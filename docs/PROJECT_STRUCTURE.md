# 프로젝트 계층 구조

Sallcll 저장소의 디렉토리 구조와 각 위치의 역할을 정리한 문서입니다.
저장소는 **backend/frontend 모노레포**(npm workspaces)로 구성되며, 백엔드는 실무에서 흔히 쓰는
**레이어드 + 도메인 모듈 구조**(controller → service → (repository) / DTO / entity)를 따릅니다.
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
├── backend/                        # NestJS 백엔드 (Node.js / TypeScript)
│   ├── src/
│   │   ├── common/                 # 앱 전역에서 재사용되는 공통 계층
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts   # 전역 예외 필터 (에러 응답 포맷 통일)
│   │   │   └── interceptors/
│   │   │       └── logging.interceptor.ts     # 요청/응답 로깅
│   │   ├── config/
│   │   │   └── configuration.ts    # 환경 변수 로딩 및 타입 정의 (ConfigModule)
│   │   ├── health/                 # 도메인 모듈 예시 1: 부가 기능(헬스체크)
│   │   │   ├── controllers/
│   │   │   │   └── health.controller.ts
│   │   │   └── health.module.ts
│   │   ├── users/                  # 도메인 모듈 예시 2: 실제 리소스(CRUD) 패턴
│   │   │   ├── controllers/
│   │   │   │   └── users.controller.ts    # 라우팅 + 요청/응답 처리
│   │   │   ├── services/
│   │   │   │   ├── users.service.ts       # 비즈니스 로직 (현재 메모리 저장소, 추후 DB 연동)
│   │   │   │   └── users.service.spec.ts  # 단위 테스트
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   └── update-user.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── users.module.ts     # 컨트롤러/서비스 등록 및 캡슐화
│   │   ├── app.module.ts           # 루트 모듈 (ConfigModule + 도메인 모듈 등록)
│   │   └── main.ts                 # 엔트리 포인트 (전역 prefix/pipe/filter/interceptor 설정)
│   ├── test/
│   │   └── app.e2e-spec.ts         # e2e 테스트
│   ├── .env.example
│   ├── eslint.config.mjs
│   ├── nest-cli.json
│   ├── package.json
│   ├── tsconfig.json / tsconfig.build.json
│   └── vitest.config.ts / vitest.config.e2e.ts
├── frontend/
│   ├── mockups/                    # 본 시안 정적 HTML (홈·서브 4장)
│   ├── package.json
│   └── README.md
├── .gitignore
├── .prettierrc                      # backend/frontend 공통 포맷 규칙
├── package.json                     # 루트 워크스페이스 정의 (npm workspaces)
├── package-lock.json
├── CONTRIBUTING.md
└── README.md
```

## 모노레포 구성

- 루트 `package.json`은 `workspaces: ["backend", "frontend"]`로 두 패키지를 관리합니다.
- `node_modules`는 루트에 호이스팅되어 하나만 존재하며, 각 워크스페이스는 자신의 `package.json`에 필요한 의존성만 선언합니다.
- 루트에서 `npm run dev:be` / `npm run build:be` / `npm run test:be` 등으로 백엔드 스크립트를 실행할 수 있고, 프런트엔드가 준비되면 `npm run dev:fe` / `npm run build:fe`도 동일하게 사용합니다.
- `.prettierrc`처럼 두 워크스페이스가 공유하는 설정은 루트에 두고, `eslint.config.mjs` · `tsconfig.json`처럼 워크스페이스별로 경로(`tsconfigRootDir`, `rootDir` 등)가 달라지는 설정은 각 워크스페이스 폴더 안에 둡니다.

## 계층별 설명

### `backend/src/common/` — 전역 공통 계층
- `filters/`: 예외 처리를 한 곳에서 통일 (`HttpExceptionFilter`). `main.ts`에서 `app.useGlobalFilters()`로 등록.
- `interceptors/`: 요청 로깅처럼 컨트롤러 실행 전후에 공통으로 끼어드는 로직 (`LoggingInterceptor`).
- 이후 `guards/`(인증/인가), `pipes/`(공통 변환·검증), `decorators/`(커스텀 데코레이터)도 이 아래에 추가.

### `backend/src/config/` — 환경 설정
- `configuration.ts`: `process.env`를 직접 참조하지 않고 타입이 있는 설정 객체로 감싸서 제공.
- `AppModule`에서 `ConfigModule.forRoot({ isGlobal: true, load: [configuration] })`로 전역 등록 → 어디서든 `ConfigService`로 주입받아 사용.

### `backend/src/{도메인}/` — 기능(도메인) 모듈
NestJS/실무에서 가장 일반적인 단위. 도메인 폴더를 먼저 나누고, 그 안에서 다시 **역할(타입)별 하위 폴더**로 묶습니다.
파일을 도메인 폴더 바로 아래에 흩어두지 않고 `controllers/`, `services/`, `dto/`, `entities/` 처럼 타입별 폴더 안에 도메인 코드가 들어가는 구조입니다.
새 기능을 추가할 때는 이 패턴을 그대로 복사해서 사용합니다. (예: 수강신청 도메인이라면 `backend/src/enrollments/`)

| 폴더/파일 | 역할 |
| --- | --- |
| `controllers/*.controller.ts` | HTTP 라우트 정의, 요청 파라미터 검증(DTO) 후 서비스 호출 |
| `services/*.service.ts` | 실제 비즈니스 로직 (컨트롤러는 로직을 직접 갖지 않음) |
| `services/*.service.spec.ts` | 서비스 단위 테스트 (테스트 대상 옆에 위치) |
| `dto/` | 요청/응답 데이터 형식 + `class-validator` 기반 유효성 검증 |
| `entities/` | 도메인 모델(추후 ORM 연동 시 DB 엔티티로 확장) |
| `repositories/*.repository.ts` (필요 시) | DB 접근 로직을 서비스에서 분리 |
| `*.module.ts` | 해당 도메인의 controller/service/provider를 묶어서 캡슐화, 필요한 것만 `exports`. 도메인 폴더 루트에 위치 |

`users` 모듈이 위 패턴의 실제 예시입니다. 현재는 DB 없이 메모리 배열로 동작하며, DB 스택이 정해지면 `services/users.service.ts` 내부만 Repository 호출로 교체하면 됩니다.

### `backend/src/app.module.ts` / `backend/src/main.ts` — 부트스트랩
- `app.module.ts`: `ConfigModule`과 각 도메인 모듈(`HealthModule`, `UsersModule`, ...)을 import만 하는 조립 지점. 비즈니스 로직을 직접 두지 않음.
- `main.ts`: 앱 실행 시 전역으로 적용할 설정을 모아둔 곳.
  - `app.setGlobalPrefix('api')` → 모든 라우트 앞에 `/api` 접두사 (예: 헬스체크는 `GET /api/health`)
  - `app.useGlobalPipes(new ValidationPipe(...))` → DTO 유효성 검증 자동 적용
  - `app.useGlobalFilters(new HttpExceptionFilter())` → 에러 응답 포맷 통일
  - `app.useGlobalInterceptors(new LoggingInterceptor())` → 요청 로깅

### `backend/test/` — e2e 테스트
- 단위 테스트는 대상 파일 옆에 `*.spec.ts`로 위치 (예: `services/users.service.spec.ts`).
- e2e(통합) 테스트는 `backend/test/` 폴더에 `*.e2e-spec.ts`로 위치, 실제 HTTP 요청을 흉내내어 여러 계층을 통합 검증.

### `frontend/` — 프런트엔드 (예정)
- 아직 프레임워크가 정해지지 않아 `package.json` + `README.md` 뼈대만 있는 상태입니다.
- 프레임워크가 정해지면 `frontend/README.md`의 안내에 따라 스캐폴딩하고, 루트 `package.json`의 `dev:fe` / `build:fe` 스크립트를 실제 스크립트로 연결합니다.

### `.github/` — 협업 템플릿
- 이슈/PR 생성 시 자동으로 적용되는 템플릿. `CONTRIBUTING.md`의 브랜치·커밋·PR 규칙과 함께 사용.

### 루트 설정 파일
- `package.json`: npm workspaces 정의 및 `dev:be`/`build:be`/`test:be`/`dev:fe`/`build:fe` 등 위임 스크립트.
- `.prettierrc`: backend/frontend 공통 코드 스타일 규칙. 각 워크스페이스의 `format`/`lint` 스크립트에서 상위 디렉토리 탐색으로 자동 적용됩니다.
- `backend/.env.example`: 로컬 개발 시 `backend/.env`로 복사해서 사용하는 환경 변수 템플릿.
- `backend/eslint.config.mjs`: 백엔드 코드 스타일 및 린트 규칙. `npm run lint:be`(루트) 또는 `backend`에서 `npm run lint`로 검사.

## 새 도메인 추가 시 체크리스트 (backend)

1. `backend/src/{도메인명}/` 폴더 생성
2. `entities/`, `dto/` 정의
3. `services/{도메인}.service.ts`에 비즈니스 로직 작성
4. `controllers/{도메인}.controller.ts`에 라우트 정의 (서비스 호출만, 로직 없음)
5. `{도메인}.module.ts`로 묶고 `app.module.ts`의 `imports`에 등록
6. 단위 테스트(`services/*.service.spec.ts`) 작성

## 브랜치 전략 (참고)

`main`(배포 안정) / `develop`(개발 통합) / `feature/{번호}-{설명}` / `fix/{설명}` / `docs/{설명}` / `refactor/{설명}` 형태로 브랜치를 운용합니다. 자세한 내용은 [CONTRIBUTING.md](../CONTRIBUTING.md) 참고.
