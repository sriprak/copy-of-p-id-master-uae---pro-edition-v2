import React from 'react';
import { LoaderIcon } from '../components/Icons';

type LoadingStep = 'CONVERTING_PDF' | 'ANALYZING' | 'SAVING';

interface LoadingPageProps {
  step: LoadingStep | string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ step }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center max-w-lg w-full transition-colors">
        <LoaderIcon className="w-20 h-20 text-blue-600 dark:text-blue-500 animate-spin mb-8" />
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center transition-colors">
          {step === 'CONVERTING_PDF' && 'Processing PDF Document'}
          {step === 'ANALYZING' && 'Analyzing P&ID Structure'}
          {step === 'SAVING' && 'Syncing to Database'}
        </h2>
        
        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full mb-6 overflow-hidden">
           <div className={`h-full bg-blue-600 dark:bg-blue-500 transition-all duration-1000 ${
             step === 'CONVERTING_PDF' ? 'w-1/3' : 
             step === 'ANALYZING' ? 'w-2/3' : 'w-full'
           }`}></div>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-center text-sm leading-relaxed transition-colors">
          {step === 'CONVERTING_PDF' && 'We are converting your document for high-resolution Optical Character Recognition (OCR).'}
          {step === 'ANALYZING' && 'AI is identifying valves, pumps, and instruments while cross-referencing UAE maintenance standards.'}
          {step === 'SAVING' && 'Securely posting structured analysis results to the PostgreSQL instance.'}
        </p>
      </div>
    </div>
  );
};

export default LoadingPage;