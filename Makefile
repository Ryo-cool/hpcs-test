.PHONY: dev dev-backend dev-frontend docker-up docker-down

# 開発環境の起動（フロントエンド + バックエンド）
dev:
	make -j 2 dev-backend dev-frontend

# バックエンドの開発環境起動
dev-backend:
	cd backend && make docker-up

# フロントエンドの開発環境起動
dev-frontend:
	cd frontend && npm run dev

# Docker環境の停止
docker-down:
	cd backend && make docker-down 