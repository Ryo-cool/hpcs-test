import React from 'react';

interface Props {
  answeredCount: number;
  totalQuestions: number;
  currentPage: number;
  totalPages: number;
}

export const ProgressBar: React.FC<Props> = ({
  answeredCount,
  totalQuestions,
  currentPage,
  totalPages,
}) => {
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <div className='w-full backdrop-blur-md bg-white/30 dark:bg-gray-900/30 border-b border-gray-200/20 dark:border-gray-700/20 py-2'>
      <div className='max-w-2xl mx-auto px-4'>
        <div className='flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2'>
          <span>
            {answeredCount} / {totalQuestions} 問完了
          </span>
          <span>
            ページ {currentPage} / {totalPages}
          </span>
        </div>
        <div className='w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
          <div
            className='h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out'
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
