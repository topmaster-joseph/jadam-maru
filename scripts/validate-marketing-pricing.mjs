import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'content', 'marketing-ai-pricing.json');
const config = JSON.parse(fs.readFileSync(file, 'utf8'));
const fail = message => { throw new Error(`Marketing AI pricing: ${message}`); };

if (!['beta_preview','runtime_staging'].includes(config.status)) fail('status must remain beta_preview/runtime_staging until live checkout is approved');
if (config.currency !== 'KRW') fail('currency must be KRW');
if (!String(config.philosophy || '').includes('필요한 만큼')) fail('customer-choice philosophy is missing');

const freeLimits=config.freeLimits||{};
for(const key of ['caption','post','shorts']){
  if(freeLimits[key]!==1)fail(`freeLimits.${key} must be exactly 1 per month`);
}
if(freeLimits.period!=='month')fail('free limits must reset monthly');
if(!Array.isArray(config.channelCatalog)||config.channelCatalog.length<6)fail('channelCatalog must expose representative marketing channels');

const modeIds = (config.billingModes || []).map(item => item.id);
for (const required of ['one_time', 'metered', 'automation']) if (!modeIds.includes(required)) fail(`billing mode ${required} is required`);

const actions = config.actions || [];
if (!actions.length) fail('at least one billable action is required');
const actionIds = new Set();
for (const action of actions) {
  if (!action.id || actionIds.has(action.id)) fail(`duplicate or missing action id: ${action.id || '(empty)'}`);
  actionIds.add(action.id);
  if (!Number.isInteger(action.basePrice) || action.basePrice <= 0) fail(`${action.id} basePrice must be a positive integer`);
  if (!Number.isInteger(action.defaultQty) || action.defaultQty < 0) fail(`${action.id} defaultQty must be a non-negative integer`);
  if (!Number.isInteger(action.maxQty) || action.maxQty < action.defaultQty) fail(`${action.id} maxQty must be >= defaultQty`);
  if (!['trial', 'preview', 'planned', 'available', 'connector'].includes(action.availability)) fail(`${action.id} has invalid availability`);
}

const plans = config.plans || [];
const requiredPlans = ['free', 'flex', 'plus', 'pro', 'auto'];
if (plans.map(plan => plan.id).join(',') !== requiredPlans.join(',')) fail(`plans must be ordered exactly as ${requiredPlans.join(' → ')}`);

let lastMonthlyFee = -1;
let lastMultiplier = Infinity;
let lastAutomationDepth = -1;
let lastChannels=-1;
for (const plan of plans) {
  if (!Number.isInteger(plan.monthlyFee) || plan.monthlyFee < 0) fail(`${plan.id} monthlyFee must be a non-negative integer`);
  if (plan.monthlyFee < lastMonthlyFee) fail(`${plan.id} monthlyFee must not decrease by tier`);
  if (!Number.isInteger(plan.includedCredit) || plan.includedCredit < 0) fail(`${plan.id} includedCredit must be a non-negative integer`);
  if (!Number.isInteger(plan.automationDepth) || plan.automationDepth < lastAutomationDepth) fail(`${plan.id} automationDepth must not decrease by tier`);
  if (!Array.isArray(plan.benefits) || plan.benefits.length < 2) fail(`${plan.id} needs concise customer benefits`);

  const e=plan.entitlements||{};
  if(!Number.isInteger(e.connectedChannels)||e.connectedChannels<0)fail(`${plan.id} connectedChannels must be a non-negative integer`);
  if(e.connectedChannels<lastChannels)fail(`${plan.id} connectedChannels must not decrease by tier`);
  for(const key of ['directPublish','scheduledPublish','recurringAutomation','alwaysOnAutomation','performanceAnalysis']) if(typeof e[key]!=='boolean')fail(`${plan.id} entitlements.${key} must be boolean`);
  if(plan.id==='free'&&(e.connectedChannels!==0||e.directPublish||e.scheduledPublish||e.recurringAutomation||e.alwaysOnAutomation))fail('FREE channels and automation must remain locked');
  if(plan.automationDepth>=1&&!e.directPublish)fail(`${plan.id} must allow direct publish at automation depth 1+`);
  if(plan.automationDepth>=2&&!e.scheduledPublish)fail(`${plan.id} must allow scheduled publish at automation depth 2+`);
  if(plan.automationDepth>=3&&!e.recurringAutomation)fail(`${plan.id} must allow recurring automation at depth 3+`);
  if(plan.automationDepth>=4&&!e.alwaysOnAutomation)fail(`${plan.id} must allow always-on automation at depth 4`);

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
  lastChannels=e.connectedChannels;
}

const byId=Object.fromEntries(plans.map(plan=>[plan.id,plan]));
if(byId.flex.entitlements.connectedChannels!==1)fail('FLEX must connect exactly 1 channel');
if(byId.plus.entitlements.connectedChannels!==3||!byId.plus.entitlements.scheduledPublish)fail('PLUS must connect 3 channels and support scheduling');
if(byId.pro.entitlements.connectedChannels!==5||!byId.pro.entitlements.recurringAutomation||!byId.pro.entitlements.performanceAnalysis)fail('PRO must connect 5 channels with recurring automation and analysis');
if(byId.auto.entitlements.connectedChannels!==10||!byId.auto.entitlements.alwaysOnAutomation)fail('AUTO must connect 10 channels with always-on automation');
if (byId.flex.monthlyFee !== 0 || byId.flex.unitMultiplier !== 1) fail('FLEX must remain zero-base-fee standard metered pricing');
if (config.payment?.liveCheckout !== false) fail('liveCheckout must remain false until payment QA and final pricing approval');
if (!String(config.payment?.hub || '').startsWith('https://pay.ekodi.kr/')) fail('payment hub must stay under pay.ekodi.kr');

console.log(`✅ Marketing AI pricing contract ${config.version} validated: FREE 1/1/1, FLEX 1, PLUS 3, PRO 5, AUTO 10`);
