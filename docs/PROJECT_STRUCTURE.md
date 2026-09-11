# 프로젝트 계층 구조

Sallcll 백엔드(Node.js / NestJS / TypeScript)의 디렉토리 구조와 각 위치의 역할을 정리한 문서입니다.
CLAUDE.md 등 다른 문서로 종합할 때 참고 자료로 사용합니다.

## 디렉토리 트리

```
Sallcll/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md          # 버그 리포트 이슈 템플릿
│   │   └── feature_request.md     # 기능 요청 이슈 템플릿
│   └── PULL_REQUEST_TEMPLATE.md   # PR 템플릿
├── docs/
│   └── PROJECT_STRUCTURE.md       # 본 문서
├── src/                           # 애플리케이션 소스 코드
│   ├── health/                    # 도메인/기능 모듈 예시 (헬스체크)
│   │   └── health.controller.ts
│   ├── app.controller.ts          # 루트 컨트롤러
│   ├── app.module.ts              # 루트 모듈 (모든 모듈이 여기 등록됨)
│   ├── app.service.ts             # 루트 서비스
│   └── main.ts                    # 애플리케이션 엔트리 포인트 (bootstrap)
├── test/
│   └── app.e2e-spec.ts            # e2e 테스트
├── .env.example                   # 환경 변수 예시 (실제 .env는 커밋되지 않음)
├── .gitignore
├── .prettierrc                    # Prettier 설정
├── eslint.config.mjs              # ESLint(flat config) 설정
├── nest-cli.json                  # Nest CLI 설정
├── package.json                   # 의존성 및 스크립트 정의
├── tsconfig.json / tsconfig.build.json  # TypeScript 설정
├── vitest.config.ts / vitest.config.e2e.ts  # 테스트(vitest) 설정
├── CONTRIBUTING.md                # 브랜치/커밋/PR 규칙
└── README.md                      # 프로젝트 소개, 실행 방법
```

## 계층별 설명

### `src/` — 애플리케이션 코드
- `main.ts`: NestJS 앱을 부트스트랩하는 진입점. 포트 등 서버 실행 설정을 담당.
- `app.module.ts`: 루트 모듈. 새로 만드는 기능 모듈은 여기에 등록해서 앱에 연결.
- 기능(도메인) 단위 폴더: `health/`처럼 도메인별로 폴더를 나누고, 그 안에 `*.controller.ts`(요청 처리), `*.service.ts`(비즈니스 로직), 필요 시 `*.module.ts`(모듈 정의), `dto/`(요청/응답 형식)를 둔다.
- 예: 수강신청 도메인을 추가한다면 `src/enrollment/enrollment.controller.ts`, `src/enrollment/enrollment.service.ts`, `src/enrollment/enrollment.module.ts` 형태로 구성.

### `test/` — e2e 테스트
- 단위 테스트는 `src/` 내 대상 파일 옆에 `*.spec.ts`로 위치 (예: `app.controller.spec.ts`).
- e2e(통합) 테스트는 `test/` 폴더에 `*.e2e-spec.ts`로 위치.

### `.github/` — 협업 템플릿
- 이슈/PR 생성 시 자동으로 적용되는 템플릿. `CONTRIBUTING.md`의 브랜치·커밋·PR 규칙과 함께 사용.

### 루트 설정 파일
- `package.json`: `npm run start:dev`(개발 서버), `build`, `lint`, `test`, `test:e2e` 스크립트 정의.
- `.env.example`: 로컬 개발 시 `.env`로 복사해서 사용하는 환경 변수 템플릿.
- `eslint.config.mjs` / `.prettierrc`: 코드 스타일 및 린트 규칙. `npm run lint`로 검사.

## 브랜치 전략 (참고)

`main`(배포 안정) / `develop`(개발 통합) / `feature/{번호}-{설명}` / `fix/{설명}` / `docs/{설명}` 형태로 브랜치를 운용합니다. 자세한 내용은 [CONTRIBUTING.md](../CONTRIBUTING.md) 참고.
