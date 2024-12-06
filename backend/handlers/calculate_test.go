package handlers

import (
	"hpcs/models"
	"testing"
)

func TestCalculateWeightedScore(t *testing.T) {
	// テストケース1: 通常の計算（重み付き）
	responses := []models.Response{
		{QuestionID: 1, Score: 5},  // 神経症傾向（通常）weight: 1.2
		{QuestionID: 29, Score: 2}, // 神経症傾向（逆転）weight: 1.3
	}

	weights := map[int]float64{
		1:  1.2,
		29: 1.3,
	}

	result := calculateWeightedScore(responses, "neuroticism", []int{1, 29}, weights)
	// (5 * 1.2 + (6-2) * 1.3) / (1.2 + 1.3) = (6 + 5.2) / 2.5 = 4.48
	expected := 4.48

	if !almostEqual(result, expected, 0.01) {
		t.Errorf("Expected score to be %f, but got %f", expected, result)
	}

	// テストケース2: 該当する回答がない場合
	result = calculateWeightedScore(responses, "neuroticism", []int{100}, weights)
	if result != 0 {
		t.Errorf("Expected score to be 0 when no matching responses, but got %f", result)
	}
}

func TestCalculateNeuroticism(t *testing.T) {
	responses := []models.Response{
		{QuestionID: 1, Score: 5},  // weight: 1.2
		{QuestionID: 2, Score: 4},  // weight: 1.0
		{QuestionID: 29, Score: 1}, // 逆転項目 (5) weight: 1.3
		{QuestionID: 30, Score: 2}, // 逆転項目 (4) weight: 1.2
	}

	result := calculateNeuroticism(responses)
	// 正規化された重み付きスコアを検証
	if result < 1 || result > 5 {
		t.Errorf("Neuroticism score should be between 1 and 5, got %f", result)
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

func TestNormalizeScore(t *testing.T) {
	tests := []struct {
		input    float64
		expected float64
	}{
		{0.5, 1.0}, // 下限値以下
		{1.0, 1.0}, // 下限値
		{3.0, 3.0}, // 範囲内
		{5.0, 5.0}, // 上限値
		{5.5, 5.0}, // 上限値以上
	}

	for _, test := range tests {
		result := normalizeScore(test.input)
		if result != test.expected {
			t.Errorf("For input %f, expected %f, but got %f",
				test.input, test.expected, result)
		}
	}
}

func TestCalculateExtraversion(t *testing.T) {
	responses := []models.Response{
		{QuestionID: 5, Score: 4}, // weight: 1.2
		{QuestionID: 6, Score: 5}, // weight: 1.1
		{QuestionID: 7, Score: 3}, // weight: 0.9
		{QuestionID: 8, Score: 4}, // weight: 1.0
	}

	result := calculateExtraversion(responses)
	if result < 1 || result > 5 {
		t.Errorf("Extraversion score should be between 1 and 5, got %f", result)
	}
}

func TestCalculateConscientiousness(t *testing.T) {
	responses := []models.Response{
		{QuestionID: 9, Score: 5},  // weight: 1.2
		{QuestionID: 10, Score: 4}, // weight: 1.1
		{QuestionID: 11, Score: 5}, // weight: 1.2
		{QuestionID: 12, Score: 4}, // weight: 0.9
	}

	result := calculateConscientiousness(responses)
	if result < 1 || result > 5 {
		t.Errorf("Conscientiousness score should be between 1 and 5, got %f", result)
	}
}

func TestCalculateAgreeableness(t *testing.T) {
	responses := []models.Response{
		{QuestionID: 13, Score: 4}, // weight: 1.2
		{QuestionID: 14, Score: 5}, // weight: 1.1
		{QuestionID: 15, Score: 4}, // weight: 1.2
		{QuestionID: 16, Score: 5}, // weight: 1.1
	}

	result := calculateAgreeableness(responses)
	if result < 1 || result > 5 {
		t.Errorf("Agreeableness score should be between 1 and 5, got %f", result)
	}
}

func TestCalculateOpenness(t *testing.T) {
	responses := []models.Response{
		{QuestionID: 17, Score: 5}, // weight: 1.2
		{QuestionID: 18, Score: 4}, // weight: 1.1
		{QuestionID: 19, Score: 5}, // weight: 0.9
		{QuestionID: 20, Score: 4}, // weight: 1.0
	}

	result := calculateOpenness(responses)
	if result < 1 || result > 5 {
		t.Errorf("Openness score should be between 1 and 5, got %f", result)
	}
}
