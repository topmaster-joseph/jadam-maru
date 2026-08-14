import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const hubFile=path.join(root,'dist','marketing-ai','index.html');
if(!fs.existsSync(hubFile))throw new Error('Marketing AI hub must exist before audience patch');

let html=fs.readFileSync(hubFile,'utf8');

html=html.replaceAll('내 매장 마케팅,<br>필요한 만큼 자유롭게.','나와 우리를 위한 마케팅,<br>필요한 만큼 자유롭게.');
html=html.replaceAll('내 매장 마케팅을,<br>더 똑똑하고 더 자유롭게.','나와 우리를 알리는 일을,<br>더 똑똑하고 더 자유롭게.');
html=html.replaceAll('매장명과 오늘 알릴 내용을 넣어 게시용 문구 초안을 직접 만들어 봅니다.','개인명·브랜드·기관·단체 이름과 알릴 내용을 넣어 게시용 문구 초안을 직접 만들어 봅니다.');
html=html.replaceAll('매장과 상품 키워드를 바탕으로 바로 활용할 태그 묶음을 확인합니다.','이름과 주제 키워드를 바탕으로 바로 활용할 태그 묶음을 확인합니다.');
html=html.replaceAll('상호와 오늘 홍보할 내용을 넣으면 SNS 문구·해시태그·쇼츠 훅 샘플을 바로 만듭니다.','개인·매장·기업·기관·단체 등 사용 유형을 고르고 알릴 내용을 넣으면 SNS 문구·해시태그·쇼츠 훅을 바로 만듭니다.');
html=html.replaceAll('점주의 선택권을 지키는 기본 원칙','사용자의 선택권을 지키는 기본 원칙');
html=html.replaceAll('변경은 점주가 직접 선택합니다.','변경은 사용자가 직접 선택합니다.');

const form=`<form class="trial-form audience-trial-form" id="freeTrialForm"><label>사용 유형<select id="trialType"><option value="personal">개인·크리에이터</option><option value="store">매장·소상공인</option><option value="business">기업·브랜드</option><option value="institution">기관·공공기관</option><option value="education">학교·교육기관</option><option value="nonprofit">비영리·종교단체</option><option value="community">모임·협회·커뮤니티</option><option value="other">기타</option></select></label><label>이름·브랜드·기관명<input id="trialSubject" maxlength="50" required placeholder="예: 에코디교회 / 홍길동"></label><label>알리고 싶은 내용<input id="trialFocus" maxlength="70" required placeholder="예: 여름캠프 참가자 모집"></label><label>톤<select id="trialTone"><option value="warm">친근하게</option><option value="clean">깔끔하게</option><option value="energetic">활기차게</option></select></label><button type="submit">무료 샘플 만들기</button></form>`;

if(!/<form class="trial-form[^>]*" id="freeTrialForm">[\s\S]*?<\/form>/.test(html))throw new Error('Marketing AI trial form was not found');
html=html.replace(/<form class="trial-form[^>]*" id="freeTrialForm">[\s\S]*?<\/form>/,form);

const style=`<style data-marketing-audience>.audience-trial-form{grid-template-columns:.9fr 1.15fr 1.45fr .8fr auto}.audience-trial-form label:first-child select{font-weight:800}.member-preview-head p{max-width:720px;margin-left:auto;margin-right:auto}@media(max-width:980px){.audience-trial-form{grid-template-columns:1fr 1fr}.audience-trial-form button{min-height:44px}}@media(max-width:760px){.audience-trial-form{grid-template-columns:1fr}}</style>`;
html=html.replace(/<style data-marketing-audience>[\s\S]*?<\/style>/g,'');
html=html.replace('</head>',`${style}</head>`);

const runtime=`<script data-audience-trial>(()=>{const form=document.querySelector('#freeTrialForm');if(!form)return;const clean=v=>String(v||'').trim().replace(/\s+/g,' ');const tag=v=>'#'+clean(v).replace(/[^0-9A-Za-z가-힣]+/g,'');const profiles={personal:{label:'개인·크리에이터',tag:'#개인브랜딩',warm:(s,f)=>s+'의 '+f+' 이야기를 오늘 함께 만나보세요. 편하게 보고, 마음에 닿는 부분을 나눠 주세요. 😊',clean:(s,f)=>s+' · '+f+'. 핵심만 담아 분명하게 전합니다.',energetic:(s,f)=>'지금 주목! '+s+'의 '+f+' 이야기가 시작됩니다. 함께 확인해 보세요!',hook:(s,f)=>'30초만에 만나는 '+s+'의 '+f},store:{label:'매장·소상공인',tag:'#동네마케팅',warm:(s,f)=>s+'에서 준비한 '+f+', 오늘 편하게 만나보세요. 😊',clean:(s,f)=>s+' · 오늘의 소식은 '+f+'. 필요한 정보만 깔끔하게 전합니다.',energetic:(s,f)=>'지금 '+s+'에서 '+f+'를 만나보세요. 오늘 놓치기 아까운 소식입니다!',hook:(s,f)=>'오늘 '+s+'에서 놓치기 아까운 '+f},business:{label:'기업·브랜드',tag:'#브랜드마케팅',warm:(s,f)=>s+'가 준비한 '+f+'를 소개합니다. 더 나은 선택에 도움이 되길 바랍니다.',clean:(s,f)=>s+' · '+f+'. 핵심 가치와 정보를 간결하게 전합니다.',energetic:(s,f)=>s+'의 새로운 '+f+', 지금 확인해 보세요!',hook:(s,f)=>s+'가 제안하는 '+f+' 핵심 30초'},institution:{label:'기관·공공기관',tag:'#기관소식',warm:(s,f)=>s+'에서 '+f+' 소식을 전합니다. 필요한 분들에게 잘 닿기를 바랍니다.',clean:(s,f)=>s+' 안내 · '+f+'. 핵심 내용을 정확하게 확인하세요.',energetic:(s,f)=>'꼭 확인하세요! '+s+'의 '+f+' 소식입니다.',hook:(s,f)=>'꼭 알아야 할 '+s+'의 '+f},education:{label:'학교·교육기관',tag:'#교육소식',warm:(s,f)=>s+'에서 '+f+' 소식을 나눕니다. 배움의 기회가 필요한 분들과 함께해 주세요.',clean:(s,f)=>s+' · '+f+' 안내. 일정과 핵심 내용을 한눈에 확인하세요.',energetic:(s,f)=>'배움의 기회! '+s+'의 '+f+'를 지금 확인하세요.',hook:(s,f)=>s+'의 '+f+', 이것만은 확인하세요'},nonprofit:{label:'비영리·종교단체',tag:'#함께하는소식',warm:(s,f)=>s+'와 함께하는 '+f+'. 필요한 이웃과 공동체에 따뜻하게 전해 주세요.',clean:(s,f)=>s+' · '+f+'. 참여와 안내에 필요한 핵심 내용을 전합니다.',energetic:(s,f)=>'함께할 시간입니다! '+s+'의 '+f+'에 참여해 보세요.',hook:(s,f)=>'함께 보면 더 좋은 '+s+'의 '+f},community:{label:'모임·협회·커뮤니티',tag:'#커뮤니티소식',warm:(s,f)=>s+'에서 '+f+' 이야기를 나눕니다. 관심 있는 분들과 함께해 주세요.',clean:(s,f)=>s+' · '+f+'. 모임에 필요한 내용을 간결하게 안내합니다.',energetic:(s,f)=>s+'의 '+f+', 같이할 사람을 기다립니다!',hook:(s,f)=>s+' 사람들과 함께하는 '+f},other:{label:'기타',tag:'#콘텐츠마케팅',warm:(s,f)=>s+'의 '+f+' 이야기를 편하게 만나보세요.',clean:(s,f)=>s+' · '+f+'. 필요한 내용을 명확하게 전합니다.',energetic:(s,f)=>'지금 확인하세요! '+s+'의 '+f+' 소식입니다.',hook:(s,f)=>s+'의 '+f+' 핵심 30초'}};form.addEventListener('submit',e=>{e.preventDefault();const type=document.querySelector('#trialType')?.value||'other';const subject=clean(document.querySelector('#trialSubject')?.value);const focus=clean(document.querySelector('#trialFocus')?.value);const tone=document.querySelector('#trialTone')?.value||'warm';if(!subject||!focus)return;const p=profiles[type]||profiles.other;const caption=(p[tone]||p.warm)(subject,focus);const hook=p.hook(subject,focus);const tags=[tag(subject),tag(focus),p.tag,'#콘텐츠마케팅','#마케팅AI'].filter((x,i,a)=>x&&x.length>1&&a.indexOf(x)===i).join(' ');document.querySelector('#trialCaption').textContent=caption;document.querySelector('#trialHook').textContent=hook;document.querySelector('#trialTags').textContent=tags;document.querySelector('#trialResults').hidden=false;document.querySelector('#trialResults').scrollIntoView({behavior:'smooth',block:'nearest'});});})();</script>`;

html=html.replace(/<script>\(\(\)=>\{const form=document\.querySelector\('#freeTrialForm'\);[\s\S]*?<\/script>/g,'');
html=html.replace(/<script data-audience-trial>[\s\S]*?<\/script>/g,'');
html=html.replace('</body>',`${runtime}</body>`);

for(const required of ['id="trialType"','id="trialSubject"','개인·크리에이터','기관·공공기관','비영리·종교단체','data-audience-trial','나와 우리를 위한 마케팅']){
  if(!html.includes(required))throw new Error(`Marketing audience contract missing: ${required}`);
}
if(html.includes('id="trialStore"'))throw new Error('Store-only trial field survived audience generalization');

fs.writeFileSync(hubFile,html);
console.log('✅ Marketing AI trial now supports personal, business, institution, education, nonprofit and community audiences');
