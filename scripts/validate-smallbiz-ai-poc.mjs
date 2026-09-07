import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const file = path.join(root, 'dist', 'marketing-ai', 'index.html');
if (!fs.existsSync(file)) throw new Error('Build Marketing AI before validating small-business PoC');
const html = fs.readFileSync(file, 'utf8');
const runtime = html.match(/<script data-smallbiz-ai-poc>([\s\S]*?)<\/script>/)?.[1];
if (!runtime) throw new Error('Small-business PoC runtime is missing');
new vm.Script(runtime, { filename: 'smallbiz-ai-poc-runtime.js' });

const required = [
  '자담치킨 목포대점 AI 마케팅 최소기능',
  '짧은 문구 1개', '게시글 1개', '15초 쇼츠 1개',
  'Instagram', 'YouTube', 'TikTok', 'Naver Blog',
  'Kakao Channel', 'Facebook', 'Google Business Profile',
  'pocGenerate', "'ekodibiz'", "'jadam-mokpo'"
];
for (const token of required) if (!html.includes(token)) throw new Error(`Small-business PoC missing: ${token}`);
console.log('✅ Small-business AI PoC runtime syntax and showcase contract verified');