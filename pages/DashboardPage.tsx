import React, { useState } from 'react';
import { PidComponent, ComponentStatus } from '../types';
import PidViewer from '../components/PidViewer';
import ComponentTable from '../components/ComponentTable';
import { CheckCircleIcon, AlertTriangleIcon } from '../components/Icons';

interface DashboardPageProps {
  stats: {
    total: number;
    operational: number;
    maintenance: number;
  };
  imagePreview: string;
  components: PidComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onStatusChange: (id: string, newStatus: ComponentStatus) => void;
  versionInfo?: { version: number; fileName: string; timestamp: string };
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  imagePreview,
  components,
  selectedComponentId,
  onSelectComponent,
  onStatusChange,
  versionInfo
}) => {
  const [notified, setNotified] = useState(false);

  const handleNotifyTeam = () => {
    setNotified(true);
    // Simulate notification API call
    setTimeout(() => setNotified(false), 3000);
  };

  if (!imagePreview) {
    return <div className="p-8 text-center text-gray-500">Please select a record from the history sidebar or start a new upload.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 h-full overflow-y-auto">
      
      {/* Header Info */}
      {versionInfo && (
        <div className="flex items-center justify-between">
           <div>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{versionInfo.fileName}</h2>
             <p className="text-sm text-gray-500 dark:text-gray-400">
               Version {versionInfo.version} • Analyzed on {new Date(versionInfo.timestamp).toLocaleString()}
             </p>
           </div>
        </div>
      )}

      {/* 1. Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Components</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-500 transition-colors">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Operational</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.operational}</p>
            <CheckCircleIcon className="w-6 h-6 text-green-500 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-500 transition-colors flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Maintenance Needed</p>
            <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.maintenance}</p>
                {stats.maintenance > 0 && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
            </div>
          </div>
          
          {stats.maintenance > 0 && (
            <button 
              onClick={handleNotifyTeam}
              disabled={notified}
              className={`mt-4 w-full text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                notified 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/50'
              }`}
            >
              {notified ? (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  Team Notified
                </>
              ) : (
                <>
                  <AlertTriangleIcon className="w-4 h-4" />
                  Notify Maintenance Team
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Diagram Section (Large) */}
      <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
        <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Interactive P&ID Diagram</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              Click markers to identify facilities
            </span>
        </div>
        {/* Force a good height for the viewer */}
        <div className="relative h-[65vh] w-full bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-600">
          <PidViewer 
            imageUrl={imagePreview} 
            components={components} 
            selectedId={selectedComponentId}
            onSelectComponent={onSelectComponent}
          />
        </div>
      </div>

      {/* 3. Detailed Data Table Section */}
      <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Component Registry & Status</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Update status below to reflect real-time maintenance</p>
          </div>
          <div className="min-h-0 overflow-auto">
            <ComponentTable 
              components={components} 
              onStatusChange={onStatusChange}
              selectedId={selectedComponentId}
              onSelectComponent={onSelectComponent}
            />
          </div>
      </div>
    </div>
  );
};

export default DashboardPage;