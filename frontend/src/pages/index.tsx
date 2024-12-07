import React, { useState, useCallback, useMemo } from 'react';
import { Question, Response, Result } from '../types';
import { questions } from '../data/questions';
import { Header } from '@/components/Header';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionItem } from '@/components/QuestionItem';
import { ResultCard } from '@/components/ResultCard';

export default function Home() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [nextQuestionIndex, setNextQuestionIndex] = useState<number | null>(null);

  const QUESTIONS_PER_PAGE = 10;
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

  const currentQuestions = useMemo(() => {
    const start = currentPage * QUESTIONS_PER_PAGE;
    return questions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [currentPage]);

  const handleAnswer = useCallback(
    (response: Response) => {
      setResponses(prev => {
        const newResponses = prev.filter(r => r.questionId !== response.questionId);
        return [...newResponses, response];
      });

      // 次の未回答の質問のインデックスを設定
      const currentIndex = currentQuestions.findIndex(q => q.id === response.questionId);
      const nextUnansweredIndex = currentQuestions.findIndex(
        (q, idx) => idx > currentIndex && !responses.some(r => r.questionId === q.id)
      );

      if (nextUnansweredIndex !== -1) {
        setNextQuestionIndex(nextUnansweredIndex);
      } else if (currentPage < totalPages - 1) {
        handleNextPage();
      }
    },
    [currentQuestions, responses, currentPage, totalPages]
  );

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

      if (!res.ok) {
        throw new Error('APIエラーが発生しました');
      }

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert('エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, [responses]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      setNextQuestionIndex(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      setNextQuestionIndex(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const isCurrentPageComplete = useMemo(() => {
    return currentQuestions.every(question =>
      responses.some(response => response.questionId === question.id)
    );
  }, [currentQuestions, responses]);

  return (
    <div className='min-h-screen'>
      <Header />
      <ProgressBar
        answeredCount={responses.length}
        totalQuestions={questions.length}
        currentPage={currentPage + 1}
        totalPages={totalPages}
      />
      <div className='container mx-auto py-4 px-4'>
        <div className='max-w-2xl mx-auto space-y-4'>
          {currentQuestions.map((question, index) => (
            <QuestionItem
              key={question.id}
              question={question}
              onAnswer={handleAnswer}
              currentAnswer={responses.find(r => r.questionId === question.id)?.score}
              index={currentPage * QUESTIONS_PER_PAGE + index}
              totalQuestions={questions.length}
              answeredCount={responses.length}
              currentPage={currentPage + 1}
              totalPages={totalPages}
              isNext={index === nextQuestionIndex}
            />
          ))}
        </div>

        <div className='max-w-2xl mx-auto mt-8'>
          <div className='flex gap-4'>
            {currentPage > 0 && (
              <button
                onClick={handlePrevPage}
                className='flex-1 py-3 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 
                          hover:bg-gray-300 dark:hover:bg-gray-600 
                          text-gray-800 dark:text-white font-medium
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
                  flex-1 py-3 px-4 rounded-lg text-white font-medium
                  transition-all duration-200
                  ${
                    isCurrentPageComplete
                      ? 'bg-indigo-600 hover:bg-indigo-700'
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
                  flex-1 py-3 px-4 rounded-lg text-white font-medium
                  transition-all duration-200
                  ${
                    responses.length === questions.length && !isLoading
                      ? 'bg-indigo-600 hover:bg-indigo-700'
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
          <div className='max-w-2xl mx-auto mt-8'>
            <ResultCard result={result} />
          </div>
        )}
      </div>
    </div>
  );
}
