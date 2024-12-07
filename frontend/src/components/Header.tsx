import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export const Header: React.FC = () => {
  return (
    <header className='sticky top-0 z-50 w-full backdrop-blur-md bg-white/30 dark:bg-gray-900/30 border-b border-gray-200/20 dark:border-gray-700/20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex-shrink-0'>
            <h1 className='text-xl font-bold text-gray-900 dark:text-white'>HPCS</h1>
          </div>
          <div className='flex items-center'>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
