# 자담&마루 AI 운영형 홈페이지

자담치킨, 피자마루, 요거트퍼플을 한 매장에서 안내하는 자담&마루 무안목포대점 사이트입니다.

## 운영 원칙
이 저장소가 사이트의 단일 원본(Source of Truth)입니다.
사용자는 자연어로 변경을 요청하고, AI는 GitHub 원본을 수정합니다. `main` 반영 후 검증·빌드·Cloudflare Pages 배포가 자동으로 이어지도록 구성합니다.

## 일상 수정 위치
- 전화·주소·영업시간: `content/store.json`
- 메뉴·가격: `content/menus.json`
- 상단 공지: `content/notices.json`
- 행사·프로모션: `content/events.json`
- Marketing AI 적용사례 설정: `content/marketing-ai-cases.json`

## Marketing AI 적용사례
공통 제품명은 `마케팅AI`로 표시하고 각 점포 브랜드를 전면에 둡니다. 화면 하단은 공통으로 `Powered by EKODIBIZ`를 사용합니다.

현재 개별상인형 적용사례:
- 자담치킨 목포대점
- 피자마루 목포대점
- 요거트퍼플 목포대점

`publicLinksEnabled=false` 또는 점포 상태가 `approved`가 아니면 적용사례 목록에서 링크를 만들지 않습니다. 개별 화면도 QA 전에는 `noindex,nofollow`와 비활성 액션을 유지합니다.

이 `marketing-ai` 하위 구조는 검증 후 독립 `marketing-ai` 저장소로 이동하기 쉽게 소스와 설정을 분리해 둡니다. Core 데이터와 기능은 복제하지 않고 공통 Marketing AI Core를 사용합니다.

## 자동 처리
1. `node scripts/validate-content.mjs`
2. `node scripts/build.mjs`
3. `node scripts/build-marketing-ai.mjs`
4. `dist/` 정적 사이트 생성
5. GitHub Actions가 Cloudflare Pages 프로젝트 `jadam-maru`로 자동 배포

## AI 작업 규칙
- Codex/ChatGPT: `AGENTS.md`
- Claude Code: `CLAUDE.md` + `AGENTS.md`
- ZIP 수동배포 및 별도 임시 production 사이트 생성 금지
- 확인되지 않은 가격은 추측하지 않고 `매장 확인`으로 유지

## Production
- Branch: `main`
- Cloudflare Pages project: `jadam-maru`
- Public URL: `https://jadam-maru.pages.dev/`

## 복구
기존 main은 `backup/main-before-ai-ops-20260810` 브랜치에 보존합니다.
