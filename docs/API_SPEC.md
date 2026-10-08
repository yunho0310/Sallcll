# API 명세서

`수강신청도우미_ERD.pdf` 기준으로 앞으로 구현할 기능별 API를 정리한 문서입니다.
현재 저장소에는 `users`/`health` 예시 모듈만 있고, 아래 명세는 **구현 목표**입니다.
`docs/PROJECT_STRUCTURE.md`의 도메인 폴더 구조(`backend/src/{도메인}/controllers|services|dto|entities`)에
맞춰 도메인별로 모듈을 만들 때 이 문서를 기준으로 진행합니다.

## 0. 공통 규칙

### Base URL / 인증

- 모든 API는 `/api` 접두사를 사용합니다 (예: `GET /api/health`). 버전은 아직 붙이지 않습니다(`/api/v1` 아님) — 실제로 필요해지면 그때 버전을 도입합니다.
- `me`로 시작하는 리소스(`/api/me/...`)는 로그인한 사용자 본인 소유 데이터입니다. `Authorization: Bearer <token>` 헤더가 필요하며, 인증 방식(JWT 발급/로그인 API)은 [`docs/AUTH_API_SPEC.md`](./AUTH_API_SPEC.md)에서 별도로 정의합니다.
- 카탈로그성 데이터(과목/분반/졸업요건)의 조회(`GET`)는 로그인 사용자 누구나 가능, 생성/수정/삭제는 관리자 권한(교직원)만 가능하다고 가정합니다.

### 응답 포맷

`.claude/rules/common/patterns.md`의 API Response 규칙을 따릅니다.

```json
// 성공 (단건)
{
  "success": true,
  "data": { "...": "..." },
  "error": null
}

// 성공 (목록, 페이지네이션 포함)
{
  "success": true,
  "data": [ { "...": "..." } ],
  "error": null,
  "meta": { "total": 42, "page": 1, "limit": 20 }
}

// 실패
{
  "success": false,
  "data": null,
  "error": "사람이 읽을 수 있는 에러 메시지"
}
```

### 상태 코드

| 코드 | 의미 | 예시 |
| --- | --- | --- |
| 200 | 조회/수정 성공 | `GET`, `PATCH` |
| 201 | 생성 성공 | `POST` (신규 리소스) |
| 204 | 성공, 본문 없음 | `DELETE` |
| 400 | 잘못된 요청(형식 오류) | 필수 필드 누락 |
| 401 | 인증 실패 | 토큰 없음/만료 |
| 403 | 권한 없음 | 타인 리소스 접근, 관리자 아님 |
| 404 | 리소스 없음 | 존재하지 않는 id |
| 409 | 상태 충돌 | 시간표 시간 중복, 위시리스트 중복 추가 |
| 422 | 유효성 검증 실패 | `class-validator` DTO 검증 실패 |

### 목록 조회 공통 쿼리 파라미터

- `page`(기본 1), `limit`(기본 20): offset 기반 페이지네이션. 카탈로그처럼 검색 위주 데이터에 적합.
- `sort`: 예) `sort=-created_at`
- 그 외 필터는 도메인별 표에 명시.

---

## 1. Users — `backend/src/users`

ERD `USER`(id, student_no, department, enroll_year) 기준. 현재 스캐폴딩된 `users` 모듈(name/email 기반 예시)은
이 명세에 맞춰 필드를 교체해야 합니다.

| Method | Path | 설명 | 권한 |
| --- | --- | --- | --- |
| GET | `/api/me` | 내 정보 조회 | 로그인 사용자 |
| PATCH | `/api/me` | 내 정보 수정 (department, enroll_year) | 로그인 사용자 |
| GET | `/api/users/:id` | 특정 사용자 조회 | 관리자 |
| GET | `/api/users` | 사용자 목록 (검색: `student_no`, `department`) | 관리자 |

**User 응답 예시**
```json
{ "id": "uuid", "studentNo": "20231234", "department": "컴퓨터공학과", "enrollYear": 2023 }
```

---

## 2. Courses / Sections / TimeSlots — `backend/src/courses`

ERD `COURSE` → `COURSE_SECTION`(1:N) → `TIME_SLOT`(1:N). 학생은 조회만, 등록/수정/삭제는 관리자.

| Method | Path | 설명 | 권한 |
| --- | --- | --- | --- |
| GET | `/api/courses` | 과목 목록 (필터: `category`, `q`=과목명 검색) | 전체 |
| GET | `/api/courses/:id` | 과목 상세 | 전체 |
| POST | `/api/courses` | 과목 생성 `{ courseCode, name, credit, category }` | 관리자 |
| PATCH | `/api/courses/:id` | 과목 수정 | 관리자 |
| DELETE | `/api/courses/:id` | 과목 삭제 | 관리자 |
| GET | `/api/courses/:id/sections` | 특정 과목의 분반 목록 | 전체 |
| GET | `/api/sections` | 분반 통합 검색 (필터: `courseId`, `day`, `period`, `professor`) | 전체 |
| GET | `/api/sections/:id` | 분반 상세 (하위 `timeSlots` 포함) | 전체 |
| POST | `/api/courses/:id/sections` | 분반 생성 `{ sectionNo, professor, capacity }` | 관리자 |
| PATCH | `/api/sections/:id` | 분반 수정 | 관리자 |
| DELETE | `/api/sections/:id` | 분반 삭제 | 관리자 |
| GET | `/api/sections/:id/time-slots` | 분반의 시간 슬롯 목록 | 전체 |
| POST | `/api/sections/:id/time-slots` | 시간 슬롯 추가 `{ day, period, room }` | 관리자 |
| DELETE | `/api/sections/:id/time-slots/:timeSlotId` | 시간 슬롯 삭제 | 관리자 |

**Section 응답 예시**
```json
{
  "id": "uuid",
  "courseId": "uuid",
  "sectionNo": "01",
  "professor": "홍교수",
  "capacity": 40,
  "timeSlots": [{ "id": "uuid", "day": "MON", "period": 3, "room": "공학관 401" }]
}
```

---

## 3. Timetables — `backend/src/timetables`

ERD `USER_TIMETABLE`(1:N `TIMETABLE_ENTRY`). 학생 본인 소유 리소스이므로 `/api/me` 하위에 둡니다.

| Method | Path | 설명 | 권한 |
| --- | --- | --- | --- |
| GET | `/api/me/timetables` | 내 시간표 목록 (필터: `semester`) | 본인 |
| POST | `/api/me/timetables` | 시간표 생성 `{ semester, name }` | 본인 |
| GET | `/api/me/timetables/:id` | 시간표 상세 (`entries` 포함) | 본인 |
| PATCH | `/api/me/timetables/:id` | 시간표 이름 변경 | 본인 |
| DELETE | `/api/me/timetables/:id` | 시간표 삭제 | 본인 |
| POST | `/api/me/timetables/:id/entries` | 분반 추가 `{ sectionId }` | 본인 |
| DELETE | `/api/me/timetables/:id/entries/:entryId` | 분반 제거 | 본인 |

**시간 충돌 처리**: `POST .../entries` 시 기존 entry들의 `TIME_SLOT`과 겹치면 `409 Conflict`,
`error: "기존 시간표와 시간이 겹칩니다 (MON 3교시)"` 형태로 응답합니다.

---

## 4. Wishlist — `backend/src/wishlist`

ERD `WISHLIST_ITEM`(user_id, section_id).

| Method | Path | 설명 | 권한 |
| --- | --- | --- | --- |
| GET | `/api/me/wishlist` | 내 위시리스트 조회 | 본인 |
| POST | `/api/me/wishlist` | 위시리스트 추가 `{ sectionId }` | 본인 |
| DELETE | `/api/me/wishlist/:id` | 위시리스트 항목 삭제 | 본인 |

- 동일 `sectionId`를 중복 추가하면 `409 Conflict`.

---

## 5. Completions & Graduation — `backend/src/graduation`

ERD `USER_COMPLETION`, `GRADUATION_CHECK_RESULT`(1:1), `GRADUATION_REQUIREMENT_SET` → `REQUIRED_COURSE_GROUP` → `REQUIRED_COURSE_GROUP_ITEM`, `BALANCED_GE_AREA`.

### 5-1. 이수 내역 (본인)

| Method | Path | 설명 | 권한 |
| --- | --- | --- | --- |
| GET | `/api/me/completions` | 내 이수 과목 목록 (필터: `semester`, `status`) | 본인 |
| POST | `/api/me/completions` | 이수 기록 추가 `{ courseCode, semester, grade, status }` | 본인 |
| PATCH | `/api/me/completions/:id` | 이수 기록 수정 | 본인 |
| DELETE | `/api/me/completions/:id` | 이수 기록 삭제 | 본인 |

### 5-2. 졸업 요건 (카탈로그, 관리자 관리)

| Method | Path | 설명 | 권한 |
| --- | --- | --- | --- |
| GET | `/api/graduation-requirements` | 요건 목록 (필터: `department`, `yearRange`) | 전체 |
| GET | `/api/graduation-requirements/:id` | 요건 상세 (`requiredCourseGroups`, `balancedGeAreas` 포함) | 전체 |
| POST | `/api/graduation-requirements` | 요건 생성 `{ department, yearRange, totalCredit }` | 관리자 |
| PATCH | `/api/graduation-requirements/:id` | 요건 수정 | 관리자 |
| DELETE | `/api/graduation-requirements/:id` | 요건 삭제 | 관리자 |
| POST | `/api/graduation-requirements/:id/required-course-groups` | 필수 과목 그룹 추가 `{ groupName }` | 관리자 |
| POST | `.../required-course-groups/:groupId/items` | 그룹에 과목 추가 `{ courseCode }` | 관리자 |
| POST | `/api/graduation-requirements/:id/balanced-ge-areas` | 균형교양 영역 추가 `{ areaName, minCourses }` | 관리자 |

### 5-3. 졸업 요건 판정 (본인, 1:1)

| Method | Path | 설명 | 권한 |
| --- | --- | --- | --- |
| GET | `/api/me/graduation-check` | 최신 졸업 판정 결과 조회 (없으면 404) | 본인 |
| POST | `/api/me/graduation-check` | 판정 재실행 (이수내역 × 요건 계산 후 결과 upsert) | 본인 |

**응답 예시**
```json
{ "id": "uuid", "totalCredit": 108, "verdict": "PASS" }
```

---

## 6. Practice (모의 수강신청 연습) — `backend/src/practice`

ERD `PRACTICE_SESSION` → `PRACTICE_SEAT_POOL`(1:N), `PRACTICE_ATTEMPT`(1:N). 실제 수강신청 전 클릭 연습 기능.

| Method | Path | 설명 | 권한 |
| --- | --- | --- | --- |
| GET | `/api/me/practice-sessions` | 내 연습 세션 목록 (필터: `semester`, `status`) | 본인 |
| POST | `/api/me/practice-sessions` | 연습 세션 시작 `{ semester }` → 위시리스트 기준 seat pool 초기화 | 본인 |
| GET | `/api/me/practice-sessions/:id` | 세션 상세 (`status`) | 본인 |
| PATCH | `/api/me/practice-sessions/:id` | 세션 상태 변경 (예: 종료) `{ status }` | 본인 |
| GET | `/api/me/practice-sessions/:id/seat-pool` | 세션의 분반별 잔여 좌석 현황 | 본인 |
| POST | `/api/me/practice-sessions/:id/attempts` | 신청 시도 `{ sectionId }` | 본인 |
| GET | `/api/me/practice-sessions/:id/attempts` | 시도 이력 조회 | 본인 |

**신청 시도 응답 예시** (좌석 소진도 정상 200 응답 — 비즈니스 결과이지 에러 아님)
```json
{ "success": true, "data": { "id": "uuid", "sectionId": "uuid", "result": "FAIL_NO_SEAT" }, "error": null }
```

---

## 부록 A. ERD 엔티티 ↔ API 리소스 매핑

| ERD 엔티티 | API 리소스 | 비고 |
| --- | --- | --- |
| USER | `/api/me`, `/api/users` | |
| COURSE | `/api/courses` | |
| COURSE_SECTION | `/api/sections`, `/api/courses/:id/sections` | |
| TIME_SLOT | `/api/sections/:id/time-slots` | |
| USER_TIMETABLE | `/api/me/timetables` | |
| TIMETABLE_ENTRY | `/api/me/timetables/:id/entries` | |
| WISHLIST_ITEM | `/api/me/wishlist` | |
| USER_COMPLETION | `/api/me/completions` | |
| GRADUATION_REQUIREMENT_SET | `/api/graduation-requirements` | |
| REQUIRED_COURSE_GROUP(_ITEM) | `/api/graduation-requirements/:id/required-course-groups(/...)` | |
| BALANCED_GE_AREA | `/api/graduation-requirements/:id/balanced-ge-areas` | |
| GRADUATION_CHECK_RESULT | `/api/me/graduation-check` | 1:1 |
| PRACTICE_SESSION | `/api/me/practice-sessions` | |
| PRACTICE_SEAT_POOL | `/api/me/practice-sessions/:id/seat-pool` | |
| PRACTICE_ATTEMPT | `/api/me/practice-sessions/:id/attempts` | |

## 부록 B. 구현 순서 제안

1. **courses** (Course/Section/TimeSlot) — 다른 모든 도메인이 참조하는 기초 데이터
2. **users** 필드를 ERD에 맞게 교체 (student_no/department/enroll_year)
3. **timetables**, **wishlist** — 학생 개인화 기능
4. **graduation** — 이수내역 + 졸업요건 + 판정
5. **practice** — 나머지 도메인에 의존하는 연습 기능 (가장 나중)

각 도메인은 `docs/PROJECT_STRUCTURE.md`의 `controllers/ services/ dto/ entities/` 하위 구조를 그대로 따릅니다.
