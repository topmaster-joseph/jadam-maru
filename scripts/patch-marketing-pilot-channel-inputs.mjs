import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(root, 'content', 'marketing-ai-store-pilots.json'), 'utf8'));

const style = `<style data-ekodi-pilot-channel-input-style>.pilot-channel-edit{display:flex;align-items:center;gap:6px;min-width:210px}.pilot-channel-edit input{min-width:150px;flex:1;border:1px solid #cfd7df;border-radius:9px;padding:8px 9px;font:inherit}.pilot-channel-edit button{border:1px solid #cfd7df;background:#fff;border-radius:9px;padding:8px 9px;font-size:11px;font-weight:850;white-space:nowrap}.pilot-channel-edit small{display:block;color:#66727e}</style>`;

function runtimeScript(slug) {
  const keyPrefix = JSON.stringify(`ekodi-marketing-pilot:${slug}:channel:`);
  return `<script data-ekodi-pilot-channel-input>(()=>{const root=document.querySelector('[data-ekodi-marketing-pilot="${slug}"]');if(!root)return;const prefix=${keyPrefix};for(const row of root.querySelectorAll('.pilot-table tbody tr')){const cells=row.querySelectorAll('td');if(cells.length<7)continue;const type=(cells[0].textContent||'').trim();const addressCell=cells[2];if((addressCell.textContent||'').trim()!=='미확인')continue;const wrap=document.createElement('div');wrap.className='pilot-channel-edit';const input=document.createElement('input');input.type='url';input.placeholder='채널주소 입력';input.setAttribute('aria-label',type+' 채널주소');let saved='';try{saved=localStorage.getItem(prefix+type)||''}catch{}if(saved)input.value=saved;const button=document.createElement('button');button.type='button';button.textContent=saved?'저장됨':'임시저장';button.addEventListener('click',()=>{const value=input.value.trim();if(value&&!/^https:\/\//i.test(value)){input.setCustomValidity('https:// 로 시작하는 채널주소를 입력해 주세요.');input.reportValidity();return}input.setCustomValidity('');try{if(value)localStorage.setItem(prefix+type,value);else localStorage.removeItem(prefix+type)}catch{}button.textContent=value?'저장됨':'임시저장';if(value){cells[1].textContent='사용자 입력';cells[6].textContent='이 브라우저';}});wrap.append(input,button);addressCell.textContent='';addressCell.append(wrap);}})();</script>`;
}

for (const pilot of config.cases || []) {
  const file = path.join(root, 'dist', 'marketing-ai', pilot.slug, 'index.html');
  if (!fs.existsSync(file)) throw new Error(`${pilot.slug}: pilot workspace missing.`);
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('data-ekodi-marketing-pilot=')) throw new Error(`${pilot.slug}: pilot dashboard must be patched before channel inputs.`);
  if (!html.includes('data-ekodi-pilot-channel-input-style')) html = html.replace('</head>', `${style}</head>`);
  if (!html.includes('data-ekodi-pilot-channel-input>')) html = html.replace('</body>', `${runtimeScript(pilot.slug)}</body>`);
  fs.writeFileSync(file, html);
}

console.log(`✅ Marketing AI pilot 미발견 채널 수동입력 fallback ${(config.cases || []).length}개 반영 완료`);
