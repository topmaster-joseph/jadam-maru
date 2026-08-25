import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'dist', 'marketing-ai', 'jadam', 'index.html');
const pilotConfig = JSON.parse(fs.readFileSync(path.join(root, 'content', 'marketing-ai-store-pilots.json'), 'utf8'));
const menus = JSON.parse(fs.readFileSync(path.join(root, 'content', 'menus.json'), 'utf8'));
const store = JSON.parse(fs.readFileSync(path.join(root, 'content', 'store.json'), 'utf8'));
const pilot = (pilotConfig.cases || []).find(item => item.slug === 'jadam');
const chicken = (menus.brands || []).find(item => item.id === 'chicken');

if (!fs.existsSync(file)) throw new Error('Jadam generated workspace is missing');
if (!pilot) throw new Error('Jadam pilot configuration is missing');
if (!chicken) throw new Error('Jadam chicken menu data is missing');

const esc = (value = '') => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const won = value => Number.isFinite(Number(value)) ? `${Number(value).toLocaleString('ko-KR')}원` : '매장 확인';

const menuCards = (chicken.items || []).map((item, index) => `
  <article class="jadam-menu-card" data-menu-index="${index}">
    <small>${index === 0 ? 'CORE' : index === 1 ? 'PEAK' : 'VARIETY'}</small>
    <strong>${esc(item.name)}</strong>
    <span>${esc(item.priceDisplay || won(item.price))}</span>
  </article>`).join('');

const weeklyCards = (pilot.weeklyPlan || []).map(row => `
  <article class="jadam-plan-card">
    <small>${esc(row.slot)}</small>
    <strong>${esc(row.goal)}</strong>
    <p>${esc(row.action)}</p>
    <span>${esc(row.status)}</span>
  </article>`).join('');

const channelRows = (pilot.channels || []).map(row => `
  <tr>
    <td><b>${esc(row.type)}</b></td>
    <td>${esc(row.status)}</td>
    <td>${esc(row.connected)}</td>
    <td>${esc(row.auth)}</td>
    <td>${esc(row.capabilities)}</td>
  </tr>`).join('');

const kpis = (pilot.kpis || []).map(item => `<span>${esc(item)}<b>연동 전</b></span>`).join('');

const privateWorkspace = `
<section class="jadam-private-workspace" data-jadam-private-workspace>
  <section class="jadam-command-hero">
    <div class="jadam-command-copy">
      <div class="jadam-kicker"><span>JADAM MOKPO NAT'L UNIV.</span><b>PRIVATE AI OPS</b></div>
      <h1>자담치킨 목포대점의<br><em>오늘 장사를 먼저 읽습니다.</em></h1>
      <p>일반 마케팅 화면이 아닙니다. 이 점포의 영업시간, 확인된 메뉴, 대학가 시간대, 주문·포장·재주문 목표를 기준으로 오늘 할 일을 먼저 정리하는 전용 AI 운영실입니다.</p>
      <div class="jadam-facts">
        <span><small>영업</small>${esc(store.hours?.display || '')}</span>
        <span><small>포장 기준</small>${esc(store.pickupMinutes?.['자담치킨'] || '')}분</span>
        <span><small>전화</small>${esc(store.phone || '')}</span>
      </div>
    </div>
    <aside class="jadam-live-brief" data-jadam-daypart-ops>
      <small>NOW · STORE BRIEF</small>
      <strong id="jadamDaypart">시간대 분석 중</strong>
      <p id="jadamDaypartReason">현재 시각과 요일을 기준으로 오늘의 우선순위를 정리합니다.</p>
      <dl>
        <div><dt>지금 밀 메뉴</dt><dd id="jadamFocusMenu">확인 중</dd></div>
        <div><dt>우선 행동</dt><dd id="jadamPriorityAction">확인 중</dd></div>
        <div><dt>외부 실행</dt><dd>사람 승인 후</dd></div>
      </dl>
    </aside>
  </section>

  <section class="jadam-ops-grid">
    <article class="jadam-ops-card priority"><small>01 · ORDER</small><strong>저녁 주문</strong><p>16:30 예열 → 17:30 피크 전환. 대학가 저녁 수요에 맞춰 주력 메뉴와 짧은 주문 문구를 먼저 준비합니다.</p></article>
    <article class="jadam-ops-card"><small>02 · PICKUP</small><strong>포장 전환</strong><p>배달만 보지 않습니다. ${esc(store.pickupMinutes?.['자담치킨'] || '')}분 포장 기준을 활용해 가까운 고객의 직접 포장 선택을 끌어냅니다.</p></article>
    <article class="jadam-ops-card"><small>03 · REORDER</small><strong>재주문</strong><p>한 번의 노출보다 다시 찾을 이유를 남깁니다. 승인된 채널의 반응과 주문 확인값이 쌓이면 재주문 가설을 주 단위로 갱신합니다.</p></article>
    <article class="jadam-ops-card"><small>04 · OFF-PEAK</small><strong>비수시간 수요</strong><p>피크만 따라가지 않고 오후·비수시간에 먹을 이유와 상황을 제안해 빈 시간의 수요를 실험합니다.</p></article>
  </section>

  <section class="jadam-panel">
    <div class="jadam-panel-head"><div><small>MENU INTELLIGENCE</small><h2>확인된 메뉴를 기준으로 판단</h2><p>추측 메뉴나 임의 가격은 쓰지 않습니다. 확인된 자담치킨 메뉴만 오늘의 제안 후보로 사용합니다.</p></div><span>${esc(menus.lastVerified || '')} 확인</span></div>
    <div class="jadam-menu-grid">${menuCards}</div>
    <p class="jadam-context-note" id="jadamMenuHypothesis">오늘의 메뉴 가설을 계산하고 있습니다.</p>
  </section>

  <section class="jadam-panel">
    <div class="jadam-panel-head"><div><small>WEEKLY OPERATING PLAN</small><h2>이번 주, 자담치킨이 먼저 할 일</h2><p>빈 입력창에서 시작하지 않습니다. AI가 점포 목표와 시간대를 바탕으로 계획을 준비하고 사용자는 틀린 부분을 고치고 승인합니다.</p></div><span>계획 승인 전</span></div>
    <div class="jadam-plan-grid">${weeklyCards}</div>
  </section>

  <section class="jadam-panel jadam-approval-panel">
    <div class="jadam-panel-head"><div><small>HUMAN APPROVAL GATE</small><h2>AI는 준비하고, 사람은 책임 있게 승인</h2><p>조사·계획·콘텐츠·외부게시를 한 덩어리로 자동 실행하지 않습니다. 자담치킨 운영의 책임선을 단계마다 남깁니다.</p></div><span>자동게시 OFF</span></div>
    <div class="jadam-approval-lane">
      <div><b>1</b><strong>매장정보</strong><span>확인</span></div><i>→</i>
      <div><b>2</b><strong>주간계획</strong><span>승인</span></div><i>→</i>
      <div><b>3</b><strong>콘텐츠</strong><span>생성</span></div><i>→</i>
      <div><b>4</b><strong>최종본</strong><span>승인</span></div><i>→</i>
      <div><b>5</b><strong>연결채널</strong><span>배포</span></div>
    </div>
  </section>

  <section class="jadam-panel">
    <div class="jadam-panel-head"><div><small>CHANNEL READINESS</small><h2>채널은 ‘발견’과 ‘권한’을 구분</h2><p>주소를 찾았다고 연결된 것으로 처리하지 않습니다. 공식 로그인·OAuth/API 권한이 확인된 채널만 실제 실행 대상으로 바뀝니다.</p></div><span>점포별 격리</span></div>
    <div class="jadam-channel-wrap"><table class="jadam-channel-table"><thead><tr><th>채널</th><th>조사상태</th><th>연결</th><th>권한</th><th>가능 기능</th></tr></thead><tbody>${channelRows}</tbody></table></div>
  </section>

  <section class="jadam-panel">
    <div class="jadam-panel-head"><div><small>REAL KPI ONLY</small><h2>숫자를 꾸며내지 않는 성과판</h2><p>실제 채널·주문 데이터가 연결되기 전에는 0이나 가짜 성장률을 보여주지 않습니다. 데이터가 들어오는 순간부터 점포 성과와 AI 업무 품질을 함께 기록합니다.</p></div><span>실데이터 연결 전</span></div>
    <div class="jadam-kpi-grid">${kpis}</div>
  </section>

  <section class="jadam-store-strip">
    <div><small>STORE</small><strong>자담치킨 목포대점</strong><span>${esc(store.address || '')}</span></div>
    <a href="${esc(store.phoneHref || '#')}">매장 전화 ${esc(store.phone || '')}</a>
  </section>
</section>`;

const gate = `
<section class="jadam-access-gate" data-jadam-access-gate aria-live="polite">
  <div class="jadam-gate-card">
    <div class="jadam-gate-mark">J</div>
    <small>PRIVATE · STORE-SPECIFIC AI</small>
    <h1>자담치킨 목포대점<br>전용 AI 운영실</h1>
    <p>일반 공개 서비스가 아닙니다. 에코디에 사전 승인된 자담치킨 관계자·운영계정만 이 점포의 AI 업무공간에 들어갈 수 있습니다.</p>
    <div class="jadam-gate-status" id="jadamGateStatus"><b></b><span>승인 계정 확인 대기</span></div>
    <a id="jadamGateLogin" href="https://auth.ekodi.kr/?site=jadam-client">승인된 Google 계정으로 로그인</a>
    <span class="jadam-gate-note">Google 로그인만으로는 열리지 않습니다. 자담치킨 고객권한 확인까지 완료되어야 합니다.</span>
  </div>
</section>`;

const style = `
<style data-jadam-private-style>
body.tenant-jadam:not(.jadam-private-authorized){overflow:hidden;background:#170e0d}
body.tenant-jadam:not(.jadam-private-authorized)>.shell{display:none!important}
body.tenant-jadam.jadam-private-authorized>.jadam-access-gate{display:none!important}
.jadam-access-gate{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 20% 15%,rgba(181,43,34,.28),transparent 32%),radial-gradient(circle at 80% 80%,rgba(255,255,255,.05),transparent 28%),#170e0d;color:#fff}
.jadam-gate-card{width:min(520px,100%);border:1px solid rgba(255,255,255,.12);border-radius:28px;padding:clamp(28px,6vw,48px);background:rgba(37,22,20,.88);box-shadow:0 34px 100px rgba(0,0,0,.34);text-align:center}.jadam-gate-mark{width:58px;height:58px;margin:0 auto 18px;display:grid;place-items:center;border-radius:18px;background:#b52b22;font-size:30px;font-weight:950}.jadam-gate-card>small{color:#d9bbb6;font-weight:900;letter-spacing:.14em}.jadam-gate-card h1{font-size:clamp(32px,7vw,48px);line-height:1.08;letter-spacing:-.055em;margin:13px 0}.jadam-gate-card p{color:#d6c8c5;line-height:1.7;font-size:14px}.jadam-gate-status{margin:20px 0 12px;padding:12px 14px;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;gap:9px;font-size:12px}.jadam-gate-status b{width:8px;height:8px;border-radius:50%;background:#d9a441;box-shadow:0 0 0 5px rgba(217,164,65,.12)}.jadam-gate-status.ok b{background:#55ba78;box-shadow:0 0 0 5px rgba(85,186,120,.12)}.jadam-gate-status.error b{background:#dc5c52;box-shadow:0 0 0 5px rgba(220,92,82,.12)}#jadamGateLogin{display:block;margin-top:10px;padding:14px 16px;border-radius:14px;background:#fff;color:#261816;font-weight:900}.jadam-gate-note{display:block;margin-top:12px;color:#a99793;font-size:10px;line-height:1.5}
.tenant-jadam .tenant-hero,.tenant-jadam .pilot-wrap,.tenant-jadam main>.grid,.tenant-jadam main>.menu,.tenant-jadam main>.actions{display:none!important}.tenant-jadam main{width:min(1220px,100%);padding:22px 20px 60px}.tenant-jadam .product{font-size:0}.tenant-jadam .product:after{content:'자담치킨 전용 AI';font-size:18px;font-weight:950}.jadam-private-workspace{display:grid;gap:14px}.jadam-command-hero{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(300px,.72fr);gap:14px}.jadam-command-copy,.jadam-live-brief,.jadam-panel,.jadam-ops-card,.jadam-store-strip{border:1px solid var(--tenant-line);box-shadow:0 16px 46px rgba(65,30,24,.06)}.jadam-command-copy{padding:clamp(28px,5vw,54px);border-radius:26px 10px 26px 10px;background:linear-gradient(145deg,#fffdfb,#fff5f0 68%,#f2ddd6)}.jadam-kicker{display:flex;gap:8px;flex-wrap:wrap}.jadam-kicker span,.jadam-kicker b{padding:7px 10px;border-radius:999px;font-size:10px;font-weight:950;letter-spacing:.08em}.jadam-kicker span{background:#f4ebe8}.jadam-kicker b{background:#b52b22;color:#fff}.jadam-command-copy h1{font-size:clamp(42px,6.3vw,76px);line-height:.97;letter-spacing:-.065em;margin:18px 0}.jadam-command-copy h1 em{font-style:normal;color:#b52b22}.jadam-command-copy>p{max-width:760px;color:#72605b;font-size:16px;line-height:1.75}.jadam-facts{display:flex;gap:8px;flex-wrap:wrap;margin-top:22px}.jadam-facts span{display:flex;gap:7px;align-items:center;padding:9px 11px;border-radius:999px;border:1px solid var(--tenant-line);font-size:11px;font-weight:850;background:rgba(255,255,255,.72)}.jadam-facts small{color:#8a706b}.jadam-live-brief{border-radius:10px 26px 10px 26px;padding:30px;background:#261816;color:#fff;display:flex;flex-direction:column;justify-content:center}.jadam-live-brief>small{color:#d8b9b2;font-weight:900;letter-spacing:.14em}.jadam-live-brief>strong{font-size:30px;letter-spacing:-.045em;margin:10px 0}.jadam-live-brief>p{color:#d8c8c4;line-height:1.6;font-size:12px;margin:0 0 15px}.jadam-live-brief dl{margin:0}.jadam-live-brief dl div{display:flex;justify-content:space-between;gap:18px;padding:12px 0;border-top:1px solid rgba(255,255,255,.11)}.jadam-live-brief dt{color:#c9b7b2;font-size:11px}.jadam-live-brief dd{margin:0;text-align:right;font-size:11px;font-weight:900}.jadam-ops-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.jadam-ops-card{padding:18px;border-radius:16px;background:#fffdfb}.jadam-ops-card.priority{background:#b52b22;color:#fff}.jadam-ops-card small{font-size:9px;font-weight:950;letter-spacing:.08em;color:#8b716b}.jadam-ops-card.priority small,.jadam-ops-card.priority p{color:#f2d4cf}.jadam-ops-card strong{display:block;font-size:21px;letter-spacing:-.04em;margin:6px 0}.jadam-ops-card p{margin:0;color:#75635e;line-height:1.55;font-size:11px}.jadam-panel{padding:22px;border-radius:20px;background:#fffdfb}.jadam-panel-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:16px}.jadam-panel-head small{font-size:9px;font-weight:950;letter-spacing:.1em;color:#92766f}.jadam-panel-head h2{font-size:25px;letter-spacing:-.045em;margin:4px 0}.jadam-panel-head p{margin:0;color:#786863;font-size:11px;line-height:1.55;max-width:730px}.jadam-panel-head>span{white-space:nowrap;padding:7px 9px;border-radius:999px;background:#f4ebe8;color:#8f4e47;font-size:9px;font-weight:900}.jadam-menu-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.jadam-menu-card{padding:16px;border-radius:15px;background:#f7efec;border:1px solid #eeddd8}.jadam-menu-card small{font-size:8px;color:#9a726b;font-weight:950}.jadam-menu-card strong{display:block;font-size:17px;margin:5px 0}.jadam-menu-card span{font-size:11px;color:#745d57}.jadam-menu-card.focus{border:2px solid #b52b22;padding:15px;background:#fff8f5}.jadam-context-note{margin:11px 0 0;padding:11px 13px;border-radius:12px;background:#2b1a18;color:#f0ded9;font-size:11px;line-height:1.55}.jadam-plan-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.jadam-plan-card{position:relative;padding:15px;border-radius:14px;border:1px solid #eadbd7;background:#fff}.jadam-plan-card small{font-size:9px;color:#96766f}.jadam-plan-card strong{display:block;font-size:14px;margin:6px 0}.jadam-plan-card p{margin:0;color:#786965;font-size:10px;line-height:1.5}.jadam-plan-card>span{display:inline-block;margin-top:9px;padding:4px 7px;border-radius:999px;background:#f4ebe8;color:#9a5048;font-size:8px;font-weight:900}.jadam-approval-panel{background:linear-gradient(145deg,#fffdfb,#f8eeea)}.jadam-approval-lane{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr auto 1fr;gap:8px;align-items:center}.jadam-approval-lane div{padding:12px;border-radius:13px;background:#fff;border:1px solid #eadbd7}.jadam-approval-lane b{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:7px;background:#291916;color:#fff;font-size:9px}.jadam-approval-lane strong{display:block;margin-top:7px;font-size:12px}.jadam-approval-lane span{color:#8a716b;font-size:9px}.jadam-approval-lane i{font-style:normal;color:#aa8f88}.jadam-channel-wrap{overflow:auto;border:1px solid #eadbd7;border-radius:14px}.jadam-channel-table{width:100%;min-width:850px;border-collapse:collapse;font-size:10px}.jadam-channel-table th,.jadam-channel-table td{padding:10px;text-align:left;border-bottom:1px solid #f0e4e0;vertical-align:top}.jadam-channel-table th{background:#f7efec;color:#7e6964}.jadam-channel-table tr:last-child td{border-bottom:0}.jadam-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.jadam-kpi-grid span{display:flex;justify-content:space-between;gap:10px;padding:11px;border-radius:12px;background:#f7efec;font-size:10px;font-weight:800}.jadam-kpi-grid b{color:#9d7c75;font-size:9px}.jadam-store-strip{padding:18px 20px;border-radius:18px;background:#291916;color:#fff;display:flex;justify-content:space-between;gap:20px;align-items:center}.jadam-store-strip small{display:block;color:#c9aaa3;font-size:8px;font-weight:900;letter-spacing:.1em}.jadam-store-strip strong{display:block;font-size:16px;margin:3px 0}.jadam-store-strip span{color:#cdbab6;font-size:10px}.jadam-store-strip a{padding:10px 12px;border-radius:12px;background:#fff;color:#291916;font-size:11px;font-weight:900}
@media(max-width:900px){.jadam-command-hero{grid-template-columns:1fr}.jadam-ops-grid,.jadam-plan-grid{grid-template-columns:repeat(2,1fr)}.jadam-kpi-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:650px){.tenant-jadam main{padding:12px 12px 44px}.jadam-command-copy{padding:28px 20px;border-radius:20px}.jadam-command-copy h1{font-size:43px}.jadam-live-brief{border-radius:20px;padding:22px}.jadam-ops-grid,.jadam-plan-grid,.jadam-menu-grid,.jadam-kpi-grid{grid-template-columns:1fr}.jadam-panel{padding:17px}.jadam-panel-head{display:grid}.jadam-approval-lane{grid-template-columns:1fr}.jadam-approval-lane i{transform:rotate(90deg);text-align:center}.jadam-store-strip{display:grid}.jadam-store-strip a{text-align:center}.jadam-gate-card{border-radius:22px}}
</style>`;

const runtime = `
<script data-jadam-private-runtime>(()=>{
  const qs=s=>document.querySelector(s);
  const status=qs('#jadamGateStatus');
  const login=qs('#jadamGateLogin');
  const returnTo=new URL(location.href); returnTo.hash='';
  const authUrl=new URL('https://auth.ekodi.kr/'); authUrl.searchParams.set('site','jadam-client'); authUrl.searchParams.set('return_to',returnTo.href); if(login) login.href=authUrl.href;
  const say=(text,kind='')=>{if(!status)return; status.className='jadam-gate-status'+(kind?' '+kind:''); const span=status.querySelector('span'); if(span)span.textContent=text;};
  const token=()=>sessionStorage.getItem('ekodi-customer-token')||'';
  const tenant=()=>sessionStorage.getItem('ekodi-customer-tenant')||'';
  let authorized=false, verifying=false;
  async function verifyAccess(){
    if(authorized||verifying)return authorized;
    const t=token(),tenantId=tenant();
    if(!t||tenantId!=='jadam'){say(t?'자담치킨 승인권한을 확인할 수 없습니다.':'승인 계정 확인 대기',t?'error':'');return false;}
    verifying=true; say('자담치킨 고객권한 확인 중');
    try{
      const r=await fetch('https://api.ekodi.kr/api/customer/session',{headers:{authorization:'Bearer '+t},cache:'no-store'});
      if(!r.ok)throw new Error('customer_session_'+r.status);
      authorized=true; document.body.classList.add('jadam-private-authorized'); document.body.dataset.privateAccess='granted'; say('승인된 자담치킨 운영계정','ok'); return true;
    }catch(e){
      sessionStorage.removeItem('ekodi-customer-token'); sessionStorage.removeItem('ekodi-customer-tenant'); sessionStorage.removeItem('ekodi-customer-role');
      say('승인 세션이 없거나 만료되었습니다. 다시 로그인해 주세요.','error'); return false;
    }finally{verifying=false;}
  }
  let checks=0; const timer=setInterval(async()=>{checks+=1; const ok=await verifyAccess(); if(ok||checks>=70)clearInterval(timer);},250);
  window.addEventListener('focus',verifyAccess); document.addEventListener('visibilitychange',()=>{if(!document.hidden)verifyAccess()});

  const daypart=qs('#jadamDaypart'),reason=qs('#jadamDaypartReason'),menu=qs('#jadamFocusMenu'),action=qs('#jadamPriorityAction'),hypothesis=qs('#jadamMenuHypothesis');
  const menuEls=[...document.querySelectorAll('.jadam-menu-card')];
  const now=new Date(),hour=now.getHours()+now.getMinutes()/60,day=now.getDay();
  let phase='영업 전·마감 후',why='영업시간 밖입니다. 다음 영업일 준비와 지난 운영 확인이 우선입니다.',act='다음 영업 계획 점검',idx=0;
  if(hour>=11&&hour<14){phase='점심·오후 유입';why='점심 직후까지의 대학가 유입을 놓치지 않고 간단한 선택 메시지를 준비할 시간입니다.';act='간단한 메뉴 선택 제안';idx=0;}
  else if(hour>=14&&hour<16.5){phase='비수시간 수요 만들기';why='저녁 피크 전 빈 시간입니다. 지금 먹을 이유와 포장 편의성을 만드는 실험이 우선입니다.';act='비수시간 포장 제안';idx=2;}
  else if(hour>=16.5&&hour<17.5){phase='저녁 주문 예열';why='피크 직전입니다. 메뉴 선택을 줄이고 포장·배달 CTA를 선명하게 준비할 시간입니다.';act='17:30 피크 콘텐츠 준비';idx=(day===4||day===5)?1:0;}
  else if(hour>=17.5&&hour<20.5){phase='저녁 주문 피크';why='주문 결정이 빠르게 일어나는 시간대입니다. 주력 메뉴 하나와 주문 행동을 짧게 연결합니다.';act='주문·포장 전환 집중';idx=(day===4||day===5)?1:0;}
  else if(hour>=20.5&&hour<22){phase='마감 전 포장·재주문';why='마감 전 남은 수요를 포장으로 연결하고 다음 방문을 남길 수 있는 시간입니다.';act='포장 + 재주문 메시지';idx=0;}
  if(day===6&&hour>=16.5&&hour<20.5){why='토요일 2인 이상 주문 가설을 우선 적용합니다. 친구·가족 상황형 메시지를 검토합니다.';act='2인 이상 상황형 제안';idx=2;}
  const cards=${JSON.stringify((chicken.items || []).map(item => ({name:item.name, price:item.priceDisplay || won(item.price)})))};
  const picked=cards[idx]||cards[0]||{name:'확인된 메뉴',price:''};
  if(daypart)daypart.textContent=phase; if(reason)reason.textContent=why; if(menu)menu.textContent=picked.name; if(action)action.textContent=act;
  menuEls.forEach((el,i)=>el.classList.toggle('focus',i===idx));
  if(hypothesis)hypothesis.textContent='오늘의 가설 · '+phase+'에는 '+picked.name+(picked.price?' ('+picked.price+')':'')+'을(를) 중심으로 '+act+'을 준비합니다. 이는 실적값이 아니라 시간대·요일·점포계획을 바탕으로 한 검수용 가설입니다.';
})();</script>`;

let html = fs.readFileSync(file, 'utf8');
html = html.replace(/<style data-jadam-private-style>[\s\S]*?<\/style>/g, '');
html = html.replace(/<script data-jadam-private-runtime>[\s\S]*?<\/script>/g, '');
html = html.replace(/<section class="jadam-access-gate"[\s\S]*?<\/section>/g, '');
html = html.replace(/<section class="jadam-private-workspace"[\s\S]*?<\/section>\s*(?=<section class="grid">)/g, '');
html = html.replace('</head>', `${style}</head>`);
html = html.replace(/(<body[^>]*>)/, `$1${gate}`);
const marker = '<section class="grid">';
html = html.includes(marker) ? html.replace(marker, `${privateWorkspace}${marker}`) : html.replace('</main>', `${privateWorkspace}</main>`);
html = html.replace('</body>', `${runtime}</body>`);
html = html.replace('<meta name="robots" content="noindex,nofollow">', '<meta name="robots" content="noindex,nofollow,noarchive,nosnippet">');

for (const required of [
  'data-jadam-private-workspace',
  'data-jadam-access-gate',
  'data-jadam-daypart-ops',
  'jadam-private-authorized',
  "sessionStorage.getItem('ekodi-customer-token')",
  "sessionStorage.getItem('ekodi-customer-tenant')",
  "tenantId!=='jadam'",
  '/api/customer/session',
  "authUrl.searchParams.set('site','jadam-client')",
  '숫자를 꾸며내지 않는 성과판',
  'Google 로그인만으로는 열리지 않습니다.',
]) if (!html.includes(required)) throw new Error(`Jadam private workspace contract missing: ${required}`);

if (!html.includes('id="googleCustomerAuth"') || !html.includes('/api/customer/federated-login')) {
  throw new Error('Existing Jadam Google/customer authorization bridge must remain in final output');
}

fs.writeFileSync(file, html);
console.log('✅ Jadam private, approved-account-only, store-tailored AI operations workspace applied');
