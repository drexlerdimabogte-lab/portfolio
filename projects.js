// Placeholder mockups rendered to canvas. To use real work: give an item `src: 'img/work/xyz.jpg'`
// and it will be used instead of the generated mockup.
export const PROJECTS = [
  { title: 'Amazon main image', client: 'Serum — skincare', kind: 'main', w: 1000, h: 1000, col: '1 / span 3', y: 4, c: ['#f4efe8', '#d7a86e'] },
  { title: 'A+ brand story', client: 'Coffee co.', kind: 'aplus', w: 1200, h: 760, col: '5 / span 5', y: 0, c: ['#2b1d16', '#e0b27a'] },
  { title: 'Product ad — social', client: 'Wireless audio', kind: 'ad', w: 1080, h: 1350, col: '11 / span 2', y: 10, c: ['#d51f3b', '#08090c'] },
  { title: 'Landing page', client: 'Botanical skincare', kind: 'web', w: 1280, h: 900, col: '2 / span 5', y: 4, c: ['#f2eee7', '#5b7a4f'] },
  { title: 'Infographic image', client: 'Steel bottle', kind: 'info', w: 1000, h: 1000, col: '8 / span 3', y: -2, c: ['#e9eef2', '#2f6fb0'] },
  { title: 'Comparison chart', client: 'Home goods', kind: 'compare', w: 1200, h: 820, col: '1 / span 4', y: 6, c: ['#fbfaf7', '#eb4759'] },
  { title: 'Mobile storefront', client: 'Pet supplies', kind: 'phone', w: 900, h: 1200, col: '6 / span 3', y: 12, c: ['#ffd25e', '#1d2b4a'] },
  { title: 'AI lifestyle concept', client: 'Candle brand', kind: 'ai', w: 1080, h: 1080, col: '10 / span 3', y: 2, c: ['#d9c3a5', '#3a2a1e'] },
];

const F = (w, s) => `${w} ${s}px Inter, sans-serif`, SF = s => `400 ${s}px "Instrument Serif", serif`;
function rr(x, a, b, w, h, r) { x.beginPath(); x.roundRect(a, b, w, h, r); }
function bottle(x, cx, by, s, col, label = 'SERUM') {
  const w = 120 * s, h = 300 * s;
  x.fillStyle = '#0002'; x.beginPath(); x.ellipse(cx, by, w * .75, 18 * s, 0, 0, 7); x.fill();
  const g = x.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, shade(col, -.25)); g.addColorStop(.35, shade(col, .25)); g.addColorStop(.6, col); g.addColorStop(1, shade(col, -.35));
  x.fillStyle = g; rr(x, cx - w / 2, by - h, w, h, 22 * s); x.fill();
  x.fillStyle = '#1b1b1b'; rr(x, cx - w * .28, by - h - 70 * s, w * .56, 76 * s, 10 * s); x.fill();
  x.fillStyle = '#ffffffd9'; rr(x, cx - w * .4, by - h * .7, w * .8, h * .42, 6 * s); x.fill();
  x.fillStyle = '#222'; x.textAlign = 'center'; x.font = F(800, 20 * s); x.fillText(label, cx, by - h * .5);
  x.font = F(500, 10 * s); x.fillText('30 ML · DEMO', cx, by - h * .41);
  x.fillStyle = '#ffffff55'; rr(x, cx - w * .32, by - h + 14 * s, 10 * s, h - 30 * s, 5 * s); x.fill();
}
function box(x, cx, by, s, col) {
  const w = 220 * s, h = 180 * s, d = 70 * s;
  x.fillStyle = '#0002'; x.beginPath(); x.ellipse(cx, by, w * .7, 16 * s, 0, 0, 7); x.fill();
  x.fillStyle = shade(col, -.25); x.beginPath(); x.moveTo(cx + w / 2, by - h); x.lineTo(cx + w / 2 + d * .6, by - h - d * .4); x.lineTo(cx + w / 2 + d * .6, by - d * .4); x.lineTo(cx + w / 2, by); x.fill();
  x.fillStyle = shade(col, .2); x.beginPath(); x.moveTo(cx - w / 2, by - h); x.lineTo(cx - w / 2 + d * .6, by - h - d * .4); x.lineTo(cx + w / 2 + d * .6, by - h - d * .4); x.lineTo(cx + w / 2, by - h); x.fill();
  x.fillStyle = col; x.fillRect(cx - w / 2, by - h, w, h);
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = SF(46 * s); x.fillText('Aura', cx, by - h * .5);
  x.font = F(500, 11 * s); x.fillText('WIRELESS · DEMO', cx, by - h * .32);
}
function headphones(x, cx, cy, s, col) {
  x.lineCap = 'round'; x.strokeStyle = shade(col, -.2); x.lineWidth = 34 * s;
  x.beginPath(); x.arc(cx, cy, 150 * s, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
  for (const sx of [-1, 1]) {
    const g = x.createRadialGradient(cx + sx * 150 * s - 20 * s, cy + 30 * s, 10 * s, cx + sx * 150 * s, cy + 60 * s, 90 * s);
    g.addColorStop(0, shade(col, .35)); g.addColorStop(1, shade(col, -.3)); x.fillStyle = g;
    rr(x, cx + sx * 150 * s - 55 * s, cy - 10 * s, 110 * s, 160 * s, 50 * s); x.fill();
  }
}
function shade(hex, a) {
  let n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
function tag(x, t, X, Y, bg = '#151514', fg = '#fff', s = 1) {
  x.font = F(600, 18 * s); const w = x.measureText(t).width + 36 * s;
  x.fillStyle = bg; rr(x, X, Y, w, 40 * s, 20 * s); x.fill(); x.fillStyle = fg; x.textAlign = 'left'; x.fillText(t, X + 18 * s, Y + 26 * s); return w;
}
function wm(x, W, H) { x.save(); x.font = F(500, 14); x.fillStyle = '#00000044'; x.textAlign = 'right'; x.fillText('PLACEHOLDER MOCKUP', W - 24, H - 22); x.restore(); }

const DRAW = {
  main(x, W, H, [bg, c]) {
    const g = x.createRadialGradient(W / 2, H * .45, 50, W / 2, H / 2, W * .7); g.addColorStop(0, '#fff'); g.addColorStop(1, bg);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = shade(c, .55); x.beginPath(); x.arc(W * .68, H * .42, 210, 0, 7); x.fill();
    bottle(x, W * .42, H * .84, 1.9, c); bottle(x, W * .7, H * .86, 1.35, shade(c, -.2), 'CREAM');
  },
  aplus(x, W, H, [bg, c]) {
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(.35, bg); g.addColorStop(1, shade(bg, .15)); x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(224,178,122,${Math.random() * .2})`; x.beginPath(); x.arc(W * .55 + Math.random() * W * .45, Math.random() * H, Math.random() * 30, 0, 7); x.fill(); }
    x.fillStyle = c; x.font = F(600, 18); x.textAlign = 'left'; x.fillText('OUR STORY', 80, 140);
    x.fillStyle = '#f6eadb'; x.font = SF(92); x.fillText('Roasted slow,', 80, 250); x.fillText('poured bold.', 80, 340);
    x.font = F(400, 20); x.fillStyle = '#f6eadbaa'; ['Single-origin beans from small farms,', 'roasted in tiny batches every week.'].forEach((t, i) => x.fillText(t, 80, 410 + i * 32));
    [['100%', 'ARABICA'], ['48h', 'FRESH SHIP'], ['4.8★', 'REVIEWS']].forEach(([a, b], i) => { x.fillStyle = c; x.font = SF(56); x.fillText(a, 80 + i * 170, 590); x.font = F(500, 13); x.fillStyle = '#f6eadb99'; x.fillText(b, 80 + i * 170, 620); });
    // bag
    x.fillStyle = '#0005'; x.beginPath(); x.ellipse(W * .78, H * .9, 170, 22, 0, 0, 7); x.fill();
    x.fillStyle = c; x.beginPath(); x.moveTo(W * .66, H * .2); x.lineTo(W * .9, H * .2); x.lineTo(W * .92, H * .9); x.lineTo(W * .64, H * .9); x.fill();
    x.fillStyle = shade(c, -.25); x.fillRect(W * .66, H * .2, W * .24, 30);
    x.fillStyle = '#2b1d16'; x.textAlign = 'center'; x.font = SF(64); x.fillText('Kapé', W * .78, H * .55); x.font = F(600, 14); x.fillText('DARK ROAST · DEMO', W * .78, H * .6);
  },
  ad(x, W, H, [bg, c]) {
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    x.fillStyle = shade(bg, .25); x.beginPath(); x.arc(W / 2, H * .5, W * .42, 0, 7); x.fill();
    headphones(x, W / 2, H * .42, 1.9, c);
    x.fillStyle = c; x.textAlign = 'left'; x.font = F(800, 120); x.fillText('HEAR', 70, 190); x.fillText('MORE.', 70, 310);
    x.font = F(500, 30); x.fillText('40h battery · ANC · demo', 70, H - 210);
    tag(x, 'SHOP NOW  →', 70, H - 160, c, bg, 1.6);
    x.fillStyle = c; x.textAlign = 'right'; x.font = SF(80); x.fillText('-30%', W - 70, H - 110);
  },
  web(x, W, H, [bg, c]) {
    x.fillStyle = '#dcd8d0'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#fff'; rr(x, 40, 40, W - 80, H - 80, 14); x.fill();
    x.fillStyle = '#ece9e3'; rr(x, 40, 40, W - 80, 44, [14, 14, 0, 0]); x.fill();
    ['#eb4759', '#f5b94a', '#3fbf6b'].forEach((k, i) => { x.fillStyle = k; x.beginPath(); x.arc(70 + i * 22, 62, 6, 0, 7); x.fill(); });
    x.fillStyle = bg; x.fillRect(40, 84, W - 80, H - 124);
    x.fillStyle = '#222'; x.font = F(700, 18); x.textAlign = 'left'; x.fillText('verdé', 80, 130);
    x.font = F(500, 14); ['Shop', 'Rituals', 'About', 'Cart (2)'].forEach((t, i) => x.fillText(t, W - 420 + i * 90, 130));
    x.fillStyle = '#1f2a1a'; x.font = SF(86); x.fillText('Skin, but', 80, 290); x.font = 'italic ' + SF(86); x.fillText('from the garden.', 80, 375);
    x.font = F(400, 18); x.fillStyle = '#444'; x.fillText('Plant-based essentials. Demo content.', 80, 430);
    tag(x, 'Shop the ritual →', 80, 470, c, '#fff');
    x.fillStyle = shade(c, .55); rr(x, W * .58, 170, W * .34, H * .52, 200); x.fill();
    bottle(x, W * .72, H * .74, 1.1, c, 'OIL'); bottle(x, W * .83, H * .76, .8, '#c9a57e', 'MIST');
    for (let i = 0; i < 4; i++) { x.fillStyle = '#e6e1d6'; rr(x, 80 + i * ((W - 200) / 4), H - 190, (W - 260) / 4, 110, 10); x.fill(); }
  },
  info(x, W, H, [bg, c]) {
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    bottle(x, W * .62, H * .92, 2.2, c, 'STEEL');
    x.textAlign = 'left'; x.fillStyle = '#152238'; x.font = F(800, 58); x.fillText('Cold 24h.', 60, 120); x.fillText('Hot 12h.', 60, 185);
    [['Double-wall vacuum', 300], ['Leak-proof lid', 440], ['BPA-free steel', 580], ['Fits cup holders', 720]].forEach(([t, y], i) => {
      x.fillStyle = c; x.beginPath(); x.arc(90, y, 30, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = F(800, 24); x.textAlign = 'center'; x.fillText(i + 1, 90, y + 8);
      x.textAlign = 'left'; x.fillStyle = '#152238'; x.font = F(600, 28); x.fillText(t, 140, y + 10);
      x.strokeStyle = c; x.setLineDash([6, 6]); x.beginPath(); x.moveTo(140 + x.measureText(t).width + 16, y); x.lineTo(W * .52, y - 40 + i * 30); x.stroke(); x.setLineDash([]);
    });
  },
  compare(x, W, H, [bg, c]) {
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    x.fillStyle = '#151514'; x.font = SF(64); x.textAlign = 'center'; x.fillText('Why ours?', W / 2, 100);
    const cols = ['Ours', 'Brand B', 'Brand C'], rows = ['Organic cotton', 'Machine wash', '2-yr warranty', 'Free returns', 'Gift-ready box'];
    cols.forEach((t, i) => { const X = 520 + i * 220; if (!i) { x.fillStyle = c; rr(x, X - 95, 140, 190, 620, 18); x.fill(); } x.fillStyle = i ? '#151514' : '#fff'; x.font = F(700, 24); x.fillText(t, X, 200); });
    rows.forEach((r, j) => { const Y = 290 + j * 100; x.fillStyle = '#151514'; x.textAlign = 'left'; x.font = F(500, 26); x.fillText(r, 90, Y); x.textAlign = 'center';
      cols.forEach((_, i) => { const ok = !i || (i + j) % 2; x.fillStyle = !i ? '#fff' : ok ? '#151514' : '#bbb'; x.font = F(800, 30); x.fillText(ok ? '✓' : '—', 520 + i * 220, Y); });
      x.fillStyle = '#0001'; x.fillRect(90, Y + 30, W - 180, 1); });
  },
  phone(x, W, H, [bg, c]) {
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) { x.fillStyle = '#ffffff33'; x.beginPath(); x.arc(Math.random() * W, Math.random() * H, 30 + Math.random() * 90, 0, 7); x.fill(); }
    const pw = 440, ph = 900, px = (W - pw) / 2, py = (H - ph) / 2;
    x.fillStyle = '#0003'; rr(x, px + 20, py + 30, pw, ph, 60); x.fill();
    x.fillStyle = '#111'; rr(x, px, py, pw, ph, 60); x.fill(); x.fillStyle = '#fff'; rr(x, px + 16, py + 16, pw - 32, ph - 32, 46); x.fill();
    x.fillStyle = '#111'; rr(x, px + pw / 2 - 60, py + 30, 120, 28, 14); x.fill();
    x.fillStyle = c; rr(x, px + 36, py + 90, pw - 72, 300, 24); x.fill();
    x.fillStyle = bg; x.font = SF(54); x.textAlign = 'left'; x.fillText('Happy paws', px + 66, py + 200); x.font = F(600, 16); x.fillText('NEW COLLECTION · DEMO', px + 66, py + 236);
    tag(x, 'Shop', px + 66, py + 300, bg, c);
    for (let i = 0; i < 4; i++) { const X = px + 36 + (i % 2) * ((pw - 88) / 2 + 16), Y = py + 420 + Math.floor(i / 2) * 220;
      x.fillStyle = '#f1efe9'; rr(x, X, Y, (pw - 88) / 2, 160, 18); x.fill(); x.fillStyle = [bg, '#f5a3a3', '#a3d4f5', '#c9e7a3'][i]; x.beginPath(); x.arc(X + (pw - 88) / 4, Y + 80, 48, 0, 7); x.fill();
      x.fillStyle = '#222'; x.font = F(600, 15); x.fillText(['Chew toy', 'Bed', 'Bowl', 'Leash'][i] + ' — ₱' + (299 + i * 150), X + 4, Y + 186); }
  },
  ai(x, W, H, [bg, c]) {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f1e3cf'); g.addColorStop(1, bg); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = '#ffffff66'; x.beginPath(); x.moveTo(W * .1, 0); x.lineTo(W * .45, 0); x.lineTo(W * .9, H); x.lineTo(W * .5, H); x.fill();
    x.fillStyle = shade(bg, -.25); x.fillRect(0, H * .7, W, H * .3);
    const cx = W * .5, by = H * .74;
    x.fillStyle = '#0003'; x.beginPath(); x.ellipse(cx, by, 200, 26, 0, 0, 7); x.fill();
    const jg = x.createLinearGradient(cx - 160, 0, cx + 160, 0); jg.addColorStop(0, '#e9dccb'); jg.addColorStop(.4, '#fffaf2'); jg.addColorStop(1, '#cbb89f');
    x.fillStyle = jg; rr(x, cx - 160, by - 300, 320, 300, 30); x.fill();
    x.fillStyle = c; x.fillRect(cx - 160, by - 200, 320, 90); x.fillStyle = '#f1e3cf'; x.font = SF(54); x.textAlign = 'center'; x.fillText('Hearth', cx, by - 140);
    x.strokeStyle = '#222'; x.lineWidth = 4; x.beginPath(); x.moveTo(cx, by - 300); x.lineTo(cx, by - 340); x.stroke();
    const fg = x.createRadialGradient(cx, by - 380, 4, cx, by - 380, 120); fg.addColorStop(0, '#fff6c8'); fg.addColorStop(.25, '#ffb44acc'); fg.addColorStop(1, '#ffb44a00');
    x.fillStyle = fg; x.beginPath(); x.arc(cx, by - 380, 120, 0, 7); x.fill();
    x.fillStyle = '#ffdd7a'; x.beginPath(); x.ellipse(cx, by - 375, 16, 40, 0, 0, 7); x.fill();
    tag(x, '✦ AI CONCEPT', 50, 50, '#151514cc', '#fff', 1.2);
  },
};

export function renderMockup(p) {
  if (p.src) return p.src;
  const cv = document.createElement('canvas'); cv.width = p.w; cv.height = p.h; const x = cv.getContext('2d');
  DRAW[p.kind](x, p.w, p.h, p.c); wm(x, p.w, p.h);
  return cv.toDataURL('image/jpeg', .86);
}

export function drawInset(cv) {
  const x = cv.getContext('2d'), W = cv.width, H = cv.height;
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#9a9a9a'); g.addColorStop(1, '#1c1c1c'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = '#ffffff22'; x.beginPath(); x.moveTo(W * .1, 0); x.lineTo(W * .5, 0); x.lineTo(W, H * .7); x.lineTo(W * .6, H); x.fill();
  x.fillStyle = '#2a2a2a'; x.fillRect(0, H * .72, W, H * .28);
  x.fillStyle = '#111'; rr(x, W * .14, H * .3, W * .72, H * .36, 12); x.fill();
  x.fillStyle = '#d8d8d8'; rr(x, W * .17, H * .33, W * .66, H * .3, 4); x.fill();
  x.fillStyle = '#9a9a9a'; for (let i = 0; i < 3; i++) rr(x, W * .21 + i * W * .2, H * .38, W * .17, H * .2, 4), x.fill();
  x.fillStyle = '#111'; x.fillRect(W * .47, H * .66, W * .06, H * .07); x.fillRect(W * .36, H * .72, W * .28, 8);
  x.fillStyle = '#3a3a3a'; rr(x, W * .62, H * .78, W * .26, 20, 6); x.fill();
  x.fillStyle = '#161616'; x.beginPath(); x.arc(W * .2, H * .82, 36, 0, 7); x.fill();
  const d = x.getImageData(0, 0, W, H); for (let i = 0; i < d.data.length; i += 4) { const n = (Math.random() - .5) * 26; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n; } x.putImageData(d, 0, 0);
}

export function streakTexture() {
  const cv = document.createElement('canvas'); cv.width = 900; cv.height = 600; const x = cv.getContext('2d');
  for (let i = 0; i < 160; i++) {
    const y = Math.random() * 600, l = 80 + Math.random() * 500, X = Math.random() * 900, a = Math.random() * .22;
    const g = x.createLinearGradient(X, 0, X + l, 0); g.addColorStop(0, '#ffffff00'); g.addColorStop(.7, `rgba(255,255,255,${a})`); g.addColorStop(1, '#ffffff00');
    x.fillStyle = g; x.fillRect(X, y, l, Math.random() < .1 ? 2 : 1);
    if (X + l > 900) x.fillRect(X - 900, y, l, 1);
  }
  for (let i = 0; i < 14; i++) { const y = Math.random() * 600, g = x.createLinearGradient(0, 0, 900, 0); g.addColorStop(0, '#d51f3b00'); g.addColorStop(.5, '#d51f3b44'); g.addColorStop(1, '#d51f3b00'); x.fillStyle = g; x.fillRect(0, y, 900, 1); }
  return cv.toDataURL();
}
