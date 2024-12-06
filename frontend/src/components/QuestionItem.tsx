import React, { memo } from 'react';
import { Question, Response } from '../types';

interface Props {
    question: Question;
    onAnswer: (response: Response) => void;
    currentAnswer?: number;
}

export const QuestionItem: React.FC<Props> = memo(({ question, onAnswer, currentAnswer }) => {
    const options = [
        { value: 1, label: '強く不同意する' },
        { value: 2, label: '不同意する' },
        { value: 3, label: 'どちらでもない' },
        { value: 4, label: '同意する' },
        { value: 5, label: '強く同意する' },
    ];

    const handleAnswer = React.useCallback((value: number) => {
        onAnswer({ questionId: question.id, score: value });
    }, [question.id, onAnswer]);

    return (
        <div className="mb-8 p-4 sm:p-6 bg-white dark:bg-dark-card rounded-lg shadow-md will-change-transform 
                      transition-colors duration-200">
            <div 
                className="mb-4 transform transition-transform duration-200 ease-out"
                style={{ transform: 'translateZ(0)' }}
            >
                <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-dark-text">
                    {question.text}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-dark-text-secondary mt-1 opacity-90">
                    {question.category === 'neuroticism' && '神経症傾向'}
                    {question.category === 'extraversion' && '外向性'}
                    {question.category === 'conscientiousness' && '誠実性'}
                    {question.category === 'agreeableness' && '協調性'}
                    {question.category === 'openness' && '開放性'}
                </p>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleAnswer(option.value)}
                        className={`
                            w-full sm:flex-1 min-h-[48px] sm:min-h-0 sm:min-w-[120px] px-3 sm:px-4 py-2 rounded-full
                            will-change-transform
                            transition-all duration-150 ease-out
                            ${currentAnswer === option.value
                                ? 'bg-blue-500 dark:bg-dark-primary text-white shadow-md translate-y-[-2px]'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-600 hover:translate-y-[-1px]'
                            }
                            focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500
                            active:translate-y-0
                            text-center
                            transform-gpu
                        `}
                        style={{
                            transform: 'translateZ(0)',
                            backfaceVisibility: 'hidden'
                        } as React.CSSProperties}
                    >
                        <span className="block text-xs sm:text-sm mb-0.5 sm:mb-1">{option.label}</span>
                        <span className="block text-xs opacity-75">{option.value}点</span>
                    </button>
                ))}
            </div>
            {question.isReverse && (
                <p className="mt-2 text-xs sm:text-sm text-amber-600 dark:text-amber-400 animate-fade-in">
                    ※この質問は逆転項目です
                </p>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.currentAnswer === nextProps.currentAnswer &&
           prevProps.question.id === nextProps.question.id;
});

QuestionItem.displayName = 'QuestionItem'; 