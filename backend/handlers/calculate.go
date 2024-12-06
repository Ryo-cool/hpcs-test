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
	// 有効な質問IDを設定（74問に修正）
	for i := 1; i <= 74; i++ {
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

	// スコア計算
	result := models.Result{
		Neuroticism:       calculateDimensionScore(request.Responses, "neuroticism"),
		Extraversion:      calculateDimensionScore(request.Responses, "extraversion"),
		Conscientiousness: calculateDimensionScore(request.Responses, "conscientiousness"),
		Agreeableness:     calculateDimensionScore(request.Responses, "agreeableness"),
		Openness:          calculateDimensionScore(request.Responses, "openness"),
	}

	c.JSON(http.StatusOK, result)
}

// QuestionInfo は質問の属性を表す構造体
type QuestionInfo struct {
	isReverse bool
}

// getDimensionQuestions は各次元に属する質問のマップを返します
func getDimensionQuestions(dimension string) map[int]QuestionInfo {
	// 各次元の質問IDと逆転項目の情報
	dimensionMap := map[string]map[int]QuestionInfo{
		"neuroticism": {
			1:  {isReverse: false}, // 感情的に不安定である
			2:  {isReverse: false}, // 心配性である
			3:  {isReverse: false}, // イライラしやすい
			4:  {isReverse: false}, // 他人に対して批判的である
			29: {isReverse: true},  // ストレスに強い
			30: {isReverse: true},  // 困難に直面しても冷静である
			31: {isReverse: true},  // プレッシャーの中でもパフォーマンスを発揮する
			32: {isReverse: true},  // 感情をコントロールできる
		},
		"extraversion": {
			5:  {isReverse: false}, // 社交的である
			6:  {isReverse: false}, // 人と話すのが好きである
			7:  {isReverse: false}, // 注目されるのが好きである
			8:  {isReverse: false}, // 自信に満ちている
			22: {isReverse: false}, // リーダーシップを発揮する
			49: {isReverse: false}, // 他人を説得するのが得意である
			50: {isReverse: false}, // 交渉が上手である
			51: {isReverse: false}, // プレゼンテーションが得意である
			52: {isReverse: false}, // 影響力がある
			61: {isReverse: false}, // 他人を指導するのが得意である
		},
		"conscientiousness": {
			9:  {isReverse: false}, // 計画的である
			10: {isReverse: false}, // 几帳面である
			11: {isReverse: false}, // 責任感が強い
			12: {isReverse: false}, // 完璧主義である
			21: {isReverse: false}, // 自分の能力に自信がある
			23: {isReverse: false}, // 目標達成に向けて努力する
			24: {isReverse: false}, // 競争心が強い
			33: {isReverse: false}, // 新しいスキルを学ぶのが早い
			35: {isReverse: false}, // 自己改善に努める
			37: {isReverse: false}, // 倫理的な行動を取る
			38: {isReverse: false}, // 誠実である
			39: {isReverse: false}, // 約束を守る
			44: {isReverse: false}, // 未知の状況でも適応できる
			45: {isReverse: false}, // 詳細に注意を払う
			46: {isReverse: false}, // ミスを最小限に抑える
			47: {isReverse: false}, // 効率的に作業を進める
			48: {isReverse: false}, // 時間を効果的に管理する
			60: {isReverse: false}, // 既存の方法を改善する
			64: {isReverse: false}, // チームを効果的に管理する
		},
		"agreeableness": {
			13: {isReverse: false}, // 他人に共感しやすい
			14: {isReverse: false}, // 他人の感情に敏感である
			15: {isReverse: false}, // 他人を気遣う
			16: {isReverse: false}, // 他人の立場を理解しようとする
			25: {isReverse: false}, // 他人の意見を尊重する
			26: {isReverse: false}, // 協力的である
			27: {isReverse: false}, // 他人の意見に耳を傾ける
			28: {isReverse: false}, // チームワークを重視する
			34: {isReverse: false}, // フィードバックを受け入れる
			40: {isReverse: false}, // 公正である
			62: {isReverse: false}, // メンターとしての役割を果たす
			63: {isReverse: false}, // 他人の成長を支援する
			69: {isReverse: false}, // 他人の感情を理解する
			70: {isReverse: false}, // 共感的に対応する
			71: {isReverse: false}, // 他人のニーズを察知する
			72: {isReverse: false}, // 人間関係を築くのが得意である
			73: {isReverse: false}, // 文化の違いを尊重する
			74: {isReverse: false}, // 多様性を受け入れる
		},
		"openness": {
			17: {isReverse: false}, // 独創的である
			18: {isReverse: false}, // 新しいアイデアを考えるのが好きである
			19: {isReverse: false}, // 芸術的な感性がある
			20: {isReverse: false}, // 新しい経験を求める
			36: {isReverse: false}, // 柔軟に考えることができる
			41: {isReverse: false}, // リスクを取ることを厭わない
			42: {isReverse: false}, // 新しい挑戦を楽しむ
			43: {isReverse: false}, // 変化を歓迎する
			53: {isReverse: false}, // 分析的に考えることができる
			54: {isReverse: false}, // 問題解決が得意である
			55: {isReverse: false}, // 論理的に考えることができる
			56: {isReverse: false}, // データを解釈するのが得意である
			57: {isReverse: false}, // 創造的な解決策を考える
			58: {isReverse: false}, // 新しいアイデアを提案する
			59: {isReverse: false}, // 革新的なアプローチを取る
			65: {isReverse: false}, // 戦略的に考えることができる
			66: {isReverse: false}, // 長期的な視野を持つ
			67: {isReverse: false}, // ビジョンを持って行動する
			68: {isReverse: false}, // 全体像を把握する
		},
	}

	return dimensionMap[dimension]
}

// calculateDimensionScore は各次元のスコアを計算します
func calculateDimensionScore(responses []models.Response, dimension string) float64 {
	// 各次元に属する質問のIDと逆転項目の情報を定義
	dimensionQuestions := getDimensionQuestions(dimension)

	var totalScore float64
	var count int

	for _, response := range responses {
		// この次元に属する質問かチェック
		questionInfo, exists := dimensionQuestions[response.QuestionID]
		if !exists {
			continue
		}

		score := float64(response.Score)
		if questionInfo.isReverse {
			// 逆転項目の場合、スコアを反転（6 - score）
			score = 6 - score
		}

		totalScore += score
		count++
	}

	if count == 0 {
		return 0
	}

	// 平均スコアを計算して返す
	return totalScore / float64(count)
}
