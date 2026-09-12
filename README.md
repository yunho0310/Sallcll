# Sallcll

팀 프로젝트 저장소입니다. `backend`(NestJS)와 `frontend`를 하나의 저장소에서 관리하는 npm workspaces 모노레포입니다.

## 소개

서경대 **수강신청 도우미**. 시간표를 짜고, 졸업요건을 맞추고, 신청을 연습한다.
빈 교시 강의 찾기는 탐색 도구일 뿐 제품의 이유가 아니다. 자세한 범위는 [docs/계획서.md](./docs/계획서.md).

## 스택

- Backend: Node.js / NestJS / TypeScript
- Frontend: 예정 (`frontend/README.md` 참고)

## 시작하기

```bash
git clone https://github.com/yunho0310/Sallcll.git
cd Sallcll
npm install
cp backend/.env.example backend/.env
npm run dev:be
```

모든 API는 `/api` 접두사를 사용합니다 (예: `GET /api/health`). 프로젝트 구조는 [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) 참고.

## 주요 스크립트 (루트에서 실행)

- `npm run dev:be` : 백엔드 개발 서버 실행 (watch)
- `npm run build:be` : 백엔드 빌드
- `npm run lint:be` : 백엔드 ESLint 검사
- `npm run test:be` : 백엔드 단위 테스트
- `npm run test:be:e2e` : 백엔드 e2e 테스트
- `npm run dev:fe` / `npm run build:fe` : 프런트엔드 실행/빌드 (스캐폴딩 후 사용 가능)

`backend/` 디렉토리 안에서 직접 `npm run start:dev`, `npm run lint` 등 개별 스크립트를 실행할 수도 있습니다.

## 브랜치 전략

- `main`: 배포 가능한 안정 브랜치
- `develop`: 개발 통합 브랜치
- `feature/{기능명}`: 기능 개발 브랜치
- `fix/{버그명}`: 버그 수정 브랜치

## 메인 시안

프론트 스캐폴드 전에 보는 정적 HTML입니다. 클론한 뒤 이 파일을 브라우저로 엽니다.

[`frontend/mockups/themes/index.html`](./frontend/mockups/themes/index.html)

```bash
start frontend/mockups/themes/index.html
```

## 기여 방법

[CONTRIBUTING.md](./CONTRIBUTING.md)를 참고해주세요.
