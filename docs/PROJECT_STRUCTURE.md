# 프로젝트 계층 구조

Sallcll 백엔드(Node.js / NestJS / TypeScript)의 디렉토리 구조와 각 위치의 역할을 정리한 문서입니다.
실무에서 흔히 쓰는 **레이어드 + 도메인 모듈 구조**(controller → service → (repository) / DTO / entity)를 따릅니다.
CLAUDE.md 등 다른 문서로 종합할 때 참고 자료로 사용합니다.

## 디렉토리 트리

```
Sallcll/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   └── PROJECT_STRUCTURE.md       # 본 문서
├── src/
│   ├── common/                    # 앱 전역에서 재사용되는 공통 계층
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts   # 전역 예외 필터 (에러 응답 포맷 통일)
│   │   └── interceptors/
│   │       └── logging.interceptor.ts     # 요청/응답 로깅
│   ├── config/
│   │   └── configuration.ts       # 환경 변수 로딩 및 타입 정의 (ConfigModule)
│   ├── health/                    # 도메인 모듈 예시 1: 부가 기능(헬스체크)
│   │   ├── health.controller.ts
│   │   └── health.module.ts
│   ├── users/                     # 도메인 모듈 예시 2: 실제 리소스(CRUD) 패턴
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── users.controller.ts    # 라우팅 + 요청/응답 처리
│   │   ├── users.service.ts       # 비즈니스 로직 (현재 메모리 저장소, 추후 DB 연동)
│   │   ├── users.service.spec.ts  # 단위 테스트
│   │   └── users.module.ts        # 컨트롤러/서비스 등록 및 캡슐화
│   ├── app.module.ts              # 루트 모듈 (ConfigModule + 도메인 모듈 등록)
│   └── main.ts                    # 엔트리 포인트 (전역 prefix/pipe/filter/interceptor 설정)
├── test/
│   └── app.e2e-spec.ts            # e2e 테스트
├── .env.example
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── tsconfig.json / tsconfig.build.json
├── vitest.config.ts / vitest.config.e2e.ts
├── CONTRIBUTING.md
└── README.md
```

## 계층별 설명

### `src/common/` — 전역 공통 계층
- `filters/`: 예외 처리를 한 곳에서 통일 (`HttpExceptionFilter`). `main.ts`에서 `app.useGlobalFilters()`로 등록.
- `interceptors/`: 요청 로깅처럼 컨트롤러 실행 전후에 공통으로 끼어드는 로직 (`LoggingInterceptor`).
- 이후 `guards/`(인증/인가), `pipes/`(공통 변환·검증), `decorators/`(커스텀 데코레이터)도 이 아래에 추가.

### `src/config/` — 환경 설정
- `configuration.ts`: `process.env`를 직접 참조하지 않고 타입이 있는 설정 객체로 감싸서 제공.
- `AppModule`에서 `ConfigModule.forRoot({ isGlobal: true, load: [configuration] })`로 전역 등록 → 어디서든 `ConfigService`로 주입받아 사용.

### `src/{도메인}/` — 기능(도메인) 모듈
NestJS/실무에서 가장 일반적인 단위. 새 기능을 추가할 때는 이 패턴을 그대로 복사해서 사용합니다. (예: 수강신청 도메인이라면 `src/enrollments/`)

| 파일 | 역할 |
| --- | --- |
| `*.controller.ts` | HTTP 라우트 정의, 요청 파라미터 검증(DTO) 후 서비스 호출 |
| `*.service.ts` | 실제 비즈니스 로직 (컨트롤러는 로직을 직접 갖지 않음) |
| `*.module.ts` | 해당 도메인의 controller/service/provider를 묶어서 캡슐화, 필요한 것만 `exports` |
| `dto/` | 요청/응답 데이터 형식 + `class-validator` 기반 유효성 검증 |
| `entities/` | 도메인 모델(추후 ORM 연동 시 DB 엔티티로 확장) |
| `*.repository.ts` (필요 시) | DB 접근 로직을 서비스에서 분리 |

`users` 모듈이 위 패턴의 실제 예시입니다. 현재는 DB 없이 메모리 배열로 동작하며, DB 스택이 정해지면 `UsersService` 내부만 Repository 호출로 교체하면 됩니다.

### `src/app.module.ts` / `src/main.ts` — 부트스트랩
- `app.module.ts`: `ConfigModule`과 각 도메인 모듈(`HealthModule`, `UsersModule`, ...)을 import만 하는 조립 지점. 비즈니스 로직을 직접 두지 않음.
- `main.ts`: 앱 실행 시 전역으로 적용할 설정을 모아둔 곳.
  - `app.setGlobalPrefix('api')` → 모든 라우트 앞에 `/api` 접두사 (예: 헬스체크는 `GET /api/health`)
  - `app.useGlobalPipes(new ValidationPipe(...))` → DTO 유효성 검증 자동 적용
  - `app.useGlobalFilters(new HttpExceptionFilter())` → 에러 응답 포맷 통일
  - `app.useGlobalInterceptors(new LoggingInterceptor())` → 요청 로깅

### `test/` — e2e 테스트
- 단위 테스트는 대상 파일 옆에 `*.spec.ts`로 위치 (예: `users.service.spec.ts`).
- e2e(통합) 테스트는 `test/` 폴더에 `*.e2e-spec.ts`로 위치, 실제 HTTP 요청을 흉내내어 여러 계층을 통합 검증.

### `.github/` — 협업 템플릿
- 이슈/PR 생성 시 자동으로 적용되는 템플릿. `CONTRIBUTING.md`의 브랜치·커밋·PR 규칙과 함께 사용.

### 루트 설정 파일
- `package.json`: `npm run start:dev`(개발 서버), `build`, `lint`, `test`, `test:e2e` 스크립트 정의.
- `.env.example`: 로컬 개발 시 `.env`로 복사해서 사용하는 환경 변수 템플릿.
- `eslint.config.mjs` / `.prettierrc`: 코드 스타일 및 린트 규칙. `npm run lint`로 검사.

## 새 도메인 추가 시 체크리스트

1. `src/{도메인명}/` 폴더 생성
2. `entities/`, `dto/` 정의
3. `{도메인}.service.ts`에 비즈니스 로직 작성
4. `{도메인}.controller.ts`에 라우트 정의 (서비스 호출만, 로직 없음)
5. `{도메인}.module.ts`로 묶고 `app.module.ts`의 `imports`에 등록
6. 단위 테스트(`*.spec.ts`) 작성

## 브랜치 전략 (참고)

`main`(배포 안정) / `develop`(개발 통합) / `feature/{번호}-{설명}` / `fix/{설명}` / `docs/{설명}` / `refactor/{설명}` 형태로 브랜치를 운용합니다. 자세한 내용은 [CONTRIBUTING.md](../CONTRIBUTING.md) 참고.
