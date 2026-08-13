import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'content', 'marketing-ai-pricing.json');
const config = JSON.parse(fs.readFileSync(file, 'utf8'));
const fail = message => { throw new Error(`Marketing AI pricing: ${message}`); };

if (config.status !== 'beta_preview') fail('status must remain beta_preview until live checkout is approved');
if (config.currency !== 'KRW') fail('currency must be KRW');
if (!String(config.philosophy || '').includes('필요한 만큼')) fail('customer-choice philosophy is missing');

const modeIds = (config.billingModes || []).map(item => item.id);
for (const required of ['one_time', 'metered', 'automation']) {
  if (!modeIds.includes(required)) fail(`billing mode ${required} is required`);
}

const actions = config.actions || [];
if (!actions.length) fail('at least one billable action is required');
const actionIds = new Set();
for (const action of actions) {
  if (!action.id || actionIds.has(action.id)) fail(`duplicate or missing action id: ${action.id || '(empty)'}`);
  actionIds.add(action.id);
  if (!Number.isInteger(action.basePrice) || action.basePrice <= 0) fail(`${action.id} basePrice must be a positive integer`);
  if (!Number.isInteger(action.defaultQty) || action.defaultQty < 0) fail(`${action.id} defaultQty must be a non-negative integer`);
  if (!Number.isInteger(action.maxQty) || action.maxQty < action.defaultQty) fail(`${action.id} maxQty must be >= defaultQty`);
  if (!['trial', 'preview', 'planned', 'available'].includes(action.availability)) fail(`${action.id} has invalid availability`);
}

const plans = config.plans || [];
const requiredPlans = ['free', 'flex', 'plus', 'pro', 'auto'];
if (plans.map(plan => plan.id).join(',') !== requiredPlans.join(',')) {
  fail(`plans must be ordered exactly as ${requiredPlans.join(' → ')}`);
}

let lastMonthlyFee = -1;
let lastMultiplier = Infinity;
let lastAutomationDepth = -1;
for (const plan of plans) {
  if (!Number.isInteger(plan.monthlyFee) || plan.monthlyFee < 0) fail(`${plan.id} monthlyFee must be a non-negative integer`);
  if (plan.monthlyFee < lastMonthlyFee) fail(`${plan.id} monthlyFee must not decrease by tier`);
  if (!Number.isInteger(plan.includedCredit) || plan.includedCredit < 0) fail(`${plan.id} includedCredit must be a non-negative integer`);
  if (!Number.isInteger(plan.automationDepth) || plan.automationDepth < lastAutomationDepth) fail(`${plan.id} automationDepth must not decrease by tier`);
  if (!Array.isArray(plan.benefits) || plan.benefits.length < 2) fail(`${plan.id} needs concise customer benefits`);

  if (plan.id === 'free') {
    if (plan.metered !== false || plan.unitMultiplier !== null) fail('FREE must remain non-metered');
  } else {
    if (plan.metered !== true) fail(`${plan.id} must support metered use`);
    if (typeof plan.unitMultiplier !== 'number' || plan.unitMultiplier <= 0 || plan.unitMultiplier > 1) fail(`${plan.id} unitMultiplier must be > 0 and <= 1`);
    if (plan.unitMultiplier >= lastMultiplier) fail(`${plan.id} must have a lower unit price than the previous paid tier`);
    lastMultiplier = plan.unitMultiplier;
  }
  lastMonthlyFee = plan.monthlyFee;
  lastAutomationDepth = plan.automationDepth;
}

const flex = plans.find(plan => plan.id === 'flex');
if (flex.monthlyFee !== 0 || flex.unitMultiplier !== 1) fail('FLEX must remain zero-base-fee standard metered pricing');
if (config.payment?.liveCheckout !== false) fail('liveCheckout must remain false until payment QA and final pricing approval');
if (!String(config.payment?.hub || '').startsWith('https://pay.ekodi.kr/')) fail('payment hub must stay under pay.ekodi.kr');

console.log(`✅ Marketing AI pricing contract ${config.version} validated`);
