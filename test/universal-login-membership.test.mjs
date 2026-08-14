import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [clientBridge, pricingPatch, pricing] = await Promise.all([
  readFile(new URL('../scripts/patch-client-prereg.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/patch-marketing-pricing.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../content/marketing-ai-pricing.json', import.meta.url), 'utf8'),
]);

test('managed stores use one Google login and apply registered role automatically', () => {
  assert.match(clientBridge, /Google로 로그인/);
  assert.match(clientBridge, /store_owner:'점주\/책임자'/);
  assert.match(clientBridge, /marketing_manager:'마케팅담당자'/);
  assert.match(clientBridge, /hq_manager:'본사담당자'/);
  assert.match(clientBridge, /accounting_manager:'회계담당자'/);
  assert.match(clientBridge, /\/api\/customer\/federated-login/);
  assert.doesNotMatch(clientBridge, /점주 Google 로그인/);
});

test('managed store login reads the tenant membership and links to plan selection', () => {
  assert.match(clientBridge, /\/api\/membership\/me\?site=marketing&tenant=/);
  assert.match(clientBridge, /site','marketing'/);
  assert.match(clientBridge, /return_to/);
  assert.match(clientBridge, /로그인됨 ·/);
});

test('every Marketing AI plan carries its selected plan into central auth', () => {
  assert.match(pricingPatch, /authHref = planId/);
  assert.match(pricingPatch, /&plan=\$\{encodeURIComponent\(planId\)\}/);
  for (const plan of ['free','flex','plus','pro','auto']) assert.match(pricing, new RegExp(`"id": "${plan}"`));
  assert.match(pricingPatch, /PLUS|월 구독 선택/);
});
