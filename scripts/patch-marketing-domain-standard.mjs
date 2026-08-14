import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), 'dist', 'marketing-ai');
const replacements = new Map([
  ['https://jadam.ekodi.kr/', 'https://marketing.jadam.ekodi.kr/'],
  ['https://pizzamaru.ekodi.kr/', 'https://marketing.pizzamaru.ekodi.kr/'],
  ['https://yogurt.ekodi.kr/', 'https://marketing.yogurt.ekodi.kr/'],
]);

if (!fs.existsSync(root)) {
  throw new Error(`Marketing AI build output not found: ${root}`);
}

const extensions = new Set(['.html', '.js', '.css', '.json']);
let changedFiles = 0;
let changedRefs = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(target);
      continue;
    }
    if (!extensions.has(path.extname(entry.name))) continue;

    const before = fs.readFileSync(target, 'utf8');
    let after = before;
    for (const [legacy, canonical] of replacements) {
      const occurrences = after.split(legacy).length - 1;
      if (occurrences > 0) {
        changedRefs += occurrences;
        after = after.split(legacy).join(canonical);
      }
    }
    if (after !== before) {
      fs.writeFileSync(target, after);
      changedFiles += 1;
    }
  }
}

walk(root);

for (const canonical of replacements.values()) {
  const qa = fs.readFileSync(path.join(root, 'qa', 'index.html'), 'utf8');
  if (!qa.includes(canonical)) {
    throw new Error(`Canonical Marketing AI domain missing from QA output: ${canonical}`);
  }
}

for (const legacy of replacements.keys()) {
  const qa = fs.readFileSync(path.join(root, 'qa', 'index.html'), 'utf8');
  if (qa.includes(legacy)) {
    throw new Error(`Legacy Marketing AI domain remains in QA output: ${legacy}`);
  }
}

console.log(`Marketing AI domain standard applied: ${changedRefs} references in ${changedFiles} files.`);
