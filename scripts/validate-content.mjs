import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const store = read('content/store.json');
const menus = read('content/menus.json');
const notices = read('content/notices.json');
const events = read('content/events.json');
const site = read('config/site.json');
const errors = [];

if (store.brandName !== '자담&마루') errors.push('brandName 오류');
if (!/^0\d{1,2}-\d{3,4}-\d{4}$/.test(store.phone || '')) errors.push('전화번호 형식 오류');
if (!store.address) errors.push('주소 누락');
if (!Array.isArray(menus.brands) || menus.brands.length !== 3) errors.push('세 브랜드 메뉴 필요');
for (const brand of menus.brands || []) {
  if (!brand.id || !brand.name || !Array.isArray(brand.items)) errors.push(`브랜드 데이터 오류: ${brand.name || brand.id || 'unknown'}`);
  for (const item of brand.items || []) {
    if (!item.name || !item.priceDisplay) errors.push(`${brand.name}: 메뉴 데이터 누락`);
    if (item.price !== null && (!Number.isFinite(item.price) || item.price < 0)) errors.push(`${brand.name}/${item.name}: 가격 오류`);
  }
}
if (!Array.isArray(notices.active)) errors.push('notices.active 오류');
if (!Array.isArray(events.events)) errors.push('events.events 오류');
if (site.productionBranch !== 'main') errors.push('productionBranch는 main이어야 함');
if (site.deployment?.manualDeployAllowed !== false) errors.push('수동 배포 금지 설정 필요');

if (errors.length) {
  console.error('❌ 콘텐츠 검증 실패');
  errors.forEach(e => console.error(`- ${e}`));
  process.exit(1);
}
console.log('✅ 자담&마루 콘텐츠 검증 통과');
console.log(`- ${store.storeName} / ${store.phone}`);
console.log(`- ${menus.brands.map(b => b.name).join(', ')}`);
