// Erzeugt die animierten SVG-Grafiken für das GitHub-Profil-README.
// Einmalig:  npm install      Danach bei Änderungen:  npm run build
// Inhalte im Abschnitt DATEN anpassen, dann neu bauen und pushen.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as si from 'simple-icons';

// ───────────────────────── DATEN ─────────────────────────

const profile = {
  first: 'Leon Nils',
  last: 'Schwinkendorf',
  status: 'available — junior roles in dev & devops',
  coords: '53.5511° N  /  9.9937° E  —  Hamburg',
  role: 'IT specialist — system integration',
  focus: 'fullstack · cloud · ai',
  start: '2023-08-01',
  end: '2027-01-31',
};

const marquee = ['fullstack', 'cloud', 'ai', 'react', 'next.js', 'aws', 'terraform', 'ansible', 'docker', 'linux', 'hamburg'];

// neofetch-Ausgabe
const fetch = [
  ['OS', 'Fachinformatiker · System Integration'],
  ['Host', 'Hamburg, Germany'],
  ['Uptime', '3 years · final year'],
  ['Focus', 'fullstack · cloud · ai'],
  ['Build', 'React · Next.js · TypeScript'],
  ['Run', 'AWS · Terraform · Ansible'],
  ['AI', 'chatbots inside real apps'],
  ['Status', 'open to junior roles'],
  ['Offline', 'basketball (PG) · hardware · design'],
];

// level: 3 = pro (bewusst frei), 2 = comfortable, 1 = learning
const stack = [
  ['TypeScript', 'siTypescript', 2, 'build'],
  ['JavaScript', 'siJavascript', 2, 'build'],
  ['React', 'siReact', 2, 'build'],
  ['Next.js', 'siNextdotjs', 1, 'build'],
  ['Node.js', 'siNodedotjs', 1, 'build'],
  ['Python', 'siPython', 1, 'build'],
  ['Tailwind', 'siTailwindcss', 1, 'build'],
  ['Figma', 'siFigma', 1, 'design'],
  ['AWS', 'siAmazonwebservices', 1, 'run'],
  ['Terraform', 'siTerraform', 1, 'run'],
  ['Ansible', 'siAnsible', 1, 'run'],
  ['Docker', 'siDocker', 2, 'run'],
  ['Linux', 'siLinux', 2, 'run'],
  ['Git', 'siGit', 2, 'tools'],
  ['GitHub', 'siGithub', 2, 'tools'],
  ['LLM APIs', null, 1, 'ai'],
];

// ───────────────────────── DESIGN ─────────────────────────

const c = { bg: '#0a0a0a', panel: '#0f0f0f', ink: '#fafafa', dim: '#8a8a8a', faint: '#3a3a3a', line: '#222222' };

const require = createRequire(import.meta.url);
const b64 = (p) => readFileSync(require.resolve(p)).toString('base64');
const DISPLAY = b64('@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2');
const MONO = b64('@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2');

const css = (display, extra) => `<style>
  ${display ? `@font-face{font-family:D;font-weight:200 800;src:url(data:font/woff2;base64,${DISPLAY}) format('woff2')}` : ''}
  @font-face{font-family:M;font-weight:100 800;src:url(data:font/woff2;base64,${MONO}) format('woff2')}
  .d{font-family:D,'Segoe UI',Helvetica,Arial,sans-serif}
  .m{font-family:M,ui-monospace,Consolas,monospace}
  .up{text-transform:uppercase;letter-spacing:2px}
  .blink{animation:blink 1.1s steps(1) infinite}
  @keyframes blink{50%{opacity:0}}
  @keyframes fade{from{opacity:0}}
  @keyframes rise{from{opacity:0;transform:translateY(14px)}}
  ${extra}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// feines Filmkorn für eine hochwertigere Fläche
const grain = (w, h) => `
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity=".055"/>`;

const cropMarks = (w, h, m = 16, s = 10) =>
  [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]]
    .map(([x, y, dx, dy]) => `<path d="M${x} ${y + dy * s}V${y}H${x + dx * s}" fill="none" stroke="${c.dim}"/>`)
    .join('');

const label = (x, y, n, t) =>
  `<text class="m up" x="${x}" y="${y}" font-size="11" fill="${c.dim}"><tspan fill="${c.ink}">${n}</tspan>  —  ${t}</text>`;

const pr = (s) => {
  let h = 2166136261;
  for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967295;
};

// ───────────────────────── HEADER ─────────────────────────

function header() {
  const W = 1000, H = 500;

  // Punktfeld mit diagonaler Welle
  const dots = [];
  for (let r = 0; r < 12; r++)
    for (let q = 0; q < 19; q++)
      dots.push(`<circle cx="${560 + q * 22}" cy="${86 + r * 22}" r="1.6" style="animation-delay:${((q + r) * 0.09).toFixed(2)}s"/>`);

  // Laufband: Mono-Schrift hat feste Breite (0.6em), daher exakt berechenbar
  const fs = 15, ls = 3;
  const unit = marquee.map((m) => m.toUpperCase()).join('   ·   ') + '   ·   ';
  const unitW = unit.length * (fs * 0.6 + ls);
  const band = esc(unit.repeat(4));

  // Fortschritt in Segmenten
  const start = +new Date(profile.start), end = +new Date(profile.end);
  const pct = Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
  const segN = 28, segOn = Math.round(segN * pct);
  const segs = Array.from({ length: segN }, (_, i) =>
    `<rect x="${690 + i * 9}" y="398" width="6" height="12" fill="${i < segOn ? c.ink : c.faint}" style="animation-delay:${(1.2 + i * 0.04).toFixed(2)}s" class="seg"/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${css(true, `
  .dots circle{fill:${c.ink};opacity:.1;animation:wave 3.2s ease-in-out infinite}
  @keyframes wave{0%,100%{opacity:.08}40%{opacity:.85}}
  .name{animation:rise 1s cubic-bezier(.2,.8,.2,1) both}
  .wipe{animation:wipe 2.2s .35s cubic-bezier(.6,0,.2,1) both}
  @keyframes wipe{from{width:0}}
  .meta{animation:fade 1s .9s both}
  .seg{animation:fade .2s both}
  .band{animation:scroll 38s linear infinite}
  @keyframes scroll{to{transform:translateX(-${unitW}px)}}
  .pulse{animation:pulse 2s ease-out infinite;transform-box:fill-box;transform-origin:center}
  @keyframes pulse{0%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(3.2)}}
`)}
<rect width="${W}" height="${H}" fill="${c.bg}"/>
<defs>
  <linearGradient id="fadeL" x1="0" x2="1"><stop offset="0" stop-color="#000"/><stop offset=".35" stop-color="#fff"/></linearGradient>
  <mask id="dm"><rect x="540" y="60" width="460" height="300" fill="url(#fadeL)"/></mask>
</defs>
<g class="dots" mask="url(#dm)">${dots.join('')}</g>
${grain(W, H)}
${cropMarks(W, H - 60)}

<g class="m up" font-size="11">
  <circle class="pulse" cx="40" cy="44" r="3.5" fill="${c.ink}"/>
  <circle cx="40" cy="44" r="3.5" fill="${c.ink}"/>
  <text x="54" y="48" fill="${c.ink}">${esc(profile.status)}</text>
  <text x="${W - 36}" y="48" text-anchor="end" fill="${c.dim}">${esc(profile.coords)}</text>
</g>

<g class="d" font-weight="800">
  <text class="name" x="32" y="200" font-size="116" letter-spacing="-5" fill="${c.ink}">${profile.first}</text>
  <defs><clipPath id="wc"><rect class="wipe" x="0" y="200" width="${W}" height="130"/></clipPath></defs>
  <text x="84" y="304" font-size="106" letter-spacing="-1" fill="${c.bg}" stroke="${c.faint}" stroke-width="1.5" paint-order="stroke">${profile.last}</text>
  <text x="84" y="304" font-size="106" letter-spacing="-1" fill="${c.bg}" stroke="${c.ink}" stroke-width="4" paint-order="stroke" clip-path="url(#wc)">${profile.last}</text>
</g>

<g class="meta">
  <line x1="36" y1="350" x2="${W - 36}" y2="350" stroke="${c.line}"/>
  <g class="m" font-size="11">
    <text class="up" x="36" y="380" fill="${c.dim}">role</text>
    <text x="36" y="408" fill="${c.ink}" font-size="14">${esc(profile.role)}</text>
    <text class="up" x="400" y="380" fill="${c.dim}">focus</text>
    <text x="400" y="408" fill="${c.ink}" font-size="14">${esc(profile.focus)}</text>
    <text class="up" x="690" y="380" fill="${c.dim}">apprenticeship  ${new Date(start).getFullYear()} → ${new Date(end).getFullYear()}</text>
  </g>
</g>
${segs}

<rect y="${H - 60}" width="${W}" height="60" fill="${c.ink}"/>
<g class="band m" font-size="${fs}" font-weight="700" letter-spacing="${ls}" fill="${c.bg}">
  <text x="0" y="${H - 24}">${band}</text>
</g>
</svg>`;
}

// ───────────────────────── NEOFETCH ─────────────────────────

const PIX = {
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  N: ['10001', '11001', '10101', '10101', '10011', '10001', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
};

function neofetch() {
  const W = 1000, top = 116, rowH = 25;
  const H = top + (fetch.length + 3) * rowH + 70;
  const cmd = 'neofetch';
  const t0 = 0.4, typeDur = 0.7, out = t0 + typeDur + 0.3;

  // Pixel-Monogramm
  const px = 15, gap = 3;
  let pixels = '';
  'LNS'.split('').forEach((ch, li) => {
    PIX[ch].forEach((row, ry) =>
      [...row].forEach((bit, rx) => {
        const x = 52 + (li * 6 + rx) * (px + gap), y = top + 10 + ry * (px + gap);
        const d = (out + pr(`${li}${ry}${rx}`) * 0.9).toFixed(2);
        pixels += bit === '1'
          ? `<rect class="px" x="${x}" y="${y}" width="${px}" height="${px}" fill="${c.ink}" style="animation-delay:${d}s"/>`
          : `<rect x="${x}" y="${y}" width="${px}" height="${px}" fill="${c.ink}" opacity=".04"/>`;
      }));
  });
  const monoW = 17 * (px + gap);

  // Graustufen-Palette wie bei neofetch
  const greys = ['#000', '#1c1c1c', '#3a3a3a', '#5c5c5c', '#808080', '#a6a6a6', '#cfcfcf', '#fafafa'];
  const palette = greys.map((g, i) =>
    `<rect x="${52 + i * (monoW / 8)}" y="${top + 160}" width="${monoW / 8 - 4}" height="22" fill="${g}" stroke="${c.line}"/>`).join('');

  const ix = 420;
  const lines = [
    `<text x="${ix}" y="${top + 22}" font-weight="700" fill="${c.ink}">leon<tspan fill="${c.dim}">@</tspan>hamburg</text>`,
    `<text x="${ix}" y="${top + 22 + rowH}" fill="${c.faint}">${'─'.repeat(13)}</text>`,
    ...fetch.map(([k, v], i) =>
      `<text x="${ix}" y="${top + 22 + (i + 2) * rowH}"><tspan fill="${c.ink}" font-weight="700">${k}</tspan><tspan x="${ix + 96}" fill="${c.dim}">${esc(v)}</tspan></text>`),
  ].map((l, i) => `<g class="ln" style="animation-delay:${(out + 0.15 + i * 0.09).toFixed(2)}s">${l}</g>`).join('');

  const endY = top + 22 + (fetch.length + 3) * rowH;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${css(false, `
  .type{animation:type ${typeDur}s ${t0}s steps(${cmd.length}) both}
  @keyframes type{from{width:0}}
  .px{animation:pop .35s cubic-bezier(.2,.8,.2,1.4) both;transform-box:fill-box;transform-origin:center}
  @keyframes pop{from{opacity:0;transform:scale(.2)}}
  .ln{animation:fade .35s both}
  .late{animation:fade .3s ${(out + 1.6).toFixed(2)}s both}
`)}
<rect width="${W}" height="${H}" fill="${c.bg}"/>
${grain(W, H)}
${label(36, 40, '01', 'about')}

<rect x="36.5" y="60.5" width="${W - 73}" height="${H - 85}" fill="${c.panel}" stroke="${c.line}"/>
<line x1="37" y1="94" x2="${W - 37}" y2="94" stroke="${c.line}"/>
<g fill="none" stroke="${c.dim}"><circle cx="58" cy="77" r="5"/><circle cx="76" cy="77" r="5"/><circle cx="94" cy="77" r="5"/></g>
<text class="m" x="${W / 2}" y="81" text-anchor="middle" font-size="11" fill="${c.dim}">leon@hamburg — zsh — 100×30</text>

<defs><clipPath id="tc"><rect class="type" x="${52 + 17 * 8.4}" y="96" width="${cmd.length * 8.4 + 2}" height="22"/></clipPath></defs>
<g class="m" font-size="14">
  <text x="52" y="${top - 2}" fill="${c.dim}">leon@hamburg <tspan fill="${c.ink}">~</tspan> %</text>
  <text x="${52 + 17 * 8.4}" y="${top - 2}" fill="${c.ink}" clip-path="url(#tc)">${cmd}</text>
</g>

${pixels}
<g class="late">${palette}</g>

<g class="m" font-size="14">${lines}</g>

<g class="m late" font-size="14">
  <text x="52" y="${endY}" fill="${c.dim}">leon@hamburg <tspan fill="${c.ink}">~</tspan> % <tspan class="blink" fill="${c.ink}">█</tspan></text>
</g>
</svg>`;
}

// ───────────────────────── STACK ─────────────────────────

function stackSvg() {
  const W = 1000, cols = 4, tw = (W - 72) / cols, th = 104, top = 64;
  const rows = Math.ceil(stack.length / cols);
  const H = top + rows * th + 36;

  const meter = (x, y, n) =>
    [0, 1, 2].map((i) => `<rect x="${x + i * 14}" y="${y}" width="11" height="4" fill="${i < n ? c.ink : c.faint}"/>`).join('');

  const sparkle = (x, y, s) =>
    `<path transform="translate(${x} ${y}) scale(${s / 24})" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" fill="${c.ink}"/>`;

  const tiles = stack.map(([name, key, lvl, tag], i) => {
    const x = 36 + (i % cols) * tw, y = top + Math.floor(i / cols) * th;
    const icon = key
      ? `<path transform="translate(${x + 22} ${y + 22}) scale(${26 / 24})" d="${si[key].path}" fill="${c.ink}"/>`
      : sparkle(x + 22, y + 22, 26);
    return `<g class="tile" style="animation-delay:${(0.15 + i * 0.05).toFixed(2)}s">
      <rect x="${x + 0.5}" y="${y + 0.5}" width="${tw - 1}" height="${th - 1}" fill="${c.panel}" stroke="${c.line}"/>
      ${icon}
      <text class="m up" x="${x + tw - 18}" y="${y + 32}" text-anchor="end" font-size="10" fill="${c.dim}">${tag}</text>
      <text class="d" x="${x + 22}" y="${y + 80}" font-size="19" font-weight="600" fill="${c.ink}">${esc(name)}</text>
      ${meter(x + tw - 56, y + 74, lvl)}
    </g>`;
  }).join('');

  const legend = [['pro', 3], ['comfortable', 2], ['learning', 1]].map(([t, n], i) => {
    const x = W - 500 + i * 168;
    return `${meter(x, 34, n)}<text class="m up" x="${x + 50}" y="40" font-size="10" fill="${c.dim}">${t}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${css(true, `
  .tile{animation:rise .6s cubic-bezier(.2,.8,.2,1) both}
  .sweep{animation:sweep 7s 1.5s ease-in-out infinite}
  @keyframes sweep{from{transform:translateX(-260px)}to{transform:translateX(${W + 60}px)}}
`)}
<rect width="${W}" height="${H}" fill="${c.bg}"/>
<defs>
  <linearGradient id="sw" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="gc"><rect x="36" y="${top}" width="${W - 72}" height="${rows * th}"/></clipPath>
</defs>
${grain(W, H)}
${label(36, 40, '02', 'stack')}
${legend}
${tiles}
<g clip-path="url(#gc)"><rect class="sweep" x="0" y="${top}" width="220" height="${rows * th}" fill="url(#sw)"/></g>
</svg>`;
}

// ───────────────────────── KONTAKT ─────────────────────────

function contact() {
  const W = 1000, H = 260;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${css(true, `
  .a{animation:rise 1s cubic-bezier(.2,.8,.2,1) both}
  .b{animation:rise 1s .12s cubic-bezier(.2,.8,.2,1) both}
  .arrow{animation:nudge 1.8s ease-in-out infinite}
  @keyframes nudge{50%{transform:translateX(10px)}}
`)}
<rect width="${W}" height="${H}" fill="${c.bg}"/>
${grain(W, H)}
${label(36, 40, '03', 'contact')}
<g class="d" font-weight="800" font-size="108" letter-spacing="-5">
  <text class="a" x="30" y="170" fill="${c.ink}">Let’s</text>
  <text class="b" x="302" y="170" fill="${c.bg}" stroke="${c.ink}" stroke-width="2" letter-spacing="-1">talk.</text>
</g>
<g class="arrow"><path d="M610 132h120m-22-22 22 22-22 22" fill="none" stroke="${c.ink}" stroke-width="3"/></g>
<line x1="36" y1="212" x2="${W - 36}" y2="212" stroke="${c.line}"/>
<g class="m up" font-size="11" fill="${c.dim}">
  <text x="36" y="238">ln.schwinkendorf@gmail.com</text>
  <text x="${W / 2}" y="238" text-anchor="middle">linkedin.com/in/leon-nils-schwinkendorf</text>
  <text x="${W - 36}" y="238" text-anchor="end">© ${new Date().getFullYear()} · hamburg</text>
</g>
</svg>`;
}

// ───────────────────────── AUSGABE ─────────────────────────

mkdirSync(new URL('./assets/', import.meta.url), { recursive: true });
for (const [name, svg] of [['header', header()], ['about', neofetch()], ['stack', stackSvg()], ['contact', contact()]]) {
  writeFileSync(new URL(`./assets/${name}.svg`, import.meta.url), svg);
  console.log(`assets/${name}.svg  ${(svg.length / 1024).toFixed(0)} KB`);
}
