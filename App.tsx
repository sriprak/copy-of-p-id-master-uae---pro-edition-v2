import React, { useState, useCallback, useEffect } from 'react';
import { analyzePidImage } from './services/geminiService';
import { saveToPostgres } from './services/dbService';
import { PidComponent, ComponentStatus, User, UploadRecord } from './types';
import { MOCK_USER } from './services/authService';
import * as pdfjsLib from 'pdfjs-dist';

// Components & Pages
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import LoadingPage from './pages/LoadingPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';

// Fix for pdfjs-dist import structure
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Initialize PDF.js worker
if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
} else {
  console.warn("PDF.js GlobalWorkerOptions not found. PDF processing might fail.");
}

type ProcessingStep = 'IDLE' | 'CONVERTING_PDF' | 'ANALYZING' | 'SAVING';
type Page = 'upload' | 'dashboard' | 'loading';
type Theme = 'light' | 'dark';

export default function App() {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(MOCK_USER);

  // --- Navigation & Theme State ---
  const [currentPage, setCurrentPage] = useState<Page>('upload');
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('IDLE');
  const [theme, setTheme] = useState<Theme>('light');

  // --- Data State ---
  // Store all uploads in history
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>([]);
  // Pointer to the currently active record
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage('upload');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentRecordId(null);
    setUploadHistory([]);
  };

  const handleNavigate = (page: Page) => {
    if (page === 'dashboard' && uploadHistory.length === 0) {
      return;
    }
    setCurrentPage(page);
  };

  // --- Derived Data ---
  const currentRecord = uploadHistory.find(r => r.id === currentRecordId);
  // Default to empty if no record selected
  const components = currentRecord ? currentRecord.components : [];
  const imagePreview = currentRecord ? currentRecord.imagePreview : '';

  // --- File Processing ---

  const convertPdfToImage = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      
      const scale = 2.0; 
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) throw new Error('Canvas context not available');

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // OPTIMIZATION: Use JPEG 0.85 instead of PNG.
      // PNG generation for large canvases is slow and creates huge strings.
      // JPEG is much faster and sufficient for P&ID lines.
      return canvas.toDataURL('image/jpeg', 0.85);
    } catch (err) {
      console.error("PDF Conversion Error", err);
      throw new Error("Failed to convert PDF. Please ensure it is a valid PDF file.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setError(null);
      
      // Start flow
      setCurrentPage('loading');

      if (selectedFile.type === 'application/pdf') {
        setProcessingStep('CONVERTING_PDF');
        try {
          const imageDataUrl = await convertPdfToImage(selectedFile);
          const base64 = imageDataUrl.split(',')[1];
          // Pass image/jpeg as mimeType because convertPdfToImage now returns jpeg
          await processData(base64, 'image/jpeg', selectedFile.name, imageDataUrl);
        } catch (err) {
           console.error(err);
           setError("Could not read PDF file. Please try a different file.");
           setCurrentPage('upload');
           setProcessingStep('IDLE');
        }
      } else {
        // Handle standard image
        const reader = new FileReader();
        reader.onload = async (event) => {
          const result = event.target?.result as string;
          const base64 = result.split(',')[1];
          await processData(base64, selectedFile.type, selectedFile.name, result);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const processData = async (base64Data: string, mimeType: string, fileName: string, previewUrl: string) => {
    setProcessingStep('ANALYZING');
    
    try {
      const analyzedComponents = await analyzePidImage(base64Data, mimeType);
      
      // Calculate Version
      const existingVersions = uploadHistory.filter(r => r.fileName === fileName);
      const version = existingVersions.length + 1;

      setProcessingStep('SAVING');
      
      // Save to Postgres
      const summary = `Analyzed ${analyzedComponents.length} components according to UAE standards.`;
      await saveToPostgres({
        fileName: fileName,
        timestamp: new Date().toISOString(),
        components: analyzedComponents,
        summary: summary,
        version: version
      });

      // Update State
      const newRecord: UploadRecord = {
        id: crypto.randomUUID(),
        fileName,
        version,
        timestamp: new Date().toISOString(),
        components: analyzedComponents,
        imagePreview: previewUrl,
        summary
      };

      setUploadHistory(prev => [newRecord, ...prev]);
      setCurrentRecordId(newRecord.id);

      // Done
      setProcessingStep('IDLE');
      setCurrentPage('dashboard');

    } catch (err) {
      console.error(err);
      setError("Failed to process P&ID. Please try again or check your API Key.");
      setCurrentPage('upload');
      setProcessingStep('IDLE');
    }
  };

  const handleStatusChange = useCallback((id: string, newStatus: ComponentStatus) => {
    // Update the specific record in history
    setUploadHistory(prevHistory => prevHistory.map(record => {
      if (record.id === currentRecordId) {
        return {
          ...record,
          components: record.components.map(comp => 
            comp.id === id ? { ...comp, currentStatus: newStatus } : comp
          )
        };
      }
      return record;
    }));
  }, [currentRecordId]);

  // Compute Stats
  const stats = {
    total: components.length,
    operational: components.filter(c => c.currentStatus === ComponentStatus.OPERATIONAL).length,
    maintenance: components.filter(c => c.currentStatus !== ComponentStatus.OPERATIONAL).length
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-300">
      <Navbar 
        currentPage={currentPage} 
        onNavigate={(p) => handleNavigate(p as Page)}
        hasData={uploadHistory.length > 0}
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar - Visible on Dashboard or when we have history */}
        {uploadHistory.length > 0 && currentPage === 'dashboard' && (
          <div className="hidden md:block h-full">
            <Sidebar 
              history={uploadHistory} 
              currentRecordId={currentRecordId}
              onSelectRecord={setCurrentRecordId}
              onNewUpload={() => setCurrentPage('upload')}
            />
          </div>
        )}

        <main className="flex-1 w-full overflow-y-auto">
          {currentPage === 'upload' && (
            <UploadPage onFileSelect={handleFileChange} error={error} />
          )}

          {currentPage === 'loading' && (
            <LoadingPage step={processingStep} />
          )}

          {currentPage === 'dashboard' && (
            <DashboardPage 
              stats={stats}
              imagePreview={imagePreview}
              components={components}
              selectedComponentId={selectedComponentId}
              onSelectComponent={setSelectedComponentId}
              onStatusChange={handleStatusChange}
              versionInfo={currentRecord ? { version: currentRecord.version, fileName: currentRecord.fileName, timestamp: currentRecord.timestamp } : undefined}
            />
          )}
        </main>
      </div>
    </div>
  );
}