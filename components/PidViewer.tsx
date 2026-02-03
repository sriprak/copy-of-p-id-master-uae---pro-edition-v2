import React, { useState } from 'react';
import { PidComponent, ComponentStatus } from '../types';

interface PidViewerProps {
  imageUrl: string;
  components: PidComponent[];
  onSelectComponent: (id: string) => void;
  selectedId: string | null;
}

const PidViewer: React.FC<PidViewerProps> = ({ imageUrl, components, onSelectComponent, selectedId }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getStatusStyles = (status: ComponentStatus) => {
    switch (status) {
      case ComponentStatus.OPERATIONAL: 
        return {
            border: 'border-green-500',
            bg: 'bg-green-500',
            text: 'text-green-500',
            shadow: 'shadow-[0_0_10px_rgba(34,197,94,0.3)]'
        };
      case ComponentStatus.MAINTENANCE_REQUIRED: 
        return {
            border: 'border-amber-500',
            bg: 'bg-amber-500',
            text: 'text-amber-500',
            shadow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]'
        };
      case ComponentStatus.CRITICAL_REPAIR: 
        return {
            border: 'border-red-600',
            bg: 'bg-red-600',
            text: 'text-red-600',
            shadow: 'shadow-[0_0_15px_rgba(220,38,38,0.5)]'
        };
      default: 
        return {
            border: 'border-gray-400',
            bg: 'bg-gray-500',
            text: 'text-gray-500',
            shadow: ''
        };
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 overflow-auto rounded-xl border border-slate-700 shadow-inner relative scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
      
      {/* 
        Image Wrapper
        - inline-block: Wraps the image tightly so markers position correctly
        - min-w-full: Ensures it fills the container width at minimum
        - relative: Context for absolute markers
      */}
      <div className="relative inline-block min-w-full min-h-full">
        <img 
          src={imageUrl} 
          alt="Analyzed P&ID" 
          // max-w-none allows the image to overflow the container if it's high res, triggering scroll
          className={`block max-w-none ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          style={{ 
             minWidth: '100%',
             height: 'auto' 
          }}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Markers Layer */}
        {imageLoaded && components.map((comp) => {
            const styles = getStatusStyles(comp.currentStatus);
            const isSelected = selectedId === comp.id;
            // Short ID logic for the badge
            const numbersOnly = comp.id.replace(/[^0-9]/g, '');
            const shortId = numbersOnly.length > 0 ? numbersOnly.substring(0, 2) : comp.id.substring(0, 2);

            return (
              <button
                key={comp.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(comp.id);
                }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-10 ${isSelected ? 'z-50' : 'hover:z-40'}`}
                style={{
                  left: `${comp.coordinates?.x ?? 50}%`,
                  top: `${comp.coordinates?.y ?? 50}%`
                }}
              >
                {/* Selection Ping */}
                {isSelected && (
                  <div className="absolute -inset-4 rounded-full animate-ping bg-blue-500 opacity-30"></div>
                )}

                {/* The Container for visual marker */}
                <div className={`relative w-10 h-10 md:w-12 md:h-12 transition-transform duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                    
                    {/* Ring Marker (Transparent center to show facility) */}
                    <div className={`absolute inset-0 rounded-full border-2 ${styles.border} ${styles.shadow} bg-white/5 backdrop-blur-[1px] group-hover:bg-white/10 transition-colors`}></div>
                    
                    {/* Center Crosshair/Dot (Minimal obstruction) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-60">
                        <div className={`w-0.5 h-2 ${styles.bg}`}></div>
                        <div className={`absolute w-2 h-0.5 ${styles.bg}`}></div>
                    </div>

                    {/* ID Badge (Offset to not block center) */}
                    <div className={`absolute -top-1 -right-1 ${styles.bg} text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-white/20 z-20`}>
                        {shortId}
                    </div>
                </div>
                
                {/* Tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap bg-gray-900/95 backdrop-blur text-white text-xs font-medium rounded px-3 py-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 shadow-xl border border-gray-700 translate-y-1 group-hover:translate-y-0">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-blue-200">{comp.id}</span>
                    <span className="text-[10px] text-gray-300">{comp.type}</span>
                  </div>
                  {/* Arrow */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900/95"></div>
                </div>
              </button>
            );
        })}
      </div>
      
      {/* Loading State Overlay */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
           <div className="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
           <span className="text-sm font-medium tracking-wide">Rendering Diagram...</span>
        </div>
      )}
    </div>
  );
};

export default PidViewer;