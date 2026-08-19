import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const output=path.join(root,'dist','marketing-ai');
const shellOrigin='https://shell.ekodi.kr';
const shellScript=`${shellOrigin}/shell.js`;

function extendDirective(csp,name,value){
  const parts=String(csp||'').split(';').map(part=>part.trim()).filter(Boolean);
  const index=parts.findIndex(part=>part===name||part.startsWith(`${name} `));
  if(index<0)parts.push(`${name} 'self' ${value}`);
  else if(!parts[index].split(/\s+/).includes(value))parts[index]=`${parts[index]} ${value}`;
  return parts.join('; ');
}

function patchCsp(html){
  return html.replace(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi,tag=>tag.replace(/content="([^"]*)"/i,(_,csp)=>{
    let next=extendDirective(csp,'script-src',shellOrigin);
    next=extendDirective(next,'connect-src',shellOrigin);
    return `content="${next}"`;
  }));
}

function patchHtml(html){
  let next=patchCsp(html);
  if(!next.includes('data-ekodi-shell="v1"'))next=next.replace('</head>',`<meta name="ekodi-shell" content="v1" data-ekodi-shell="v1"><script defer src="${shellScript}" data-ekodi-service="marketing"></script></head>`);
  return next;
}

function walk(dir){
  if(!fs.existsSync(dir))return[];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    return entry.isDirectory()?walk(full):entry.isFile()&&entry.name==='index.html'?[full]:[];
  });
}

const files=walk(output);
if(!files.length)throw new Error('Marketing AI build has no index.html files to patch');
for(const file of files){
  const before=fs.readFileSync(file,'utf8');
  const after=patchHtml(before);
  if(!after.includes(shellScript)||!after.includes('data-ekodi-service="marketing"'))throw new Error(`Shell injection failed: ${file}`);
  const cspMeta=after.match(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i)?.[0]||'';
  if(cspMeta&&(!cspMeta.includes(shellOrigin)||!cspMeta.includes('script-src')||!cspMeta.includes('connect-src')))throw new Error(`Shell CSP extension failed: ${file}`);
  fs.writeFileSync(file,after);
}
console.log(`✅ EKODI shared Shell injected into ${files.length} Marketing AI page(s) without blocking first paint.`);
