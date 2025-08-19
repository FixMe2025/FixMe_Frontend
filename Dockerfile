# 1. 베이스 이미지 설정
FROM node:20-slim AS base

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 종속성 설치
COPY package*.json ./
RUN npm install

# 4. 소스 코드 복사
COPY . .

# 5. 프로덕션 빌드
RUN npm run build

# 6. 프로덕션 환경 설정
FROM base AS production
ENV NODE_ENV=production
CMD ["npm", "start"]
