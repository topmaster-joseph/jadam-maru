import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('composite operator homepage preserves all three franchise identities and gets own operator CI',()=>{
 const html=read('index.html'),css=read('styles.css'),generator=read('scripts/patch-operator-main.mjs');
 assert.match(html,/data-operator-ci="three-stores" aria-hidden="true"/);
 assert.match(html,/class="operator-ci-nodes"/);
 assert.match(html,/자담<span class="amp">&<\/span>마루/);
 for(const name of ['자담치킨','피자마루','요거트퍼플'])assert.ok(html.includes(name),name);
 assert.ok(css.includes('three-stores'));
 assert.ok(generator.includes('data-operator-ci="three-stores"'));
 assert.ok(generator.includes('gateway-logo i[data-operator-ci'));
 assert.doesNotMatch(html,/EKODI®|상표등록 완료/);
});
