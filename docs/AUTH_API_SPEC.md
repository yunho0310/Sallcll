# 인증 API 명세서

`docs/API_SPEC.md` 0절 공통 규칙을 그대로 따릅니다. 그 문서는 "인증 방식은 범위 밖, 별도 설계"라고 되어 있어서
이 문서에서 회원가입/로그인/로그아웃/토큰 재발급을 정의합니다. `backend/src/auth`에 구현합니다.

## 0. 이 문서에서 새로 정하는 것

`docs/ERD.md`의 `USER` 엔티티(`id, student_no, department, enroll_year`)에는 로그인에 쓸 필드가 없습니다.
`home.html` 로그인 폼이 이메일/비밀번호 입력이므로, 인증을 위해 `USER`에 아래 2개 필드 추가가 필요합니다 — **ERD 변경, 팀 확인 필요**:

| 필드 | 타입 | 비고 |
| --- | --- | --- |
| `email` | string, unique | 로그인 아이디. 학번 메일 전제 (`@skuniv.ac.kr` 등 도메인 검증은 정책 확정 후 추가) |
| `password_hash` | string | bcrypt 해시. 평문 저장 금지 |

리프레시 토큰은 별도 테이블 없이 MVP 단계에서는 `USER.refresh_token_hash` 컬럼 하나로 시작합니다(기기 1개당 세션 1개 가정).
여러 기기 동시 로그인을 지원해야 하면 `AUTH_REFRESH_TOKEN(id, user_id FK, token_hash, expires_at)` 테이블로 분리 — 지금은 과설계라 미루는 것을 권장합니다.

## 1. 인증 방식

- JWT 액세스 토큰(짧은 수명, 15분) + 리프레시 토큰(긴 수명, 14일) 조합
- 액세스 토큰은 `Authorization: Bearer <accessToken>` 헤더로 전달, 이후 모든 `/api/me/...` 요청에 사용
- 리프레시 토큰은 응답 바디로 내려주고 클라이언트가 보관(웹이면 httpOnly 쿠키 권장 — 프론트 스택 확정 후 결정)
- 비밀번호는 `bcrypt`로 해싱해서 저장 (NestJS에서 흔히 쓰는 라이브러리, 신규 의존성 추가 필요)

## 2. 엔드포인트

| Method | Path | 설명 | 권한 |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | 회원가입. 가입과 동시에 로그인 처리(토큰 발급) | 비로그인 |
| POST | `/api/auth/login` | 로그인 | 비로그인 |
| POST | `/api/auth/logout` | 로그아웃. 서버에 저장된 `refresh_token_hash` 무효화 | 로그인 사용자 |
| POST | `/api/auth/refresh` | 리프레시 토큰으로 액세스 토큰 재발급 | 리프레시 토큰 소지자 |

본인 정보 조회/수정은 새로 만들지 않고 `docs/API_SPEC.md` 1절의 `GET /api/me`, `PATCH /api/me`를 그대로 씁니다.

### POST /api/auth/signup

요청
```json
{
  "email": "20231234@skuniv.ac.kr",
  "password": "최소 8자",
  "studentNo": "20231234",
  "department": "컴퓨터공학과",
  "enrollYear": 2023
}
```

응답 (201)
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "20231234@skuniv.ac.kr", "studentNo": "20231234", "department": "컴퓨터공학과", "enrollYear": 2023 },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  },
  "error": null
}
```

- `email` 또는 `studentNo` 중복 시 `409 Conflict`
- 비밀번호 규칙 위반(8자 미만 등) 시 `422` (`class-validator` DTO 검증)

### POST /api/auth/login

요청
```json
{ "email": "20231234@skuniv.ac.kr", "password": "..." }
```

응답 (200): signup과 동일한 `{ user, accessToken, refreshToken }` 형태.

- 이메일 없음 또는 비밀번호 불일치 시 `401 Unauthorized`, `error: "이메일 또는 비밀번호가 올바르지 않습니다"`
  (어느 쪽이 틀렸는지 구분해서 응답하지 않음 — 계정 존재 여부 노출 방지)

### POST /api/auth/logout

요청: 없음 (헤더의 `Authorization: Bearer <accessToken>`으로 사용자 식별)

응답: `204 No Content`

### POST /api/auth/refresh

요청
```json
{ "refreshToken": "eyJ..." }
```

응답 (200)
```json
{ "success": true, "data": { "accessToken": "eyJ..." }, "error": null }
```

- 리프레시 토큰 만료/불일치 시 `401 Unauthorized` → 클라이언트는 로그인 화면으로 리다이렉트

## 3. 상태 코드 (이 도메인에서 추가되는 것만)

| 코드 | 의미 | 예시 |
| --- | --- | --- |
| 401 | 인증 실패 | 로그인 비밀번호 불일치, 리프레시 토큰 만료 |
| 409 | 상태 충돌 | 이메일/학번 중복 가입 |
| 422 | 유효성 검증 실패 | 비밀번호 8자 미만, 이메일 형식 오류 |

## 4. 다른 도메인과의 연결

- `docs/API_SPEC.md`의 모든 `/api/me/...`, 관리자 전용 라우트는 이 문서의 액세스 토큰을 전제로 합니다.
- NestJS 구현 시 `AuthGuard`(JWT 검증) + `RolesGuard`(관리자 여부)를 `backend/src/common/guards/`에 추가하고,
  `docs/PROJECT_STRUCTURE.md` 컨벤션대로 `backend/src/auth/`에 `controllers/services/dto/guards/strategies` 하위 구조로 구현합니다.

## 5. 열린 질문 (팀 확인 필요)

- [ ] `email`을 학번 메일로 강제할지(도메인 검증), 아니면 아무 이메일이나 허용할지
- [ ] 리프레시 토큰을 응답 바디로 줄지, httpOnly 쿠키로 줄지 — 프론트 스택(SSR 여부) 확정 후 결정
- [ ] 비밀번호 재설정(찾기) 플로우는 이 범위에 없음 — 필요하면 별도 절 추가
