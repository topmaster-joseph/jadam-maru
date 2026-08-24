const expectedFull = String(process.env.SOURCE_VERSION || process.env.GITHUB_SHA || process.env.CF_PAGES_COMMIT_SHA || '').trim();
const expected = expectedFull.slice(0, 12);
const maxRounds = Number(process.env.EKODI_SMOKE_ROUNDS || 30);
const delayMs = Number(process.env.EKODI_SMOKE_DELAY_MS || 12000);

if (!expected) throw new Error('SOURCE_VERSION, GITHUB_SHA or CF_PAGES_COMMIT_SHA is required for production verification');

const targets = [
  { name: 'Pages hub', url: 'https://marketing-ai.pages.dev/', ui: 'USER UI', admin: false },
  { name: 'Pages jadam', url: 'https://marketing-ai-jadam.pages.dev/', ui: 'ADMIN UI', admin: true },
  { name: 'Pages pizzamaru', url: 'https://marketing-ai-pizzamaru.pages.dev/', ui: 'ADMIN UI', admin: true },
  { name: 'Pages yogurt', url: 'https://marketing-ai-yogurtpurple.pages.dev/', ui: 'ADMIN UI', admin: true },
  { name: 'Marketing hub', url: 'https://marketing.ekodi.kr/', ui: 'USER UI', admin: false },
  { name: 'Jadam site', url: 'https://jadam.ekodi.kr/', ui: 'ADMIN UI', admin: true },
  { name: 'Jadam AI', url: 'https://jadam.ai.ekodi.kr/', ui: 'ADMIN UI', admin: true },
  { name: 'Pizzamaru site', url: 'https://pizzamaru.ekodi.kr/', ui: 'ADMIN UI', admin: true },
  { name: 'Pizzamaru AI', url: 'https://pizzamaru.ai.ekodi.kr/', ui: 'ADMIN UI', admin: true },
  { name: 'Yogurt site', url: 'https://yogurt.ekodi.kr/', ui: 'ADMIN UI', admin: true },
  { name: 'Yogurt AI', url: 'https://yogurt.ai.ekodi.kr/', ui: 'ADMIN UI', admin: true },
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
      'user-agent': 'EKODI-Production-Smoke/2.0',
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}: ${url}`);
  return {
    text: await response.text(),
    finalUrl: response.url,
    contentType: String(response.headers.get('content-type') || '').toLowerCase(),
  };
}

function extractAssetUrl(html, filename, baseUrl) {
  const pattern = new RegExp(`(?:href|src)=["']([^"']*${filename.replace('.', '\\.')}[^"']*)["']`, 'i');
  const found = html.match(pattern)?.[1];
  if (!found) return '';
  return new URL(found.replaceAll('&amp;', '&'), baseUrl).href;
}

async function verifyAsset(url, { marker, minLength = 200, type }) {
  if (!url) throw new Error('asset URL missing');
  const resource = await getText(url);
  if (resource.text.length < minLength) throw new Error(`asset unexpectedly small: ${url}`);
  if (marker && !resource.text.includes(marker)) throw new Error(`asset marker missing: ${url}`);
  if (type === 'css' && !resource.contentType.includes('text/css')) {
    throw new Error(`stylesheet MIME mismatch (${resource.contentType || 'missing'}): ${url}`);
  }
  if (type === 'js' && !/(javascript|ecmascript)/.test(resource.contentType)) {
    throw new Error(`script MIME mismatch (${resource.contentType || 'missing'}): ${url}`);
  }
}

async function verifyTarget(target) {
  const { text: html, finalUrl, contentType } = await getText(target.url);
  if (!contentType.includes('text/html')) throw new Error(`page MIME mismatch (${contentType || 'missing'}); final=${finalUrl}`);

  const required = [
    `data-ekodi-ui-classification="${target.ui}"`,
    `data-ekodi-build-sha="${expected}"`,
    'data-ekodi-asset-routing="same-origin"',
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

  const pageOrigin = new URL(finalUrl).origin;
  const officialCss = extractAssetUrl(html, 'official-ui.css', finalUrl);
  const officialJs = extractAssetUrl(html, 'official-ui.js', finalUrl);
  if (new URL(officialCss).origin !== pageOrigin || new URL(officialJs).origin !== pageOrigin) {
    throw new Error(`official UI assets escaped deployed origin; final=${finalUrl}`);
  }
  await verifyAsset(officialCss, {
    marker: 'EKODI official USER UI / ADMIN UI governance layer',
    minLength: 500,
    type: 'css',
  });
  await verifyAsset(officialJs, {
    marker: target.admin ? 'EKODI Admin AI' : 'EKODI User AI',
    minLength: 500,
    type: 'js',
  });

  if (target.admin) {
    const siteCss = extractAssetUrl(html, 'site.css', finalUrl);
    const shellJs = extractAssetUrl(html, 'shell-style.js', finalUrl);
    if (new URL(siteCss).origin !== pageOrigin || new URL(shellJs).origin !== pageOrigin) {
      throw new Error(`tenant assets escaped deployed origin; final=${finalUrl}`);
    }
    await verifyAsset(siteCss, {
      marker: 'Generated by scripts/patch-marketing-style-assets.mjs',
      minLength: 1000,
      type: 'css',
    });
    await verifyAsset(shellJs, {
      marker: 'data-ekodi-shell-external-style',
      minLength: 400,
      type: 'js',
    });
  }
  return `${target.name}: ${target.ui} · build ${expected} · same-origin assets`;
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

console.log(`✅ Production verified end-to-end on four Pages projects and seven canonical Marketing AI domains for commit ${expected}.`);
