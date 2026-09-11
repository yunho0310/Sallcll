# Sallcll

팀 프로젝트 저장소입니다.

## 소개

(프로젝트 소개를 여기에 작성하세요.)

## 스택

- Node.js / NestJS / TypeScript

## 시작하기

```bash
git clone https://github.com/yunho0310/Sallcll.git
cd Sallcll
npm install
cp .env.example .env
npm run start:dev
```

모든 API는 `/api` 접두사를 사용합니다 (예: `GET /api/health`). 프로젝트 구조는 [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) 참고.

## 주요 스크립트

- `npm run start:dev` : 개발 서버 실행 (watch)
- `npm run build` : 빌드
- `npm run lint` : ESLint 검사
- `npm run test` : 단위 테스트
- `npm run test:e2e` : e2e 테스트

## 브랜치 전략

- `main`: 배포 가능한 안정 브랜치
- `develop`: 개발 통합 브랜치
- `feature/{기능명}`: 기능 개발 브랜치
- `fix/{버그명}`: 버그 수정 브랜치

## 기여 방법

[CONTRIBUTING.md](./CONTRIBUTING.md)를 참고해주세요.
