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
  const [currentPage, setCurrentPage] = useState(0);

  const QUESTIONS_PER_PAGE = 10;
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

  const currentQuestions = useMemo(() => {
    const start = currentPage * QUESTIONS_PER_PAGE;
    return questions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [currentPage]);

  const progress = useMemo(() => (responses.length / questions.length) * 100, [responses.length]);

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
      console.log('送信するデータ:', { responses });
      const res = await fetch('http://localhost:8080/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('APIエラー:', errorData);
        throw new Error(errorData.error || 'APIエラーが発生しました');
      }

      const data = await res.json();
      console.log('APIレスポンス:', data);
      setResult(data);
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました。' + (error instanceof Error ? error.message : ''));
    } finally {
      setIsLoading(false);
    }
  }, [responses]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const isCurrentPageComplete = useMemo(() => {
    return currentQuestions.every(question =>
      responses.some(response => response.questionId === question.id)
    );
  }, [currentQuestions, responses]);

  return (
    <div
      className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 
                      dark:from-gray-900 dark:to-gray-800 transition-colors duration-300'
    >
      <ThemeToggle />

      <div className='fixed top-0 left-0 right-0 z-50'>
        <div className='h-1 bg-gray-200 dark:bg-gray-700'>
          <div
            className='h-full bg-gradient-to-r from-blue-500 to-blue-600 
                                transition-all duration-300 ease-out'
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className='bg-white dark:bg-gray-800 shadow-sm'>
          <div className='max-w-3xl mx-auto px-4 py-2 flex justify-between items-center'>
            <span className='text-sm text-gray-600 dark:text-gray-300'>
              {responses.length} / {questions.length} 問完了
            </span>
            <span className='text-sm font-medium text-gray-900 dark:text-white'>
              ページ {currentPage + 1} / {totalPages}
            </span>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-20'>
        <div className='text-center mb-16'>
          <h1
            className='text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 
                                animate-fade-in'
          >
            パーソナリティ診断テスト
          </h1>
          <p
            className='text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto 
                                animate-fade-in animation-delay-200'
          >
            ありのままの自分で正直に回答してください。
            より正確な結果を得るために、深く考えすぎないようにしましょう。
          </p>
        </div>

        <div className='space-y-8'>
          {currentQuestions.map((question, index) => (
            <QuestionItem
              key={question.id}
              question={question}
              onAnswer={handleAnswer}
              currentAnswer={responses.find(r => r.questionId === question.id)?.score}
              index={currentPage * QUESTIONS_PER_PAGE + index}
              totalQuestions={questions.length}
              answeredCount={responses.length}
            />
          ))}
        </div>

        <div className='fixed bottom-8 left-0 right-0 px-4'>
          <div className='max-w-3xl mx-auto flex gap-4 bg-lime-600'>
            {currentPage > 0 && (
              <button
                onClick={handlePrevPage}
                className='flex-1 py-4 rounded-xl bg-gray-200 dark:bg-gray-700 
                                          hover:bg-gray-300 dark:hover:bg-gray-600 
                                          text-gray-800 dark:text-white font-medium text-lg
                                          transition-all duration-200'
              >
                前へ
              </button>
            )}
            {currentPage < totalPages - 1 ? (
              <button
                onClick={handleNextPage}
                disabled={!isCurrentPageComplete}
                className={`
                                    flex-1 py-4 rounded-xl text-white font-medium text-lg
                                    transition-all duration-200
                                    ${
                                      isCurrentPageComplete
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                                        : 'bg-gray-400 cursor-not-allowed'
                                    }
                                `}
              >
                次へ
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={responses.length !== questions.length || isLoading}
                className={`
                                    flex-1 py-4 rounded-xl text-white font-medium text-lg
                                    transition-all duration-200
                                    ${
                                      responses.length === questions.length && !isLoading
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                                        : 'bg-gray-400 cursor-not-allowed'
                                    }
                                `}
              >
                {isLoading ? '分析中...' : '結果を見る'}
              </button>
            )}
          </div>
        </div>

        {result && (
          <div className='mt-12 animate-scale'>
            <ResultCard result={result} />
          </div>
        )}
      </div>
    </div>
  );
}
