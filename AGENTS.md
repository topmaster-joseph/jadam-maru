# AGENTS.md — 자담&마루 AI 운영 규칙

이 저장소의 단일 원본(Source of Truth)은 GitHub이다.
AI 작업자는 파일을 내려받아 별도 ZIP으로 배포하지 않는다.

## 운영 목표
- 사용자가 자연어로 수정 요청하면 저장소 원본을 변경한다.
- 변경은 검증 후 production branch에 반영한다.
- GitHub 변경 후 Cloudflare Pages가 자동 배포되도록 유지한다.
- 수동 ZIP 업로드, 임의 복제 사이트 생성은 금지한다.

## 데이터 우선 원칙
전화번호, 주소, 영업시간, 메뉴, 가격, 공지, 이벤트를 HTML 여러 곳에 중복 하드코딩하지 않는다.
가능한 변경은 아래 파일만 수정한다.
- `content/store.json`
- `content/menus.json`
- `content/notices.json`
- `content/events.json`
- `config/site.json`

UI 구조를 바꾸는 요청일 때만 화면 코드를 수정한다.

## 브랜드 원칙
- 공식 표기: `자담&마루`
- 매장명: `자담&마루 무안목포대점`
- 모바일 우선
- 가장 중요한 CTA는 전화 주문
- 메뉴 가격은 `content/menus.json`이 유일한 기준
- 매장 정보는 `content/store.json`이 유일한 기준

## 수정 절차
1. 현재 production 상태를 확인한다.
2. 요청과 관련된 최소 데이터 파일만 수정한다.
3. `node scripts/validate-content.mjs`를 실행한다.
4. `node scripts/build.mjs`를 실행한다.
5. main 반영 후 자동배포 상태를 확인한다.

## 안전장치
- 전화번호, 주소, 가격을 추측하지 않는다.
- 불확실한 가격은 `price: null`, `priceDisplay: "매장 확인"`으로 둔다.
- 개인정보를 저장하는 새 기능을 추가하면 개인정보처리방침을 함께 갱신한다.
- 배포 실패 시 새 수동 사이트를 만들지 말고 직전 정상 커밋으로 롤백한다.

## 완료 기준
사용자에게 “완료”라고 말하기 전에 저장소 변경과 자동배포 반영 여부를 각각 확인한다.
