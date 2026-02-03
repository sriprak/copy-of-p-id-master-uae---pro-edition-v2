import React from 'react';
import { UploadCloudIcon } from '../components/Icons';

interface UploadPageProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string | null;
}

const UploadPage: React.FC<UploadPageProps> = ({ onFileSelect, error }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors">
          Intelligent P&ID Digitization
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 transition-colors">
          Upload your dated piping diagrams. Our AI, calibrated to UAE industrial standards, will digitize, analyze, and locate facilities for maintenance.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-3 animate-pulse">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 border border-gray-100 dark:border-gray-700 text-center hover:shadow-2xl transition-all duration-300">
          <div className="w-24 h-24 bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-8 transition-colors">
            <UploadCloudIcon className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 transition-colors">Upload P&ID Diagram</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors">
            Supports high-resolution PNG, JPG, or PDF files.
            <br/>
            <span className="text-xs text-blue-500 dark:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded mt-2 inline-block">
              PDFs are auto-OCR'd
            </span>
          </p>
          
          <label className="block w-full">
            <span className="sr-only">Choose file</span>
            <input 
              type="file" 
              accept="image/*,.pdf"
              onChange={onFileSelect}
              className="block w-full text-sm text-slate-500 dark:text-slate-400
                file:mr-4 file:py-3 file:px-8
                file:rounded-full file:border-0
                file:text-sm file:font-bold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700
                file:cursor-pointer cursor-pointer
                file:transition-colors
              "
            />
          </label>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors">
            <div className="font-bold text-gray-900 dark:text-white">Scan</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Optical Recognition</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors">
            <div className="font-bold text-gray-900 dark:text-white">Analyze</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">UAE Compliance Check</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors">
            <div className="font-bold text-gray-900 dark:text-white">Sync</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Postgres Database</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;