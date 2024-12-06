package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

// エラーレスポンスの構造体
type ErrorResponse struct {
	Error string `json:"error"`
}

func TestErrorResponses(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := setupRouter()

	tests := []struct {
		name           string
		requestBody    string
		expectedStatus int
		expectedError  string
	}{
		{
			name:           "不正なJSON形式",
			requestBody:    `{"responses":[{"questionId":1,score":3}]}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "invalid character",
		},
		{
			name:           "スコアが範囲外",
			requestBody:    `{"responses":[{"questionId":1,"score":6}]}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "invalid score for question 1",
		},
		{
			name:           "存在しない質問ID",
			requestBody:    `{"responses":[{"questionId":999,"score":3}]}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "invalid question ID: 999",
		},
		{
			name:           "空のリクエスト",
			requestBody:    `{}`,
			expectedStatus: http.StatusOK,
			expectedError:  "",
		},
		{
			name:           "空の回答リスト",
			requestBody:    `{"responses":[]}`,
			expectedStatus: http.StatusOK,
			expectedError:  "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("POST", "/api/calculate", strings.NewReader(tt.requestBody))
			req.Header.Set("Content-Type", "application/json")
			router.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status code %d, got %d", tt.expectedStatus, w.Code)
			}

			if tt.expectedError != "" {
				var errorResponse ErrorResponse
				err := json.Unmarshal(w.Body.Bytes(), &errorResponse)
				if err != nil {
					t.Fatalf("Failed to unmarshal error response: %v", err)
				}

				if !strings.Contains(errorResponse.Error, tt.expectedError) {
					t.Errorf("Expected error message containing '%s', got '%s'",
						tt.expectedError, errorResponse.Error)
				}
			}
		})
	}
}

func TestErrorResponseFormat(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := setupRouter()

	// 不正なスコアでテスト
	requestBody := `{"responses":[{"questionId":1,"score":10}]}`
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/calculate", strings.NewReader(requestBody))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	// レスポンスの構造を確認
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	// エラーメッセージのフィールドを確認
	errorMsg, exists := response["error"]
	if !exists {
		t.Error("Error response should contain 'error' field")
	}

	// エラーメッセージが文字列であることを確認
	if _, ok := errorMsg.(string); !ok {
		t.Error("Error message should be a string")
	}

	// Content-Typeがapplication/jsonであることを確認
	contentType := w.Header().Get("Content-Type")
	if !strings.Contains(contentType, "application/json") {
		t.Errorf("Expected Content-Type to contain application/json, got %s", contentType)
	}
}
