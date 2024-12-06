package handlers

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func setupRouterWithCORS() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	// CORSの設定を更新
	config := cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			return origin == "http://localhost:3000"
		},
		MaxAge: 12 * 3600,
	}

	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" && origin != "http://localhost:3000" {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		c.Next()
	})

	r.Use(cors.New(config))

	// モックハンドラーを使用
	r.POST("/api/calculate", func(c *gin.Context) {
		var req map[string]interface{}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "ok"})
	})
	return r
}

func TestCORSHeaders(t *testing.T) {
	router := setupRouterWithCORS()

	tests := []struct {
		name          string
		origin        string
		method        string
		body          string
		expectedCode  int
		shouldAllowed bool
	}{
		{
			name:          "許可されたオリジン",
			origin:        "http://localhost:3000",
			method:        "POST",
			body:          `{"responses":[{"questionId":1,"score":3}]}`,
			expectedCode:  http.StatusOK,
			shouldAllowed: true,
		},
		{
			name:          "許可されていないオリジン",
			origin:        "http://example.com",
			method:        "POST",
			expectedCode:  http.StatusForbidden,
			shouldAllowed: false,
		},
		{
			name:          "プリフライトリクエスト - 許可されたオリジン",
			origin:        "http://localhost:3000",
			method:        "OPTIONS",
			expectedCode:  http.StatusNoContent,
			shouldAllowed: true,
		},
		{
			name:          "プリフライトリクエスト - 許可されていないオリジン",
			origin:        "http://example.com",
			method:        "OPTIONS",
			expectedCode:  http.StatusForbidden,
			shouldAllowed: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			var req *http.Request
			if tt.method == "POST" {
				req = httptest.NewRequest(tt.method, "/api/calculate", strings.NewReader(tt.body))
				req.Header.Set("Content-Type", "application/json")
			} else {
				req = httptest.NewRequest(tt.method, "/api/calculate", nil)
			}
			req.Header.Set("Origin", tt.origin)

			if tt.method == "OPTIONS" {
				req.Header.Set("Access-Control-Request-Method", "POST")
				req.Header.Set("Access-Control-Request-Headers", "Content-Type")
			}

			router.ServeHTTP(w, req)

			// ステータスコードの確認
			if w.Code != tt.expectedCode {
				t.Errorf("Expected status code %d, got %d", tt.expectedCode, w.Code)
			}

			// CORSヘッダーの確認
			allowOrigin := w.Header().Get("Access-Control-Allow-Origin")
			if tt.shouldAllowed {
				if allowOrigin != tt.origin {
					t.Errorf("Expected Access-Control-Allow-Origin to be %s, got %s", tt.origin, allowOrigin)
				}
			} else {
				if allowOrigin != "" {
					t.Errorf("Expected no Access-Control-Allow-Origin header, got %s", allowOrigin)
				}
			}

			// その他のCORSヘッダーの確認
			if tt.shouldAllowed && tt.method == "OPTIONS" {
				allowMethods := w.Header().Get("Access-Control-Allow-Methods")
				if allowMethods != "GET,POST" {
					t.Errorf("Expected Access-Control-Allow-Methods to be GET,POST, got %s", allowMethods)
				}

				allowHeaders := w.Header().Get("Access-Control-Allow-Headers")
				if allowHeaders != "Origin,Content-Type" {
					t.Errorf("Expected Access-Control-Allow-Headers to be Origin,Content-Type, got %s", allowHeaders)
				}

				allowCredentials := w.Header().Get("Access-Control-Allow-Credentials")
				if allowCredentials != "true" {
					t.Errorf("Expected Access-Control-Allow-Credentials to be true, got %s", allowCredentials)
				}
			}
		})
	}
}

func TestCORSPreflightRequest(t *testing.T) {
	router := setupRouterWithCORS()

	// プリフライトリクエストのテスト
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("OPTIONS", "/api/calculate", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	req.Header.Set("Access-Control-Request-Method", "POST")
	req.Header.Set("Access-Control-Request-Headers", "Content-Type")

	router.ServeHTTP(w, req)

	// プリフライトレスポンスの詳細な検証
	expectedHeaders := map[string]string{
		"Access-Control-Allow-Origin":      "http://localhost:3000",
		"Access-Control-Allow-Methods":     "GET,POST",
		"Access-Control-Allow-Headers":     "Origin,Content-Type",
		"Access-Control-Allow-Credentials": "true",
	}

	for header, expected := range expectedHeaders {
		if actual := w.Header().Get(header); actual != expected {
			t.Errorf("Expected %s to be %s, got %s", header, expected, actual)
		}
	}

	if w.Code != http.StatusNoContent {
		t.Errorf("Expected status code %d, got %d", http.StatusNoContent, w.Code)
	}
}
