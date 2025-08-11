import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const outDir = path.resolve('client/src/assets/cards');

const colors = {
  Red:    '#ef4444',
  Yellow: '#f59e0b',
  Green:  '#16a34a',
  Blue:   '#2563eb',
  Wild:   '#111827'
};
const ranks = ['0','1','2','3','4','5','6','7','8','9','Skip','Reverse','Draw2'];
const wildRanks = ['Wild','WildDraw4'];

await fs.mkdir(outDir, { recursive: true });

function svgCard(bg, label) {
  return `
<svg width="200" height="280" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" rx="18" ry="18" width="192" height="272" fill="${bg}" />
  <rect x="18" y="32" rx="60" ry="60" width="164" height="216" fill="#ffffff20" />
  <text x="20" y="34" font-family="Inter,Arial" font-size="16" fill="white">${label}</text>
  <text x="180" y="270" text-anchor="end" font-family="Inter,Arial" font-size="16" fill="white">${label}</text>
  <text x="100" y="160" text-anchor="middle" font-family="Inter,Arial" font-weight="700" font-size="${label.length>2? 48 : 72}" fill="white">${label}</text>
</svg>`;
}

function svgWild(label) {
  return `
<svg width="200" height="280" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" rx="18" ry="18" width="192" height="272" fill="${colors.Wild}" />
  <g transform="translate(30,70)">
    <circle cx="40" cy="40" r="32" fill="#ef4444"/>
    <circle cx="100" cy="40" r="32" fill="#16a34a"/>
    <circle cx="40" cy="100" r="32" fill="#2563eb"/>
    <circle cx="100" cy="100" r="32" fill="#f59e0b"/>
  </g>
  <text x="100" y="30" text-anchor="middle" font-family="Inter,Arial" font-size="16" fill="white">WILD</text>
  <text x="100" y="165" text-anchor="middle" font-family="Inter,Arial" font-weight="700" font-size="48" fill="white">${label === 'Wild' ? '★' : '+4'}</text>
</svg>`;
}

function svgBack() {
  return `
<svg width="200" height="280" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" rx="18" ry="18" width="192" height="272" fill="#0f172a"/>
  <rect x="20" y="20" rx="14" ry="14" width="160" height="240" fill="#1f2937" stroke="#ffffff30" stroke-width="2"/>
  <text x="100" y="150" text-anchor="middle" font-family="Inter,Arial" font-weight="700" font-size="48" fill="#fff">UNO</text>
</svg>`;
}

async function render(svg, out) {
  await sharp(Buffer.from(svg)).png().toFile(out);
}

async function main() {
  for (const [name, bg] of Object.entries(colors)) {
    if (name === 'Wild') continue;
    for (const r of ranks) {
      const label = r === 'Draw2' ? '+2' : r === 'Reverse' ? '↺' : r === 'Skip' ? '⦸' : r;
      const svg = svgCard(bg, String(label));
      await render(svg, path.join(outDir, `${name}_${r}.png`));
    }
  }
  for (const w of wildRanks) {
    await render(svgWild(w), path.join(outDir, `Wild_${w}.png`));
  }
  await render(svgBack(), path.join(outDir, 'back.png'));
  console.log('Generated card PNGs →', outDir);
}

main().catch((e) => { console.error(e); process.exit(1); });