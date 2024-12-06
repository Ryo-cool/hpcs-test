import React, { memo } from 'react';
import { Question, Response } from '../types';

interface Props {
    question: Question;
    onAnswer: (response: Response) => void;
    currentAnswer?: number;
    index: number;
}

export const QuestionItem: React.FC<Props> = memo(({ question, onAnswer, currentAnswer, index }) => {
    const options = [
        { value: 1, label: '強く不同意', description: '全く当てはまらない' },
        { value: 2, label: '不同意', description: 'あまり当てはまらない' },
        { value: 3, label: '中立', description: 'どちらとも言えない' },
        { value: 4, label: '同意', description: 'やや当てはまる' },
        { value: 5, label: '強く同意', description: 'とても当てはまる' },
    ];

    const getCategoryLabel = (category: string) => {
        const labels = {
            neuroticism: '神経症傾向',
            extraversion: '外向性',
            conscientiousness: '誠実性',
            agreeableness: '協調性',
            openness: '開放性'
        };
        return labels[category as keyof typeof labels] || category;
    };

    return (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium px-3 py-1 rounded-full 
                                   bg-blue-500 text-white">
                        Q{index + 1}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full 
                                   bg-gray-200 dark:bg-gray-700 
                                   text-gray-700 dark:text-gray-300">
                        {getCategoryLabel(question.category)}
                    </span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                    {question.text}
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onAnswer({ questionId: question.id, score: option.value })}
                        className={`
                            relative p-4 rounded-lg transition-all duration-200
                            ${currentAnswer === option.value
                                ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
                            }
                            hover:shadow-md active:transform active:scale-95
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                        `}
                        aria-label={`${option.label}: ${option.description}`}
                    >
                        <div className="flex flex-col items-center space-y-2">
                            <span className="text-lg font-bold">
                                {option.label}
                            </span>
                            <span className={`text-sm ${
                                currentAnswer === option.value
                                    ? 'text-blue-100'
                                    : 'text-gray-500 dark:text-gray-300'
                            }`}>
                                {option.description}
                            </span>
                            {currentAnswer === option.value && (
                                <div className="absolute top-2 right-2">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {question.isReverse && (
                <div className="mt-4 flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                    <svg className="w-5 h-5 text-yellow-700 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        この質問は逆転項目です
                    </span>
                </div>
            )}
        </div>
    );
});

QuestionItem.displayName = 'QuestionItem'; 