{
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
gsap.registerPlugin(ScrollTrigger, SplitText);

/* ================= dati ================= */
const CATS = [
  { id: 'tutti', name: 'Tutti' },
  { id: 'alveare', name: "Dall'alveare" },
  { id: 'cosmesi', name: 'Cosmesi naturale' },
  { id: 'unguenti', name: 'Unguenti e creme' }
];
const P = [
  { id: 'castagnella', name: 'Castagnella', cat: 'alveare', price: 8.5, img: 'c-castagnella', d: "Miele di castagno e farina di castagne tradizionale, spalmabile. È quanto di più caratteristico ci sia nella vita delle nostre montagne: un miele pulito, aromatico, denso, da piante vecchie di secoli.", rows: [['Ingredienti', 'Miele di castagno, farina di castagne'], ['Ideale', 'Spalmata sul pane, a colazione o a merenda']] },
  { id: 'miele', name: 'Miele millefiori balsamico', cat: 'alveare', price: 9.5, img: 'c-miele', d: 'Prodotto di montagna, dalle nostre arnie lungo il Gambellato. Denso, aromatico, balsamico.', rows: [['Ingredienti', 'Miele millefiori di montagna'], ['Ideale', 'Al cucchiaio, nel tè, sul pane']] },
  { id: 'propoli', name: 'Propoli spray', cat: 'alveare', price: 12, img: 'c-propoli', d: "Molte persone si ritengono allergiche a questo biocida naturale. Questa propoli è la nostra: fatta dalle nostre api e raccolta qui, al Mulino del Frate.", rows: [['Ingredienti', 'Propoli delle api del Mulino'], ['Ideale', 'Da tenere sempre in borsa']] },
  { id: 'dopobarba', name: 'Fluido dopobarba rinfrescante', cat: 'cosmesi', price: 15, img: 'c-dopobarba', d: "Dal laboratorio di Lucilla, erborista da ventisei anni. Un fluido leggero per dopo la rasatura.", rows: [['Proprietà', 'Idratante, emolliente, calmante'], ['Ideale', 'Dopo la rasatura']] },
  { id: 'maschera', name: "Maschera all'argilla", cat: 'cosmesi', price: 14, img: 'c-maschera', d: "Una maschera delicata per il viso, con olio di polline, da usare una volta a settimana.", rows: [['Ingredienti', 'Argilla, olio di polline'], ['Uso', 'Una volta a settimana']] },
  { id: 'artiglio', name: "Crema all'artiglio del diavolo e arnica", cat: 'unguenti', price: 14, img: 'c-artiglio', d: "Crema per il massaggio, con artiglio del diavolo e arnica.", rows: [['Ingredienti', 'Artiglio del diavolo, arnica'], ['Ideale', 'Per i massaggi']] },
  { id: 'calendula', name: 'Crema alla propoli e calendula', cat: 'unguenti', price: 13, img: 'c-calendula', d: "La propoli delle nostre api insieme alla calendula, in una crema morbida.", rows: [['Ingredienti', 'Propoli, calendula']] },
  { id: 'polline', name: 'Unguento propoli e polline', cat: 'unguenti', price: 12, img: 'c-polline', d: "Propoli e polline, entrambi dalle arnie del Mulino.", rows: [['Ingredienti', 'Propoli, polline']] },
  { id: 'teatree', name: 'Unguento propoli e tea tree', cat: 'unguenti', price: 12, img: 'c-teatree', d: "Propoli delle nostre api con olio essenziale di tea tree.", rows: [['Ingredienti', 'Propoli, olio essenziale di tea tree']] }
];
const ERE = [
  { when: 'XI e XII secolo', t: 'I frati macinano al fiume', img: 'fiume.jpg', d: "Qui vicino c'era un convento, oggi scomparso del tutto. Con ogni probabilità il nostro mulino era il punto sul fiume dove i frati macinavano per i loro bisogni. Da qui il nome: il mulino del frate." },
  { when: 'Tra 1200 e 1300', t: 'Due macine e un bottaccio', img: 'insegna-panorama.jpg', d: "Bologna incentiva la costruzione di mulini nell'alta valle del Reno. Due macine, una da grano e una da formentone, un grande bottaccio per l'estate e la stanza dell'acqua, tutta a volta romana." },
  { when: 'Dopo il 1480', t: 'La strada per Boccadirio', img: 'hero-insegna.jpg', d: "Da Bruscoli, Monghidoro, Castel del Rio e Firenzuola si scende a pregare a Boccadirio. Le strade carraie che passano di qui sono ancora incassate nel terreno, tra muri a secco antichissimi." },
  { when: 'Oggi', t: 'Lucilla e Lorenzo', img: 'apiario.jpg', d: "Lei erborista, lui medico veterinario. Hanno ristrutturato con pietra serena, castagno, quercia e sabbia di fiume, rispettando il lavoro degli antichi. Con loro due cani, tre gatti e le api." },
  { when: 'Sul sentiero', t: 'CAI 17 e Via degli Dei', img: 'erbe.jpg', d: "Il Mulino è sul sentiero 17 del CAI di Bologna e sull'Alta Via dei Parchi, a poca distanza dalla Via degli Dei. Ancora oggi qui si arriva a piedi." }
];
// offerte e più venduti: dati di esempio per la bozza (vedi DA-VERIFICARE.md)
const SALE = { miele: .15, polline: .15, maschera: .15 };
const TOP = ['castagnella', 'propoli', 'calendula'];
const byId = id => P.find(p => p.id === id);
const cost = p => SALE[p.id] ? Math.round(p.price * (1 - SALE[p.id]) * 10) / 10 : p.price;
const priceHTML = p => SALE[p.id] ? `<s>${eur(p.price)}</s> <b>${eur(cost(p))}</b>` : eur(p.price);
const flag = p => SALE[p.id] ? `<span class="flag sale">-${Math.round(SALE[p.id] * 100)}%</span>` : TOP.includes(p.id) ? '<span class="flag top">Tra i più amati</span>' : '';
const catName = id => (CATS.find(c => c.id === id) || {}).name || '';
const eur = n => '€ ' + n.toFixed(2).replace('.', ',');
const src = p => `assets/${p.img}.webp`;
// dimensioni reali dei modelli 3D (altezza in cm, rapporto larghezza/altezza del riquadro)
const DIM = { castagnella: [8.7, .9], miele: [8.7, .9], propoli: [8.4, .5], dopobarba: [13.7, .5], maschera: [5.55, 1.33], artiglio: [5.55, 1.33], calendula: [5.55, 1.33], polline: [5.55, 1.33], teatree: [5.55, 1.33] };
const hp = id => Math.round(45 + 55 * DIM[id][0] / 13.7);
const jarBox = (p, extra = '', style = '') => `<div class="jarbox" data-jar="${p.id}" ${extra} style="height:${hp(p.id)}%;aspect-ratio:${DIM[p.id][1]};${style}" role="img" aria-label="${p.name}, modello 3D"><img class="jar-fallback" src="${src(p)}" alt=""></div>`;
const snapSrc = p => (window.MDFJars && MDFJars.snap(p.id)) || src(p);

/* ================= lenis ================= */
let lenis = null;
if (!RM && window.Lenis) {
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const lock = on => lenis && (on ? lenis.stop() : lenis.start());
const toTop = () => { lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0); };
const scrollToEl = el => lenis ? lenis.scrollTo(el, { offset: -60, duration: 1.8 }) : el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });

/* ================= render statici ================= */
const tags = () => `<div class="tags"><span><svg><use href="#i-leaf"/></svg>Naturale</span><span><svg><use href="#i-hand"/></svg>Fatto a mano</span></div>`;
const prodHTML = p => `<article class="prod" data-prod="${p.id}" tabindex="0" aria-label="${p.name}">
  <div class="stage">${jarBox(p)}</div>
  ${flag(p)}${tags()}<h3>${p.name}</h3><div class="meta">${priceHTML(p)}</div><span class="pill">Acquista ora</span></article>`;
const packHTML = `<article class="pack"><div class="pack-img"><img src="assets/cosmesi.jpg" alt="Vasetti e flaconi del Mulino del Frate su un vassoio di vimini"></div>
  <div class="pack-copy"><h3>Confezione regalo</h3><p>La componiamo noi: miele, tisane, una crema dal laboratorio di Lucilla. Dicci per chi è e quanto vuoi spendere, e prepariamo una scatola su misura.</p><button class="blk" data-gift>Chiedi una confezione</button></div></article>`;

// due giri identici di prodotti: il secondo prende il posto del primo e lo scaffale scorre all'infinito
$('#shelf').innerHTML = [...P, ...P].map((p, i) => jarBox(p, `data-prod="${p.id}" data-angle="${(i % P.length) * 1.3}" data-speed=".5"`).replace('class="jarbox"', i < P.length ? 'class="jarbox" tabindex="0"' : 'class="jarbox" aria-hidden="true"')).join('');
$('#cards').innerHTML = ERE.map((e, i) => `<article class="card" data-era="${i}" tabindex="0"><div class="ph"><img src="assets/${e.img}" alt="" loading="lazy"></div><h3>${e.t}</h3><p>${e.when}</p></article>`).join('');
$('#filters').innerHTML = CATS.map((c, i) => `<button data-f="${c.id}" aria-pressed="${i === 0}">${c.name}</button>`).join('');

function renderGrid(f = 'tutti') {
  const list = P.filter(p => f === 'tutti' || p.cat === f);
  const html = list.map(prodHTML);
  if (f === 'tutti') html.splice(6, 0, packHTML);
  $('#pgrid').innerHTML = html.join('');
}
renderGrid();

/* ================= drip ================= */
function buildDrip(g) {
  const NS = 'http://www.w3.org/2000/svg';
  g.innerHTML = '';
  const band = document.createElementNS(NS, 'rect');
  band.setAttribute('x', -20); band.setAttribute('y', -20); band.setAttribute('width', 1040); g.appendChild(band);
  const drops = [];
  const xs = [35, 95, 150, 230, 290, 360, 430, 470, 545, 610, 680, 735, 800, 870, 940, 985];
  xs.forEach((x, i) => {
    const r = document.createElementNS(NS, 'rect'), w = 16 + (i * 13) % 26;
    r.setAttribute('x', x - w / 2); r.setAttribute('y', -20); r.setAttribute('width', w); r.setAttribute('rx', w / 2);
    g.appendChild(r); drops.push({ r, len: 40 + (i * 61) % 190 });
  });
  return p => {
    const b = 6 + p * 28;
    band.setAttribute('height', b + 20);
    drops.forEach((d, i) => d.r.setAttribute('height', b + 20 + d.len * gsap.utils.clamp(0, 1, p * 1.25 - (i % 3) * .08)));
  };
}

/* ================= helpers animazione ================= */
function linesIn(el, opts = {}) {
  const s = new SplitText(el, { type: 'lines', linesClass: 'ln', mask: 'lines', autoSplit: false });
  gsap.from(s.lines, { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: .09, scrollTrigger: opts.now ? undefined : { trigger: el, start: 'top 85%' }, delay: opts.delay || 0 });
  return s;
}
function giantIn(el, opts = {}) {
  const s = new SplitText(el, { type: 'lines,chars', linesClass: 'ln', mask: 'lines' });
  gsap.from(s.chars, { yPercent: 105, duration: 1.4, ease: 'expo.out', stagger: .028, scrollTrigger: opts.now ? undefined : { trigger: el, start: 'top 82%' }, delay: opts.delay || 0 });
  return s;
}
function picsIn(el) {
  $$('.pic img', el).forEach((im, i) => gsap.from(im, { scale: 0, rotation: i % 2 ? 25 : -25, duration: 1.2, ease: 'back.out(1.6)', delay: .35 + i * .15, scrollTrigger: { trigger: el, start: 'top 80%' } }));
}
function fitHero() {
  const t = $('#heroTitle'), f = $('#heroFrame');
  t.style.fontSize = '100px';
  const rg = document.createRange(); rg.selectNodeContents(t);
  const w = rg.getBoundingClientRect().width;
  t.style.fontSize = Math.min(100 * (f.clientWidth * 0.93) / w, 400) + 'px';
}

/* ================= scene per vista ================= */
let ctx = null, heroSplit = null;
const scenes = {
  home(first) {
    fitHero();
    if (RM) return;
    heroSplit = new SplitText('#heroTitle', { type: 'chars', mask: 'chars' });
    gsap.from(heroSplit.chars, { yPercent: 110, duration: 1.6, ease: 'expo.out', stagger: .045, delay: first ? 1.55 : .35 });
    gsap.from('#heroImg', { scale: 1.25, duration: 2.4, ease: 'expo.out', delay: first ? 1.3 : .2 });
    gsap.from('#heroCta > *', { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .12, delay: first ? 2.2 : .9 });
    gsap.to('#heroCta', { yPercent: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '45% top', scrub: true } });
    // pulsante Shop fisso: compare appena si lascia l'hero
    ScrollTrigger.create({ trigger: '.about', start: 'top 70%', end: 'max', onEnter: () => floatShop(true), onLeaveBack: () => floatShop(false) });
    if (!seen()) ScrollTrigger.create({ trigger: '#antico', start: 'bottom 60%', once: true, onEnter: () => setTimeout(() => openPromo(), 600) });
    armPromo();
    gsap.to('#heroImg', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('#heroTitle', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    $$('[data-speed]').forEach(im => gsap.fromTo(im, { yPercent: 0 }, { yPercent: +im.dataset.speed, ease: 'none', scrollTrigger: { trigger: im.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } }));

    linesIn($('#statement')); picsIn($('#statement').parentElement);
    gsap.from('.about-copy .oval', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.about-copy .oval', start: 'top 92%' } });

    giantIn($('#anticoTitle'));
    const jr = $('#jarRise'), jt = { t: -.2, s: -2.4 };
    gsap.fromTo('#jarRise', { y: '38vh' }, { y: '-6vh', ease: 'none', scrollTrigger: { trigger: '#antico', start: 'top 85%', end: 'bottom 30%', scrub: true } });
    gsap.to(jt, { t: .12, s: 2.4, ease: 'none', onUpdate: () => { jr.dataset.tilt = jt.t; jr.dataset.spin = jt.s; }, scrollTrigger: { trigger: '#antico', start: 'top 85%', end: 'bottom 30%', scrub: true } });

    const set = buildDrip($('#dripG')), o = { p: 0 };
    gsap.to(o, { p: 1, ease: 'none', onUpdate: () => set(o.p), scrollTrigger: { trigger: '#filmBox', start: 'top 80%', end: 'center 35%', scrub: 1 } });
    gsap.fromTo('#filmBox', { scale: .9, borderRadius: 40 }, { scale: 1, borderRadius: 16, ease: 'none', scrollTrigger: { trigger: '#filmBox', start: 'top bottom', end: 'top 25%', scrub: true } });
    gsap.fromTo('#filmImg', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '#filmBox', start: 'top bottom', end: 'bottom top', scrub: true } });

    gsap.from('.kicker', { y: 20, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.kicker', start: 'top 90%' } });
    linesIn($('#sapori')); picsIn($('#sapori').parentElement);
    giantIn($('#bottegaTitle'));
    const shelf = $('#shelf');
    // scaffale in loop continuo: scorre da solo, accelera con la velocità dello scroll e cambia verso se si torna su
    const loopW = () => (shelf.scrollWidth + parseFloat(getComputedStyle(shelf).columnGap || 0)) / 2;
    const loop = gsap.fromTo(shelf, { x: 0 }, { x: () => -loopW(), duration: 38, ease: 'none', repeat: -1, invalidateOnRefresh: true });
    loop.totalTime(38 * 500); // margine per poter girare anche all'indietro
    let dir = 1;
    ScrollTrigger.create({ trigger: '.shelf-wrap', start: 'top bottom', end: 'bottom top',
      onUpdate: self => { dir = self.direction; const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 250); gsap.to(loop, { timeScale: v || dir, duration: .25, overwrite: true, onComplete: () => gsap.to(loop, { timeScale: dir, duration: 1.2, ease: 'power2.out' }) }); } });
    $$('.jarbox', shelf).forEach(j => { j.addEventListener('pointerenter', () => gsap.to(loop, { timeScale: .15 * dir, duration: .6 })); j.addEventListener('pointerleave', () => gsap.to(loop, { timeScale: dir, duration: .8 })); });

    giantIn($('#storiaTitle'));
    gsap.to('#storiaTitle .glyph', { rotation: 360, ease: 'none', transformOrigin: '50% 50%', duration: 6, repeat: -1 });
    gsap.from('#cards .card', { y: 140, opacity: 0, rotation: (i) => (i % 2 ? 8 : -8), duration: 1.3, ease: 'expo.out', stagger: .09, scrollTrigger: { trigger: '#cards', start: 'top 88%' }, clearProps: 'transform' });

    gsap.fromTo('#bannerImg', { yPercent: -8, scale: 1.1 }, { yPercent: 8, scale: 1, ease: 'none', scrollTrigger: { trigger: '#bannerBox', start: 'top bottom', end: 'bottom top', scrub: true } });
    linesIn($('#bannerTitle'));
    giantIn($('#visitaTitle'));
    gsap.from('.contacts > *', { y: 30, opacity: 0, stagger: .07, duration: 1, ease: 'expo.out', clearProps: 'all', scrollTrigger: { trigger: '.contacts', start: 'top 85%' } });
    gsap.fromTo('.map-box', { clipPath: 'inset(12% 8% 12% 8% round 16px)' }, { clipPath: 'inset(0% 0% 0% 0% round 16px)', ease: 'none', scrollTrigger: { trigger: '.map-box', start: 'top 95%', end: 'top 45%', scrub: true } });
    gsap.from('.banner .oval', { scale: .6, opacity: 0, duration: 1.1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.banner .oval', start: 'top 92%' } });
  },
  bottega() {
    if (RM) return;
    giantIn($('#catTitle'), { now: true, delay: .25 });
    gsap.from('#filters button', { y: 24, opacity: 0, stagger: .05, duration: .9, ease: 'expo.out', delay: .6 });
    gridIn();
    gsap.fromTo('.cat .engr-bg img', { yPercent: 0 }, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.cat', start: 'top top', end: 'bottom top', scrub: true } });
  },
  checkout() {
    if (RM) return;
    gsap.from('.co-head > *', { y: 30, opacity: 0, stagger: .07, duration: 1, ease: 'expo.out', delay: .25 });
    gsap.from('.co-form > *, .co-sum', { y: 40, opacity: 0, stagger: .06, duration: 1, ease: 'expo.out', delay: .4 });
  },
  prodotto() {
    if (RM) return;
    const fl = $('.pdp-stage .float');
    const tl = { t: -.35, s: -3 }, setT = () => { fl.dataset.tilt = tl.t; fl.dataset.spin = tl.s; };
    gsap.from(fl, { y: 220, duration: 1.6, ease: 'expo.out', delay: .3 });
    gsap.to(tl, { t: -.08, s: 0, duration: 2, ease: 'expo.out', delay: .3, onUpdate: setT });
    gsap.to(fl, { y: -16, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.9 });
    gsap.from('.hint', { y: 20, opacity: 0, duration: 1, ease: 'expo.out', delay: 1.4 });
    gsap.from('.pdp-info > *', { y: 30, opacity: 0, stagger: .06, duration: 1, ease: 'expo.out', delay: .35 });
    gsap.fromTo('#lifeImg', { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.life', start: 'top bottom', end: 'bottom top', scrub: true } });
    linesIn($('.also-title'));
    gsap.from('#also', { y: 80, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '#also', start: 'top 85%' } });
  }
};
function gridIn() {
  if (RM) return;
  gsap.from('#pgrid', { y: 60, duration: 1.2, ease: 'expo.out', delay: .45 });
}

/* ================= prodotto ================= */
function renderProduct(id) {
  const p = byId(id) || P[0];
  $('#pdp').innerHTML = `<div class="pdp-stage"><img class="eng" src="assets/inc-insegna.webp" alt=""><div class="float-wrap"><div class="float" data-jar="${p.id}" data-drag data-speed=".22" data-angle="-.5" data-pad="1.13" style="height:${Math.round(hp(p.id) * .78)}%;aspect-ratio:${DIM[p.id][1]}" role="img" aria-label="${p.name}: trascina per ruotarlo"><img class="jar-fallback" src="${src(p)}" alt=""></div></div><div class="hint"><svg viewBox="0 0 34 20" aria-hidden="true"><path d="M4 10h26M4 10l5-5M4 10l5 5M30 10l-5-5M30 10l-5 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>Trascina per girarlo a 360°</div></div>
  <div class="pdp-info">
    <div class="crumbs"><a href="#bottega" data-go="bottega">Bottega</a><svg><use href="#i-chev"/></svg><span>${catName(p.cat)}</span><svg><use href="#i-chev"/></svg><span>${p.name}</span></div>
    <h1>${p.name}</h1>${tags()}
    <p class="desc">${p.d}</p>
    <div class="rows">${p.rows.map(r => `<div><b>${r[0]}</b>${r[1]}</div>`).join('')}<div><b>Formato</b>Da confermare</div></div>
    <div class="price">${priceHTML(p)}${SALE[p.id] ? ` <span class="flag sale">-${Math.round(SALE[p.id] * 100)}%</span>` : ''}</div>
    <div class="buy"><div class="step"><button data-q="-1" aria-label="Togli uno">-</button><span id="qty">1</span><button data-q="1" aria-label="Aggiungi uno">+</button></div><button class="blk" data-add="${p.id}">Aggiungi al carrello</button></div>
    <p class="small-note">Ritiro al Mulino su appuntamento o spedizione da concordare.</p>
  </div>`;
  const others = P.filter(x => x.id !== p.id && x.cat === p.cat).concat(P.filter(x => x.cat !== p.cat)).slice(0, 3);
  $('#also').innerHTML = others.map(prodHTML).join('');
}

/* ================= router + sipario ================= */
const curtain = $('#curtain'), cWord = $('#curtainWord');
let current = null, busy = false;
function parse() {
  const h = location.hash.slice(1);
  if (h === 'bottega') return { view: 'bottega' };
  if (h.startsWith('prodotto-')) return { view: 'prodotto', id: h.slice(9) };
  if (h === 'pagamento') return { view: 'checkout' };
  return { view: 'home' };
}
const shopFloat = $('#shopFloat');
function floatShop(on) { gsap.to(shopFloat, { autoAlpha: on ? 1 : 0, y: on ? 0 : 30, duration: on ? .7 : .35, ease: on ? 'back.out(1.6)' : 'power2.in', overwrite: true }); }
function show(r, first) {
  if (ctx) ctx.revert();
  floatShop(false);
  closePromo();
  if (r.view !== 'home') clearTimeout(promoTimer);
  $$('.shop-link').forEach(l => l.toggleAttribute('aria-current', r.view === 'bottega'));
  $$('.view').forEach(v => v.hidden = v.dataset.view !== r.view);
  if (r.view === 'prodotto') renderProduct(r.id);
  if (r.view === 'checkout') { renderCheckout(); syncDelivery(); }
  if (r.view === 'bottega') { renderGrid(); $$('#filters button').forEach((b, i) => b.setAttribute('aria-pressed', i === 0)); }
  toTop();
  ctx = gsap.context(() => scenes[r.view](first));
  ScrollTrigger.refresh();
  current = r.view + (r.id || '');
  if (r.to) setTimeout(() => { const el = document.getElementById(r.to); el && scrollToEl(el); }, 900);
}
function navigate(r) {
  const key = r.view + (r.id || '');
  if (key === current) { if (r.to) { const el = document.getElementById(r.to); el && scrollToEl(el); } else lenis ? lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo(0, 0); return; }
  if (busy) return; busy = true;
  const label = r.view === 'checkout' ? 'Pagamento' : r.view === 'bottega' ? 'La bottega' : r.view === 'prodotto' ? (byId(r.id) || P[0]).name : 'Mulino del Frate';
  cWord.textContent = label;
  if (RM) { show(r); busy = false; return; }
  lock(true);
  gsap.timeline({ onComplete: () => { busy = false; lock(false); } })
    .set(curtain, { yPercent: 100, borderRadius: '40px 40px 0 0', display: 'grid' })
    .to(curtain, { yPercent: 0, borderRadius: '0px 0px 0 0', duration: .8, ease: 'expo.inOut' })
    .fromTo(cWord, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .6, ease: 'expo.out' }, '-=.3')
    .add(() => show(r))
    .to(cWord, { yPercent: -60, opacity: 0, duration: .4, ease: 'power2.in' }, '+=.15')
    .to(curtain, { yPercent: -100, borderRadius: '0 0 40px 40px', duration: .9, ease: 'expo.inOut' }, '-=.1')
    .set(curtain, { display: 'none' });
}
let pendingTo = null;
window.addEventListener('hashchange', () => { const r = parse(); if (pendingTo) { r.to = pendingTo; pendingTo = null; } navigate(r); });
function go(hashName, to) {
  if (('#' + hashName) === location.hash || (hashName === 'home' && !location.hash)) { const r = parse(); r.to = to; navigate(r); return; }
  pendingTo = to || null;
  location.hash = hashName;
}

/* ================= menu ================= */
const menu = $('#menu'), menuBtn = $('#menuBtn');
let menuOpen = false;
function toggleMenu(open = !menuOpen) {
  menuOpen = open; menuBtn.setAttribute('aria-expanded', open); menu.setAttribute('aria-hidden', !open);
  $('#menuLabel').textContent = open ? 'Chiudi' : 'Menu';
  if (open) {
    lock(true);
    gsap.set(menu, { visibility: 'visible' });
    gsap.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: RM ? 0 : .9, ease: 'expo.inOut' });
    if (!RM) gsap.fromTo('.menu li a span', { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: .07, ease: 'expo.out', delay: .35 });
    if (!RM) gsap.fromTo('.menu-info', { opacity: 0 }, { opacity: .7, duration: .8, delay: .7 });
  } else {
    gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: RM ? 0 : .7, ease: 'expo.inOut', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
    lock(false);
  }
}
menuBtn.addEventListener('click', () => toggleMenu());

/* ================= carrello ================= */
let cart = {};
try { cart = JSON.parse(localStorage.getItem('mdf-cart-2') || '{}') || {}; } catch (e) { cart = {}; }
const save = () => { try { localStorage.setItem('mdf-cart-2', JSON.stringify(cart)); } catch (e) {} };
const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
const total = () => Object.entries(cart).reduce((s, [id, q]) => s + (byId(id) ? cost(byId(id)) * q : 0), 0);
const drawer = $('#drawer'), scrim = $('#scrim');
let drawerOpen = false, modalOpen = false;
function renderCart() {
  $$('[data-count]').forEach(c => c.textContent = count());
  const ids = Object.keys(cart).filter(byId);
  $('#lines').innerHTML = ids.length ? ids.map(id => { const p = byId(id); return `<div class="cline"><div class="th"><img src="${snapSrc(p)}" data-snap="${p.id}" alt=""></div><div><h4>${p.name}</h4><div class="step"><button data-dec="${id}" aria-label="Togli uno">-</button><span>${cart[id]}</span><button data-inc="${id}" aria-label="Aggiungi uno">+</button></div></div><span class="p">${eur(cost(p) * cart[id])}</span></div>`; }).join('')
    : `<div class="empty">Il carrello è vuoto.<br><a href="#bottega" data-go="bottega" class="oval">Vai alla bottega</a></div>`;
  $('#total').textContent = eur(total());
  if (typeof current !== 'undefined' && current === 'checkout' && !$('#coGrid').hidden) renderCheckout();
}
function scrimOn(on) { gsap.to(scrim, { autoAlpha: on ? 1 : 0, duration: .45 }); }
function openCart() {
  renderCart(); drawerOpen = true; drawer.setAttribute('aria-hidden', 'false'); lock(true); scrimOn(true);
  gsap.set(drawer, { visibility: 'visible' });
  gsap.fromTo(drawer, { xPercent: 100 }, { xPercent: 0, duration: RM ? 0 : .9, ease: 'expo.out', overwrite: true });
  if (!RM) gsap.from('#lines > *', { x: 50, opacity: 0, stagger: .06, duration: .8, ease: 'expo.out', delay: .2 });
}
function closeCart() {
  if (!drawerOpen) return; drawerOpen = false; drawer.setAttribute('aria-hidden', 'true');
  gsap.to(drawer, { xPercent: 100, duration: RM ? 0 : .6, ease: 'expo.in', overwrite: true, onComplete: () => { if (!drawerOpen) gsap.set(drawer, { visibility: 'hidden' }); } });
  if (!modalOpen) { scrimOn(false); if (!menuOpen) lock(false); }
}
function addToCart(id, q, fromImg) {
  cart[id] = (cart[id] || 0) + q; save();
  const badge = $('#nav [data-count]');
  const done = () => { renderCart(); gsap.fromTo(badge, { scale: 1.6 }, { scale: 1, duration: .9, ease: 'elastic.out(1.2,.35)' }); toast('Aggiunto al carrello: ' + byId(id).name); };
  if (RM || !fromImg) return done();
  const r = fromImg.getBoundingClientRect(), t = badge.getBoundingClientRect();
  let cl;
  if (document.documentElement.classList.contains('jars-on')) { cl = document.createElement('div'); cl.dataset.jar = id; cl.dataset.speed = '9'; cl.dataset.pad = '1.04'; }
  else { cl = document.createElement('img'); cl.src = src(byId(id)); }
  Object.assign(cl.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', zIndex: 99, pointerEvents: 'none', margin: 0, objectFit: 'contain' });
  document.body.appendChild(cl);
  const dx = t.left + t.width / 2 - (r.left + r.width / 2), dy = t.top + t.height / 2 - (r.top + r.height / 2);
  document.documentElement.classList.add('flying');
  gsap.timeline({ onComplete: () => { cl.remove(); document.documentElement.classList.remove('flying'); done(); } })
    .to(cl, { x: dx, duration: 1, ease: 'power2.inOut' }, 0)
    .to(cl, { y: dy, duration: 1, ease: 'back.in(1.3)' }, 0)
    .to(cl, { scale: .08, duration: 1, ease: 'power3.in' }, 0);
}

/* ================= modale ================= */
const modal = $('#modal'), box = $('#modalBox');
function openModal(html) {
  box.innerHTML = `<button class="x" data-close-modal aria-label="Chiudi"><svg><use href="#i-x"/></svg></button>${html}`;
  modalOpen = true; modal.setAttribute('aria-hidden', 'false'); lock(true); scrimOn(true);
  gsap.set(modal, { visibility: 'visible' });
  gsap.fromTo(box, { y: 90, opacity: 0, rotation: 1.5 }, { y: 0, opacity: 1, rotation: 0, duration: RM ? 0 : 1, ease: 'expo.out', overwrite: true });
  setTimeout(() => { const f = $('input', box) || $('[data-close-modal]', box); f && f.focus(); }, 60);
}
function closeModal() {
  if (!modalOpen) return; modalOpen = false; modal.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('qv-open'); box.classList.remove('qv');
  gsap.to(box, { y: 50, opacity: 0, duration: .35, ease: 'power2.in', overwrite: true, onComplete: () => { if (!modalOpen) gsap.set(modal, { visibility: 'hidden' }); } });
  if (!drawerOpen) { scrimOn(false); if (!menuOpen) lock(false); }
}
function quickView(id) {
  const p = byId(id); if (!p) return;
  openModal(`<div class="qv-stage"><img class="eng" src="assets/inc-insegna.webp" alt=""><div class="qv-jarwrap"><div class="qv-jar" id="qvJar" data-jar="${p.id}" data-drag data-speed=".3" data-angle="-.4" data-pad="1.12" style="aspect-ratio:${DIM[p.id][1]};height:${Math.round(hp(p.id) * .8)}%" role="img" aria-label="${p.name}: trascina per ruotarlo"><img class="jar-fallback" src="${src(p)}" alt=""></div></div>
    <div class="hint"><svg viewBox="0 0 34 20" aria-hidden="true"><path d="M4 10h26M4 10l5-5M4 10l5 5M30 10l-5-5M30 10l-5 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>Trascina per girarlo</div></div>
    <div class="qv-info"><div class="crumbs"><span>${catName(p.cat)}</span></div>${flag(p)}<h2>${p.name}</h2>${tags()}
      <p class="desc">${p.d}</p>
      <div class="rows">${p.rows.map(r => `<div><b>${r[0]}</b>${r[1]}</div>`).join('')}</div>
      <div class="price">${priceHTML(p)}</div>
      <div class="buy"><div class="step"><button data-qv-q="-1" aria-label="Togli uno">-</button><span id="qvQty">1</span><button data-qv-q="1" aria-label="Aggiungi uno">+</button></div><button class="blk" data-qv-add="${p.id}">Aggiungi al carrello</button></div>
      <button class="qv-more" data-qv-page="${p.id}">Vedi la scheda completa</button></div>`);
  box.classList.add('qv'); document.documentElement.classList.add('qv-open');
}
function eraModal(i) {
  const e = ERE[i];
  openModal(`<img class="mimg" src="assets/${e.img}" alt=""><div class="when">${e.when}</div><h2>${e.t}</h2><p>${e.d}</p>`);
}
function formModal(kind) {
  const titles = { order: "Invia l'ordine", gift: 'Chiedi una confezione', contact: 'Contattaci' };
  const intro = {
    order: 'Lasciaci i tuoi dati: Lucilla ti ricontatta per confermare l\'ordine e concordare ritiro o spedizione.',
    gift: 'Raccontaci per chi è e quanto vuoi spendere: Lucilla ti risponde con una proposta.',
    contact: 'Siamo a Roncobilaccio, sulla Panoramica, a due chilometri scarsi dal casello A1. Dalla provinciale sono circa 200 metri di discesa verso il fiume, a piedi o con un 4x4.'
  };
  const info = kind === 'contact' ? `<div class="info-grid"><div><b>Indirizzo</b>Via della Torre 17, Roncobilaccio<br>40035 Castiglione dei Pepoli (BO)</div><div><b>Orari</b>Dal lunedì al venerdì, su appuntamento</div><div><b>Telefono</b>+39 348 250 2474</div><div><b>Email</b>mulinodelfrate@gmail.com</div></div>` : '';
  openModal(`<h2>${titles[kind]}</h2><p>${intro[kind]}</p>${info}
    <form class="form" id="mform">
      <label>Nome e cognome<input name="n" required autocomplete="name"></label>
      <label>Email o telefono<input name="c" required autocomplete="email"></label>
      <label>${kind === 'order' ? 'Note: ritiro al Mulino o indirizzo di spedizione' : 'Messaggio'}<textarea name="m" rows="3"></textarea></label>
      <button class="blk" type="submit">${kind === 'order' ? 'Prepara il riepilogo' : 'Prepara il messaggio'}</button>
    </form><div id="mout"></div>`);
  $('#mform').addEventListener('submit', ev => {
    ev.preventDefault();
    const f = new FormData(ev.target);
    const lines = kind === 'order' ? Object.entries(cart).filter(([id]) => byId(id)).map(([id, q]) => `${q} x ${byId(id).name}  ${eur(cost(byId(id)) * q)}`) : [];
    const txt = `${titles[kind]}, Mulino del Frate\n\nNome: ${f.get('n')}\nContatto: ${f.get('c')}\n` + (lines.length ? `\n${lines.join('\n')}\nTotale: ${eur(total())}\n` : '') + (f.get('m') ? `\n${f.get('m')}` : '');
    $('#mout').innerHTML = `<p style="margin-top:18px"><b>Questa è una bozza: il messaggio non è stato inviato.</b> Nel sito definitivo arriverà direttamente a Lucilla. Per ora puoi copiarlo e mandarlo a mulinodelfrate@gmail.com o al +39 348 250 2474.</p><div class="summary" id="sum"></div><button class="blk" id="copy">Copia il testo</button>`;
    $('#sum').textContent = txt; ev.target.remove();
    $('#copy').addEventListener('click', () => { navigator.clipboard && navigator.clipboard.writeText(txt).then(() => toast('Testo copiato'), () => toast('Copia non disponibile: seleziona il testo')); });
  });
}

/* ================= pannello "questa settimana" (offerte / più amati) ================= */
const promo = $('#promo');
let promoOpen = false, promoTab = 'sale';
// il pannello compare da solo una volta sola: poi resta chiuso, anche ricaricando (si riapre solo dal footer)
let promoShown = false;
const seen = () => { if (promoShown) return true; try { return localStorage.getItem('mdf-promo-visto') === '1'; } catch (e) { return false; } };
const markSeen = () => { promoShown = true; try { localStorage.setItem('mdf-promo-visto', '1'); } catch (e) {} };
function promoList() {
  const ids = promoTab === 'sale' ? Object.keys(SALE) : TOP;
  $('#promoList').innerHTML = ids.map(byId).map(p => `<li class="pitem">
    <button class="pthumb" data-promo-go="${p.id}" aria-label="Apri ${p.name}"><img src="${snapSrc(p)}" data-snap="${p.id}" alt=""></button>
    <div class="pinfo"><button class="pname" data-promo-go="${p.id}">${p.name}</button><div class="pprice">${priceHTML(p)}</div></div>
    <button class="padd" data-promo-add="${p.id}" aria-label="Aggiungi ${p.name} al carrello"><svg><use href="#i-bag"/></svg></button></li>`).join('');
  $$('#promo [data-tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === promoTab));
  if (!RM) gsap.from('#promoList .pitem', { x: 40, opacity: 0, stagger: .07, duration: .7, ease: 'expo.out' });
}
function openPromo(force) {
  if (promoOpen || modalOpen || drawerOpen || menuOpen) return;
  if (!force && seen()) return;
  clearTimeout(promoTimer);
  promoOpen = true; markSeen(); promo.setAttribute('aria-hidden', 'false'); promoList();
  gsap.killTweensOf(promo);
  gsap.set(promo, { visibility: 'visible' });
  gsap.fromTo(promo, { xPercent: 110, rotation: 3 }, { xPercent: 0, rotation: 0, duration: RM ? 0 : 1.1, ease: 'expo.out', overwrite: true });
}
function closePromo() {
  if (!promoOpen) return; promoOpen = false; markSeen(); clearTimeout(promoTimer); promo.setAttribute('aria-hidden', 'true');
  gsap.killTweensOf(promo); // ferma l'entrata se è ancora in corso: altrimenti il pannello restava a schermo
  gsap.to(promo, { xPercent: 110, rotation: 0, duration: RM ? 0 : .5, ease: 'power3.in', overwrite: true, onComplete: () => gsap.set(promo, { visibility: 'hidden' }) });
}
let promoTimer = null;
function armPromo() {
  if (seen()) return;
  clearTimeout(promoTimer); promoTimer = setTimeout(() => current === 'home' && openPromo(), 20000);
}


/* ================= pagamento ================= */
const SHIP = 7.9, FREE_FROM = 49;   // valori di esempio, da confermare
const coForm = $('#coForm');
const shipping = () => (coForm.ship.value === 'ritiro' || total() >= FREE_FROM) ? 0 : SHIP;
function renderCheckout() {
  const ids = Object.keys(cart).filter(byId);
  const empty = !ids.length;
  $('#coEmpty').hidden = !empty; $('#coGrid').hidden = empty; $('#coDone').hidden = true;
  $('#coTitle').textContent = "Completa l'ordine"; $('.co-lead').hidden = false;
  if (empty) return;
  $('#sumLines').innerHTML = ids.map(id => { const p = byId(id); return `<li><span class="sum-th"><img src="${snapSrc(p)}" data-snap="${p.id}" alt=""><i>${cart[id]}</i></span><span class="sum-n">${p.name}</span><span class="sum-p">${SALE[p.id] ? `<s>${eur(p.price * cart[id])}</s><br>` : ''}${eur(cost(p) * cart[id])}</span></li>`; }).join('');
  updateTotals();
}
function updateTotals() {
  const sub = total(), full = Object.entries(cart).reduce((s, [id, q]) => s + (byId(id) ? byId(id).price * q : 0), 0);
  const pick = coForm.ship.value === 'ritiro', sh = shipping(), tot = sub + sh;
  $('#sumSub').textContent = eur(full);
  $('#sumSaveRow').hidden = full - sub < .01; $('#sumSave').textContent = '− ' + eur(full - sub);
  $('#sumShipLabel').textContent = pick ? 'Ritiro al Mulino' : 'Spedizione';
  $('#sumShip').textContent = sh ? eur(sh) : 'Gratis';
  $('#sumTot').textContent = eur(tot); $('#sumTotSmall').textContent = eur(tot);
  $('#shipCost').textContent = sub >= FREE_FROM ? 'Gratis' : eur(SHIP);
  $('#sumFree').textContent = pick ? 'Nessun costo di spedizione: Lucilla ti scrive per fissare il ritiro.' : sub >= FREE_FROM ? 'La spedizione è gratuita.' : `Aggiungi ${eur(FREE_FROM - sub)} per la spedizione gratuita.`;
  $('#payBtn').textContent = 'Paga ' + eur(tot);
}
function syncDelivery() {
  const pick = coForm.ship.value === 'ritiro';
  $('#addr').hidden = pick; $('#pick').hidden = !pick; $('#payPick').hidden = !pick;
  $$('#addr [data-req]').forEach(i => i.required = !pick);
  ['pnome', 'pcognome'].forEach(n => coForm[n].required = pick);
  if (!pick && coForm.pay.value === 'ritiro') coForm.pay.value = 'carta';
  $('#cardBox').hidden = coForm.pay.value !== 'carta';
  coForm.cf.required = coForm.fattura.checked; $('#invoice').hidden = !coForm.fattura.checked;
  updateTotals();
}
$$('#addr input[required]').forEach(i => i.dataset.req = '1');
coForm.addEventListener('change', syncDelivery);
coForm.prov.addEventListener('input', e => e.target.value = e.target.value.toUpperCase());
coForm.cap.addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g, ''));
coForm.addEventListener('focusout', e => { const l = e.target.closest('.fl'); if (l && e.target.value) l.classList.toggle('bad', !e.target.checkValidity()); });
coForm.addEventListener('input', e => { const l = e.target.closest('.fl'); if (l && l.classList.contains('bad') && e.target.checkValidity()) l.classList.remove('bad'); });
$('#sumToggle').addEventListener('click', () => { const s = $('#coSum'), o = !s.classList.contains('open'); s.classList.toggle('open', o); $('#sumToggle').setAttribute('aria-expanded', o); $('#sumToggle').firstChild.textContent = o ? 'Nascondi il riepilogo ' : 'Mostra il riepilogo '; });
coForm.addEventListener('submit', e => {
  e.preventDefault();
  let first = null;
  $$('input, select, textarea', coForm).forEach(i => {
    const ok = i.checkValidity(), l = i.closest('.fl') || i.closest('.chk');
    if (l) l.classList.toggle('bad', !ok);
    if (!ok && !first) first = i;
  });
  if (first) {
    $('#coErr').textContent = 'Controlla i campi segnati in rosso.';
    (lenis ? lenis.scrollTo(first, { offset: -140, duration: 1 }) : first.scrollIntoView({ block: 'center' }));
    setTimeout(() => first.focus({ preventScroll: true }), 500);
    return;
  }
  $('#coErr').textContent = '';
  const f = new FormData(coForm), pick = f.get('ship') === 'ritiro';
  const lines = Object.entries(cart).filter(([id]) => byId(id)).map(([id, q]) => `${q} x ${byId(id).name}`).join(', ');
  const tot = total() + shipping();
  const payTxt = { carta: 'carta', paypal: 'PayPal', bonifico: 'bonifico bancario', ritiro: 'pagamento al ritiro' }[f.get('pay')];
  const who = pick ? `${f.get('pnome')} ${f.get('pcognome')}` : `${f.get('nome')} ${f.get('cognome')}`;
  const where = pick ? 'Ritiro al Mulino, Via della Torre 17, Roncobilaccio' : `${f.get('via')}${f.get('via2') ? ', ' + f.get('via2') : ''}, ${f.get('cap')} ${f.get('citta')} (${f.get('prov')})`;
  const done = $('#coDone');
  done.innerHTML = `<span class="sim">Simulazione della bozza</span>
    <h2>Grazie, ${(pick ? f.get('pnome') : f.get('nome'))}.</h2>
    <p>Nel sito vero a questo punto il pagamento viene confermato e ricevi la conferma all'indirizzo <b></b>. Qui non è stato addebitato niente e i dati non sono stati inviati.</p>
    <div class="recap"><h3>Prodotti</h3><p>${lines}</p><h3>Consegna</h3><p class="r-where"></p><h3>Pagamento</h3><p>${payTxt}, totale ${eur(tot)}</p></div>
    <a href="#bottega" data-go="bottega" class="oval">Torna allo shop</a>`;
  $('b', done).textContent = f.get('email'); $('.r-where', done).textContent = `${who}, ${where}`;
  $('#coGrid').hidden = true; done.hidden = false;
  $('#coTitle').textContent = 'Ordine ricevuto'; $('.co-lead').hidden = true;
  cart = {}; save(); renderCart();
  toTop();
  if (!RM) gsap.from('#coDone > *', { y: 40, opacity: 0, stagger: .08, duration: 1, ease: 'expo.out' });
});

/* ================= cartoline della storia: trascinamento con il mouse ================= */
let cardsDragged = false;
{
  const c = $('#cards');
  let down = false, sx = 0, sl = 0, lx = 0, lt = 0, v = 0, raf = 0;
  c.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    down = true; cardsDragged = false; sx = lx = e.clientX; sl = c.scrollLeft; lt = performance.now(); v = 0;
    cancelAnimationFrame(raf); c.classList.add('grabbing');
  });
  addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - sx; if (Math.abs(dx) > 6) cardsDragged = true;
    c.scrollLeft = sl - dx;
    const now = performance.now(); v = (e.clientX - lx) / Math.max(now - lt, 8); lx = e.clientX; lt = now;
  });
  addEventListener('pointerup', () => {
    if (!down) return; down = false;
    // inerzia, poi l'aggancio alla cartolina più vicina
    const glide = () => { if (Math.abs(v) < .02) { c.classList.remove('grabbing'); return; } c.scrollLeft -= v * 16; v *= .93; raf = requestAnimationFrame(glide); };
    glide();
    setTimeout(() => { cardsDragged = false; }, 50);
  });
  c.addEventListener('click', e => { if (cardsDragged) { e.stopPropagation(); e.preventDefault(); } }, true);
  c.addEventListener('dragstart', e => e.preventDefault());
}

/* ================= toast ================= */
const tEl = $('#toast'); let tTl;
gsap.set(tEl, { xPercent: -50, yPercent: 160 });
function toast(m) { tEl.textContent = m; tTl && tTl.kill(); tTl = gsap.timeline().to(tEl, { yPercent: 0, autoAlpha: 1, duration: .6, ease: 'back.out(1.7)' }).to(tEl, { yPercent: 160, autoAlpha: 0, duration: .4, ease: 'power2.in' }, '+=2'); }

/* ================= eventi ================= */
document.addEventListener('click', e => {
  const t = e.target.closest('a, button, [data-prod], [data-era]');
  if (!t) return;
  if (t.matches('[data-tab]')) { promoTab = t.dataset.tab; promoList(); return; }
  if (t.matches('[data-close-promo]')) { closePromo(); return; }
  if (t.matches('[data-promo-add]')) { addToCart(t.dataset.promoAdd, 1, $('img', t.closest('.pitem'))); return; }
  if (t.matches('[data-promo-go]')) { closePromo(); quickView(t.dataset.promoGo); return; }
  if (t.matches('[data-qv-q]')) { const q = $('#qvQty'); q.textContent = Math.max(1, +q.textContent + +t.dataset.qvQ); gsap.fromTo(q, { scale: 1.5 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.4)' }); return; }
  if (t.matches('[data-qv-add]')) { const el = $('#qvJar'), q = +$('#qvQty').textContent; closeModal(); addToCart(t.dataset.qvAdd, q, el); return; }
  if (t.matches('[data-qv-page]')) { const id = t.dataset.qvPage; closeModal(); setTimeout(() => go('prodotto-' + id), 300); return; }
  if (t.matches('[data-open-promo]')) { e.preventDefault(); openPromo(true); return; }
  if (t.matches('[data-add]')) { addToCart(t.dataset.add, +$('#qty').textContent, $('.pdp-stage .float')); return; }
  if (t.matches('[data-q]')) { const q = $('#qty'); q.textContent = Math.max(1, +q.textContent + +t.dataset.q); gsap.fromTo(q, { scale: 1.5 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.4)' }); return; }
  if (t.matches('[data-inc]')) { cart[t.dataset.inc]++; save(); renderCart(); return; }
  if (t.matches('[data-dec]')) { const id = t.dataset.dec; if (--cart[id] <= 0) delete cart[id]; save(); renderCart(); return; }
  if (t.matches('[data-open-cart]')) { if (menuOpen) toggleMenu(false); openCart(); return; }
  if (t.matches('[data-close-cart]')) { closeCart(); return; }
  if (t.matches('[data-close-modal]')) { closeModal(); return; }
  if (t.matches('[data-gift]')) { formModal('gift'); return; }
  if (t.matches('[data-contact]')) { e.preventDefault(); if (menuOpen) toggleMenu(false); formModal('contact'); return; }
  if (t.id === 'checkout') { if (!count()) { toast('Il carrello è vuoto'); return; } closeCart(); go('pagamento'); return; }
  if (t.matches('[data-express]')) { toast(`${t.dataset.express}: nella bozza il pagamento rapido non è attivo`); return; }
  if (t.id === 'cardsNext') { const c = $('#cards'); c.scrollBy({ left: c.clientWidth * .6, behavior: RM ? 'auto' : 'smooth' }); return; }
  if (t.matches('[data-f]')) {
    $$('#filters button').forEach(b => b.setAttribute('aria-pressed', b === t));
    const g = $('#pgrid');
    if (RM) { renderGrid(t.dataset.f); return; }
    renderGrid(t.dataset.f); gsap.fromTo(g, { y: 40 }, { y: 0, duration: .9, ease: 'expo.out' }); ScrollTrigger.refresh();
    return;
  }
  if (t.matches('[data-era]')) { if (cardsDragged) return; eraModal(+t.dataset.era); return; }
  if (t.matches('[data-prod]')) { e.preventDefault(); if (cardsDragged) return; quickView(t.dataset.prod); return; }
  if (t.matches('[data-go]')) { e.preventDefault(); const to = t.dataset.to; if (drawerOpen) closeCart(); if (menuOpen) { toggleMenu(false); setTimeout(() => go(t.dataset.go, to), 500); } else go(t.dataset.go, to); return; }
  if (t.matches('[data-to]')) { e.preventDefault(); const el = document.getElementById(t.dataset.to); el && scrollToEl(el); return; }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (promoOpen) closePromo(); else if (modalOpen) closeModal(); else if (drawerOpen) closeCart(); else if (menuOpen) toggleMenu(false); }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-prod], [data-era]')) { e.preventDefault(); e.target.click(); }
});
scrim.addEventListener('click', () => { if (modalOpen) closeModal(); else closeCart(); });
let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (!$('#v-home').hidden) fitHero(); ScrollTrigger.refresh(); }, 200); });


/* ================= puntatore ================= */
{
  const cur = $('#cursor');
  if (!RM && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.documentElement.classList.add('has-cursor');
    const lab = $('.c-label', cur);
    const drag = '<svg viewBox="0 0 34 20" aria-hidden="true"><path d="M4 10h26M4 10l5-5M4 10l5 5M30 10l-5-5M30 10l-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const RULES = [['.pdp-stage .float, .qv-jar', drag + 'Trascina'], ['.prod, .shelf .jarbox, .pthumb', 'Apri'], ['.cards', drag + 'Trascina']];
    // la targhetta segue la freccia senza ritardo, spostata in basso a destra per non coprire il punto del click
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; cur.classList.remove('off');
    }, { passive: true });
    document.addEventListener('pointerover', e => {
      const rule = RULES.find(([sel]) => e.target.closest(sel));
      cur.classList.toggle('label', !!rule);
      if (rule) lab.innerHTML = rule[1];
    });
    document.documentElement.addEventListener('pointerleave', () => cur.classList.add('off'));
  }
}


/* ================= mappa (Leaflet + OpenStreetMap), caricata solo quando ci si avvicina ================= */
{
  // posizione indicativa: fine di Via la Torre, verso il torrente Gambellato (da confermare con Lucilla)
  const MULINO = [44.1225, 11.2212];
  let started = false;
  const load = (tag, attrs) => new Promise((ok, ko) => { const el = document.createElement(tag); Object.assign(el, attrs); el.onload = ok; el.onerror = ko; document.head.appendChild(el); });
  async function initMap() {
    if (started) return; started = true;
    try {
      await Promise.all([
        load('link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css' }),
        load('script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js' })
      ]);
      const touch = matchMedia('(pointer: coarse)').matches;
      const map = L.map('map', { scrollWheelZoom: false, dragging: !touch, tap: false, zoomControl: true }).setView(MULINO, 14);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      const icon = L.divIcon({ className: 'pin-mdf', iconSize: [54, 66], iconAnchor: [27, 64], popupAnchor: [0, -58],
        html: '<svg viewBox="0 0 54 66"><path d="M27 64S4 40 4 25a23 23 0 0 1 46 0c0 15-23 39-23 39Z" fill="#f2b33d" stroke="#151310" stroke-width="2.5"/><g transform="translate(13 11) scale(.28)" color="#151310"><use href="#i-macina"/></g></svg>' });
      L.marker(MULINO, { icon, title: 'Mulino del Frate' }).addTo(map)
        .bindPopup('<b>Mulino del Frate</b>Via della Torre 17, Roncobilaccio<br>sul torrente Gambellato').openPopup();
      // la mappa trascinabile con un dito solo bloccherebbe lo scroll della pagina: su touch si sposta con i pulsanti + e -
      setTimeout(() => map.invalidateSize(), 400);
    } catch (e) { $('#mapFallback').hidden = false; }
  }
  const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); initMap(); } }, { rootMargin: '600px' });
  io.observe($('#map'));
}

/* ================= avvio ================= */
renderCart();
const heroImg = $('#heroImg');
const ready = Promise.all([document.fonts.ready, heroImg.complete ? 1 : new Promise(r => { heroImg.onload = r; heroImg.onerror = r; setTimeout(r, 3500); })]);
ready.then(() => {
  const r = parse();
  const w = new SplitText(cWord, { type: 'chars', mask: 'chars' });
  show(r, true);
  if (RM) { curtain.style.display = 'none'; return; }
  lock(true);
  gsap.timeline({ onComplete: () => { lock(false); w.revert(); } })
    .from(w.chars, { yPercent: 110, duration: .9, ease: 'expo.out', stagger: .03 })
    .to(w.chars, { yPercent: -110, duration: .6, ease: 'expo.in', stagger: .015 }, '+=.25')
    .to(curtain, { yPercent: -100, borderRadius: '0 0 40px 40px', duration: 1.1, ease: 'expo.inOut' }, '-=.2')
    .set(curtain, { display: 'none' });
});
}
