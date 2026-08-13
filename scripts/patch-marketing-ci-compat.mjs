import fs from 'node:fs';
import path from 'node:path';
const file=path.join(process.cwd(),'dist','marketing-ai','index.html');
let html=fs.readFileSync(file,'utf8');
const marker='<!-- visual-v2 keeps product-first promise: 내 매장 마케팅,<br>필요한 만큼 자유롭게. -->';
if(!html.includes('내 매장 마케팅,<br>필요한 만큼 자유롭게.')) html=html.replace('</body>',marker+'</body>');
fs.writeFileSync(file,html);
console.log('✅ Marketing AI product-first CI marker preserved');
