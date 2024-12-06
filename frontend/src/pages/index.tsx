import React, { useState, useCallback, useMemo } from 'react';
import { Question, Response, Result } from '../types';
import { questions } from '../data/questions';
import { QuestionItem } from '../components/QuestionItem';
import { ThemeToggle } from '../components/ThemeToggle';
import { ResultCard } from '../components/ResultCard';

export default function Home() {
    const [responses, setResponses] = useState<Response[]>([]);
    const [result, setResult] = useState<Result | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const progress = useMemo(() => 
        (responses.length / questions.length) * 100,
        [responses.length]
    );

    const handleAnswer = useCallback((response: Response) => {
        setResponses(prev => {
            const newResponses = prev.filter(r => r.questionId !== response.questionId);
            return [...newResponses, response];
        });
    }, []);

    const handleSubmit = useCallback(async () => {
        if (responses.length !== questions.length) {
            alert('すべての質問に回答してください。');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ responses }),
            });
            const data = await res.json();
            setResult(data);
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        } catch (error) {
            console.error('Error:', error);
            alert('エラーが発生しました。');
        } finally {
            setIsLoading(false);
        }
    }, [responses]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
            <ThemeToggle />
            
            <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-dark-card z-50">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700
                             transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 max-w-4xl pt-16 pb-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 
                                 animate-fade-in">
                        パーソナリティ診断テスト
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto 
                                animate-fade-in animation-delay-200">
                        以下の質問に対して、あなたにどの程度当てはまるかを5段階で評価してください。
                        より正確な結果を得るために、すべての質問に正直にお答えください。
                    </p>
                </div>

                <div className="space-y-6">
                    {questions.map((question, index) => (
                        <QuestionItem
                            key={question.id}
                            question={question}
                            onAnswer={handleAnswer}
                            currentAnswer={responses.find(r => r.questionId === question.id)?.score}
                            index={index}
                        />
                    ))}
                </div>

                <div className="sticky bottom-6 mt-12">
                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-4 
                                  border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    回答済み:
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                        {responses.length}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        / {questions.length}
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {Math.round(progress)}% 完了
                            </div>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || responses.length !== questions.length}
                            className={`
                                w-full py-4 rounded-lg text-white font-medium text-lg
                                transition-all duration-200 transform
                                ${isLoading || responses.length !== questions.length
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                                }
                            `}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" 
                                                stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>分析中...</span>
                                </div>
                            ) : (
                                '結果を見る'
                            )}
                        </button>
                    </div>
                </div>

                {result && (
                    <div className="mt-12 animate-scale">
                        <ResultCard result={result} />
                    </div>
                )}
            </div>
        </div>
    );
} 