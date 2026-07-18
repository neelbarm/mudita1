# Sarga Studio server. Build context is the studio/ directory:
#   docker build -f deploy/Dockerfile .
FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY tsconfig.json ./
COPY bin ./bin
COPY src ./src
COPY db ./db
COPY fixtures ./fixtures
COPY templates ./templates

RUN mkdir -p runs artifacts outbox clients .local

EXPOSE 8787
CMD ["npx", "tsx", "src/server/index.ts"]
