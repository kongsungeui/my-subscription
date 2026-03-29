# My Subscription

개인 구독 서비스를 한눈에 관리하는 대시보드 앱입니다. Netflix, ChatGPT 등 반복 결제 서비스를 등록하고, 월/연 단위 총 지출을 KRW로 환산해 확인할 수 있습니다.

## 주요 기능

- **구독 관리** — 리스트 상단 + 버튼으로 추가, 행 클릭으로 수정/삭제 (공용 팝업 재사용)
- **다중 통화 지원** — KRW / USD 입력, 자동 환율 환산
- **결제 주기** — 월간 / 3개월 / 6개월 / 연간 구분, 합산에 정확히 반영
- **지출 요약** — 월 총액 / 연 총액 KRW 카드
- **환율 설정** — USD→KRW 환율 직접 조정
- **테마** — Light / Dark 전환
- **세션 인증** — 쿠키 기반 로그인 (7일 유지)

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| ORM | Prisma 7 |
| 데이터베이스 | PostgreSQL |
| 언어 | TypeScript 5 |

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx             # 메인 대시보드 (로그인 / 구독 목록, Server Component)
│   ├── dashboard-client.tsx # 구독 리스트 + 추가/수정 팝업 (Client Component)
│   ├── layout.tsx           # 루트 레이아웃 (테마 적용)
│   ├── actions.ts           # 서버 액션 (CRUD, 로그인, 설정)
│   └── globals.css          # 전역 스타일 & 테마 CSS 변수
└── lib/
    ├── data.ts              # Prisma 클라이언트, DB 헬퍼, 포맷 유틸
    └── auth.ts              # 쿠키 기반 세션 인증
prisma/
├── schema.prisma            # Subscription, Settings 모델 정의
└── migrations/              # Prisma 마이그레이션 히스토리
docker-compose.yml           # 로컬 개발용 PostgreSQL
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
# postinstall 스크립트에서 Prisma 클라이언트가 자동 생성됩니다.
```

### 2. 로컬 DB 실행

```bash
docker compose up -d
```

### 3. 환경 변수 설정

`.env` 파일의 `DATABASE_URL`을 확인합니다. 기본값은 docker-compose와 일치합니다.

```env
DATABASE_URL="postgresql://myapp:myapp@localhost:5432/my_subscription"
```

배포 환경에서는 `.env.local` 또는 환경 변수로 별도 설정하세요.

### 4. 데이터베이스 마이그레이션

```bash
npx prisma migrate deploy   # 배포 / 최초 실행
npx prisma migrate dev      # 로컬 개발 (스키마 변경 시)
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 로그인 화면이 나타납니다.

> 인증 정보는 `src/lib/auth.ts`에서 확인 및 변경할 수 있습니다.

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 (webpack 모드) |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 시작 |
| `npm run lint` | ESLint 실행 |

## 데이터베이스 스키마

### Subscription

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Int | PK |
| name | String | 서비스명 |
| amountMinor | Int | 금액 (USD: 센트, KRW: 원 단위) |
| currency | KRW \| USD | 통화 |
| billingCycle | MONTHLY \| QUARTERLY \| SEMI_ANNUAL \| YEARLY | 결제 주기 |
| memo | String? | 메모 |
| isActive | Boolean | 활성 여부 |

### Settings (싱글턴)

| 필드 | 타입 | 기본값 |
|------|------|--------|
| usdToKrwRate | Int | 1350 |
| themeMode | LIGHT \| DARK | LIGHT |
