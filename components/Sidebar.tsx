import React from 'react';
import { UploadRecord } from '../types';
import { UploadCloudIcon, HistoryIcon } from './Icons';

interface SidebarProps {
  history: UploadRecord[];
  currentRecordId: string | null;
  onSelectRecord: (id: string) => void;
  onNewUpload: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ history, currentRecordId, onSelectRecord, onNewUpload }) => {
  // Group history by fileName
  const groupedHistory: Record<string, UploadRecord[]> = {};
  history.forEach(rec => {
    if (!groupedHistory[rec.fileName]) {
      groupedHistory[rec.fileName] = [];
    }
    groupedHistory[rec.fileName].push(rec);
  });

  return (
    <div className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onNewUpload}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <UploadCloudIcon className="w-4 h-4" />
          New Upload
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <HistoryIcon className="w-3 h-3" />
            File History
          </h3>
        </div>

        {Object.keys(groupedHistory).length === 0 ? (
           <div className="px-4 py-8 text-center">
             <p className="text-sm text-gray-400 dark:text-gray-500">No uploads yet.</p>
           </div>
        ) : (
          <div className="space-y-4 px-2">
            {Object.keys(groupedHistory).map(fileName => {
              const versions = groupedHistory[fileName].sort((a, b) => b.version - a.version);
              
              return (
                <div key={fileName} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                     <div className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate" title={fileName}>
                       {fileName}
                     </div>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {versions.map(record => (
                      <button
                        key={record.id}
                        onClick={() => onSelectRecord(record.id)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                          currentRecordId === record.id 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                         <span>Version {record.version}</span>
                         <span className="text-[10px] opacity-70">
                           {new Date(record.timestamp).toLocaleDateString()}
                         </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;