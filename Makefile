.PHONY: install dev db-up db-migrate lint typecheck test build docker-up

install:
	pnpm install

dev:
	pnpm dev

db-up:
	docker compose up -d postgres redis

db-migrate:
	pnpm db:migrate

lint:
	pnpm lint

typecheck:
	pnpm typecheck

test:
	pnpm test

build:
	pnpm build

docker-up:
	docker compose up --build
