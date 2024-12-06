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
        { key: 'openness', label: '開放性', color: 'orange' }
    ];

    return (
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-xl p-8 
                      border border-gray-100 dark:border-gray-800">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                分析結果
            </h2>
            <div className="space-y-6">
                {traits.map(({ key, label, color }) => {
                    const value = result[key as keyof Result];
                    const percentage = (value / 5) * 100;
                    
                    return (
                        <div key={key} className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                                    {label}
                                </span>
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {value.toFixed(1)}
                                </span>
                            </div>
                            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`absolute top-0 left-0 h-full bg-${color}-500 
                                              rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: `${percentage}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent 
                                                  to-white/20 dark:to-white/10" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}; 