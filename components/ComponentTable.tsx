import React, { useState, useEffect } from 'react';
import { PidComponent, ComponentStatus } from '../types';
import { CheckCircleIcon, WrenchIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { COMPONENT_STATUS_COLORS } from '../constants';

interface ComponentTableProps {
  components: PidComponent[];
  onStatusChange: (id: string, newStatus: ComponentStatus) => void;
  onSelectComponent: (id: string) => void;
  selectedId: string | null;
}

const ITEMS_PER_PAGE = 10;

const ComponentTable: React.FC<ComponentTableProps> = ({ 
  components, 
  onStatusChange, 
  onSelectComponent,
  selectedId 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');

  const totalPages = Math.ceil(components.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const visibleComponents = components.slice(startIndex, endIndex);

  // Sync page when selectedId changes (e.g., clicked on map)
  useEffect(() => {
    if (selectedId) {
      const index = components.findIndex(c => c.id === selectedId);
      if (index !== -1) {
        const targetPage = Math.floor(index / ITEMS_PER_PAGE) + 1;
        if (targetPage !== currentPage) {
          setCurrentPage(targetPage);
        }
      }
    }
  }, [selectedId, components]); 

  // Sync input when page changes
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handleInputSubmit = () => {
    const pageNum = parseInt(pageInput);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
    } else {
      // Revert to current page if invalid
      setPageInput(currentPage.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-hidden rounded-t-xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 flex-1 transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Component</th>
                <th className="px-6 py-4 font-semibold">UAE Standards Note</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {visibleComponents.map((comp) => {
                const isPerfect = comp.currentStatus === ComponentStatus.OPERATIONAL;
                const isSelected = selectedId === comp.id;

                return (
                  <tr 
                    key={comp.id} 
                    className={`transition-colors hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-inset ring-blue-200 dark:ring-blue-700' : ''
                    }`}
                    onClick={() => onSelectComponent(comp.id)}
                  >
                    <td className="px-6 py-4">
                      {isPerfect ? (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                           <CheckCircleIcon className="w-5 h-5" />
                           <span>Good</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                          <WrenchIcon className="w-5 h-5" />
                          <span>Check</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-gray-100">
                      {comp.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{comp.type}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{comp.label}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                       <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-2 rounded border border-slate-100 dark:border-slate-700">
                         {comp.uaeStandardNote}
                       </p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className={`block w-full min-w-[140px] rounded-md border-0 py-1.5 pl-3 pr-8 text-xs font-semibold ring-1 ring-inset focus:ring-2 sm:leading-6 dark:bg-gray-700 dark:text-white ${COMPONENT_STATUS_COLORS[comp.currentStatus]}`}
                        value={comp.currentStatus}
                        onChange={(e) => onStatusChange(comp.id, e.target.value as ComponentStatus)}
                        onClick={(e) => e.stopPropagation()} // Prevent row selection when clicking select
                      >
                        <option value={ComponentStatus.OPERATIONAL} className="text-gray-900 dark:text-white bg-white dark:bg-gray-800">Operational</option>
                        <option value={ComponentStatus.MAINTENANCE_REQUIRED} className="text-gray-900 dark:text-white bg-white dark:bg-gray-800">Maintenance</option>
                        <option value={ComponentStatus.CRITICAL_REPAIR} className="text-gray-900 dark:text-white bg-white dark:bg-gray-800">Critical Repair</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {visibleComponents.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                     No components found.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 border-x border-b border-gray-200 dark:border-gray-700 rounded-b-xl px-6 py-3 flex items-center justify-between transition-colors">
          <div className="text-sm text-gray-500 dark:text-gray-400">
             Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, components.length)}</span> of <span className="font-medium">{components.length}</span> results
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Page</span>
              <input 
                type="text" 
                value={pageInput}
                onChange={handleInputChange}
                onBlur={handleInputSubmit}
                onKeyDown={handleKeyDown}
                className="w-12 text-center rounded-md border border-gray-300 dark:border-gray-600 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition-colors"
              />
              <span className="font-medium text-gray-500 dark:text-gray-400">of {totalPages}</span>
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentTable;