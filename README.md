# 자담&마루 운영매장 AI 홈페이지

자담치킨 목포대점, 피자마루 목포대점, 요거트퍼플 목포대점은 동일한 운영사업자가 관리하지만 서로 다른 가게와 메뉴로 운영됩니다. 이 저장소의 메인은 세 매장을 하나의 메뉴판으로 합치는 페이지가 아니라, 공통 운영정보 아래 각 독립 매장으로 연결하는 운영 허브입니다.

## 운영 원칙
이 저장소가 사이트의 단일 원본(Source of Truth)입니다.
사용자는 자연어로 변경을 요청하고, AI는 GitHub 원본을 수정합니다. `main` 반영 후 검증·빌드·Cloudflare Pages 배포가 자동으로 이어지도록 구성합니다.

- 공통 운영주체 정보는 한 곳에서 관리합니다.
- 자담치킨, 피자마루, 요거트퍼플의 메뉴·주문·채널은 서로 섞지 않습니다.
- 각 매장은 독립 고객페이지와 독립 Marketing AI Workspace를 가집니다.
- 확인되지 않은 매장별 전화·주소·가격·채널은 추측하지 않습니다.

## 일상 수정 위치
- 공통 운영정보: `content/store.json`
- 운영주체와 독립 매장 연결관계: `content/operator-stores.json`
- 매장별 메뉴·가격: `content/menus.json`
- 상단 공지: `content/notices.json`
- 행사·프로모션: `content/events.json`
- Marketing AI 적용사례 설정: `content/marketing-ai-cases.json`
- 실증용 AI 직원 설정: `content/marketing-ai-store-pilots.json`

## 운영 매장
- 자담치킨 목포대점: `https://jadam.ekodi.kr/` / Marketing AI `https://jadam.ai.ekodi.kr/`
- 피자마루 목포대점: `https://pizzamaru.ekodi.kr/` / Marketing AI `https://pizzamaru.ai.ekodi.kr/`
- 요거트퍼플 목포대점: `https://yogurt.ekodi.kr/` / Marketing AI `https://yogurt.ai.ekodi.kr/`

## Marketing AI 적용사례
공통 제품명은 `마케팅AI`로 표시하고 각 점포 브랜드를 전면에 둡니다. 화면 하단은 공통으로 `Powered by EKODIBIZ`를 사용합니다.

`publicLinksEnabled=false` 또는 점포 상태가 `approved`가 아니면 적용사례 목록에서 링크를 만들지 않습니다. 개별 화면도 QA 전에는 `noindex,nofollow`와 비활성 액션을 유지합니다.

이 `marketing-ai` 하위 구조는 검증 후 독립 `marketing-ai` 저장소로 이동하기 쉽게 소스와 설정을 분리해 둡니다. Core 데이터와 기능은 복제하지 않고 공통 Marketing AI Core를 사용합니다.

## 자동 처리
1. `node scripts/validate-content.mjs`
2. `node scripts/build.mjs`
3. `node scripts/patch-operator-main.mjs`
4. `node scripts/build-marketing-ai.mjs`
5. 개별 Marketing AI 패치·검증
6. `dist/` 정적 사이트 생성
7. GitHub Actions가 Cloudflare Pages 프로젝트로 배포

## AI 작업 규칙
- Codex/ChatGPT: `AGENTS.md`
- Claude Code: `CLAUDE.md` + `AGENTS.md`
- ZIP 수동배포 및 별도 임시 production 사이트 생성 금지
- 확인되지 않은 가격은 추측하지 않고 `매장 확인`으로 유지
- 공통 운영자와 개별 매장 정보를 혼합해 하나의 통합매장처럼 표현하지 않음

## Production
- Branch: `main`
- Cloudflare Pages project: `jadam-maru`
- Public URL: `https://jadam-maru.pages.dev/`

## 복구
기존 main은 `backup/main-before-ai-ops-20260810` 브랜치에 보존합니다.
