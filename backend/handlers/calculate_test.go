package handlers

import (
	"hpcs/models"
	"testing"
)

func TestCalculateDimensionScore(t *testing.T) {
	// テストケース1: 神経症傾向（通常項目と逆転項目を含む）
	responses := []models.Response{
		{QuestionID: 1, Score: 5},  // 通常項目
		{QuestionID: 29, Score: 2}, // 逆転項目（実際のスコアは4）
	}

	result := calculateDimensionScore(responses, "neuroticism")
	expected := 4.5 // (5 + 4) / 2

	if !almostEqual(result, expected, 0.01) {
		t.Errorf("Expected neuroticism score to be %f, but got %f", expected, result)
	}

	// テストケース2: 外向性（通常項目のみ）
	responses = []models.Response{
		{QuestionID: 5, Score: 4},
		{QuestionID: 6, Score: 5},
	}

	result = calculateDimensionScore(responses, "extraversion")
	expected = 4.5 // (4 + 5) / 2

	if !almostEqual(result, expected, 0.01) {
		t.Errorf("Expected extraversion score to be %f, but got %f", expected, result)
	}

	// テストケース3: 該当する回答がない場合
	responses = []models.Response{
		{QuestionID: 999, Score: 3}, // 存在しない質問ID
	}

	result = calculateDimensionScore(responses, "openness")
	expected = 0.0

	if result != expected {
		t.Errorf("Expected score to be %f when no matching responses, but got %f", expected, result)
	}

	// テストケース4: 複数の回答がある場合
	responses = []models.Response{
		{QuestionID: 13, Score: 4}, // 協調性
		{QuestionID: 14, Score: 5},
		{QuestionID: 15, Score: 3},
	}

	result = calculateDimensionScore(responses, "agreeableness")
	expected = 4.0 // (4 + 5 + 3) / 3

	if !almostEqual(result, expected, 0.01) {
		t.Errorf("Expected agreeableness score to be %f, but got %f", expected, result)
	}
}

// 浮動小数点数の比較用ヘルパー関数
func almostEqual(a, b, tolerance float64) bool {
	diff := a - b
	if diff < 0 {
		diff = -diff
	}
	return diff <= tolerance
}
