import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const hub=path.join(root,'dist','marketing-ai','index.html');
const cssFile=path.join(root,'assets','marketing-visual-v2.css');
if(!fs.existsSync(hub)||!fs.existsSync(cssFile)) throw new Error('Visual v2 source missing');

let html=fs.readFileSync(hub,'utf8');
const css=fs.readFileSync(cssFile,'utf8');
if(!html.includes('data-flex-pricing')||!html.includes('id="freeTrialForm"')||!html.includes('id="pricing"')) throw new Error('Visual v2 prerequisites missing');

html=html.replace(/<style data-marketing-visual-v2>[\s\S]*?<\/style>/g,'');
html=html.replace('<div class="product">마케팅AI</div>','<div class="product"><span class="brand-mark">M</span><span>마케팅AI</span></div>');

const trial=html.match(/<section class="trial-lab" id="freeTrial">[\s\S]*?<\/section>/)?.[0];
if(!trial) throw new Error('Free trial section not found');
html=html.replace(trial,'');

const preview=`<div class="product-preview"><div class="preview-window"><div class="preview-head"><div class="preview-brand"><i>M</i>마케팅AI 대시보드</div><span>최근 7일⌄</span></div><div class="preview-body"><div class="kpis"><div><small>게시물</small><b>24</b><em>↑18%</em></div><div><small>도달</small><b>28.5K</b><em>↑32%</em></div><div><small>참여</small><b>1,826</b><em>↑22%</em></div><div><small>전환</small><b>412</b><em>↑15%</em></div></div><div class="preview-grid"><section class="preview-panel"><div class="preview-title"><b>AI 추천 콘텐츠</b><span>더보기 ›</span></div><div class="mini-content"><article><div class="mini-thumb"></div><small>신메뉴 소개</small><b>오늘의 추천 메뉴를 알려보세요</b></article><article><div class="mini-thumb"></div><small>매장 분위기</small><b>우리 매장의 매력을 한 컷에</b></article><article><div class="mini-thumb"></div><small>이벤트 안내</small><b>놓치기 아까운 혜택을 자동으로</b></article></div></section><section class="preview-panel"><div class="preview-title"><b>성과 추이</b><span>도달 · 참여</span></div><div class="spark-chart"><i style="height:30%"></i><i style="height:48%"></i><i style="height:43%"></i><i style="height:72%"></i><i style="height:55%"></i><i style="height:78%"></i><i style="height:92%"></i></div></section></div></div><div class="connected"><b>연결 채널</b><span>◎ Instagram</span><span>f Facebook</span><span>N Blog</span><span>▶ YouTube Shorts</span></div></div></div>`;

const hero=/<section class="hero">[\s\S]*?<\/section>/;
if(!hero.test(html)) throw new Error('Hero section not found');
html=html.replace(hero,`<section class="hero hero-v2"><div class="hero-copy"><div class="hero-kicker">✦ AI가 만드는 스마트 마케팅</div><h1>내 매장 마케팅을,<br><span>더 똑똑하고 더 자유롭게.</span></h1><p>먼저 무료로 써보고, 필요할 때만 결제하세요. 많이 사용할수록 단가는 낮아지고, 맡길수록 자동화는 깊어집니다.</p><div class="hero-pills"><span>로그인 없이 바로 체험</span><span>필요한 기능만 선택</span><span>플랜은 직접 변경</span></div>${trial}</div>${preview}</section>`);

const features=`<section class="feature-strip" id="features"><div class="feature-grid"><article class="feature-card"><span class="feature-icon">✦</span><div><strong>콘텐츠 생성</strong><p>문구·이미지·해시태그를 매장 톤에 맞게 준비합니다.</p></div></article><article class="feature-card"><span class="feature-icon">▣</span><div><strong>쇼츠·영상</strong><p>짧은 영상과 숏폼 아이디어를 빠르게 제작합니다.</p></div></article><article class="feature-card"><span class="feature-icon">➤</span><div><strong>소셜 자동게시</strong><p>연결한 채널에 예약·반복 게시를 실행합니다.</p></div></article><article class="feature-card"><span class="feature-icon">◔</span><div><strong>성과분석·추천</strong><p>반응을 읽고 다음 마케팅 행동을 제안합니다.</p></div></article></div></section>`;

const flow=`<section class="workflow-v2"><h2>마케팅 자동화, 이렇게 이어집니다.</h2><div class="workflow-steps"><article><i>💡</i><b>1 기획</b><small>아이디어 제안</small></article><article><i>✎</i><b>2 생성</b><small>문구·이미지·영상</small></article><article><i>✓</i><b>3 승인</b><small>확인·수정</small></article><article><i>➤</i><b>4 게시</b><small>예약·자동게시</small></article><article><i>▥</i><b>5 분석</b><small>성과·다음 행동</small></article></div></section>`;

if(!html.includes('<section class="choice-intro"')) throw new Error('Choice section missing');
html=html.replace('<section class="choice-intro"',`${features}${flow}<section class="choice-intro"`);

const loginHref=html.match(/id="googleCustomerAuth" href="([^"]+)"/)?.[1]||'#freeTrial';
const cta=`<section class="bottom-cta"><div><small>START FREE · GROW WHEN YOU NEED</small><h2>먼저 무료로 체험하고,<br>내 매장만의 AI 마케팅을 시작하세요.</h2><div class="points"><span>✓ 로그인 없이 30초 체험</span><span>✓ 필요한 기능만 선택</span><span>✓ 많이 쓸수록 낮아지는 단가</span></div></div><a href="${loginHref}"><b>G</b> Google로 무료 시작</a></section>`;
html=html.replace('</main>',`${cta}</main>`);
html=html.replace('</head>',`<style data-marketing-visual-v2>${css}</style></head>`);

for(const x of ['data-marketing-visual-v2','hero-v2','product-preview','id="features"','workflow-v2','bottom-cta','id="freeTrialForm"','id="pricing"','BEST PLAN AI']) if(!html.includes(x)) throw new Error('Visual v2 contract missing: '+x);
fs.writeFileSync(hub,html);
console.log('✅ Marketing AI visual v2 desktop + mobile patched');
