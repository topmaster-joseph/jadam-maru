import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pilotPath = path.join(root, 'content', 'marketing-ai-store-pilots.json');
const config = JSON.parse(fs.readFileSync(pilotPath, 'utf8'));
const esc = (value = '') => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const requiredChannelFields = ['type', 'status', 'address', 'connected', 'auth', 'capabilities', 'lastChecked'];

function validatePilot(pilot) {
  if (!pilot?.slug || !pilot?.storeName || !pilot?.aiRole || !pilot?.mission) {
    throw new Error('Marketing AI pilot requires slug, storeName, aiRole and mission.');
  }
  if (!Array.isArray(pilot.channels) || pilot.channels.length < 3) {
    throw new Error(`${pilot.slug}: at least three channel rows are required.`);
  }
  for (const row of pilot.channels) {
    for (const field of requiredChannelFields) {
      if (!(field in row)) throw new Error(`${pilot.slug}: channel field missing: ${field}`);
    }
  }
  if (!Array.isArray(pilot.weeklyPlan) || pilot.weeklyPlan.length < 3) {
    throw new Error(`${pilot.slug}: weekly plan must be prepared before content generation.`);
  }
}

const style = `
<style data-ekodi-marketing-pilot-style>
.pilot-wrap{margin:18px 0 22px;display:grid;gap:14px}.pilot-brief,.pilot-panel{background:#fff;border:1px solid #dfe5ea;border-radius:20px;padding:20px}.pilot-brief{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(240px,.8fr);gap:18px;align-items:start}.pilot-kicker{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px}.pilot-chip{display:inline-flex;align-items:center;padding:6px 9px;border-radius:999px;background:#eef2f5;color:#596673;font-size:11px;font-weight:900}.pilot-chip.safe{background:#e9f7ef;color:#146c43}.pilot-brief h2,.pilot-panel h2{margin:0;letter-spacing:-.035em}.pilot-brief h2{font-size:clamp(25px,4vw,34px)}.pilot-brief p{margin:9px 0 0;color:#66727e;line-height:1.65}.pilot-goals{display:grid;gap:8px}.pilot-goal{padding:12px;border-radius:14px;background:#f6f8fa}.pilot-goal small{display:block;color:#66727e;margin-bottom:4px}.pilot-goal strong{font-size:14px}.pilot-flow{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-top:14px}.pilot-step{padding:11px 9px;border-radius:13px;background:#f6f8fa;text-align:center}.pilot-step b{display:block;font-size:12px}.pilot-step small{display:block;margin-top:3px;color:#66727e;font-size:10px}.pilot-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.pilot-head p{margin:5px 0 0;color:#66727e;font-size:13px;line-height:1.55}.pilot-state{white-space:nowrap;padding:7px 10px;border-radius:999px;background:#fff4d6;color:#7a4d00;font-size:11px;font-weight:900}.pilot-table-wrap{overflow:auto;border:1px solid #e7ebef;border-radius:14px}.pilot-table{width:100%;min-width:920px;border-collapse:collapse;font-size:12px}.pilot-table th,.pilot-table td{text-align:left;padding:11px 10px;border-bottom:1px solid #eef2f5;vertical-align:top}.pilot-table th{background:#f7f9fa;color:#596673;font-size:11px;white-space:nowrap}.pilot-table tr:last-child td{border-bottom:0}.pilot-address{max-width:220px;overflow-wrap:anywhere}.pilot-plan{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pilot-plan article{border:1px solid #e7ebef;border-radius:15px;padding:14px}.pilot-plan small{display:flex;justify-content:space-between;gap:10px;color:#66727e}.pilot-plan strong{display:block;margin:7px 0 5px;font-size:15px}.pilot-plan p{margin:0;color:#66727e;font-size:12px;line-height:1.55}.pilot-approval{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.pilot-approval div{border:1px solid #e7ebef;border-radius:13px;padding:11px}.pilot-approval b{display:block;font-size:12px}.pilot-approval span{display:block;color:#66727e;font-size:10px;margin-top:4px}.pilot-kpis{display:flex;gap:7px;flex-wrap:wrap}.pilot-kpis span{background:#f3f6f8;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:800}.pilot-note{padding:12px 14px;border-radius:14px;background:#fff8e8;color:#6e4a00;font-size:12px;line-height:1.6}.pilot-actions{display:flex;gap:8px;flex-wrap:wrap}.pilot-actions button{border:1px solid #d5dce2;background:#fff;border-radius:12px;padding:10px 13px;font-weight:850;color:#66727e}.pilot-actions button.primary{background:#17202a;color:#fff;border-color:#17202a}.pilot-actions button:disabled{opacity:.7;cursor:not-allowed}@media(max-width:760px){.pilot-brief{grid-template-columns:1fr}.pilot-flow{grid-template-columns:repeat(3,1fr)}.pilot-plan{grid-template-columns:1fr}.pilot-approval{grid-template-columns:1fr 1fr}.pilot-head{display:block}.pilot-state{display:inline-flex;margin-top:8px}}
</style>`;

function channelRows(pilot) {
  return pilot.channels.map(row => `<tr>
    <td><b>${esc(row.type)}</b></td>
    <td>${esc(row.status)}</td>
    <td class="pilot-address">${/^https:\/\//.test(row.address) ? `<a href="${esc(row.address)}" target="_blank" rel="noopener">${esc(row.address)}</a>` : esc(row.address)}</td>
    <td>${esc(row.connected)}</td>
    <td>${esc(row.auth)}</td>
    <td>${esc(row.capabilities)}</td>
    <td>${esc(row.lastChecked)}</td>
  </tr>`).join('');
}

function weeklyPlan(pilot) {
  return pilot.weeklyPlan.map(row => `<article>
    <small><span>${esc(row.slot)}</span><span>${esc(row.status)}</span></small>
    <strong>${esc(row.goal)}</strong>
    <p>${esc(row.action)}</p>
  </article>`).join('');
}

function pilotMarkup(pilot) {
  const goals = pilot.primaryGoals.map(goal => `<div class="pilot-goal"><small>우선 목표</small><strong>${esc(goal)}</strong></div>`).join('');
  const kpis = pilot.kpis.map(item => `<span>${esc(item)}</span>`).join('');
  return `<section class="pilot-wrap" data-ekodi-marketing-pilot="${esc(pilot.slug)}">
    <section class="pilot-brief">
      <div>
        <div class="pilot-kicker"><span class="pilot-chip">PRE-PILOT</span><span class="pilot-chip safe">HUMAN APPROVAL</span></div>
        <h2>${esc(pilot.aiRole)}</h2>
        <p>${esc(pilot.mission)}</p>
        <div class="pilot-flow" aria-label="Marketing AI 업무 루프">
          <div class="pilot-step"><b>RESEARCH</b><small>먼저 조사</small></div><div class="pilot-step"><b>PREPARE</b><small>먼저 계획</small></div><div class="pilot-step"><b>APPROVE</b><small>사람 검수</small></div><div class="pilot-step"><b>EXECUTE</b><small>승인 후 실행</small></div><div class="pilot-step"><b>MEASURE</b><small>성과 기록</small></div><div class="pilot-step"><b>LEARN</b><small>다음 계획</small></div>
        </div>
      </div>
      <div class="pilot-goals">${goals}</div>
    </section>

    <section class="pilot-panel">
      <div class="pilot-head"><div><h2>점포 기초정보</h2><p>공식·공개자료를 먼저 조사하고 점주는 틀린 정보와 미확인 항목만 수정합니다.</p></div><span class="pilot-state">${esc(pilot.profile.status)} · ${esc(pilot.profile.confidence)}</span></div>
      <div class="pilot-kpis">${pilot.profile.researchPriority.map(item => `<span>${esc(item)}</span>`).join('')}</div>
      <p class="pilot-note">입력 원칙: ${esc(pilot.profile.ownerInputPolicy)}</p>
    </section>

    <section class="pilot-panel">
      <div class="pilot-head"><div><h2>채널 연결 현황</h2><p>발견과 연결, 정식 로그인·권한승인을 분리합니다. 공식 권한이 없는 채널에는 자동게시하지 않습니다.</p></div><span class="pilot-state">자동조사 + 점주확인</span></div>
      <div class="pilot-table-wrap"><table class="pilot-table"><thead><tr><th>채널구분</th><th>상태</th><th>채널주소</th><th>연결여부</th><th>정식 로그인·권한승인</th><th>사용가능 기능</th><th>최근확인</th></tr></thead><tbody>${channelRows(pilot)}</tbody></table></div>
    </section>

    <section class="pilot-panel">
      <div class="pilot-head"><div><h2>이번 주 계획 · AI 사전준비</h2><p>빈 화면에서 시작하지 않습니다. AI가 초안을 준비하고 점주가 계획을 먼저 검수합니다.</p></div><span class="pilot-state">계획 승인 전</span></div>
      <div class="pilot-plan">${weeklyPlan(pilot)}</div>
      <div class="pilot-actions" style="margin-top:12px"><button class="primary" type="button" disabled>주간계획 검수 · 연결 예정</button><button type="button" disabled>수정 요청 · 연결 예정</button></div>
    </section>

    <section class="pilot-panel">
      <div class="pilot-head"><div><h2>승인 게이트</h2><p>콘텐츠 생성과 외부 게시를 분리해 검수 흔적과 책임선을 남깁니다.</p></div><span class="pilot-state">외부 자동실행 OFF</span></div>
      <div class="pilot-approval"><div><b>1. 기초정보 확인</b><span>점주 검수</span></div><div><b>2. 주간계획 승인</b><span>생성 전 필수</span></div><div><b>3. 콘텐츠 생성</b><span>승인 계획만</span></div><div><b>4. 최종 콘텐츠 승인</b><span>게시 전 필수</span></div><div><b>5. 연결채널 배포</b><span>공식 권한만</span></div></div>
    </section>

    <section class="pilot-panel">
      <div class="pilot-head"><div><h2>성과 · 학습</h2><p>조회수만 보지 않고 점포 행동성과와 AI의 업무 품질을 함께 기록합니다.</p></div><span class="pilot-state">실증 전 · 기준값 0</span></div>
      <div class="pilot-kpis">${kpis}</div>
      <p class="pilot-note">Pre-Pilot에서는 실제 외부 자동게시를 켜지 않습니다. 정식 OAuth/API 권한, 점주 승인, 채널별 정책을 확인한 뒤 승인된 연결채널부터 단계적으로 실행합니다.</p>
    </section>
  </section>`;
}

for (const pilot of config.cases || []) {
  validatePilot(pilot);
  const file = path.join(root, 'dist', 'marketing-ai', pilot.slug, 'index.html');
  if (!fs.existsSync(file)) throw new Error(`${pilot.slug}: generated Marketing AI workspace not found: ${file}`);
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('data-ekodi-marketing-pilot-style')) html = html.replace('</head>', `${style}</head>`);
  if (!html.includes('data-ekodi-marketing-pilot=')) {
    const panel = pilotMarkup(pilot);
    const marker = '<section class="grid">';
    html = html.includes(marker) ? html.replace(marker, `${panel}${marker}`) : html.replace('</main>', `${panel}</main>`);
  }
  html = html
    .replace('오늘의 콘텐츠', '오늘의 AI 업무')
    .replace('추천 초안 준비', '주간계획 준비')
    .replace('콘텐츠 만들기 · 검수 후 활성화', '주간계획 승인 후 콘텐츠 생성')
    .replace('채널 게시 · 검수 후 활성화', '최종 승인 후 연결채널 배포');
  if (!html.includes(`data-ekodi-marketing-pilot="${pilot.slug}"`)) throw new Error(`${pilot.slug}: pilot markup injection failed.`);
  fs.writeFileSync(file, html);
}

console.log(`✅ Marketing AI store pilot workspaces ${(config.cases || []).length}개 반영 완료`);
