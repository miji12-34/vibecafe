# 느좋카페 구현 계획

> 최종 갱신: 2026-10-22
> 범위 근거: [scope.md](scope.md)

## 결정 사항

| 항목 | 결정 |
|---|---|
| 스택 | Next.js (App Router) + TypeScript + Tailwind CSS |
| 포트 | **3030** (`dev`, `start` 모두) |
| 지도 | 카카오맵 JavaScript SDK를 직접 로드 (래퍼 라이브러리 없음) |
| 데이터 | `data/cafes.json`이 원본(단일 소스). **현재 JSON 필드 기준으로 타입 정의** |
| 기본 권역 | 송파·잠실. 처음 열 때 전체 카페가 보이도록 지도 범위를 자동으로 맞춤 |
| 로그인·제보 | **자리만 잡기**: 데이터 접근 계층과 폴더 위치만 정하고, 구현은 2단계 이후로 미룸 |

## 폴더 구조

```
VibeCafe/
├─ .env.local                 # NEXT_PUBLIC_KAKAO_MAP_KEY (git 제외)
├─ .env.example               # 키 이름만 적은 템플릿
├─ data/
│  └─ cafes.json              # 시드 데이터
├─ docs/
│  ├─ scope.md
│  └─ plan.md
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx           # 공통 레이아웃, 모바일 viewport
│  │  ├─ page.tsx             # 서버 컴포넌트: getCafes() → <CafeMap />
│  │  └─ globals.css
│  ├─ components/
│  │  └─ map/
│  │     ├─ CafeMap.tsx       # 'use client' 지도 + 마커 렌더링
│  │     └─ useKakaoLoader.ts # SDK 스크립트 로드 (autoload=false → kakao.maps.load)
│  ├─ lib/
│  │  └─ cafes.ts             # 데이터 접근 계층 (getCafes, getCafeById)
│  └─ types/
│     ├─ cafe.ts              # Cafe 타입 + enum 라벨
│     └─ kakao.d.ts           # window.kakao 전역 타입 선언
├─ package.json               # "dev": "next dev -p 3030"
└─ tsconfig.json
```

### 설계 원칙

- **화면은 데이터 출처를 모른다.** 컴포넌트는 `lib/cafes.ts`의 함수만 호출한다. 지금은 JSON을 읽고, 나중에 로그인·제보를 붙일 때 이 파일의 내부만 DB(예: Supabase)로 바꾼다.
- **지도 SDK는 클라이언트에서만 다룬다.** `window.kakao`는 브라우저에만 있으므로 `CafeMap`만 클라이언트 컴포넌트로 두고, 데이터 로딩은 서버 컴포넌트(`page.tsx`)에서 한다.
- **나중에 생길 자리** (지금은 만들지 않음):
  - `src/app/cafes/[id]/` 카페 상세
  - `src/app/report/` 제보 폼
  - `src/app/login/` 로그인
  - `src/app/api/` 제보 저장 API

## Cafe 타입 (현재 JSON 기준)

| 필드 | 타입 | 값 |
|---|---|---|
| `id`, `name`, `address` | string | |
| `lat`, `lng` | number | 지도 좌표 |
| `naver_place_url` | string | 외부 링크 |
| `open_time`, `close_time` | string `"HH:MM"` | 자정 이후 마감은 `"00:00"`, `"02:00"` 형태 |
| `is_24h` | boolean | |
| `iced_americano_price` | number | 원 단위 |
| `outlet` | enum | `many` / `some` (현재 데이터 기준. `few`, `none` 추가 가능) |
| `wifi` | boolean | |
| `noise` | enum | `quiet` / `normal` (`loud` 추가 가능) |
| `work_fit` | enum | `good` / `ok` (`bad` 추가 가능) |
| `tags` | string[] | |
| *(선택)* `laptop_policy`, `photos`, `verified_at` | | scope.md에 있던 느좋 허용, 사진, 확인일. 데이터가 채워지면 사용 |

## 1차 구현 범위: 지도 위에 마커 표시

**완료 기준:** `npm run dev`를 실행한 뒤 `http://localhost:3030`에서 송파·잠실 지도 위에 카페 9곳의 마커가 보이고, 마커를 누르면 카페 이름이 뜬다.

0. **사전 확인 (사용자 작업):** 카카오 디벨로퍼스 → 내 애플리케이션 → 플랫폼 → Web에 `http://localhost:3030`을 등록한다. `.env.local`의 키가 **JavaScript 키**인지도 확인한다. 등록하지 않으면 지도가 빈 화면으로 나온다.
1. **프로젝트 초기화:** Next.js, TypeScript, Tailwind를 설치하고 포트 3030 스크립트, `.gitignore`, `.env.example`을 만든다. 폴더에 이미 파일이 있으므로 `create-next-app` 대신 직접 구성한다.
2. **타입과 데이터 계층:** `types/cafe.ts`, `lib/cafes.ts`(`getCafes()`)를 만든다.
3. **SDK 로더:** `useKakaoLoader`로 스크립트를 한 번만 로드하고 로드 상태를 반환한다.
4. **지도와 마커:** `CafeMap`에서 지도를 만들고 카페마다 마커를 찍는다. `LatLngBounds`로 전체가 보이게 맞추고, 클릭하면 이름이 담긴 인포윈도우를 띄운다.
5. **검증:** 3030 포트로 띄워 브라우저에서 마커 9개를 확인하고, 모바일 폭에서도 확인한다.
6. **문서 정리:** scope.md의 스키마 표를 실제 JSON 기준으로 갱신한다.

## 다음 단계 (참고)

| 단계 | 내용 |
|---|---|
| 2 ✅ | 카페 상세 카드 (바텀시트): 영업 중 여부·영업시간, 콘센트·와이파이·소음·작업 적합도, 가격, 태그, 네이버 링크. `components/cafe/`, `lib/hours.ts` |
| 3 | 필터 (콘센트·와이파이·소음·영업 중) + 리스트 뷰 |
| ✅ | AI 카페 추천 챗봇: 오른쪽 아래 버튼 → 채팅창, OpenAI Responses API(gpt-6-luna, reasoning.effort none), 추천 카드 클릭 시 지도·상세 카드로 이동. `app/api/chat`, `components/chat/` |
| 4 | 로그인 + 제보 (인증·DB 선택 → `lib/cafes.ts` 교체, `report/`·`api/` 추가) |
