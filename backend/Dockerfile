FROM golang:1.21-alpine

WORKDIR /app

# 依存関係のインストールに必要なパッケージを追加
RUN apk add --no-cache git

# 依存関係をコピーしてインストール
COPY go.mod go.sum ./
RUN go mod download

# ソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN go build -o main .

# ポートを公開
EXPOSE 8080

# アプリケーションを実行
CMD ["./main"] 