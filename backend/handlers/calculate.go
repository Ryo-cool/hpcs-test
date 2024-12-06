package handlers

import (
	"fmt"
	"hpcs/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// validateResponses は回答データのバリデーションを行います
func validateResponses(responses []models.Response) error {
	validQuestionIDs := make(map[int]bool)
	// 有効な質問IDを設定
	for i := 1; i <= 51; i++ {
		validQuestionIDs[i] = true
	}

	for _, response := range responses {
		// スコアの範囲チェック
		if response.Score < 1 || response.Score > 5 {
			return fmt.Errorf("invalid score for question %d: score must be between 1 and 5", response.QuestionID)
		}

		// 質問IDの有効性チェック
		if !validQuestionIDs[response.QuestionID] {
			return fmt.Errorf("invalid question ID: %d", response.QuestionID)
		}
	}

	return nil
}

// CalculateScore は性格特性のスコアを計算するハンドラーです
func CalculateScore(c *gin.Context) {
	var request struct {
		Responses []models.Response `json:"responses"`
	}

	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// バリデーション
	if err := validateResponses(request.Responses); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// スコアの計算
	result := models.Result{
		Neuroticism:       calculateNeuroticism(request.Responses),
		Extraversion:      calculateExtraversion(request.Responses),
		Conscientiousness: calculateConscientiousness(request.Responses),
		Agreeableness:     calculateAgreeableness(request.Responses),
		Openness:          calculateOpenness(request.Responses),
	}

	c.JSON(http.StatusOK, result)
}

// 重み付けされたスコアの計算
func calculateWeightedScore(responses []models.Response, category string, questionIDs []int, weights map[int]float64) float64 {
	var totalScore float64
	var totalWeight float64

	for _, id := range questionIDs {
		for _, response := range responses {
			if response.QuestionID == id {
				score := float64(response.Score)
				if isReverseItem(id) {
					score = 6 - score
				}
				weight := weights[id]
				totalScore += score * weight
				totalWeight += weight
				break
			}
		}
	}

	if totalWeight == 0 {
		return 0
	}
	return totalScore / totalWeight
}

// 各特性の重み付け係数
var (
	neuroticismWeights = map[int]float64{
		1:  1.2, // 感情的に不安定である
		2:  1.0, // 心配性である
		3:  1.1, // イライラしやすい
		4:  0.9, // 他人に対して批判的である
		29: 1.3, // ストレスに強い（逆転）
		30: 1.2, // 困難に直面しても冷静である（逆転）
		31: 1.1, // プレッシャーの中でもパフォーマンスを発揮する（逆転）
		32: 1.0, // 感情をコントロールできる（逆転）
	}

	extraversionWeights = map[int]float64{
		5:  1.2, // 社交的である
		6:  1.1, // 人と話すのが好きである
		7:  0.9, // 注目されるのが好きである
		8:  1.0, // 自信に満ちている
		22: 1.1, // リーダーシップを発揮する
		49: 1.0, // 他人を説得するのが得意である
		50: 1.0, // 交渉が上手である
		51: 0.9, // プレゼンテーションが得意である
	}

	conscientiousnessWeights = map[int]float64{
		9:  1.2, // 計画的である
		10: 1.1, // 几帳面である
		11: 1.2, // 責任感が強い
		12: 0.9, // 完璧主義である
		23: 1.1, // 目標達成に向けて努力する
		24: 0.8, // 競争心が強い
		45: 1.0, // 詳細に注意を払う
		46: 1.0, // ミスを最小限に抑える
	}

	agreeablenessWeights = map[int]float64{
		13: 1.2, // 他人に共感しやすい
		14: 1.1, // 他人の感情に敏感である
		15: 1.2, // 他人を気遣う
		16: 1.1, // 他人の立場を理解しようとする
		25: 1.0, // 他人の意見を尊重する
		26: 1.0, // 協力的である
		27: 1.0, // 他人の意見に耳を傾ける
		28: 0.9, // チームワークを重視する
	}

	opennessWeights = map[int]float64{
		17: 1.2, // 独創的である
		18: 1.1, // 新しいアイデアを考えるのが好きである
		19: 0.9, // 芸術的な感性がある
		20: 1.0, // 新しい経験を求める
		41: 1.0, // リスクを取ることを厭わない
		42: 1.1, // 新しい挑戦を楽しむ
		43: 1.0, // 変化を歓迎する
		44: 1.0, // 未知の状況でも適応できる
	}
)

// 神経症傾向の計算を更新
func calculateNeuroticism(responses []models.Response) float64 {
	questionIDs := []int{1, 2, 3, 4, 29, 30, 31, 32}
	return normalizeScore(calculateWeightedScore(responses, "neuroticism", questionIDs, neuroticismWeights))
}

// スコアの正規化（1-5の範囲に収める）
func normalizeScore(score float64) float64 {
	if score < 1 {
		return 1
	}
	if score > 5 {
		return 5
	}
	return score
}

// 外向性の計算
func calculateExtraversion(responses []models.Response) float64 {
	questionIDs := []int{5, 6, 7, 8, 22, 49, 50, 51}
	return normalizeScore(calculateWeightedScore(responses, "extraversion", questionIDs, extraversionWeights))
}

// 誠実性の計算
func calculateConscientiousness(responses []models.Response) float64 {
	questionIDs := []int{9, 10, 11, 12, 23, 24, 45, 46}
	return normalizeScore(calculateWeightedScore(responses, "conscientiousness", questionIDs, conscientiousnessWeights))
}

// 協調性の計算
func calculateAgreeableness(responses []models.Response) float64 {
	questionIDs := []int{13, 14, 15, 16, 25, 26, 27, 28}
	return normalizeScore(calculateWeightedScore(responses, "agreeableness", questionIDs, agreeablenessWeights))
}

// 開放性の計算
func calculateOpenness(responses []models.Response) float64 {
	questionIDs := []int{17, 18, 19, 20, 41, 42, 43, 44}
	return normalizeScore(calculateWeightedScore(responses, "openness", questionIDs, opennessWeights))
}

// 逆転項目かどうかを判定
func isReverseItem(id int) bool {
	reverseItems := map[int]bool{
		29: true, // ストレスに強い
		30: true, // 困難に直面しても冷静である
		31: true, // プレッシャーの中でもパフォーマンスを発揮する
		32: true, // 感情をコントロールできる
	}
	return reverseItems[id]
}
