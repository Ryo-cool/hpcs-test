package handlers

import (
	"bytes"
	"encoding/json"
	"hpcs/models"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/api/calculate", CalculateScore)
	return r
}

func TestCalculateScoreAPI(t *testing.T) {
	router := setupRouter()

	// テストケース1: 正常なリクエスト
	responses := []models.Response{
		{QuestionID: 1, Score: 5},
		{QuestionID: 2, Score: 4},
		{QuestionID: 29, Score: 1}, // 逆転項目
		{QuestionID: 5, Score: 4},
		{QuestionID: 9, Score: 5},
		{QuestionID: 13, Score: 4},
		{QuestionID: 17, Score: 5},
	}

	requestBody := struct {
		Responses []models.Response `json:"responses"`
	}{
		Responses: responses,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		t.Fatalf("Failed to marshal request body: %v", err)
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/calculate", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}

	var result models.Result
	err = json.Unmarshal(w.Body.Bytes(), &result)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	// 結果の検証
	if result.Neuroticism <= 0 || result.Neuroticism > 5 {
		t.Errorf("Invalid neuroticism score: %f", result.Neuroticism)
	}
	if result.Extraversion <= 0 || result.Extraversion > 5 {
		t.Errorf("Invalid extraversion score: %f", result.Extraversion)
	}
	if result.Conscientiousness <= 0 || result.Conscientiousness > 5 {
		t.Errorf("Invalid conscientiousness score: %f", result.Conscientiousness)
	}
	if result.Agreeableness <= 0 || result.Agreeableness > 5 {
		t.Errorf("Invalid agreeableness score: %f", result.Agreeableness)
	}
	if result.Openness <= 0 || result.Openness > 5 {
		t.Errorf("Invalid openness score: %f", result.Openness)
	}

	// テストケース2: 不正なリクエスト（空の回答）
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/calculate", bytes.NewBufferString(`{"responses":[]}`))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d for empty responses, got %d", http.StatusOK, w.Code)
	}

	// テストケース3: 不正なJSON
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/calculate", bytes.NewBufferString(`invalid json`))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status code %d for invalid JSON, got %d", http.StatusBadRequest, w.Code)
	}
}
