import React from 'react';
import { DatabaseIcon, SunIcon, MoonIcon, UserIcon, LogoutIcon } from './Icons';
import { User } from '../types';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  hasData: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, hasData, theme, toggleTheme, user, onLogout }) => {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo Area */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => onNavigate('upload')}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">P</div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">P&ID Master UAE</h1>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('upload')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'upload' 
                    ? 'bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                New Analysis
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                disabled={!hasData}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  currentPage === 'dashboard' 
                    ? 'bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300' 
                    : !hasData 
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Dashboard
                {!hasData && <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-400 dark:text-gray-500">Empty</span>}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
           {/* Theme Toggle */}
           <button 
             onClick={toggleTheme}
             className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
             aria-label="Toggle Theme"
           >
             {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
           </button>

           {user && (
             <>
               <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
               <div className="flex items-center gap-3 pl-1">
                 <div className="text-right hidden sm:block">
                   <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                 </div>
                 <div className="relative group">
                   <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 overflow-hidden">
                     {user.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover"/> : <UserIcon className="w-5 h-5 text-gray-500" />}
                   </div>
                 </div>
                 <button 
                   onClick={onLogout}
                   className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                   title="Logout"
                 >
                   <LogoutIcon className="w-5 h-5" />
                 </button>
               </div>
             </>
           )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;