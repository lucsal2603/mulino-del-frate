// Prodotti del Mulino ricostruiti in 3D (Three.js): un solo canvas fisso, una vista per ogni [data-jar].
// Unità: centimetri. Etichette ridisegnate dal vero, testo letto dalle foto dei prodotti.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const idle = () => new Promise(r => window.requestIdleCallback ? requestIdleCallback(() => r(), { timeout: 250 }) : setTimeout(r, 30));
const SMALL = innerWidth < 760;
const V2 = (x, y) => new THREE.Vector2(x, y);

/* ------------------------------------------------------------------ testi etichette */
const ADDR1 = 'Mulino del Frate , via della Torre 17 Roncobilaccio';
const ADDR2 = '40035 Castiglione dei Pepoli ,Bo Italy tel. 3482502474';
const FOOT = 'Confez. c/o Apicoltura Girotti Castelmaggiore';
const LABELS = {
  castagnella: { strip: 'swirl', name: 'Castagnella', sub: ['crema di miele di castagno e farina di', 'castagne , spalmabile'], serif: 'prodotto della montagna bolognese' },
  miele: { strip: 'logo', name: 'Miele millefiori balsamico', serifBold: 'prodotto di montagna', band: ['Azienda agricola, apicoltura', 'erboristeria, cosmesi e ospitalità'] },
  propoli: { strip: 'swirl', name: 'Propoli', sub: ['spray'], compact: true },
  dopobarba: { strip: 'lines', name: 'Fluido dopobarba rinfrescante', sub: ['idratante emolliente calmante'], caps: 'LAVANDA, MALVA, POLLINE' },
  maschera: { strip: 'swirl', name: "Maschera all'argilla", sub: ['uso settimanale delicata', 'con olio di polline'] },
  artiglio: { strip: 'dark', name: "Crema all'artiglio del diavolo e arnica", sub: ["cera d'api, estratto di artiglio del diavolo e di arnica"] },
  calendula: { strip: 'dark', name: 'Crema alla propoli e calendula', sub: ["cera d'api, propoli, olio di calendula"] },
  polline: { strip: 'dark', name: 'Unguento propoli e polline', sub: ['antimicotico e antiossidante , multiuso', "cera d'api, propoli e polline"] },
  teatree: { strip: 'dark', name: 'Unguento propoli e tea tree', sub: ["olio veg. , cera d'api, propoli e tea tree"] }
};

/* ------------------------------------------------------------------ texture disegnate */
function paper(ctx, W, H, base = '#efe2c4') {
  ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(120,90,50,.06)'); g.addColorStop(.5, 'rgba(255,255,255,.05)'); g.addColorStop(1, 'rgba(120,90,50,.08)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 1400; i++) { ctx.strokeStyle = `rgba(${Math.random() > .5 ? '255,255,250' : '120,95,60'},${.05 + Math.random() * .06})`; ctx.lineWidth = .8 + Math.random() * 1.4; const px = Math.random() * W, py = Math.random() * H, a = Math.random() * Math.PI, l = 6 + Math.random() * 26; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); ctx.stroke(); }
  for (let i = 0; i < 2500; i++) { ctx.fillStyle = `rgba(${rnd() > .5 ? '90,70,40' : '255,255,255'},${.03 + rnd() * .04})`; ctx.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 3, 1 + rnd() * 3); }
}
function strip(ctx, kind, x, y, w, h, logo) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (kind === 'dark') {
    ctx.fillStyle = '#5a4046'; ctx.fillRect(x, y, w, h);
    for (let i = 0; i < 140; i++) { ctx.strokeStyle = `rgba(${i % 3 ? '160,120,130' : '40,25,30'},.35)`; ctx.lineWidth = 1 + (i % 4); const yy = y + (i / 140) * h; ctx.beginPath(); ctx.moveTo(x, yy); ctx.bezierCurveTo(x + w * .3, yy + 6, x + w * .7, yy - 6, x + w, yy + 3); ctx.stroke(); }
  } else if (kind === 'lines') {
    ctx.fillStyle = '#e6d8c2'; ctx.fillRect(x, y, w, h);
    for (let i = 0; i < 26; i++) { ctx.strokeStyle = `rgba(150,120,140,${.25 + (i % 3) * .12})`; ctx.lineWidth = 2 + (i % 5); const xx = x + (i / 26) * w; ctx.beginPath(); ctx.moveTo(xx, y); ctx.lineTo(xx + Math.sin(i) * 6, y + h); ctx.stroke(); }
  } else if (kind === 'logo' && logo) {
    ctx.fillStyle = '#7a5a3c'; ctx.fillRect(x, y, w, h);
    const m = w * .1; ctx.fillStyle = '#d9c7a4'; ctx.fillRect(x + m, y + m, w - 2 * m, h * .62);
    const iw = w - 4 * m, ih = h * .62 - 2 * m, s = Math.max(iw / logo.width, ih / logo.height);
    ctx.save(); ctx.beginPath(); ctx.rect(x + 2 * m, y + 2 * m, iw, ih); ctx.clip();
    ctx.drawImage(logo, x + 2 * m + (iw - logo.width * s) / 2, y + 2 * m + (ih - logo.height * s) / 2, logo.width * s, logo.height * s); ctx.restore();
  } else {
    ctx.fillStyle = '#e8dccb'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(165,135,140,.55)'; ctx.lineWidth = 3;
    for (let k = 0; k < 7; k++) {
      const cx = x + w * (.35 + (k % 2) * .3), cy = y + h * (.08 + k * .145), R = w * .26;
      ctx.beginPath();
      for (let t = 0; t < 14; t += .08) { const r = R * (1 - t / 14); const px = cx + Math.cos(t) * r, py = cy + Math.sin(t) * r * .8; t ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
    }
  }
  ctx.restore();
}
function fitFont(ctx, txt, font, size, maxW) {
  let s = size; ctx.font = font.replace('#', s + 'px');
  while (ctx.measureText(txt).width > maxW && s > 8) { s -= 1; ctx.font = font.replace('#', s + 'px'); }
  return s;
}
function drawLabel(id, W, H, logo) {
  const L = LABELS[id];
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  paper(ctx, W, H, id === 'artiglio' || id === 'calendula' || id === 'polline' || id === 'teatree' ? '#f2cf9a' : '#efe2c4');
  const bandH = L.band ? H * .36 : 0;
  const sw = L.strip === 'logo' ? W * .15 : W * .085;
  strip(ctx, L.strip, 0, 0, sw, H - bandH, logo);
  const x0 = sw + W * .035, maxW = W - x0 - W * .04;
  const ink = '#4a2e1a', soft = '#6e5a46';
  let y = H * (L.compact ? .2 : .14);
  const u = (H - bandH) / 100;
  ctx.textBaseline = 'alphabetic'; ctx.fillStyle = soft;
  let s = fitFont(ctx, ADDR1, 'small-caps 400 # "Noto Serif"', u * 7.2, maxW); ctx.fillText(ADDR1, x0, y);
  y += s * 1.15; s = fitFont(ctx, ADDR2, 'small-caps 400 # "Noto Serif"', u * 7.2, maxW); ctx.fillText(ADDR2, x0, y);
  ctx.fillStyle = ink;
  y += u * (L.compact ? 26 : 20);
  s = fitFont(ctx, L.name, '700 # "Noto Sans"', u * (L.name.length > 28 ? 14 : 17), maxW - W * .02); ctx.fillText(L.name, x0 + W * .015, y);
  y += u * 4;
  (L.sub || []).forEach(t => { const ss = fitFont(ctx, t, '400 # "Noto Sans"', u * 9.4, maxW); y += ss * 1.12; ctx.fillStyle = '#4e3b2b'; ctx.fillText(t, x0, y); });
  if (L.caps) { const ss = fitFont(ctx, L.caps, '400 # "Noto Sans"', u * 7.4, maxW); y += ss * 1.7; ctx.fillStyle = soft; ctx.save(); ctx.letterSpacing = '6px'; ctx.fillText(L.caps, x0 + W * .02, y); ctx.restore(); }
  if (L.serif) { const ss = fitFont(ctx, L.serif, '400 # "Noto Serif"', u * 9, maxW); y += ss * 1.15; ctx.fillStyle = '#5a3a20'; ctx.fillText(L.serif, x0 + W * .005, y); }
  if (L.serifBold) { const ss = fitFont(ctx, L.serifBold, '700 # "Noto Sans"', u * 10, maxW); y += ss * 1.45; ctx.fillStyle = '#5a3a20'; ctx.fillText(L.serifBold, x0 + W * .08, y); }
  ctx.fillStyle = soft;
  s = fitFont(ctx, FOOT, 'small-caps 400 # "Noto Serif"', u * 6.2, maxW * .9);
  ctx.fillText(FOOT, x0 + (maxW - ctx.measureText(FOOT).width) / 2, H - bandH - u * 5);
  if (L.band) {
    const by = H - bandH;
    ctx.fillStyle = '#4d4240'; ctx.fillRect(0, by, W, bandH);
    for (let i = 0; i < 90; i++) { ctx.strokeStyle = `rgba(${i % 2 ? '140,120,115' : '30,22,20'},.3)`; ctx.lineWidth = 1 + i % 3; const xx = (i / 90) * W; ctx.beginPath(); ctx.moveTo(xx, by); ctx.bezierCurveTo(xx + 20, by + bandH * .3, xx - 20, by + bandH * .7, xx + 8, H); ctx.stroke(); }
    ctx.fillStyle = '#ead8b0';
    L.band.forEach((t, i) => { const ss = fitFont(ctx, t, '700 # "Noto Sans"', bandH * .2, W * .8); ctx.fillText(t, W * .05, by + bandH * (.32 + i * .27)); });
    ctx.fillStyle = 'rgba(234,216,176,.7)';
    fitFont(ctx, 'lotto e scadenza sul fondo', '400 # "Noto Sans"', bandH * .09, W * .6); ctx.fillText('lotto e scadenza sul fondo', W * .05, by + bandH * .88);
  }
  // bordo leggermente più scuro
  const e = ctx.createLinearGradient(0, 0, W, 0); e.addColorStop(0, 'rgba(80,60,40,.18)'); e.addColorStop(.03, 'rgba(0,0,0,0)'); e.addColorStop(.97, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(80,60,40,.18)');
  ctx.fillStyle = e; ctx.fillRect(0, 0, W, H);
  return c;
}
function honeycomb(W, H, s, top) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const g = top ? ctx.createRadialGradient(W * .42, H * .38, 10, W / 2, H / 2, W * .7) : ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#3c5a46'); g.addColorStop(1, '#22372b');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#e2bf4e'; ctx.lineWidth = s * .13; ctx.lineJoin = 'round';
  const w = Math.sqrt(3) * s, rows = Math.ceil(H / (1.5 * s)) + 2, cols = Math.ceil(W / w) + 2;
  for (let r = -1; r < rows; r++) for (let q = -1; q < cols; q++) {
    const cx = q * w + (r % 2 ? w / 2 : 0), cy = r * 1.5 * s;
    ctx.beginPath();
    for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; const px = cx + Math.cos(a) * s * .97, py = cy + Math.sin(a) * s * .97; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.closePath(); ctx.stroke();
  }
  if (top) { const v = ctx.createRadialGradient(W / 2, H / 2, W * .3, W / 2, H / 2, W * .52); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
  return c;
}
/* ------------------------------------------------------------------ texture di dettaglio */
const mk = (W, H, draw) => { const c = document.createElement('canvas'); c.width = W; c.height = H; draw(c.getContext('2d'), W, H); return c; };
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const paperBump = () => mk(1024, 512, (x, W, H) => {
  x.fillStyle = '#808080'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 4000; i++) { x.strokeStyle = `rgba(${rnd() > .5 ? 255 : 0},${rnd() > .5 ? 255 : 0},${rnd() > .5 ? 255 : 0},.06)`; x.strokeStyle = rnd() > .5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'; x.lineWidth = .6 + rnd(); const px = rnd() * W, py = rnd() * H, a = rnd() * Math.PI, l = 3 + rnd() * 14; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
});
const granules = (base, spread) => mk(1024, 512, (x, W, H) => {
  x.fillStyle = base; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) { const v = (rnd() - .5) * spread; x.fillStyle = v > 0 ? `rgba(255,248,225,${v})` : `rgba(120,80,20,${-v})`; const r = 1.2 + rnd() * 3.2; x.beginPath(); x.arc(rnd() * W, rnd() * H, r, 0, 7); x.fill(); }
  x.filter = 'blur(1px)'; x.drawImage(x.canvas, 0, 0); x.filter = 'none';
});
const cream = () => mk(1024, 512, (x, W, H) => {
  x.fillStyle = '#3a1d0d'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { x.strokeStyle = `rgba(${rnd() > .5 ? '120,70,40' : '25,12,5'},${.08 + rnd() * .1})`; x.lineWidth = 4 + rnd() * 18; const y = rnd() * H; x.beginPath(); x.moveTo(-20, y); x.bezierCurveTo(W * .3, y + (rnd() - .5) * 80, W * .7, y + (rnd() - .5) * 80, W + 20, y + (rnd() - .5) * 40); x.stroke(); }
  for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(200,170,130,${.08 + rnd() * .15})`; x.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd() * 2); }
});
const plastic = () => mk(512, 512, (x, W, H) => { x.fillStyle = '#808080'; x.fillRect(0, 0, W, H); for (let i = 0; i < 5000; i++) { x.fillStyle = rnd() > .5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; x.fillRect(rnd() * W, rnd() * H, 2, 2); } });
const ribs = n => mk(2048, 64, (x, W, H) => { for (let i = 0; i < n; i++) { const g = x.createLinearGradient(i * W / n, 0, (i + 1) * W / n, 0); g.addColorStop(0, '#404040'); g.addColorStop(.5, '#d0d0d0'); g.addColorStop(1, '#404040'); x.fillStyle = g; x.fillRect(i * W / n, 0, W / n + 1, H); } });
const aoBlob = () => mk(256, 256, (x) => { const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, '#fff'); g.addColorStop(.45, '#bbb'); g.addColorStop(.7, '#444'); g.addColorStop(1, '#000'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); });

/* ------------------------------------------------------------------ materiali fisici */
let maxAniso = 8;
function tex(canvas, { srgb = true, repeat = null } = {}) { const t = new THREE.CanvasTexture(canvas); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); } return t; }
let T = {};
const M = {
  glass: (o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: 0xffffff, metalness: 0, roughness: .025, transmission: 1, thickness: .45, ior: 1.5, attenuationColor: new THREE.Color(0xd5eadc), attenuationDistance: 5, specularIntensity: 1, envMapIntensity: 1.15 }, o)),
  pp: (o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: 0xf7f6f1, roughness: .34, metalness: 0, sheen: .5, sheenRoughness: .6, sheenColor: new THREE.Color(0xffffff), clearcoat: .15, clearcoatRoughness: .4, bumpMap: T.plastic, bumpScale: .015, envMapIntensity: .9 }, o)),
  label: map => new THREE.MeshPhysicalMaterial({ map, bumpMap: T.paper, bumpScale: .35, roughness: .82, metalness: 0, sheen: .25, sheenRoughness: .8, sheenColor: new THREE.Color(0xfff3dc), side: THREE.DoubleSide, envMapIntensity: .7 }),
  tin: map => new THREE.MeshPhysicalMaterial({ map, metalness: .55, roughness: .3, clearcoat: 1, clearcoatRoughness: .07, envMapIntensity: 1.2 }),
  tinPlain: hex => new THREE.MeshPhysicalMaterial({ color: hex, metalness: .65, roughness: .28, clearcoat: 1, clearcoatRoughness: .08 })
};
const solid = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m; };
const lathe = (pts, mat, seg = 128) => solid(new THREE.LatheGeometry(pts.map(p => V2(p[0], p[1])), seg), mat);
// guscio pieno: profilo esterno dal basso all'alto, poi interno dall'alto in basso
const shell = (outer, inner, mat, seg = 128) => lathe([...outer, ...inner], mat, seg);
function labelMesh(r, y0, y1, theta, canvas) { const g = new THREE.CylinderGeometry(r, r, y1 - y0, 160, 1, true, -theta / 2, theta); const m = solid(g, M.label(tex(canvas))); m.position.y = (y0 + y1) / 2; return m; }
const arcPx = (r, theta, h, W = 2048) => Math.round(W * h / (r * theta));
// cilindro con il bordo superiore ondulato (separazione tra strati del contenuto)
function wall(r, y0, y1, mat, wobTop = 0, wobBot = 0) {
  const g = new THREE.CylinderGeometry(r, r, y1 - y0, 160, 8, true); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i), a = Math.atan2(x, z); const w = (Math.sin(a * 3) * .5 + Math.sin(a * 7 + 1.3) * .3 + Math.sin(a * 13 + .4) * .2); const top = (y - (y0 - y1) / 2) / (y1 - y0); p.setY(i, y + w * (wobTop * top + wobBot * (1 - top))); }
  g.computeVertexNormals(); const m = solid(g, mat); m.position.y = (y0 + y1) / 2; return m;
}
function disc(r, y, mat, dome = 0) {
  const g = new THREE.CircleGeometry(r, 128, 0, Math.PI * 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), yy = p.getY(i), d = Math.hypot(x, yy) / r; p.setZ(i, dome * (1 - d * d) + .03 * Math.sin(x * 2.1) * Math.cos(yy * 1.7)); }
  g.computeVertexNormals(); const m = solid(g, mat); m.rotation.x = -Math.PI / 2; m.position.y = y; return m;
}

/* ------------------------------------------------------------------ modelli */
function honeyJar(id, logo, cfg) {
  const g = new THREE.Group();
  const outer = [[0, 0], [2.6, 0], [3.0, .07], [3.22, .27], [3.3, .6], [3.3, 1.12], [3.36, 1.22], [3.3, 1.33], [3.31, 6.3], [3.27, 6.72], [3.12, 7.07], [3.0, 7.24], [2.99, 7.31], [3.07, 7.35], [3.07, 7.44], [2.98, 7.48], [2.98, 7.95], [2.92, 8.0]];
  const inner = [[2.78, 8.0], [2.76, 7.32], [2.88, 7.12], [3.05, 6.75], [3.08, 6.3], [3.08, .8], [2.98, .52], [2.5, .44], [0, .5]];
  g.add(shell(outer, inner, M.glass()));
  const top = cfg.fill, line = top - cfg.cap;
  const body = new THREE.MeshPhysicalMaterial({ map: cfg.map, color: 0xffffff, roughness: cfg.rough, clearcoat: cfg.coat, clearcoatRoughness: .25, bumpMap: cfg.bump || null, bumpScale: cfg.bumpScale || 0, envMapIntensity: .8 });
  const layer = new THREE.MeshPhysicalMaterial({ color: cfg.capColor, roughness: .75, bumpMap: T.granCap, bumpScale: .6, sheen: .4, sheenColor: new THREE.Color(0xffffff) });
  g.add(wall(3.06, .78, line, body, .09));
  g.add(lathe([[0, .52], [2.48, .46], [2.96, .54], [3.06, .8]], body));
  g.add(wall(3.06, line, top - .04, layer, 0, .09));
  g.add(lathe([[3.06, top - .05], [2.95, top], [1.5, top - .06], [0, top - .02]].reverse(), layer));
  const ly0 = cfg.label[0], ly1 = cfg.label[1], th = cfg.theta;
  g.add(labelMesh(3.338, ly0, ly1, th, drawLabel(id, 2048, arcPx(3.338, th, ly1 - ly0), logo)));
  // capsula twist-off: bordo arrotolato, fianco stampato a nido d'ape, spalla arrotondata, pannello con anello in rilievo
  const lidY = 7.42;
  g.add(lathe([[3.25, lidY], [3.4, lidY + .02], [3.44, lidY + .09], [3.4, lidY + .16], [3.36, lidY + .17]], M.tinPlain(0xb99a3c)));
  const side = solid(new THREE.CylinderGeometry(3.38, 3.38, .86, 160, 1, true), M.tin(T.honeySide)); side.position.y = lidY + .17 + .43; g.add(side);
  g.add(lathe([[3.38, lidY + 1.03], [3.36, lidY + 1.1], [3.3, lidY + 1.16], [3.2, lidY + 1.19], [3.05, lidY + 1.2]], M.tinPlain(0x27402f)));
  g.add(disc(3.06, lidY + 1.2, M.tin(T.honeyTop), .05));
  const ring = solid(new THREE.TorusGeometry(2.75, .05, 12, 160), M.tinPlain(0x27402f)); ring.rotation.x = Math.PI / 2; ring.position.y = lidY + 1.22; g.add(ring);
  return { g, h: lidY + 1.26, r: 3.45 };
}
function sprayBottle(id) {
  const g = new THREE.Group();
  const outer = [[0, 0], [1.42, 0], [1.62, .1], [1.68, .35], [1.68, 4.3], [1.62, 4.75], [1.32, 5.2], [.86, 5.5], [.8, 5.6], [.8, 5.75], [.86, 5.8], [.86, 5.95], [.78, 6.0]];
  const inner = [[.6, 6.0], [.6, 5.5], [1.1, 5.2], [1.5, 4.7], [1.52, 4.3], [1.52, .45], [1.2, .3], [0, .38]];
  g.add(shell(outer, inner, M.glass({ attenuationColor: new THREE.Color(0x7a3608), attenuationDistance: .28, thickness: 1.2, roughness: .04 })));
  const liq = new THREE.MeshPhysicalMaterial({ color: 0x2a1004, roughness: .1 });
  g.add(lathe([[0, .4], [1.2, .32], [1.5, .45], [1.5, 4.0], [0, 4.0]], liq));
  g.add(labelMesh(1.695, .85, 3.9, 3.0, drawLabel(id, 2048, arcPx(1.695, 3.0, 3.05))));
  const pp = M.pp(), ribbed = M.pp({ bumpMap: T.ribs, bumpScale: .9 });
  const collar = solid(new THREE.CylinderGeometry(.98, .98, .78, 96, 1, false), ribbed); collar.position.y = 6.2; g.add(collar);
  g.add(lathe([[0, 6.59], [.98, 6.59], [.9, 6.66], [.3, 6.68], [.26, 6.72]], pp, 64));
  const stem = solid(new THREE.CylinderGeometry(.22, .22, .5, 32), pp); stem.position.y = 6.95; g.add(stem);
  g.add(lathe([[0, 7.15], [.6, 7.15], [.66, 7.2], [.66, 8.05], [.6, 8.2], [.4, 8.27], [.2, 8.24], [0, 8.25]], pp, 64));
  const noz = solid(new THREE.CylinderGeometry(.17, .22, .42, 24), pp); noz.rotation.z = Math.PI / 2; noz.position.set(.82, 7.88, 0); g.add(noz);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(.06, 16), new THREE.MeshBasicMaterial({ color: 0x222222 })); hole.rotation.y = Math.PI / 2; hole.position.set(1.035, 7.88, 0); g.add(hole);
  return { g, h: 8.3, r: 1.75 };
}
function pet(id) {
  const g = new THREE.Group();
  const outer = [[0, 0], [2.55, 0], [2.8, .12], [2.9, .45], [2.9, 9.0], [2.83, 9.65], [2.47, 10.42], [1.72, 11.03], [1.3, 11.32], [1.28, 11.5], [1.4, 11.55], [1.4, 11.68], [1.27, 11.72], [1.27, 12.25], [1.2, 12.3]];
  const inner = [[1.12, 12.3], [1.12, 11.4], [1.6, 11.0], [2.38, 10.4], [2.76, 9.6], [2.83, 9.0], [2.83, .5], [2.5, .18], [0, .14]];
  g.add(shell(outer, inner, M.glass({ thickness: .1, ior: 1.57, attenuationColor: new THREE.Color(0xffffff), attenuationDistance: 1e6 })));
  const liq = new THREE.MeshPhysicalMaterial({ color: 0x7a3410, roughness: .04, metalness: 0, clearcoat: 1, clearcoatRoughness: .02, envMapIntensity: 1.1, sheen: .3, sheenColor: new THREE.Color(0xd08040) });
  g.add(lathe([[0, .16], [2.48, .2], [2.82, .52], [2.82, 9.0], [2.78, 9.4], [0, 9.42]], liq));
  g.add(labelMesh(2.925, 3.0, 7.9, 2.7, drawLabel(id, 2048, arcPx(2.925, 2.7, 4.9))));
  const pp = M.pp();
  const ring = solid(new THREE.CylinderGeometry(1.5, 1.5, .28, 96), pp); ring.position.y = 11.9; g.add(ring);
  const capG = new THREE.LatheGeometry([[1.38, 12.06], [1.5, 12.08], [1.52, 12.2], [1.52, 13.4], [1.47, 13.55], [1.3, 13.62], [0, 13.64]].map(p => V2(p[0], p[1])), 180);
  const pos = capG.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), y = pos.getY(i), rr = Math.hypot(x, z); if (rr > 1.45 && y > 12.25 && y < 13.35) { const a = Math.atan2(x, z), k = 1 + .02 * Math.max(0, Math.cos(a * 72)); pos.setX(i, x * k); pos.setZ(i, z * k); } }
  capG.computeVertexNormals(); g.add(solid(capG, pp));
  return { g, h: 13.66, r: 2.95 };
}
function creamJar(id) {
  const g = new THREE.Group();
  const body = M.pp();
  g.add(lathe([[0, 0], [2.7, 0], [2.92, .06], [3.02, .2], [3.05, .45], [3.05, 3.3], [3.0, 3.42], [2.82, 3.48], [2.82, 3.9], [2.7, 3.95], [0, 3.95]], body));
  const groove = solid(new THREE.TorusGeometry(3.03, .025, 8, 160), M.pp({ color: 0xe4e1da })); groove.rotation.x = Math.PI / 2; groove.position.y = .32; g.add(groove);
  g.add(labelMesh(3.064, .55, 3.15, 3.5, drawLabel(id, 2048, arcPx(3.064, 3.5, 2.6))));
  const gap = solid(new THREE.CylinderGeometry(2.95, 2.95, .1, 128, 1, true), new THREE.MeshStandardMaterial({ color: 0x5a5650, roughness: .9 })); gap.position.y = 3.53; g.add(gap);
  g.add(lathe([[2.84, 3.58], [3.1, 3.58], [3.16, 3.64], [3.16, 3.78], [3.13, 3.83], [3.16, 3.88], [3.17, 4.85], [3.13, 5.22], [2.98, 5.44], [2.6, 5.56], [1.5, 5.62], [0, 5.63]], M.pp()));
  return { g, h: 5.64, r: 3.2 };
}

/* ------------------------------------------------------------------ scena */
let renderer, scene, camera, key, models = {};
const state = new WeakMap();
async function build(logo) {
  T.paper = tex(paperBump(), { srgb: false, repeat: [3, 2] });
  T.plastic = tex(plastic(), { srgb: false, repeat: [4, 4] });
  T.ribs = tex(ribs(90), { srgb: false });
  await idle();
  T.granCap = tex(granules('#808080', .35), { srgb: false, repeat: [3, 1] });
  T.honeySide = tex(honeycomb(2048, 88, 45), { repeat: [1, 1] }); T.honeySide.wrapS = THREE.RepeatWrapping;
  T.honeyTop = tex(honeycomb(1024, 1024, 70, true));
  await idle();
  const creamMap = tex(cream(), { repeat: [2, 1] });
  const honeyMap = tex(granules('#e3c486', .16), { repeat: [1, 1] });
  await idle();
  const honeyBump = tex(granules('#808080', .35), { srgb: false, repeat: [1, 1] });
  await idle();
  models.castagnella = honeyJar('castagnella', logo, { fill: 7.0, cap: .72, map: creamMap, capColor: 0xc8b597, rough: .28, coat: .6, label: [2.05, 5.55], theta: 2.55 });
  await idle();
  models.miele = honeyJar('miele', logo, { fill: 6.95, cap: .5, map: honeyMap, bump: honeyBump, bumpScale: .25, capColor: 0xf0e2bd, rough: .5, coat: .3, label: [1.75, 6.15], theta: 2.85 });
  await idle();
  models.propoli = sprayBottle('propoli');
  await idle();
  models.dopobarba = pet('dopobarba');
  for (const id of ['maschera', 'artiglio', 'calendula', 'polline', 'teatree']) { await idle(); models[id] = creamJar(id); }
  const ao = tex(aoBlob(), { srgb: false });
  Object.values(models).forEach(m => {
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(m.r * 2.5, m.r * 2.5), new THREE.MeshBasicMaterial({ color: 0x1e140c, alphaMap: ao, transparent: true, opacity: .62, depthWrite: false, toneMapped: false }));
    blob.rotation.x = -Math.PI / 2; blob.position.y = .005; blob.renderOrder = -1; m.g.add(blob);
    m.g.position.y = -m.h / 2; m.pivot = new THREE.Group(); m.pivot.add(m.g); m.pivot.visible = false; scene.add(m.pivot);
    m.mats = []; m.g.traverse(o => { if (o.material && !m.mats.includes(o.material)) { o.material.userData.base = o.material.opacity; o.material.userData.tr = o.material.transparent; m.mats.push(o.material); } });
  });
}
// inquadratura esatta: proietta il cilindro che contiene il prodotto (già ruotato/inclinato)
// e regola distanza e centro finché sta tutto nel riquadro, con il margine richiesto
const RIM = Array.from({ length: 24 }, (_, i) => [Math.cos(i / 24 * Math.PI * 2), Math.sin(i / 24 * Math.PI * 2)]);
const _v = new THREE.Vector3();
function frameCamera(cam, m, aspect, pad = 1.1) {
  cam.aspect = aspect; cam.fov = 18; cam.updateProjectionMatrix();
  const t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), el = THREE.MathUtils.degToRad(7);
  let d = Math.max(m.h / 2, (m.r * 1.12) / aspect) * pad / t, cy = 0;
  m.pivot.updateMatrixWorld(true);
  for (let it = 0; it < 3; it++) {
    cam.position.set(0, cy + Math.sin(el) * d, Math.cos(el) * d); cam.lookAt(0, cy, 0); cam.updateMatrixWorld();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const [c, s] of RIM) for (const y of [-m.h / 2, m.h / 2]) {
      _v.set(c * m.r, y, s * m.r).applyMatrix4(m.pivot.matrixWorld).project(cam);
      x0 = Math.min(x0, _v.x); x1 = Math.max(x1, _v.x); y0 = Math.min(y0, _v.y); y1 = Math.max(y1, _v.y);
    }
    cy += (y0 + y1) / 2 * d * t;
    d *= Math.max((x1 - x0) / 2, (y1 - y0) / 2) * pad;
  }
  cam.position.set(0, cy + Math.sin(el) * d, Math.cos(el) * d); cam.lookAt(0, cy, 0);
}
function setOpacity(m, op) {
  // solo i materiali già trasparenti seguono l'opacità: gli altri non cambiano mai programma
  m.mats.forEach(mt => { if (mt.userData.tr) mt.opacity = mt.userData.base * op; });
}
// colore del fondo dietro al prodotto: il vetro lo "vede" per trasparenza (pass di trasmissione)
function bgOf(el) { for (let n = el; n && n !== document.documentElement; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; const m = c.match(/[\d.]+/g); if (m && (m.length < 4 || +m[3] > .5)) return new THREE.Color(`rgb(${m[0]},${m[1]},${m[2]})`); } return new THREE.Color(0xefebe6); }
function opacityOf(el) { let o = 1, n = el; for (let i = 0; i < 8 && n && n !== document.body; i++, n = n.parentElement) { const v = n.style && n.style.opacity; if (v !== '' && v != null) o *= +v; } return o; }

let els = [], dirty = true;
function collect() { els = [...document.querySelectorAll('[data-jar]')]; dirty = false; }
new MutationObserver(() => { dirty = true; fillSnaps(); }).observe(document.body, { childList: true, subtree: true });

const clock = new THREE.Clock();
// Ogni prodotto ha la sua tela 2D dentro la pagina: il motore 3D (fuori schermo) disegna la vista
// e la copia lì. Così il prodotto scorre insieme alla pagina, senza ritardi né scatti sul telefono.
function canvasFor(el) {
  let cv = el.querySelector(':scope > canvas.jar-cv');
  if (!cv) { cv = document.createElement('canvas'); cv.className = 'jar-cv'; cv.setAttribute('aria-hidden', 'true'); el.appendChild(cv); }
  return cv;
}
let frame = 0, lastScroll = 0;
addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });
function render() {
  if (dirty) collect();
  frame++;
  const dt = Math.min(clock.getDelta(), .05);
  const W = innerWidth, H = innerHeight, pr = renderer.getPixelRatio(), gl = renderer.domElement;
  for (const el of els) {
    const m = models[el.dataset.jar]; if (!m) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < -40 || r.top > H + 40 || r.right < 0 || r.left > W) continue;
    let st = state.get(el);
    if (!st) { st = { a: +(el.dataset.angle || 0), v: 0, drag: false, bg: bgOf(el), i: Math.random() < .5 ? 0 : 1, t: 0 }; state.set(el, st); bindDrag(el, st); }
    st.t += dt;
    const big = el.hasAttribute('data-drag') || r.height > 360;
    const scrolling = performance.now() - lastScroll < 180;
    // mentre si scorre, i riquadri piccoli restano fermi (la loro tela scorre già con la pagina) e i grandi vanno a fotogrammi alterni
    if (!st.drag && ((scrolling && !big) || ((frame + st.i) % 2 && (!big || scrolling)))) continue;
    renderer.transmissionResolutionScale = big ? .5 : .3;
    const step = st.t; st.t = 0;
    const host = el.closest('.prod') || el;
    const speed = RM ? 0 : (+(el.dataset.speed || .35)) * (host.matches(':hover') ? 3 : 1);
    if (!st.drag) { st.a += st.v * step; st.v *= Math.pow(.04, step); st.a += speed * step; }
    m.pivot.rotation.set(0, st.a + (+(el.dataset.spin || 0)), +(el.dataset.tilt || 0));
    m.pivot.visible = true;
    frameCamera(camera, m, r.width / r.height, +(el.dataset.pad || 1.14));
    // se il riquadro è più grande dello spazio di lavoro, si rende un po' più piccolo e si ingrandisce nella copia
    const k = Math.min(1, W / r.width, H / r.height), vw = Math.floor(r.width * k), vh = Math.floor(r.height * k);
    renderer.setViewport(0, 0, vw, vh); renderer.setScissor(0, 0, vw, vh); renderer.setScissorTest(true);
    renderer.setClearColor(0, 0); renderer.clear();
    renderer.setClearColor(st.bg, 1); renderer.render(scene, camera); renderer.setClearColor(0, 0);
    m.pivot.visible = false;
    const cv = canvasFor(el), cw = Math.round(r.width * pr), ch = Math.round(r.height * pr);
    if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
    const c2 = cv.getContext('2d');
    c2.clearRect(0, 0, cw, ch);
    c2.drawImage(gl, 0, gl.height - vh * pr, vw * pr, vh * pr, 0, 0, cw, ch);
  }
}
function bindDrag(el, st) {
  if (!el.hasAttribute('data-drag')) return;
  let lx = 0, lt = 0;
  el.addEventListener('pointerdown', e => { st.drag = true; lx = e.clientX; lt = performance.now(); el.setPointerCapture(e.pointerId); el.classList.add('dragging'); });
  el.addEventListener('pointermove', e => { if (!st.drag) return; const dx = e.clientX - lx, now = performance.now(); st.a += dx * .012; st.v = dx * .012 / Math.max((now - lt) / 1000, .008); lx = e.clientX; lt = now; });
  const up = () => { st.drag = false; el.classList.remove('dragging'); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
}

/* ------------------------------------------------------------------ istantanee: rese sul canvas principale e copiate subito */
const snaps = {};
async function makeSnaps() {
  const SW = 300, SH = 384, pr = renderer.getPixelRatio();
  const out = document.createElement('canvas'); out.width = SW * pr; out.height = SH * pr; const o = out.getContext('2d');
  const H = innerHeight;
  for (const [id, m] of Object.entries(models)) {
    await idle();
    m.pivot.visible = true; m.pivot.rotation.set(0, -.3, 0); setOpacity(m, 1);
    frameCamera(camera, m, SW / SH, 1.04);
    renderer.setScissorTest(false); renderer.clear(); renderer.setScissorTest(true);
    renderer.setViewport(0, 0, SW, SH); renderer.setScissor(0, 0, SW, SH); renderer.setClearColor(0xe4ddd3, 1); renderer.render(scene, camera); renderer.setClearColor(0, 0);
    o.clearRect(0, 0, out.width, out.height);
    o.drawImage(renderer.domElement, 0, (H - SH) * pr, SW * pr, SH * pr, 0, 0, out.width, out.height);
    snaps[id] = out.toDataURL('image/png'); m.pivot.visible = false;
  }
  renderer.setScissorTest(false); renderer.clear();
}
function fillSnaps() { document.querySelectorAll('img[data-snap]').forEach(im => { const s = snaps[im.dataset.snap]; if (s && im.src !== s) im.src = s; }); }

/* ------------------------------------------------------------------ avvio */
async function start() {
  const canvas = document.createElement('canvas'); canvas.id = 'jarsCanvas';
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return; }
  if (!renderer.getContext()) return;
  renderer.setPixelRatio(Math.min(devicePixelRatio, SMALL ? 1.25 : 1.5)); renderer.setSize(innerWidth, innerHeight); renderer.setClearColor(0, 0); renderer.autoClear = false;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = false; // l'ombra a terra è morbida e disegnata a parte: niente passaggio d'ombra a ogni fotogramma
  renderer.transmissionResolutionScale = .5;
  maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  scene = new THREE.Scene();
  await idle();
  const pm = new THREE.PMREMGenerator(renderer);
  try {
    const b64 = (await import('./assets/studio-hdr.js')).default;
    let buf;
    try { buf = await (await fetch('data:application/octet-stream;base64,' + b64)).arrayBuffer(); }
    catch (e) { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); buf = u.buffer; }
    await idle();
    const d = new RGBELoader().parse(buf);
    const hdr = new THREE.DataTexture(d.data, d.width, d.height, THREE.RGBAFormat, d.type);
    hdr.colorSpace = THREE.LinearSRGBColorSpace; hdr.mapping = THREE.EquirectangularReflectionMapping; hdr.minFilter = hdr.magFilter = THREE.LinearFilter; hdr.generateMipmaps = false; hdr.flipY = true; hdr.needsUpdate = true;
    await idle();
    scene.environment = pm.fromEquirectangular(hdr).texture; hdr.dispose();
  } catch (e) { scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; }
  scene.environmentRotation = new THREE.Euler(0, -.9, 0); scene.environmentIntensity = 1.05;
  key = new THREE.DirectionalLight(0xfff4e6, 1.3); key.position.set(-2.5, 18, 5.5);
  scene.add(key);
  camera = new THREE.PerspectiveCamera(18, 1, .1, 500);
  await Promise.all(['400 40px "Noto Sans"', '700 40px "Noto Sans"', '400 40px "Noto Serif"'].map(f => document.fonts.load(f)));
  const logo = await new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = 'assets/logo-gallo.jpg'; });
  await build(logo);
  Object.values(models).forEach(m => { setOpacity(m, 1); m.pivot.visible = true; });
  await idle();
  if (renderer.compileAsync) await renderer.compileAsync(scene, camera); else renderer.compile(scene, camera);
  Object.values(models).forEach(m => m.pivot.visible = false);
  await makeSnaps(); fillSnaps();
  document.documentElement.classList.add('jars-on');
  addEventListener('resize', () => renderer.setSize(innerWidth, innerHeight));
  if (window.gsap) gsap.ticker.add(render); else renderer.setAnimationLoop(render);
  window.MDFJars = { snap: id => snaps[id] };
  dispatchEvent(new Event('jars-ready'));
}
start();
