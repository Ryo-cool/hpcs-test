export interface Question {
    id: number;
    text: string;
    category: string;
    isReverse: boolean;
}

export interface Response {
    questionId: number;
    score: number;
}

export interface Result {
    neuroticism: number;
    extraversion: number;
    conscientiousness: number;
    agreeableness: number;
    openness: number;
} 