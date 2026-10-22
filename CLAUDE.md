# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트

느좋카페: 노트북 작업하기 좋은 카페를 카카오맵 위에서 찾는 모바일 웹 우선 서비스. 제품 범위와 결정 사항은 `docs/scope.md`, 단계별 구현 계획과 진행 상황은 `docs/plan.md`에 있다. 새 기능을 시작하기 전에 두 문서를 확인하고, 단계를 마치면 `docs/plan.md`를 갱신한다. 사용자와의 대화는 한국어로 한다.

## 명령어

- `npm run dev`: 개발 서버 (**포트 3030 고정**, 카카오 도메인 등록이 `http://localhost:3030` 기준)
- `npm run build` / `npm start`: 프로덕션 빌드 및 실행 (3030)
- `npm run typecheck`: `tsc --noEmit`

테스트 러너와 린터는 아직 없다. 변경 후에는 typecheck를 돌리고 브라우저에서 확인한다.

## 스택과 주의점

- Next.js 16 (App Router) + React 19 + Tailwind CSS v4 (`@tailwindcss/postcss`, `globals.css`의 `@import "tailwindcss"`).
- TypeScript는 **5.x로 고정**했다. 7.x는 Next.js의 타입 검사와 호환되지 않을 수 있다.
- **UI는 shadcn/ui** (`components.json`, style `base-nova`, Radix가 아니라 **Base UI** 기반, 아이콘은 `lucide-react`). 컴포넌트는 `npx shadcn@latest add <name>`으로 `src/components/ui/`에 추가하고, 이 폴더의 파일은 직접 고치지 않는다. 생성된 컴포넌트는 `cn`을 npm 패키지 `cn`(shadcn 공식, clsx+tailwind-merge 대체)에서 가져오며, 앱 코드에서는 `@/lib/utils`의 `cn`을 쓴다.
- 색은 `stone-*` 같은 팔레트 대신 테마 토큰(`bg-muted`, `text-muted-foreground`, `border` 등)을 쓴다. 작업에 유리한 속성 강조용으로 커스텀 토큰 `positive` / `positive-foreground`를 `globals.css`에 추가했다 (light/dark 모두 정의).
- 폰트: Geist(라틴) + Noto Sans KR(한글), `globals.css`의 `--font-sans`에서 조합한다.
- 경로 별칭: `@/*` → `src/*`, `@data/*` → `data/*`.
- 환경변수 (템플릿 `.env.example`, 배포 시 Vercel 환경변수에 같은 이름으로 설정):
  - `NEXT_PUBLIC_KAKAO_MAP_KEY`: 카카오 **JavaScript 키**. 배포 도메인도 카카오 플랫폼(Web)에 등록해야 지도가 뜬다.
  - `OPENAI_API_KEY`: **서버 전용**. `app/api/chat/route.ts`에서만 읽는다. `NEXT_PUBLIC_` 접두사를 붙이지 않는다.

## 아키텍처

데이터 흐름: `data/cafes.json` → `src/lib/cafes.ts` (`getCafes`, `getCafeById`) → `src/app/page.tsx` (서버 컴포넌트) → `CafeExplorer` (클라이언트).

- **데이터 접근 계층**: 화면 코드는 JSON을 직접 import하지 않고 반드시 `lib/cafes.ts`를 거친다. 로그인·제보(UGC) 단계에서는 이 파일 내부만 DB로 바꾸는 것이 설계 의도다. 함수가 `async`인 것도 이 때문이다.
- **스키마**: 원본은 `data/cafes.json`이고, 타입과 한글 라벨은 `src/types/cafe.ts`에 있다. scope.md 초안과 달리 실제 JSON 필드(`outlet`, `wifi: boolean`, `noise`, `work_fit` 등)가 기준이다.
- **카카오맵 SDK**: 래퍼 라이브러리 없이 `components/map/useKakaoLoader.ts`가 `autoload=false`로 스크립트를 한 번만 삽입하고 `kakao.maps.load`를 기다린다. 사용하는 SDK API는 `src/types/kakao.d.ts`에 직접 선언하므로, 새 API를 쓰면 여기에 선언을 추가한다.
- **지도 컴포넌트** (`CafeMap`): 지도와 마커는 `[status, cafes]`가 바뀔 때만 다시 만든다. 부모 콜백은 `handlersRef`로 참조해서 콜백이 바뀌어도 지도를 다시 만들지 않는다. 선택 상태는 `CafeExplorer`가 들고 있고, 지도는 `selectedId`를 받아 마커가 바텀시트(`CafeDetailSheet`)에 가리지 않게 중심을 옮긴다.
- **AI 추천 챗봇**: `ChatWidget`(클라이언트)이 대화 기록 전체를 `POST /api/chat`으로 보내고, 라우트가 OpenAI Responses API(모델 `gpt-6-luna`, `reasoning.effort: "none"`)를 호출한다. 카페 데이터는 `getCafes()`로 읽어 instructions에 넣고, JSON 스키마 structured output의 `id` enum으로 실제 카페 id만 나오게 한 뒤 서버에서 한 번 더 걸러낸다. 추천 카드 클릭은 `CafeExplorer`의 `setSelectedId`로 이어져 지도 이동과 상세 카드를 재사용한다. 대화는 클라이언트 상태에만 있다 (저장 없음).
- **영업시간**: `lib/hours.ts`. `close_time <= open_time`이면 익일 마감으로 해석한다 (`"00:00"` → 24:00).
