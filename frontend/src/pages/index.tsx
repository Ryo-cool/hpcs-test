import React, { useState, useCallback, useMemo } from 'react';
import { Question, Response, Result } from '../types';
import { questions } from '../data/questions';
import { QuestionItem } from '../components/QuestionItem';
import { ThemeToggle } from '../components/ThemeToggle';

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

    const questionItems = useMemo(() => 
        questions.map((question, index) => (
            <div
                key={question.id}
                className="animate-fade-in"
                style={{ 
                    animationDelay: `${index * 0.05}s`,
                    transform: 'translateZ(0)'
                }}
            >
                <QuestionItem
                    question={question}
                    onAnswer={handleAnswer}
                    currentAnswer={responses.find(r => r.questionId === question.id)?.score}
                />
            </div>
        )),
        [questions, responses, handleAnswer]
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
            <ThemeToggle />
            <div 
                className="fixed top-0 left-0 right-0 h-1.5 sm:h-2 bg-gray-200 dark:bg-dark-card z-50"
                style={{ transform: 'translateZ(0)' }}
            >
                <div 
                    className="h-full bg-blue-500 dark:bg-dark-primary will-change-transform"
                    style={{ 
                        width: `${progress}%`,
                        transition: 'width 0.3s ease-out',
                        transform: 'translateZ(0)'
                    }}
                />
            </div>
            
            <div className="container mx-auto px-4 sm:px-6 max-w-3xl pt-8 sm:pt-12">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800 dark:text-dark-text animate-fade-in">
                    HPCS テスト
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-dark-text-secondary mb-6 sm:mb-8 animate-fade-in" 
                   style={{ animationDelay: '0.1s' }}>
                    各質問に対して、あなたにどの程度当てはまるかを5段階で評価してください。
                </p>
                
                <div className="space-y-4 sm:space-y-6">
                    {questionItems}
                </div>

                <div className="sticky bottom-4 mt-6 sm:mt-8">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || responses.length !== questions.length}
                        className={`
                            w-full py-3 sm:py-4 rounded-lg text-white font-medium text-sm sm:text-base
                            transition-all duration-200
                            ${isLoading || responses.length !== questions.length
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl'
                            }
                        `}
                    >
                        {isLoading ? '計算中...' : '結果を見る'}
                    </button>
                    <p className="text-center text-xs sm:text-sm text-gray-500 mt-2">
                        {responses.length} / {questions.length} 問回答済み
                    </p>
                </div>

                {result && (
                    <div 
                        className="mt-8 sm:mt-12 p-4 sm:p-6 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-100 dark:border-gray-800 animate-scale"
                        style={{ transform: 'translateZ(0)' }}
                    >
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-dark-text">
                            分析結果
                        </h2>
                        <div className="space-y-3 sm:space-y-4">
                            {Object.entries(result).map(([key, value]) => (
                                <div key={key} className="relative pt-1">
                                    <div className="flex justify-between mb-1 sm:mb-2">
                                        <span className="text-sm sm:text-base text-gray-700 dark:text-dark-text">
                                            {key === 'neuroticism' && '神経症傾向'}
                                            {key === 'extraversion' && '外向性'}
                                            {key === 'conscientiousness' && '誠実性'}
                                            {key === 'agreeableness' && '協調性'}
                                            {key === 'openness' && '開放性'}
                                        </span>
                                        <span className="text-sm sm:text-base text-gray-600 dark:text-dark-text-secondary">
                                            {value.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="overflow-hidden h-1.5 sm:h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                                        <div
                                            style={{ width: `${(value / 5) * 100}%` }}
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 dark:bg-dark-primary transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 