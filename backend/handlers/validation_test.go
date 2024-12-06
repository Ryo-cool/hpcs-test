package handlers

import (
	"bytes"
	"encoding/json"
	"hpcs/models"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestValidateResponses(t *testing.T) {
	router := setupRouter()

	// テストケース1: スコアが範囲外（6）
	responses := []models.Response{
		{QuestionID: 1, Score: 6}, // 無効なスコア
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

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status code %d for invalid score, got %d", http.StatusBadRequest, w.Code)
	}

	// テストケース2: スコアが範囲外（0）
	responses = []models.Response{
		{QuestionID: 1, Score: 0}, // 無効なスコア
	}

	requestBody.Responses = responses
	jsonData, _ = json.Marshal(requestBody)

	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/calculate", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status code %d for invalid score, got %d", http.StatusBadRequest, w.Code)
	}

	// テストケース3: 無効な質問ID
	responses = []models.Response{
		{QuestionID: 999, Score: 3}, // 存在しない質問ID
	}

	requestBody.Responses = responses
	jsonData, _ = json.Marshal(requestBody)

	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/api/calculate", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status code %d for invalid question ID, got %d", http.StatusBadRequest, w.Code)
	}
}
