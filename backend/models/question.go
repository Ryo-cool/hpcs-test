package models

type Question struct {
	ID        int    `json:"id"`
	Text      string `json:"text"`
	Category  string `json:"category"`
	IsReverse bool   `json:"isReverse"`
}

type Response struct {
	QuestionID int `json:"questionId"`
	Score      int `json:"score"`
}

type Result struct {
	Neuroticism       float64 `json:"neuroticism"`
	Extraversion      float64 `json:"extraversion"`
	Conscientiousness float64 `json:"conscientiousness"`
	Agreeableness     float64 `json:"agreeableness"`
	Openness          float64 `json:"openness"`
}
