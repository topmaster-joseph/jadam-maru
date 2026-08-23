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
    next=extendDirective(next,'style-src',shellOrigin);
    next=extendDirective(next,'connect-src',shellOrigin);
    return `content="${next}"`;
  }));
}

function markFixedHeader(html){
  if(html.includes('data-ekodi-fixed-header'))return html;
  const pattern=/<([a-z][a-z0-9-]*)\b([^>]*\bclass=(["'])[^"']*\btop\b[^"']*\3[^>]*)>/i;
  return html.replace(pattern,'<$1$2 data-ekodi-fixed-header>');
}

function patchHtml(html){
  let next=patchCsp(html);
  next=markFixedHeader(next);
  if(!next.includes('data-ekodi-shell="v1"'))next=next.replace('</head>',`<meta name="ekodi-shell" content="v1" data-ekodi-shell="v1"><script defer src="${shellScript}" data-ekodi-service="marketing" data-ekodi-surface="public"></script></head>`);
  else next=next.replace(/(<script\b[^>]*data-ekodi-service=["']marketing["'][^>]*)(>)/i,(all,start,end)=>/data-ekodi-surface=/.test(start)?all:`${start} data-ekodi-surface="public"${end}`);
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
  if(!after.includes('data-ekodi-surface="public"'))throw new Error(`Marketing AI public surface marker missing: ${file}`);
  if(!after.includes('data-ekodi-fixed-header'))throw new Error(`Mobile fixed header marker missing: ${file}`);
  const cspMeta=after.match(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i)?.[0]||'';
  if(cspMeta&&(!cspMeta.includes(shellOrigin)||!cspMeta.includes('script-src')||!cspMeta.includes('style-src')||!cspMeta.includes('connect-src')))throw new Error(`Shell CSP extension failed: ${file}`);
  fs.writeFileSync(file,after);
}
console.log(`✅ EKODI shared Shell injected with explicit public surface; authenticated sessions may promote to stable workspace UI.`);
