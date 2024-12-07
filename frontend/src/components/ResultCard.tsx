import React from 'react';
import { Result } from '../types';

interface Props {
  result: Result;
}

export const ResultCard: React.FC<Props> = ({ result }) => {
  const traits = [
    { key: 'neuroticism', label: '神経症傾向', color: 'purple' },
    { key: 'extraversion', label: '外向性', color: 'green' },
    { key: 'conscientiousness', label: '誠実性', color: 'blue' },
    { key: 'agreeableness', label: '協調性', color: 'pink' },
    { key: 'openness', label: '開放性', color: 'orange' },
  ];

  // レーダーチャートの頂点の座標を計算
  const calculatePoint = (index: number, value: number, totalPoints: number) => {
    const angle = (Math.PI * 2 * index) / totalPoints - Math.PI / 2;
    const radius = (value / 5) * 100; // 5段階評価を100%スケールに変換
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  // SVGのポイントを生成
  const points = traits
    .map((trait, index) => {
      const value = result[trait.key as keyof Result];
      const point = calculatePoint(index, value, traits.length);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  // 目盛り線のポイントを生成
  const gridPoints = Array.from({ length: 5 }, (_, i) => {
    const radius = ((i + 1) / 5) * 100;
    return traits
      .map((_, index) => {
        const point = calculatePoint(index, radius / 20, traits.length);
        return `${point.x},${point.y}`;
      })
      .join(' ');
  });

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4
                  bg-opacity-50 dark:bg-opacity-50
                  backdrop-filter backdrop-blur-md
                  hover:bg-opacity-75 dark:hover:bg-opacity-75
                  hover:shadow-xl transition-all duration-200`}
    >
      <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-8'>分析結果</h2>

      <div className='flex flex-col md:flex-row items-center gap-8'>
        {/* レーダーチャート */}
        <div className='relative w-[300px] h-[300px]'>
          <svg
            viewBox='-100 -100 200 200'
            className='w-full h-full transform rotate-[18deg]' // 72度（360/5）の半分だけ回転させて正立させる
          >
            {/* 目盛り線 */}
            {gridPoints.map((points, i) => (
              <polygon
                key={`grid-${i}`}
                points={points}
                fill='none'
                stroke='rgba(156, 163, 175, 0.2)'
                strokeWidth='0.5'
              />
            ))}

            {/* 軸線 */}
            {traits.map((_, index) => {
              const point = calculatePoint(index, 5, traits.length);
              return (
                <line
                  key={`axis-${index}`}
                  x1='0'
                  y1='0'
                  x2={point.x}
                  y2={point.y}
                  stroke='rgba(156, 163, 175, 0.2)'
                  strokeWidth='0.5'
                />
              );
            })}

            {/* データポリゴン */}
            <polygon
              points={points}
              fill='rgba(59, 130, 246, 0.2)'
              stroke='rgb(59, 130, 246)'
              strokeWidth='2'
              className='transition-all duration-500'
            />

            {/* データポイント */}
            {traits.map((trait, index) => {
              const value = result[trait.key as keyof Result];
              const point = calculatePoint(index, value, traits.length);
              return (
                <circle
                  key={`point-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r='3'
                  fill='rgb(59, 130, 246)'
                  className='transition-all duration-500'
                />
              );
            })}
          </svg>
        </div>

        {/* スコアリスト */}
        <div className='flex-1 space-y-4'>
          {traits.map(({ key, label, color }) => {
            const value = result[key as keyof Result];
            return (
              <div key={key} className='space-y-2'>
                <div className='flex justify-between items-baseline'>
                  <span className='text-lg font-medium text-gray-700 dark:text-gray-200'>
                    {label}
                  </span>
                  <span className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                    {value ? value.toFixed(1) : '0.0'}
                  </span>
                </div>
                <div className='relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                  <div
                    className='absolute top-0 left-0 h-full bg-blue-500 rounded-full 
                              transition-all duration-1000 ease-out'
                    style={{ width: `${(value / 5) * 100}%` }}
                  >
                    <div
                      className='absolute inset-0 bg-gradient-to-r from-transparent
                                to-white/20 dark:to-white/10'
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
