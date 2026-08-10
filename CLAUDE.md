# CLAUDE.md — 자담&마루 Claude Code 운영 규칙

`AGENTS.md`를 최우선 운영 규칙으로 함께 읽고 따른다.

Claude Code 작업 시:
- GitHub 저장소를 단일 원본으로 사용한다.
- 사용자의 자연어 요청을 먼저 데이터 변경인지 UI 변경인지 분류한다.
- 데이터 변경이면 `content/*.json`만 우선 수정한다.
- UI 변경은 최소 범위로 수행한다.
- 수동 Cloudflare 업로드나 별도 배포본을 만들지 않는다.
- 검증 후 production 반영은 `main`을 기준으로 수행한다.
