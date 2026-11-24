// Prodotti del Mulino ricostruiti in 3D (Three.js): un solo canvas fisso, una vista per ogni [data-jar].
// Unità: centimetri. Etichette ridisegnate dal vero, testo letto dalle foto dei prodotti.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  for (let i = 0; i < 5000; i++) { ctx.fillStyle = `rgba(${rnd() > .5 ? '90,70,40' : '255,255,255'},${.03 + rnd() * .04})`; ctx.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 3, 1 + rnd() * 3); }
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
function shadowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d'); const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  g.addColorStop(0, 'rgba(40,30,20,.55)'); g.addColorStop(.5, 'rgba(40,30,20,.22)'); g.addColorStop(1, 'rgba(40,30,20,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

/* ------------------------------------------------------------------ materiali */
let maxAniso = 4;
const tex = (canvas, wrap) => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; if (wrap) { t.wrapS = THREE.RepeatWrapping; } return t; };
const M = {
  glass: () => new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .04, metalness: 0, transparent: true, opacity: .22, clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: 1.6, depthWrite: false }),
  glassBase: () => new THREE.MeshPhysicalMaterial({ color: 0xcfe3da, roughness: .1, transparent: true, opacity: .45, clearcoat: 1, depthWrite: false }),
  white: () => new THREE.MeshPhysicalMaterial({ color: 0xf6f4ef, roughness: .36, clearcoat: .35, clearcoatRoughness: .3, transparent: true }),
  amber: () => new THREE.MeshPhysicalMaterial({ color: 0x3a1a0b, roughness: .07, clearcoat: 1, clearcoatRoughness: .03, transparent: true, opacity: .96, envMapIntensity: 1.4 }),
  fill: (hex, rough = .35) => new THREE.MeshPhysicalMaterial({ color: hex, roughness: rough, clearcoat: .45, clearcoatRoughness: .2, transparent: true }),
  liquid: hex => new THREE.MeshPhysicalMaterial({ color: hex, roughness: .08, clearcoat: .8, transparent: true, opacity: .82, depthWrite: true, envMapIntensity: 1.3 }),
  label: map => new THREE.MeshStandardMaterial({ map, roughness: .78, metalness: 0, transparent: true }),
  tin: map => new THREE.MeshStandardMaterial({ map, metalness: .55, roughness: .3, transparent: true })
};
function lathe(pts, mat, seg = 96, order = 1) { const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(p => V2(p[0], p[1])), seg), mat); m.renderOrder = order; return m; }
function labelMesh(r, y0, y1, theta, canvas, order = 2) {
  const g = new THREE.CylinderGeometry(r, r, y1 - y0, 128, 1, true, -theta / 2, theta);
  const m = new THREE.Mesh(g, M.label(tex(canvas))); m.position.y = (y0 + y1) / 2; m.renderOrder = order; return m;
}
const arcPx = (r, theta, h, W = 2048) => Math.round(W * h / (r * theta));

/* ------------------------------------------------------------------ modelli */
function honeyJar(id, logo, cfg) {
  const g = new THREE.Group();
  const glassPts = [[0, .02], [2.85, .02], [3.12, .12], [3.28, .4], [3.31, 1.15], [3.37, 1.28], [3.31, 1.42], [3.32, 6.3], [3.28, 6.75], [3.12, 7.1], [3.0, 7.28], [2.98, 7.6]];
  g.add(lathe(glassPts, M.glass(), 96, 5));
  g.add(lathe([[0, .02], [2.85, .02], [3.1, .12], [3.2, .4], [3.18, .55], [0, .55]], M.glassBase(), 96, 4));
  const r = 3.12, top = cfg.fill;
  g.add(lathe([[0, .56], [3.0, .56], [r, .75], [r, top - cfg.cap], [0, top - cfg.cap]], M.fill(cfg.color, cfg.rough), 96, 1));
  g.add(lathe([[0, top - cfg.cap], [r, top - cfg.cap], [r, top - .05], [2.9, top], [0, top]], M.fill(cfg.capColor, .7), 96, 1));
  const ly0 = cfg.label[0], ly1 = cfg.label[1], th = cfg.theta;
  g.add(labelMesh(3.345, ly0, ly1, th, drawLabel(id, 2048, arcPx(3.345, th, ly1 - ly0), logo)));
  // tappo a capsula con nido d'ape
  const side = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 1.0, 128, 1, true), M.tin(tex(honeycomb(2048, 96, 47), true)));
  side.position.y = 7.45 + .5; side.renderOrder = 6; g.add(side);
  const capTop = new THREE.Mesh(new THREE.CircleGeometry(3.28, 128), M.tin(tex(honeycomb(1024, 1024, 74, true))));
  capTop.rotation.x = -Math.PI / 2; capTop.position.y = 8.57; capTop.renderOrder = 6; g.add(capTop);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.29, .13, 16, 128), new THREE.MeshStandardMaterial({ color: 0x2c4536, metalness: .6, roughness: .3, transparent: true }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 8.45; ring.renderOrder = 6; g.add(ring);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(3.38, .06, 10, 128), new THREE.MeshStandardMaterial({ color: 0xc9a845, metalness: .8, roughness: .25, transparent: true }));
  lip.rotation.x = Math.PI / 2; lip.position.y = 7.46; lip.renderOrder = 6; g.add(lip);
  return { g, h: 8.7, r: 3.45 };
}
function sprayBottle(id) {
  const g = new THREE.Group();
  g.add(lathe([[0, 0], [1.5, 0], [1.64, .12], [1.68, .4], [1.68, 4.35], [1.6, 4.85], [1.25, 5.25], [.78, 5.55], [.74, 6.0], [0, 6.0]], M.amber(), 96, 1));
  g.add(labelMesh(1.705, .9, 3.85, 3.0, drawLabel(id, 2048, arcPx(1.705, 3.0, 2.95))));
  const white = M.white();
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(.92, .95, .75, 48), white); collar.position.y = 6.2; g.add(collar);
  for (let i = 0; i < 36; i++) { const rib = new THREE.Mesh(new THREE.BoxGeometry(.05, .62, .06), white); const a = i / 36 * Math.PI * 2; rib.position.set(Math.sin(a) * .95, 6.2, Math.cos(a) * .95); rib.rotation.y = a; g.add(rib); }
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .55, 24), white); stem.position.y = 6.85; g.add(stem);
  const act = lathe([[0, 7.05], [.62, 7.05], [.64, 7.15], [.64, 8.15], [.5, 8.35], [0, 8.4]], white, 48, 3); g.add(act);
  const noz = new THREE.Mesh(new THREE.CylinderGeometry(.16, .2, .5, 20), white); noz.rotation.z = Math.PI / 2; noz.position.set(.78, 7.85, 0); g.add(noz);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(.07, 16), new THREE.MeshBasicMaterial({ color: 0x333333 })); hole.rotation.y = Math.PI / 2; hole.position.set(1.035, 7.85, 0); g.add(hole);
  return { g, h: 8.4, r: 1.75 };
}
function pet(id) {
  const g = new THREE.Group();
  const prof = [[0, 0], [2.6, 0], [2.82, .15], [2.9, .5], [2.9, 9.0], [2.82, 9.7], [2.45, 10.45], [1.7, 11.05], [1.28, 11.35], [1.26, 12.2], [0, 12.2]];
  g.add(lathe(prof, M.glass(), 96, 5));
  g.add(lathe([[0, .12], [2.55, .12], [2.78, .3], [2.82, .6], [2.82, 9.0], [2.74, 9.55], [0, 9.55]], M.liquid(0x6a3412), 96, 1));
  g.add(labelMesh(2.935, 3.0, 7.9, 2.7, drawLabel(id, 2048, arcPx(2.935, 2.7, 4.9))));
  const capG = new THREE.CylinderGeometry(1.45, 1.45, 1.65, 120, 1);
  const pos = capG.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), rr = Math.hypot(x, z); if (rr > 1.3) { const a = Math.atan2(x, z), k = 1 + .025 * Math.cos(a * 60); pos.setX(i, x * k); pos.setZ(i, z * k); } }
  capG.computeVertexNormals();
  const cap = new THREE.Mesh(capG, M.white()); cap.position.y = 12.0 + .82; cap.renderOrder = 6; g.add(cap);
  return { g, h: 13.7, r: 2.95 };
}
function creamJar(id) {
  const g = new THREE.Group();
  g.add(lathe([[0, 0], [2.8, 0], [2.98, .12], [3.05, .4], [3.05, 3.35], [2.95, 3.5], [2.75, 3.55], [2.75, 3.9], [0, 3.9]], M.white(), 96, 1));
  g.add(labelMesh(3.075, .55, 3.15, 3.5, drawLabel(id, 2048, arcPx(3.075, 3.5, 2.6))));
  const lid = lathe([[2.8, 3.55], [3.1, 3.55], [3.17, 3.62], [3.17, 4.8], [3.12, 5.2], [2.95, 5.45], [2.6, 5.55], [0, 5.56]], M.white(), 96, 3);
  g.add(lid);
  const seam = new THREE.Mesh(new THREE.TorusGeometry(3.1, .025, 8, 128), new THREE.MeshStandardMaterial({ color: 0xd9d6cf, roughness: .5, transparent: true }));
  seam.rotation.x = Math.PI / 2; seam.position.y = 3.6; g.add(seam);
  return { g, h: 5.55, r: 3.2 };
}

/* ------------------------------------------------------------------ scena */
let renderer, scene, camera, shadow, models = {}, snapR;
const state = new WeakMap();
function build(logo) {
  models.castagnella = honeyJar('castagnella', logo, { fill: 7.05, cap: .75, color: 0x3b1f0f, capColor: 0xc9b79a, rough: .3, label: [2.05, 5.55], theta: 2.55 });
  models.miele = honeyJar('miele', logo, { fill: 7.0, cap: .6, color: 0xd8ae5e, capColor: 0xeedcae, rough: .55, label: [1.75, 6.15], theta: 2.85 });
  models.propoli = sprayBottle('propoli');
  models.dopobarba = pet('dopobarba');
  ['maschera', 'artiglio', 'calendula', 'polline', 'teatree'].forEach(id => models[id] = creamJar(id));
  // l'ombra a terra è disegnata nella pagina (CSS), sotto il canvas
  Object.values(models).forEach(m => {
    m.g.position.y = -m.h / 2; m.pivot = new THREE.Group(); m.pivot.add(m.g); m.pivot.visible = false; scene.add(m.pivot);
    m.mats = []; m.g.traverse(o => { if (o.material) { o.material.userData.base = o.material.opacity; m.mats.push(o.material); } });
  });
}
function frameCamera(cam, m, aspect, pad = 1.08) {
  cam.aspect = aspect; cam.fov = 22; cam.updateProjectionMatrix();
  const half = Math.max(m.h / 2, (m.r * 1.15) / aspect) * pad;
  const d = half / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
  const el = THREE.MathUtils.degToRad(9);
  cam.position.set(0, Math.sin(el) * d, Math.cos(el) * d); cam.lookAt(0, -m.h * .02, 0);
}
function lights(sc) {
  const key = new THREE.DirectionalLight(0xfff1dc, 2.2); key.position.set(-6, 10, 8); sc.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2); rim.position.set(8, 4, -6); sc.add(rim);
  sc.add(new THREE.AmbientLight(0xffffff, .35));
}
function opacityOf(el) { let o = 1, n = el; for (let i = 0; i < 8 && n && n !== document.body; i++, n = n.parentElement) { const v = n.style && n.style.opacity; if (v !== '' && v != null) o *= +v; } return o; }

let els = [], dirty = true;
function collect() { els = [...document.querySelectorAll('[data-jar]')]; dirty = false; }
new MutationObserver(() => { dirty = true; fillSnaps(); }).observe(document.body, { childList: true, subtree: true });

const clock = new THREE.Clock();
function render() {
  if (dirty) collect();
  const dt = Math.min(clock.getDelta(), .05);
  const W = innerWidth, H = innerHeight;
  renderer.setScissorTest(false); renderer.clear(); renderer.setScissorTest(true);
  for (const el of els) {
    const m = models[el.dataset.jar]; if (!m) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
    const op = opacityOf(el); if (op < .02) continue;
    let st = state.get(el);
    if (!st) { st = { a: +(el.dataset.angle || 0), v: 0, drag: false }; state.set(el, st); bindDrag(el, st); }
    const hover = el.closest('.prod, [data-jar]').matches(':hover');
    const speed = RM ? 0 : (+(el.dataset.speed || .35)) * (hover ? 3 : 1);
    if (!st.drag) { st.a += st.v * dt; st.v *= Math.pow(.04, dt); st.a += speed * dt; }
    m.pivot.rotation.set(0, st.a + (+(el.dataset.spin || 0)), +(el.dataset.tilt || 0));
    m.mats.forEach(mt => mt.opacity = mt.userData.base * op);
    m.pivot.visible = true;
    frameCamera(camera, m, r.width / r.height, +(el.dataset.pad || 1.14));
    const x = r.left, y = H - r.bottom;
    renderer.setViewport(x, y, r.width, r.height); renderer.setScissor(x, y, r.width, r.height);
    renderer.render(scene, camera);
    m.pivot.visible = false;
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

/* ------------------------------------------------------------------ istantanee (miniature carrello, testo) */
const snaps = {};
function makeSnaps() {
  const c = document.createElement('canvas'); c.width = 360; c.height = 460;
  snapR = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true, preserveDrawingBuffer: true });
  snapR.toneMapping = THREE.ACESFilmicToneMapping; snapR.outputColorSpace = THREE.SRGBColorSpace;
  const cam = new THREE.PerspectiveCamera(22, 360 / 460, .1, 500);
  Object.entries(models).forEach(([id, m]) => {
    m.pivot.visible = true; m.pivot.rotation.set(0, -.35, 0); m.mats.forEach(mt => mt.opacity = mt.userData.base);
    frameCamera(cam, m, 360 / 460, 1.02); snapR.render(scene, cam); snaps[id] = c.toDataURL('image/png'); m.pivot.visible = false;
  });
  snapR.dispose();
}
function fillSnaps() { document.querySelectorAll('img[data-snap]').forEach(im => { const s = snaps[im.dataset.snap]; if (s && im.src !== s) im.src = s; }); }

/* ------------------------------------------------------------------ avvio */
async function start() {
  const canvas = document.createElement('canvas'); canvas.id = 'jarsCanvas';
  let ok = true;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { ok = false; }
  if (!ok || !renderer.getContext()) return;
  document.body.appendChild(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight); renderer.setClearColor(0, 0); renderer.autoClear = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace;
  maxAniso = renderer.capabilities.getMaxAnisotropy();
  scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  lights(scene);
  camera = new THREE.PerspectiveCamera(22, 1, .1, 500);
  await Promise.all(['400 40px "Noto Sans"', '700 40px "Noto Sans"', '400 40px "Noto Serif"'].map(f => document.fonts.load(f)));
  const logo = await new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = 'assets/logo-gallo.jpg'; });
  build(logo);
  makeSnaps(); fillSnaps();
  document.documentElement.classList.add('jars-on');
  addEventListener('resize', () => renderer.setSize(innerWidth, innerHeight));
  const loop = () => render();
  if (window.gsap) gsap.ticker.add(loop); else renderer.setAnimationLoop(loop);
  window.MDFJars = { snap: id => snaps[id] };
  dispatchEvent(new Event('jars-ready'));
}
start();
