const expectedFull = String(process.env.GITHUB_SHA || process.env.CF_PAGES_COMMIT_SHA || '').trim();
const expected = expectedFull.slice(0, 12);
const maxRounds = Number(process.env.EKODI_SMOKE_ROUNDS || 30);
const delayMs = Number(process.env.EKODI_SMOKE_DELAY_MS || 12000);

if (!expected) throw new Error('GITHUB_SHA or CF_PAGES_COMMIT_SHA is required for production verification');

const targets = [
  { name: 'Pages hub', url: 'https://jadam-maru.pages.dev/marketing-ai/', ui: 'USER UI', admin: false },
  { name: 'Pages jadam', url: 'https://jadam-maru.pages.dev/marketing-ai/jadam/', ui: 'ADMIN UI', admin: true },
  { name: 'Pages pizzamaru', url: 'https://jadam-maru.pages.dev/marketing-ai/pizzamaru/', ui: 'ADMIN UI', admin: true },
  { name: 'Pages yogurt', url: 'https://jadam-maru.pages.dev/marketing-ai/yogurtpurple/', ui: 'ADMIN UI', admin: true },
  { name: 'Marketing hub', url: 'https://marketing.ekodi.kr/', ui: 'USER UI', admin: false },
  { name: 'Jadam workspace', url: 'https://jadam.ai.ekodi.kr/', ui: 'ADMIN UI', admin: true },
  { name: 'Pizzamaru workspace', url: 'https://pizzamaru.ai.ekodi.kr/', ui: 'ADMIN UI', admin: true },
  { name: 'Yogurt workspace', url: 'https://yogurt.ai.ekodi.kr/', ui: 'ADMIN UI', admin: true },
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function withProbe(url) {
  const u = new URL(url);
  u.searchParams.set('ekodi_smoke', expected);
  return u.href;
}

async function getText(url) {
  const response = await fetch(withProbe(url), {
    redirect: 'follow',
    cache: 'no-store',
    headers: {
      'cache-control': 'no-cache',
      'user-agent': 'EKODI-Production-Smoke/1.0',
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
  return { text: await response.text(), finalUrl: response.url };
}

function extractAsset(html, filename) {
  const pattern = new RegExp(`(?:href|src)=["']([^"']*${filename.replace('.', '\\.')}[^"']*)["']`, 'i');
  const found = html.match(pattern)?.[1];
  return found ? found.replaceAll('&amp;', '&') : '';
}

async function verifyAsset(url, marker, minLength = 200) {
  if (!url) throw new Error('asset URL missing');
  const { text } = await getText(url);
  if (text.length < minLength) throw new Error(`asset unexpectedly small: ${url}`);
  if (marker && !text.includes(marker)) throw new Error(`asset marker missing: ${url}`);
}

async function verifyTarget(target) {
  const { text: html, finalUrl } = await getText(target.url);
  const required = [
    `data-ekodi-ui-classification="${target.ui}"`,
    `data-ekodi-build-sha="${expected}"`,
    'data-ekodi-ui-governance="official"',
    'data-ekodi-ui-governance-runtime="official"',
  ];
  for (const marker of required) {
    if (!html.includes(marker)) throw new Error(`missing ${marker}; final=${finalUrl}`);
  }
  if (target.admin && !html.includes('data-ekodi-admin-context')) {
    throw new Error(`ADMIN context missing; final=${finalUrl}`);
  }
  if (!target.admin && html.includes('data-ekodi-admin-context')) {
    throw new Error(`ADMIN context leaked into USER UI; final=${finalUrl}`);
  }

  const officialCss = extractAsset(html, 'official-ui.css');
  const officialJs = extractAsset(html, 'official-ui.js');
  await verifyAsset(officialCss, 'EKODI official USER UI / ADMIN UI governance layer', 500);
  await verifyAsset(officialJs, target.admin ? 'EKODI Admin AI' : 'EKODI User AI', 500);

  if (target.admin) {
    const siteCss = extractAsset(html, 'site.css');
    const shellJs = extractAsset(html, 'shell-style.js');
    await verifyAsset(siteCss, '', 1000);
    await verifyAsset(shellJs, 'data-ekodi-shell-external-style', 400);
  }
  return `${target.name}: ${target.ui} · build ${expected}`;
}

let pending = new Map(targets.map(target => [target.name, { target, error: 'not checked' }]));

for (let round = 1; round <= maxRounds && pending.size; round += 1) {
  const batch = [...pending.values()].map(({ target }) => target);
  const results = await Promise.all(batch.map(async target => {
    try {
      return { target, ok: true, message: await verifyTarget(target) };
    } catch (error) {
      return { target, ok: false, message: error?.message || String(error) };
    }
  }));

  for (const result of results) {
    if (result.ok) {
      pending.delete(result.target.name);
      console.log(`✅ ${result.message}`);
    } else {
      pending.set(result.target.name, { target: result.target, error: result.message });
      console.log(`⏳ ${result.target.name}: ${result.message}`);
    }
  }

  if (pending.size && round < maxRounds) {
    console.log(`Waiting for Cloudflare Pages deployment: ${pending.size} target(s), round ${round}/${maxRounds}`);
    await sleep(delayMs);
  }
}

if (pending.size) {
  const details = [...pending.entries()].map(([name, value]) => `${name}: ${value.error}`).join('\n');
  throw new Error(`Production deployment did not converge to ${expected} within the verification window:\n${details}`);
}

console.log(`✅ Production verified end-to-end on Pages and all canonical Marketing AI domains for commit ${expected}.`);
