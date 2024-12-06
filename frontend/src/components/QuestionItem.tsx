import React, { memo } from 'react';
import { Question, Response } from '../types';

interface Props {
  question: Question;
  onAnswer: (response: Response) => void;
  currentAnswer?: number;
  index: number;
  totalQuestions: number;
  answeredCount: number;
}

export const QuestionItem: React.FC<Props> = memo(
  ({ question, onAnswer, currentAnswer, index, totalQuestions, answeredCount }) => {
    const options = [
      { value: 1, label: '全く同意しない' },
      { value: 2, label: '同意しない' },
      { value: 3, label: 'どちらでもない' },
      { value: 4, label: '同意する' },
      { value: 5, label: '強く同意する' },
    ];

    return (
      <div className='px-4'>
        <div className='max-w-2xl mx-auto'>
          <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
            <div className='mb-4 flex items-start gap-4'>
              <span className='text-xl font-semibold text-indigo-600'>{index + 1}</span>
              <h3 className='text-lg font-medium text-gray-900 leading-relaxed'>{question.text}</h3>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-5 gap-3 mt-6'>
              {options.map(option => {
                const isSelected = currentAnswer === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => onAnswer({ questionId: question.id, score: option.value })}
                    className={`
                      w-full p-3 rounded-lg border text-sm font-medium
                      transition-all duration-200 ease-in-out
                      focus:outline-none focus:ring-2 focus:ring-indigo-500
                      ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                      }
                    `}
                    aria-pressed={isSelected}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className='mt-4 text-right text-sm text-gray-500'>
              {answeredCount} / {totalQuestions} 問完了
            </div>
          </div>
        </div>
      </div>
    );
  }
);

QuestionItem.displayName = 'QuestionItem';
