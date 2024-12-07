import React, { memo, useRef, useEffect } from 'react';
import { Question, Response } from '../types';

interface Props {
  question: Question;
  onAnswer: (response: Response) => void;
  currentAnswer?: number;
  index: number;
  totalQuestions: number;
  answeredCount: number;
  currentPage: number;
  totalPages: number;
  isNext?: boolean;
}

export const QuestionItem: React.FC<Props> = memo(
  ({
    question,
    onAnswer,
    currentAnswer,
    index,
    totalQuestions,
    answeredCount,
    currentPage,
    totalPages,
    isNext,
  }) => {
    const questionRef = useRef<HTMLDivElement>(null);
    const options = [
      { value: 1, label: '全く同意しない' },
      { value: 2, label: '同意しない' },
      { value: 3, label: 'どちらでもない' },
      { value: 4, label: '同意する' },
      { value: 5, label: '強く同意する' },
    ];

    useEffect(() => {
      if (isNext && questionRef.current) {
        questionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, [isNext]);

    const handleAnswer = (response: Response) => {
      onAnswer(response);
      // 次の���回答の設問へスクロール
      const nextQuestion = document.getElementById(`question-${index + 1}`);
      if (nextQuestion) {
        nextQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    return (
      <div
        ref={questionRef}
        id={`question-${index}`}
        className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6
                    bg-opacity-50 dark:bg-opacity-50
                    backdrop-filter backdrop-blur-md
                    hover:bg-opacity-75 dark:hover:bg-opacity-75
                    hover:shadow-xl transition-all duration-200'
      >
        <div className='mb-4 flex items-start gap-4'>
          <span className='text-xl font-semibold text-indigo-600'>{index + 1}</span>
          <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100 leading-relaxed'>
            {question.text}
          </h3>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-5 gap-3 mt-6'>
          {options.map(option => {
            const isSelected = currentAnswer === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleAnswer({ questionId: question.id, score: option.value })}
                className={`
                  w-full p-3 rounded-lg border text-sm font-medium
                  transition-all duration-200 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                  ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                  }
                `}
                aria-pressed={isSelected}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

QuestionItem.displayName = 'QuestionItem';
