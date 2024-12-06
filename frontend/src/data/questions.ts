import { Question } from '../types';
import questionsData from './data.json';

// JSONデータを型付きの配列に変換
export const questions: Question[] = questionsData.map((item, index) => ({
    id: index + 1,
    text: item.question,
    category: dimensionToCategory(item.dimension),
    isReverse: item.reversed
}));

// 日本語の次元名を英語のカテゴリー名に変換
function dimensionToCategory(dimension: string): string {
    const categoryMap: { [key: string]: string } = {
        '神経症傾向': 'neuroticism',
        '外向性': 'extraversion',
        '勤勉性': 'conscientiousness',
        '協調性': 'agreeableness',
        '開放性': 'openness'
    };
    
    return categoryMap[dimension] || dimension;
} 