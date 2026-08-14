import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const out=path.join(root,'dist','marketing-ai');

function htmlFiles(dir){
  if(!fs.existsSync(dir))return[];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())return htmlFiles(full);
    return entry.isFile()&&entry.name.endsWith('.html')?[full]:[];
  });
}

const runtime=`<script data-store-plan-links>(()=>{const apply=ctx=>{const store=String(ctx?.storeId||'');if(!store)return;for(const link of document.querySelectorAll('a.pricing-cta[href*="auth.ekodi.kr"]')){try{const url=new URL(link.href);url.searchParams.set('site','marketing');url.searchParams.set('store',store);url.searchParams.set('return_to',location.href.split('#')[0]);link.href=url.href;link.dataset.storePlan=store}catch{}}};if(window.EKODI_MARKETING_CONTEXT)apply(window.EKODI_MARKETING_CONTEXT);window.addEventListener('ekodi:workspace-ready',event=>apply(event.detail),{passive:true});})();</script>`;

let patched=0;
for(const file of htmlFiles(out)){
  let html=fs.readFileSync(file,'utf8');
  html=html.replace(/<script data-store-plan-links>[\s\S]*?<\/script>/g,'');
  if(!html.includes('pricing-cta'))continue;
  if(!html.includes('data-ekodi-workspace-handoff'))throw new Error(`Workspace handoff must run before store plan links: ${path.relative(root,file)}`);
  html=html.replace('</body>',`${runtime}</body>`);
  fs.writeFileSync(file,html);
  patched+=1;
}

if(patched<1)throw new Error('Expected at least one Marketing AI pricing surface');
const hub=fs.readFileSync(path.join(out,'index.html'),'utf8');
for(const required of ['data-store-plan-links','url.searchParams.set(\'store\',store)','ekodi:workspace-ready','pricing-cta']){
  if(!hub.includes(required))throw new Error(`Store plan link contract missing: ${required}`);
}
console.log(`Marketing AI pricing links follow the verified Store UUID: ${patched} surfaces`);
