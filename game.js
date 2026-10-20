(() => {
'use strict';

/* =========================================================
   Constants
   ========================================================= */
const ROUND = 90;          // seconds per round
const PILE_MAX = 6;        // dishes beyond this overflow
const SCRUB_N = 3;         // taps per dish
const FAIL_PENALTY = 50;
const RANKS = [
  {r:'S', min:10000, color:'#ffb703', msg:'段取りの神。家事も仕事も無双です。'},
  {r:'A', min:7000,  color:'#fb8500', msg:'見事な同時進行。かなりの段取り上手!'},
  {r:'B', min:4500,  color:'#14b8a6', msg:'いい流れ。待ち時間をもっと使い倒そう。'},
  {r:'C', min:2500,  color:'#4f7cff', msg:'まずは時間のかかる作業から始めてみよう。'},
  {r:'D', min:0,     color:'#8a84a3', msg:'ウォームアップ完了。次が本番!'},
];

/* =========================================================
   SVG
   ========================================================= */
const ICON = {
  bell:'<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a1.5 1.5 0 0 1 1.5 1.5v.6A6.5 6.5 0 0 1 18.5 10.5v4l1.8 2.4a1 1 0 0 1-.8 1.6h-15a1 1 0 0 1-.8-1.6l1.8-2.4v-4a6.5 6.5 0 0 1 5-6.4v-.6A1.5 1.5 0 0 1 12 2zm-2.5 17.5h5a2.5 2.5 0 0 1-5 0z"/></svg>',
  pause:'<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/></svg>',
  soundOn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  soundOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
  trophy:'<svg viewBox="0 0 24 24"><path fill="#ffb703" stroke="#2a2740" stroke-width="1.6" stroke-linejoin="round" d="M7 3h10v5a5 5 0 0 1-10 0zM7 5H4v1.5A3.5 3.5 0 0 0 7.5 10M17 5h3v1.5A3.5 3.5 0 0 1 16.5 10M10 13.5h4l.5 3.5h-5zM8 17h8v3H8z"/></svg>',
};

const LOGO = `<svg viewBox="0 0 120 120">
  <rect x="6" y="6" width="108" height="108" rx="28" fill="#2d2766"/>
  <g fill="none" stroke-width="9" stroke-linecap="round">
    <circle cx="40" cy="40" r="16" stroke="rgba(255,255,255,.15)"/>
    <circle cx="40" cy="40" r="16" stroke="#14b8a6" stroke-dasharray="75 101" transform="rotate(-90 40 40)"/>
    <circle cx="80" cy="40" r="16" stroke="rgba(255,255,255,.15)"/>
    <circle cx="80" cy="40" r="16" stroke="#fb8500" stroke-dasharray="45 101" transform="rotate(-90 80 40)"/>
    <circle cx="40" cy="80" r="16" stroke="rgba(255,255,255,.15)"/>
    <circle cx="40" cy="80" r="16" stroke="#ef476f" stroke-dasharray="90 101" transform="rotate(-90 40 80)"/>
    <circle cx="80" cy="80" r="16" stroke="#ffb703"/>
  </g>
  <path d="M72 80l6 6 10-12" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const flame = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-7 0C-11-7-6-14 0-19C1-13 5-11 5-11C7-14 6-17 5-20C11-14 12-6 7 0Z"/><path class="in" d="M-3 0C-5-4-2-7 0-10C1-6 3-5 3-5C5-3 4-1 3 0Z"/></g>`;

const ART = {
  washer: `<svg viewBox="0 0 120 120" class="art washer-art">
    <ellipse class="shadow" cx="60" cy="114" rx="40" ry="4"/>
    <g class="wbody">
    <rect class="w-body" x="20" y="8" width="80" height="104" rx="12"/>
    <path class="w-panel" d="M20 32V20A12 12 0 0 1 32 8h56a12 12 0 0 1 12 12v12z"/>
    <circle class="w-knob" cx="35" cy="20" r="6"/>
    <rect class="led" x="58" y="16" width="30" height="8" rx="4"/>
    <circle class="w-rim" cx="60" cy="72" r="31"/>
    <circle class="w-glass" cx="60" cy="72" r="24"/>
    <g class="drum">
      <path class="cl-a" d="M43 77c6-7 11-7 17-2s11 5 17-2v7c-6 7-11 7-17 2s-11-5-17 2z"/>
      <circle class="cl-b" cx="53" cy="63" r="7"/>
      <rect class="cl-c" x="61" y="59" width="13" height="10" rx="3"/>
    </g>
    <g class="bubbles"><circle cx="48" cy="86" r="3"/><circle cx="68" cy="66" r="2.5"/><circle cx="72" cy="84" r="2"/></g>
    <path class="shine" d="M44 60a20 20 0 0 1 12-10"/>
    </g>
  </svg>`,
  rice: `<svg viewBox="0 0 120 120" class="art rice-art">
    <ellipse class="shadow" cx="60" cy="112" rx="42" ry="4"/>
    <g class="steam"><path d="M46 24c-5-5 5-9 0-14"/><path d="M60 20c-5-5 5-9 0-14"/><path d="M74 24c-5-5 5-9 0-14"/></g>
    <path class="r-body" d="M20 58q0-6 6-6h68q6 0 6 6v34q0 16-16 16H36q-16 0-16-16z"/>
    <g class="grains"><ellipse class="grain" cx="40" cy="50" rx="3" ry="1.8"/><ellipse class="grain" cx="50" cy="48" rx="3" ry="1.8"/><ellipse class="grain" cx="62" cy="50" rx="3" ry="1.8"/><ellipse class="grain" cx="72" cy="48" rx="3" ry="1.8"/><ellipse class="grain" cx="82" cy="50" rx="3" ry="1.8"/><ellipse class="grain" cx="56" cy="45" rx="3" ry="1.8"/><ellipse class="grain" cx="68" cy="44" rx="3" ry="1.8"/></g>
    <g class="lid"><path class="r-lid" d="M18 54q2-24 42-24t42 24z"/><rect class="r-handle" x="48" y="25" width="24" height="8" rx="4"/></g>
    <rect class="r-panel" x="40" y="66" width="40" height="24" rx="7"/>
    <circle class="led" cx="51" cy="78" r="4.5"/>
    <rect class="r-btn" x="60" y="74" width="13" height="8" rx="3"/>
  </svg>`,
  stove: `<svg viewBox="0 0 120 120" class="art stove-art">
    <rect class="s-top" x="6" y="96" width="108" height="16" rx="6"/>
    <rect class="s-knob" x="14" y="100" width="10" height="8" rx="2"/>
    <rect class="s-knob" x="96" y="100" width="10" height="8" rx="2"/>
    <g class="flame">${flame(38, 97, .9)}${flame(56, 97)}${flame(74, 97, .9)}</g>
    <path class="p-handle" d="M92 70l20-8a3.5 3.5 0 0 1 2.6 6.5L94 77z"/>
    <ellipse class="p-pan" cx="56" cy="70" rx="40" ry="13"/>
    <ellipse class="p-in" cx="56" cy="67" rx="34" ry="9"/>
    <g class="egg"><path class="e-white" d="M36 67c0-6 8-8 16-7 8-3 18-1 20 4s-2 8-12 9-24 0-24-6z"/><ellipse class="e-yolk" cx="54" cy="65" rx="7" ry="4.5"/><ellipse class="e-shine" cx="52" cy="63.6" rx="2.4" ry="1.2"/></g>
    <g class="smoke"><path d="M44 54c-4-4 4-8 0-12"/><path d="M66 52c-4-4 4-8 0-12"/></g>
  </svg>`,
  kettle: `<svg viewBox="0 0 120 120" class="art kettle-art">
    <rect class="s-top" x="10" y="100" width="100" height="12" rx="5"/>
    <g class="flame">${flame(46, 101, .7)}${flame(60, 101, .8)}${flame(74, 101, .7)}</g>
    <g class="kbody">
      <path class="k-handle" d="M38 46q22-30 44 0"/>
      <path class="k-spout" d="M82 72l20-20 5 4-19 24z"/>
      <path class="k-body" d="M34 98q-8 0-6-8l7-36q2-10 25-10t25 10l7 36q2 8-6 8z"/>
      <path class="k-band" d="M31 80h58"/>
      <rect class="k-lid" x="46" y="38" width="28" height="8" rx="4"/>
      <circle class="k-knob" cx="60" cy="34" r="4.5"/>
      <path class="shine" d="M40 60l-3 16"/>
    </g>
    <g class="steam"><path d="M106 48c-4-4 4-8 0-12"/><path d="M112 44c-4-4 4-8 0-12"/><path d="M100 44c-4-4 4-8 0-12"/></g>
  </svg>`,
  sink: `<svg viewBox="0 0 120 120" class="art sink-art">
    <rect class="water" x="62" y="28" width="5" height="70" rx="2"/>
    <path class="sk-faucet" d="M88 62V30q0-10-10-10H62v8h12q4 0 4 4v30z"/>
    <rect class="sk-counter" x="4" y="62" width="112" height="10" rx="3"/>
    <path class="sk-basin" d="M14 72h92l-6 32q-1 6-7 6H27q-6 0-7-6z"/>
    <g class="plates"></g>
    <g class="foam"><circle cx="38" cy="0" r="4"/><circle cx="45" cy="-3" r="5"/><circle cx="54" cy="-1" r="4"/><circle cx="61" cy="-3" r="3"/></g>
  </svg>`,
};

/* =========================================================
   Station definitions
   ========================================================= */
const DEFS = [
  {id:'washer', name:'洗濯機', key:'1', run:12, win:8,   perf:2.5, base:150, prep:0,
   txt:{request:'タップで洗濯スタート', running:'洗濯中', done:'取り出して!'},
   fail:'シワシワに…', reqFail:'洗濯が遅れた!',
   how:'12秒。時間がかかるので最初に'},
  {id:'rice', name:'炊飯器', key:'2', run:10, win:8, perf:2.5, base:150, prep:4,
   txt:{request:'連打で米を研ぐ', prep:'米を研ぐ', running:'炊飯中', done:'ほぐして!'},
   fail:'ご飯がカチカチ…', reqFail:'炊き忘れた!',
   how:'4回タップで研いで10秒'},
  {id:'stove', name:'目玉焼き', key:'3', run:5, win:2.8, perf:1.1, base:130, prep:0,
   txt:{request:'タップで卵を割る', running:'焼いています', done:'今だ! 皿へ'},
   fail:'焦げた!', reqFail:'朝ごはんが遅い!',
   how:'5秒。すぐ焦げるので注意'},
  {id:'kettle', name:'やかん', key:'4', run:7, win:3.5, perf:1.4, base:120, prep:0,
   txt:{request:'タップで火にかける', running:'沸かしています', done:'火を止めて!'},
   fail:'吹きこぼれた!', reqFail:'お茶が遅い!',
   how:'7秒。鳴ったら止める'},
];
const SINK = {id:'sink', name:'皿洗い', key:'5', how:'3回こすって1枚。隙間時間に'};
const ALL = [...DEFS, SINK];

/* =========================================================
   Helpers
   ========================================================= */
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * clamp(t, 0, 1);
const rand = (a, b) => a + Math.random() * (b - a);
const fmt = n => Math.round(n).toLocaleString('ja-JP');

const store = {
  get(k, d){ try { const v = localStorage.getItem('dandori.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v){ try { localStorage.setItem('dandori.' + k, JSON.stringify(v)); } catch {} },
};

/* =========================================================
   Sound (WebAudio synth, no assets)
   ========================================================= */
const Sfx = (() => {
  let ctx = null, master = null, noiseBuf = null;
  let muted = store.get('muted', false);
  function ensure(){
    try {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = .6; master.connect(ctx.destination);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate * .3, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
    } catch {}
  }
  function tone(f, dur, type = 'sine', vol = .15, when = 0, slide = 0){
    if (muted || !ctx) return;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t + dur);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(master); o.start(t); o.stop(t + dur + .03);
  }
  function noise(dur, vol, freq = 2000, when = 0){
    if (muted || !ctx) return;
    const t = ctx.currentTime + when;
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + dur + .02);
  }
  return {
    ensure,
    get muted(){ return muted; },
    toggle(){ muted = !muted; store.set('muted', muted); if (!muted) ensure(); return muted; },
    tap(){ tone(520, .05, 'triangle', .07); },
    nope(){ tone(200, .07, 'square', .04); },
    bell(){ tone(1175, .12, 'sine', .08); tone(1568, .18, 'sine', .07, .09); },
    start(){ tone(392, .14, 'triangle', .1, 0, 2); },
    prep(){ noise(.07, .12, 3000); tone(700 + Math.random() * 200, .04, 'triangle', .05); },
    ding(){ tone(1046, .16, 'sine', .12); tone(1568, .3, 'sine', .1, .12); },
    whistle(){ tone(1800, .5, 'sine', .07, 0, 1.08); },
    good(){ tone(660, .1, 'triangle', .11); tone(990, .16, 'triangle', .11, .07); },
    perfect(){ [784, 988, 1175, 1568].forEach((f, i) => tone(f, .16, 'triangle', .11, i * .05)); tone(2093, .3, 'sine', .06, .2); },
    scrub(){ noise(.06, .14, 2600 + Math.random() * 800); },
    dish(){ tone(1400, .08, 'sine', .08); tone(2100, .12, 'sine', .06, .05); },
    fail(){ tone(220, .32, 'sawtooth', .09, 0, .5); tone(160, .4, 'square', .05, .05, .6); },
    triple(){ [523, 659, 784].forEach((f, i) => tone(f, .14, 'square', .06, i * .07)); },
    full(){ [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, .18, 'square', .06, i * .07)); tone(1568, .5, 'triangle', .1, .38); },
    tick(){ tone(1200, .04, 'square', .04); },
    count(){ tone(660, .12, 'triangle', .12); },
    go(){ tone(1046, .3, 'triangle', .14); },
    end(){ [784, 659, 523, 392].forEach((f, i) => tone(f, .2, 'triangle', .1, i * .1)); },
    fanfare(){ [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, .2, 'triangle', .1, i * .11)); },
  };
})();

/* =========================================================
   Particles
   ========================================================= */
const FX = (() => {
  const c = $('#fx'), ctx = c.getContext('2d');
  let ps = [], dpr = 1;
  function resize(){
    dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  }
  addEventListener('resize', resize); resize();
  function burst(x, y, n, colors, power = 1){
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = rand(120, 420) * power;
      ps.push({x, y, vx:Math.cos(a) * sp, vy:Math.sin(a) * sp - 160 * power,
        life:0, max:rand(.5, 1.1), s:rand(4, 9), c:colors[i % colors.length],
        rot:Math.random() * 6, vr:rand(-10, 10), sq:Math.random() < .5});
    }
  }
  function rain(n, colors){
    for (let i = 0; i < n; i++) {
      ps.push({x:Math.random() * innerWidth, y:-20 - Math.random() * 200, vx:rand(-60, 60), vy:rand(60, 220),
        life:0, max:rand(2, 3.5), s:rand(6, 11), c:colors[i % colors.length],
        rot:Math.random() * 6, vr:rand(-6, 6), sq:true, g:120});
    }
  }
  function step(dt){
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ps = ps.filter(p => (p.life += dt) < p.max);
    for (const p of ps) {
      p.vy += (p.g ?? 900) * dt; p.vx *= .99;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      ctx.globalAlpha = 1 - (p.life / p.max) ** 2;
      ctx.fillStyle = p.c;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      if (p.sq) ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      else { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  return {burst, rain, step};
})();

/* =========================================================
   DOM build
   ========================================================= */
const board = $('#board');
const refs = [];
const ui = {
  score:$('#score'), time:$('#time'), timeBox:$('#timeBox'), mult:$('#mult'), multiBox:$('#multiBox'),
  pips:[...document.querySelectorAll('#pips i')], combo:$('#combo'), comboBox:$('#comboBox'),
};

function buildBoard(){
  board.innerHTML = '';
  ALL.forEach((d, i) => {
    const el = document.createElement('div');
    el.className = 'station s-idle ' + d.id;
    el.style.setProperty('--area', d.id);
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', d.name);
    el.innerHTML = `<div class="st-head"><span class="key">${d.key}</span><span class="name">${d.name}</span><span class="tag">${ICON.bell}依頼</span></div>
      <div class="st-art">${ART[d.id]}</div>
      <div class="st-status"></div>
      <div class="st-bar"><i class="zone"></i><i class="fill"></i></div>`;
    el.addEventListener('pointerdown', e => { e.preventDefault(); tap(i); });
    board.appendChild(el);
    refs[i] = {el, cls:'', status:el.querySelector('.st-status'), statusHTML:'',
      bar:el.querySelector('.st-bar'), fill:el.querySelector('.fill'), zone:el.querySelector('.zone'),
      plates:el.querySelector('.plates'), foam:el.querySelector('.foam')};
  });
}

function buildHow(){
  $('#howGrid').innerHTML = ALL.map(d =>
    `<div class="how-item demo">${ART[d.id]}<b>${d.name}</b>${d.how}</div>`).join('');
}

/* =========================================================
   Game state
   ========================================================= */
let G = null;

function newGame(){
  G = {
    t:0, score:0, disp:0, combo:0, maxCombo:0, done:0, perfect:0, fails:0, dishes:0,
    maxRun:0, triples:0, fulls:0, running:false, paused:false, over:false,
    spawnT:2.2, pileT:4, pile:2, scrub:0, water:0, lastSec:ROUND,
    st:DEFS.map(d => ({d, state:'idle', t:0, req:null, prepN:0, quick:0, cool:0, flash:0})),
  };
  // Teach the core idea right away: two long jobs at once.
  request(G.st[0], 12); request(G.st[1], 12);
  renderPlates();
}

const progress = () => G.t / ROUND;
const runningCount = () => G.st.reduce((n, s) => n + (s.state === 'running'), 0);
const multiMult = () => 1 + .5 * runningCount();
const comboMult = () => 1 + Math.min(G.combo, 30) * .03;
const totalMult = () => multiMult() * comboMult();

function request(s, limit){
  s.state = 'request'; s.t = 0; s.prepN = 0;
  const l = limit ?? lerp(10, 6.5, progress());
  s.req = {left:l, total:l};
}

function spawn(){
  const free = G.st.filter(s => s.state === 'idle' && s.cool <= 0);
  if (!free.length) return;
  request(free[Math.random() * free.length | 0]);
  Sfx.bell();
}

function addDish(){
  G.pile++;
  if (G.pile > PILE_MAX) {
    G.pile = PILE_MAX - 2; G.scrub = 0;
    failCommon(refs[4].el, '皿があふれた!');
  }
  renderPlates();
}

/* ---------- actions ---------- */
function tap(i){
  if (!G || !G.running || G.paused) return;
  Sfx.ensure();
  const el = refs[i].el;
  el.classList.remove('press'); void el.offsetWidth; el.classList.add('press');
  setTimeout(() => el.classList.remove('press'), 90);
  if (i === 4) return scrub();

  const s = G.st[i];
  switch (s.state) {
    case 'request':
      if (s.d.prep) { s.state = 'prep'; s.prepN = 0; }
      else { start(s); break; }
      // falls through
    case 'prep':
      s.prepN++; Sfx.prep();
      sparkAt(el, 6, ['#fff', '#cfe8ff', '#ffe9a8'], .5);
      if (s.prepN >= s.d.prep) start(s);
      break;
    case 'done': collect(s); break;
    default: Sfx.nope();
  }
}

function start(s){
  s.quick = Math.round(60 * clamp(s.req.left / s.req.total, 0, 1));
  s.req = null; s.state = 'running'; s.t = 0;
  Sfx.start();
  const el = elOf(s);
  popup(el, s.quick >= 45 ? ['START', 'QUICK +' + s.quick] : ['START'], 'small');
  const r = runningCount();
  G.maxRun = Math.max(G.maxRun, r);
  if (r === 4) {
    G.fulls++; addScore(300);
    banner('FULL DANDORI!', '4つ同時進行 +300', 'gold');
    Sfx.full();
    FX.rain(80, ['#ffb703', '#fb8500', '#14b8a6', '#ef476f', '#fff']);
  } else if (r === 3) {
    G.triples++; addScore(100);
    banner('TRIPLE TASK!', '3つ同時進行 +100', 'orange');
    Sfx.triple();
  }
}

function collect(s){
  const perfect = s.t <= s.d.perf;
  const mm = multiMult(), m = mm * comboMult();
  const base = s.d.base + s.quick + (perfect ? Math.round(s.d.base * .5) : 0);
  const pts = Math.round(base * m);
  addScore(pts);
  G.combo++; G.maxCombo = Math.max(G.maxCombo, G.combo); G.done++;
  if (perfect) G.perfect++;
  s.state = 'idle'; s.t = 0; s.cool = .8;

  const el = elOf(s);
  const subs = [];
  if (perfect) subs.push('<span class="sub pf">PERFECT</span>');
  if (mm > 1) subs.push(`<span class="sub">MULTI x${mm.toFixed(1)}</span>`);
  popupRaw(el, `<div class="main">+${fmt(pts)}</div>${subs.join('')}`, perfect ? 'perfect' : 'good');
  if (perfect) { Sfx.perfect(); sparkAt(el, 36, ['#ffb703', '#ffd166', '#fff', '#fb8500'], 1.1); }
  else { Sfx.good(); sparkAt(el, 18, ['#06d6a0', '#14b8a6', '#fff'], .8); }
  bumpHud();
}

function scrub(){
  if (G.pile <= 0) { Sfx.nope(); return; }
  G.scrub++; G.water = .3; Sfx.scrub();
  const el = refs[4].el;
  sparkAt(el, 4, ['#fff', '#d6ecff'], .4);
  if (G.scrub >= SCRUB_N) {
    G.scrub = 0; G.pile--; G.dishes++;
    G.combo++; G.maxCombo = Math.max(G.maxCombo, G.combo);
    const mm = multiMult();
    const pts = Math.round(30 * mm * comboMult());
    addScore(pts);
    popupRaw(el, `<div class="main">+${fmt(pts)}</div>${mm > 1 ? `<span class="sub">MULTI x${mm.toFixed(1)}</span>` : ''}`, 'dish');
    Sfx.dish();
    sparkAt(el, 10, ['#8b5cf6', '#c4b5fd', '#fff'], .6);
    renderPlates();
    bumpHud();
  }
  renderFoam();
}

function fail(s, msg){
  s.state = 'idle'; s.t = 0; s.req = null; s.flash = .5; s.cool = 1.5;
  failCommon(elOf(s), msg);
}
function failCommon(el, msg){
  G.fails++; G.combo = 0;
  G.score = Math.max(0, G.score - FAIL_PENALTY);
  popupRaw(el, `<div class="main">${msg}</div><span class="sub">-${FAIL_PENALTY}</span>`, 'bad');
  Sfx.fail();
  board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake');
  if (el === refs[4].el) { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 450); }
}

function addScore(n){ G.score += n; }

/* ---------- update ---------- */
function update(dt){
  G.t += dt;
  const p = progress();

  G.spawnT -= dt;
  if (G.spawnT <= 0) { spawn(); G.spawnT = lerp(6, 3, p) * rand(.8, 1.2); }

  G.pileT -= dt;
  if (G.pileT <= 0) { addDish(); G.pileT = lerp(5.5, 3, p) * rand(.85, 1.15); }

  G.water = Math.max(0, G.water - dt);

  for (const s of G.st) {
    s.t += dt;
    if (s.cool > 0) s.cool -= dt;
    if (s.flash > 0) s.flash -= dt;
    switch (s.state) {
      case 'request': case 'prep':
        s.req.left -= dt;
        if (s.req.left <= 0) fail(s, s.d.reqFail);
        break;
      case 'running':
        if (s.t >= s.d.run) {
          s.state = 'done'; s.t = 0;
          s.d.id === 'kettle' ? Sfx.whistle() : Sfx.ding();
        }
        break;
      case 'done':
        if (s.t >= s.d.win) fail(s, s.d.fail);
        break;
    }
  }

  const sec = Math.ceil(ROUND - G.t);
  if (sec !== G.lastSec) { G.lastSec = sec; if (sec <= 10 && sec > 0) Sfx.tick(); }
  if (G.t >= ROUND) endGame();
}

/* ---------- render ---------- */
function render(dt){
  G.disp += (G.score - G.disp) * Math.min(1, dt * 12);
  if (Math.abs(G.score - G.disp) < 1) G.disp = G.score;
  ui.score.textContent = fmt(G.disp);
  const left = Math.max(0, ROUND - G.t);
  ui.time.textContent = Math.ceil(left);
  ui.timeBox.classList.toggle('low', left <= 10 && !G.over);
  const r = runningCount();
  ui.pips.forEach((pip, i) => pip.classList.toggle('on', i < r));
  ui.multiBox.classList.toggle('lv3', r === 3);
  ui.multiBox.classList.toggle('lv4', r === 4);
  ui.mult.textContent = 'x' + totalMult().toFixed(1);
  ui.combo.textContent = G.combo;
  ui.comboBox.classList.toggle('hot', G.combo >= 10);

  G.st.forEach((s, i) => {
    const R = refs[i], d = s.d;
    let cls = 'station ' + d.id + ' s-' + s.state, status = '', w = 0, m = '', zone = 0;
    switch (s.state) {
      case 'idle': status = '依頼待ち'; break;
      case 'request': case 'prep': {
        const ratio = s.req.left / s.req.total;
        status = s.state === 'prep'
          ? `${d.txt.prep} <span class="dots">${dots(s.prepN, d.prep)}</span>`
          : d.txt.request;
        w = ratio; m = ratio < .35 ? 'urgent' : 'req';
        if (ratio < .35) cls += ' urgent';
        break;
      }
      case 'running':
        status = `${d.txt.running} ${Math.ceil(d.run - s.t)}秒`;
        w = s.t / d.run; m = 'run';
        break;
      case 'done': {
        const perf = s.t <= d.perf;
        status = perf ? 'PERFECT チャンス!' : d.txt.done;
        w = 1 - s.t / d.win; m = perf ? 'perf' : 'done';
        zone = d.perf / d.win;
        if (perf) cls += ' perf';
        break;
      }
    }
    if (s.flash > 0) cls += ' flash';
    if (cls !== R.cls) { R.el.className = cls; R.cls = cls; }
    if (status !== R.statusHTML) { R.status.innerHTML = status; R.statusHTML = status; }
    R.fill.style.width = (w * 100).toFixed(1) + '%';
    R.zone.style.width = (zone * 100).toFixed(1) + '%';
    if (R.bar.dataset.m !== m) R.bar.dataset.m = m;
  });

  // sink
  const R = refs[4];
  const warn = G.pile >= PILE_MAX - 1;
  const cls = 'station sink s-sink' + (warn ? ' warn' : '') + (G.water > 0 ? ' washing' : '') + (R.el.classList.contains('flash') ? ' flash' : '');
  if (cls !== R.cls) { R.el.className = cls; R.cls = cls; }
  const status = G.pile === 0 ? 'ピカピカ!'
    : `${warn ? 'あふれそう!' : '連打で洗う'}<span class="dots">${dots(G.scrub, SCRUB_N)}</span>残り${G.pile}枚`;
  if (status !== R.statusHTML) { R.status.innerHTML = status; R.statusHTML = status; }
  R.fill.style.width = (G.pile / (PILE_MAX + 1) * 100).toFixed(1) + '%';
  R.zone.style.width = '0%';
  const m = warn ? 'warn' : 'pile';
  if (R.bar.dataset.m !== m) R.bar.dataset.m = m;
}

const dots = (n, max) => Array.from({length:max}, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');
const elOf = s => refs[G.st.indexOf(s)].el;

function renderPlates(){
  let h = '';
  for (let k = 0; k < G.pile; k++) {
    const y = 100 - k * 7;
    h += `<g class="plate"><ellipse class="pl" cx="50" cy="${y}" rx="24" ry="6"/><ellipse class="pl-in" cx="50" cy="${y - .5}" rx="15" ry="3.4"/>`
      + `<circle class="dirt" cx="${42 + (k * 7) % 14}" cy="${y - 1}" r="1.8"/><circle class="dirt" cx="${58 - (k * 5) % 10}" cy="${y + .5}" r="1.3"/></g>`;
  }
  refs[4].plates.innerHTML = h;
  renderFoam();
}
function renderFoam(){
  const f = refs[4].foam;
  const show = G && G.pile > 0 && G.scrub > 0;
  f.style.display = show ? '' : 'none';
  if (show) f.setAttribute('transform', `translate(0 ${100 - (G.pile - 1) * 7 - 3})`);
}

/* ---------- feedback ---------- */
function centerOf(el){
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height * .45];
}
function popup(el, lines, kind){
  popupRaw(el, `<div class="main">${lines[0]}</div>${lines.slice(1).map(l => `<span class="sub">${l}</span>`).join('')}`, kind);
}
function popupRaw(el, html, kind){
  const [x, y] = centerOf(el);
  const p = document.createElement('div');
  p.className = 'pop ' + kind; p.innerHTML = html;
  p.style.left = x + 'px'; p.style.top = y + 'px';
  $('#popups').appendChild(p);
  setTimeout(() => p.remove(), 1000);
}
function sparkAt(el, n, colors, power){
  const [x, y] = centerOf(el);
  FX.burst(x, y, n, colors, power);
}
let bannerTimer = 0;
function banner(main, sub, color = ''){
  const b = $('#banner');
  b.className = ''; void b.offsetWidth;
  b.innerHTML = `<div class="b-main">${main}</div>${sub ? `<div class="b-sub">${sub}</div>` : ''}`;
  b.className = 'show ' + color;
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => { b.className = ''; }, 1600);
}
function bumpHud(){
  for (const v of [ui.score, ui.combo]) { v.classList.remove('bump'); void v.offsetWidth; v.classList.add('bump'); }
}

/* =========================================================
   Flow / screens
   ========================================================= */
const screens = ['titleScreen', 'howScreen', 'recScreen', 'pauseScreen', 'resultScreen'];
let backTo = 'titleScreen';
function show(id){
  screens.forEach(s => $('#' + s).classList.toggle('show', s === id));
}

let cdTimers = [];
function startGame(){
  Sfx.ensure();
  cdTimers.forEach(clearTimeout); cdTimers = [];
  newGame();
  show(null);
  const cd = $('#countdown');
  cd.classList.add('show');
  ['3', '2', '1', 'GO!'].forEach((txt, i) => {
    cdTimers.push(setTimeout(() => {
      cd.innerHTML = `<span>${txt}</span>`;
      txt === 'GO!' ? Sfx.go() : Sfx.count();
    }, i * 700));
  });
  cdTimers.push(setTimeout(() => {
    cd.classList.remove('show'); cd.innerHTML = '';
    G.running = true;
    Sfx.bell();
  }, 2900));
}

function pause(){
  if (!G || !G.running || G.paused) return;
  G.paused = true; show('pauseScreen');
}
function resume(){
  if (!G || !G.paused) return;
  G.paused = false; show(null);
}
function quit(){
  cdTimers.forEach(clearTimeout);
  $('#countdown').classList.remove('show');
  G = null; resetBoard(); refreshTitle(); show('titleScreen');
}

function endGame(){
  G.running = false; G.over = true; G.t = ROUND;
  Sfx.end();
  banner('TIME UP!', '', 'red');
  setTimeout(showResult, 1500);
}

function rankOf(score){ return RANKS.find(r => score >= r.min); }

function showResult(){
  if (!G) return;
  const score = G.score, rank = rankOf(score);
  const recs = store.get('records', []);
  const prevBest = recs.length ? recs[0].score : 0;
  const isNew = score > prevBest && score > 0;
  recs.push({score, rank:rank.r, date:new Date().toISOString(), done:G.done, perfect:G.perfect, maxCombo:G.maxCombo});
  recs.sort((a, b) => b.score - a.score);
  store.set('records', recs.slice(0, 10));

  $('#rankBadge').innerHTML = `<svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="54" fill="${rank.color}" stroke="#2a2740" stroke-width="5"/>
    <circle cx="60" cy="60" r="43" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="6 6" opacity=".7"/>
    <text x="60" y="62" text-anchor="middle" dominant-baseline="central" font-size="64" font-weight="800" fill="#fff" stroke="#2a2740" stroke-width="3" paint-order="stroke" font-family="'M PLUS Rounded 1c',sans-serif">${rank.r}</text></svg>`;
  $('#comment').textContent = rank.msg;
  $('#newRec').classList.toggle('show', isNew);
  const stats = [
    ['完了タスク', G.done], ['PERFECT', G.perfect], ['最大コンボ', G.maxCombo],
    ['最大同時進行', G.maxRun], ['洗った皿', G.dishes], ['ミス', G.fails],
  ];
  $('#stats').innerHTML = stats.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  const text = `段取りマスターで ${fmt(score)}点(ランク${rank.r})! 最大${G.maxRun}つ同時進行・PERFECT ${G.perfect}回`;
  $('#shareBtn').href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(location.href.split('#')[0]);

  show('resultScreen');
  // count-up
  const el = $('#finalScore'), t0 = performance.now(), dur = 1200;
  (function tick(now){
    const k = Math.min(1, (now - t0) / dur);
    el.textContent = fmt(score * (1 - (1 - k) ** 3));
    if (k < 1) requestAnimationFrame(tick);
    else if (isNew || rank.r === 'S') { Sfx.fanfare(); FX.rain(120, ['#ffb703', '#fb8500', '#14b8a6', '#ef476f', '#8b5cf6', '#fff']); }
    else Sfx.good();
  })(t0);
}

function refreshTitle(){
  const recs = store.get('records', []);
  $('#bestScore').textContent = fmt(recs.length ? recs[0].score : 0);
}

function renderRecords(){
  const recs = store.get('records', []);
  $('#recList').innerHTML = recs.length ? recs.map((r, i) => {
    const d = new Date(r.date);
    const color = (RANKS.find(x => x.r === r.rank) || RANKS[4]).color;
    return `<li><span class="no">${i + 1}</span><span class="rk" style="background:${color}">${r.rank}</span>
      <span class="sc">${fmt(r.score)}</span><span class="dt">${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}</span></li>`;
  }).join('') : '<li class="empty">まだ記録がありません</li>';
}

function resetBoard(){
  G = null;
  refs.forEach((R, i) => {
    R.el.className = 'station s-idle ' + ALL[i].id; R.cls = '';
    R.status.innerHTML = i === 4 ? '連打で洗う' : '依頼待ち'; R.statusHTML = '';
    R.fill.style.width = '0%'; R.zone.style.width = '0%';
  });
  refs[4].plates.innerHTML = ''; refs[4].foam.style.display = 'none';
  ui.score.textContent = '0'; ui.time.textContent = ROUND; ui.combo.textContent = '0'; ui.mult.textContent = 'x1.0';
  ui.pips.forEach(p => p.classList.remove('on'));
  ui.timeBox.classList.remove('low');
}

function setSoundIcon(){ $('#soundBtn').innerHTML = Sfx.muted ? ICON.soundOff : ICON.soundOn; }

/* =========================================================
   Wiring
   ========================================================= */
buildBoard(); buildHow(); resetBoard();
$('#logo').innerHTML = LOGO;
$('#bestIco').innerHTML = ICON.trophy;
$('#pauseBtn').innerHTML = ICON.pause;
setSoundIcon(); refreshTitle();

$('#startBtn').onclick = startGame;
$('#retryBtn').onclick = startGame;
$('#howBtn').onclick = () => show('howScreen');
$('#recBtn').onclick = () => { renderRecords(); show('recScreen'); };
document.querySelectorAll('[data-back]').forEach(b => b.onclick = () => show(backTo));
$('#resumeBtn').onclick = resume;
$('#quitBtn').onclick = quit;
$('#toTitleBtn').onclick = quit;
$('#pauseBtn').onclick = () => (G && G.paused ? resume() : pause());
$('#soundBtn').onclick = () => { Sfx.toggle(); setSoundIcon(); };

addEventListener('keydown', e => {
  if (e.repeat) return;
  const n = '12345'.indexOf(e.key);
  if (n >= 0) { tap(n); return; }
  if (e.key === ' ' || e.key === 'Escape' || e.key === 'p') {
    if (G && G.running) { e.preventDefault(); G.paused ? resume() : pause(); }
  }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

let last = performance.now();
function loop(now){
  const dt = Math.min(.05, (now - last) / 1000);
  last = now;
  if (G) {
    if (G.running && !G.paused) update(dt);
    if (G) render(dt);
  }
  FX.step(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

})();
