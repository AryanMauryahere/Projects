(() => {
'use strict';
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
const W = 960, H = 540, $ = id => document.getElementById(id);
const SEG = 200, ROADW = 1400, LANES = 3, DRAW = 200, CARW = 600, LAPS = 3;
const D = 1 / Math.tan(50 * Math.PI / 180);
const MAXSPEED = SEG * 60;
const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (a, b, p) => a + (b - a) * (-Math.cos(p * Math.PI) / 2 + 0.5);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = ms => { ms = Math.max(0, ms | 0); const m = ms / 60000 | 0, s = ms / 1000 % 60 | 0, c = ms % 1000 / 10 | 0;
  return [m, s, c].map(v => String(v).padStart(2, '0')).join(':'); };

/* ---------- Track ---------- */
const segs = [];
const lastY = () => segs.length ? segs[segs.length - 1].p2.y : 0;
function add(curve, y) {
  const n = segs.length;
  segs.push({ i: n, p1: { z: n * SEG, y: lastY() }, p2: { z: (n + 1) * SEG, y }, curve, col: Math.floor(n / 3) % 2, a: {}, b: {} });
}
function road(en, ho, le, curve, dy) {
  const K = 4; en *= K; ho *= K; le *= K;
  const sy = lastY(), ey = sy + dy * SEG, tot = en + ho + le; let n = 0;
  for (let i = 0; i < en; i++, n++) add(ease(0, curve, i / en), ease(sy, ey, n / tot));
  for (let i = 0; i < ho; i++, n++) add(curve, ease(sy, ey, n / tot));
  for (let i = 0; i < le; i++, n++) add(ease(curve, 0, i / le), ease(sy, ey, n / tot));
}
[[25,50,25,0,0],[30,40,30,3,30],[20,30,20,-4,-20],[25,40,25,-3,20],[30,50,30,-5,-30],[30,50,30,4,0],[40,40,40,0,0]]
  .forEach(r => road(...r));
const N = segs.length, TL = N * SEG;
const segAt = z => segs[Math.floor(((z % TL) + TL) % TL / SEG)];
const COL = [
  { grass: '#4f8f2f', rumble: '#f4f4f4', road: '#6a6a76', lane: '#f3e9d2' },
  { grass: '#468528', rumble: '#d8362f', road: '#65656f' }
];

/* ---------- State ---------- */
let state = 'menu', prevState = 'menu', countdown = 0, elapsed = 0, finished = false, finishTime = 0, finishRank = 1;
let pdist = 0, px = 0, speed = 0, fuel = 100, nitro = 100, steerVis = 0, shake = 0, bg = 0, tNow = 0;
let camH = 1100, camTarget = 1100, cars = [], rank = 6;
const kb = {}, tc = {}, inp = n => kb[n] || tc[n];

function reset() {
  pdist = 0; px = 0; speed = 0; fuel = 100; nitro = 100; elapsed = 0; finished = false;
  const defs = [['#d62828',.82,-.5],['#f4f4f4',.77,.4],['#2b6fd6',.72,-.05],['#8e44ad',.68,.55],['#16a085',.64,-.6]];
  cars = defs.map((d, i) => ({ color: d[0], top: d[1], base: d[2], off: d[2], dist: 3300 - i * 640, speed: 0, ph: i * 1.7, seg: segs[0] }));
  countdown = 3.4; state = 'countdown';
  ['menu', 'end', 'pauseBox'].forEach(id => $(id).classList.add('hidden'));
}

/* ---------- Update ---------- */
function update(dt) {
  tNow += dt;
  const pz = camH * D;
  camH = lerp(camH, camTarget, Math.min(1, dt * 4));
  if (state === 'countdown') { countdown -= dt; if (countdown <= 0) state = 'race'; }
  const live = state === 'race' || state === 'done';
  const seg = segAt(pdist + pz);
  const sr = clamp(speed / MAXSPEED, 0, 1.3);

  if (live) {
    if (state === 'race') elapsed += dt;
    const gas = state === 'race' && inp('gas'), brk = state === 'done' || inp('brake');
    const boost = state === 'race' && inp('nitro') && nitro > 0 && speed > MAXSPEED * .2;
    let max = MAXSPEED * (boost ? 1.25 : 1);
    if (fuel <= 0) max = MAXSPEED * .3;
    if (brk) speed -= MAXSPEED * .9 * dt;
    else if (gas) speed += MAXSPEED / 5 * (boost ? 2.2 : 1) * dt;
    else speed -= MAXSPEED / 6 * dt;
    if (speed > max) speed = Math.max(max, speed - MAXSPEED * .35 * dt);
    const dx = dt * 2 * sr, dir = (state === 'race') * ((inp('right') ? 1 : 0) - (inp('left') ? 1 : 0));
    px += dx * dir - dx * sr * seg.curve * .3;
    steerVis = lerp(steerVis, dir - seg.curve * sr * .08, Math.min(1, dt * 8));
    if ((px < -1 || px > 1) && speed > MAXSPEED / 4) { speed -= MAXSPEED * .5 * dt; shake = 1; } else shake = Math.max(0, shake - dt * 4);
    px = clamp(px, -2.2, 2.2); speed = clamp(speed, 0, MAXSPEED * 1.3);
    nitro = boost ? Math.max(0, nitro - 35 * dt) : Math.min(100, nitro + 8 * dt);
    if (state === 'race') fuel = Math.max(0, fuel - (.05 + .42 * sr) * dt);
    pdist += speed * dt;
    bg -= seg.curve * sr * dt * 60;
    if (state === 'race' && pdist >= LAPS * TL) {
      finished = true; state = 'done'; finishTime = elapsed; finishRank = rank; showEnd();
    }
  }
  for (const c of cars) {
    if (live) {
      const target = c.top * MAXSPEED * (1 - clamp(Math.abs(segAt(c.dist).curve) * .045, 0, .25));
      c.speed += (target - c.speed) * Math.min(1, dt * .8);
      c.dist += c.speed * dt;
    }
    c.off = c.base + .12 * Math.sin(tNow * .6 + c.ph);
    c.seg = segAt(c.dist);
    const dz = c.dist - (pdist + pz);
    if (live && Math.abs(dz) < 320 && Math.abs(px - c.off) < .38) {
      if (dz > 0) speed = Math.min(speed, c.speed * .85); else c.speed += 300;
      px += (px >= c.off ? 1 : -1) * .05; shake = 1;
    }
  }
  const all = [pdist, ...cars.map(c => c.dist)];
  rank = 1 + all.slice(1).filter(d => d > pdist).length;
  $('nitroBtn').style.opacity = .4 + .6 * nitro / 100;
}

/* ---------- Drawing helpers ---------- */
function poly(x1, y1, x2, y2, x3, y3, x4, y4, c) {
  ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4); ctx.closePath(); ctx.fill();
}
function proj(p, cx, cy, cz, o) {
  const tz = p.z - cz, sc = D / Math.max(tz, 1);
  o.z = tz; o.scale = sc; o.x = W / 2 + sc * -cx * W / 2; o.y = H / 2 - sc * (p.y - cy) * H / 2; o.w = sc * ROADW * W / 2;
}
function drawSeg(s) {
  const a = s.a, b = s.b, c = COL[s.col];
  ctx.fillStyle = c.grass; ctx.fillRect(0, b.y, W, a.y - b.y + 1);
  const r1 = a.w / Math.max(6, 2 * LANES), r2 = b.w / Math.max(6, 2 * LANES);
  poly(a.x - a.w - r1, a.y, a.x - a.w, a.y, b.x - b.w, b.y, b.x - b.w - r2, b.y, c.rumble);
  poly(a.x + a.w + r1, a.y, a.x + a.w, a.y, b.x + b.w, b.y, b.x + b.w + r2, b.y, c.rumble);
  poly(a.x - a.w, a.y, a.x + a.w, a.y, b.x + b.w, b.y, b.x - b.w, b.y, c.road);
  if (c.lane) for (let l = 1; l < LANES; l++) {
    const t = l / LANES * 2 - 1, m1 = a.w / 40, m2 = b.w / 40, x1 = a.x + a.w * t, x2 = b.x + b.w * t;
    poly(x1 - m1, a.y, x1 + m1, a.y, x2 + m2, b.y, x2 - m2, b.y, '#f3e9d2');
  }
}
function drawCar(cx, by, w, color, o = {}) {
  ctx.save(); ctx.translate(cx, by); if (o.tilt) ctx.rotate(o.tilt);
  const sh = (pts, col) => { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x * w, -y * w)); ctx.closePath(); ctx.fill(); };
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 0, w * .56, w * .07, 0, 0, 7); ctx.fill();
  sh([[-.48,0],[-.32,0],[-.32,.2],[-.48,.2]], '#17171b'); sh([[.32,0],[.48,0],[.48,.2],[.32,.2]], '#17171b');
  sh([[-.5,.08],[.5,.08],[.5,.32],[.42,.37],[-.42,.37],[-.5,.32]], color);
  sh([[-.37,.35],[-.27,.56],[.27,.56],[.37,.35]], color);
  sh([[-.3,.37],[-.22,.51],[.22,.51],[.3,.37]], '#173a55'); sh([[-.24,.4],[-.2,.49],[-.05,.49],[-.09,.4]], 'rgba(150,210,240,.45)');
  sh([[-.5,.08],[.5,.08],[.5,.15],[-.5,.15]], '#202024');
  const tl = o.brake ? '#ff6a6a' : '#e02828';
  sh([[-.48,.22],[-.22,.22],[-.22,.3],[-.48,.3]], tl); sh([[.22,.22],[.48,.22],[.48,.3],[.22,.3]], tl);
  if (o.player) {
    sh([[-.42,.56],[.42,.56],[.42,.61],[-.42,.61]], '#c99a00'); sh([[-.24,.5],[-.2,.5],[-.2,.56],[-.24,.56]], '#222'); sh([[.2,.5],[.24,.5],[.24,.56],[.2,.56]], '#222');
    sh([[-.19,.16],[.19,.16],[.19,.32],[-.19,.32]], '#2f86e0');
    ctx.fillStyle = '#fff'; ctx.font = `italic 800 ${w * .16}px "Segoe UI",sans-serif`; ctx.textAlign = 'center'; ctx.fillText('27', 0, -w * .18);
  } else sh([[-.1,.17],[.1,.17],[.1,.25],[-.1,.25]], '#eee');
  ctx.restore();
}
function label(cx, y, text, col, size) {
  ctx.save(); ctx.font = `italic 800 ${size}px "Segoe UI",sans-serif`; ctx.textAlign = 'center';
  const tw = ctx.measureText(text).width + size;
  ctx.fillStyle = 'rgba(8,28,44,.75)'; ctx.fillRect(cx - tw / 2, y - size * .95, tw, size * 1.35);
  ctx.fillStyle = col; ctx.fillText(text, cx, y); ctx.restore();
}
function hills(off, base, amp, col, f) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H / 2 + 2);
  for (let x = 0; x <= W; x += 8) ctx.lineTo(x, H / 2 - base - amp * (Math.sin((x + off) * f) + .5 * Math.sin((x + off) * f * 2.3 + 1) + .5));
  ctx.lineTo(W, H / 2 + 2); ctx.closePath(); ctx.fill();
}

/* ---------- Render ---------- */
const ORD = ['1st', '2nd', '3rd'], OCOL = ['#ffffff', '#ff4b4b', '#ffffff'];
function render() {
  const g = ctx.createLinearGradient(0, 0, 0, H / 2);
  g.addColorStop(0, '#19c2c8'); g.addColorStop(.6, '#8fe0a8'); g.addColorStop(1, '#d7ee8a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H / 2 + 1);
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  for (let i = 0; i < 4; i++) { const x = ((i * 300 + bg * .1) % 1200 + 1200) % 1200 - 120; ctx.beginPath(); ctx.ellipse(x, 60 + i * 22, 90, 9, 0, 0, 7); ctx.fill(); }
  hills(bg * .4, 30, 45, '#6ea834', .005); hills(bg, 8, 30, '#3f7d20', .009);
  ctx.fillStyle = COL[0].grass; ctx.fillRect(0, H / 2, W, H / 2);

  const pz = camH * D, base = segAt(pdist), pct = (pdist % SEG) / SEG;
  const ps = segAt(pdist + pz), py = lerp(ps.p1.y, ps.p2.y, ((pdist + pz) % SEG) / SEG);
  let x = 0, dx = -(base.curve * pct), maxy = H; const vis = [];
  const camY = camH + py + (shake ? (Math.random() - .5) * 40 : 0);
  for (let n = 0; n < DRAW; n++) {
    const s = segs[(base.i + n) % N], looped = s.i < base.i, cz = pdist % TL - (looped ? TL : 0);
    const camX = px * ROADW - x;
    proj(s.p1, camX, camY, cz, s.a); proj(s.p2, camX - dx, camY, cz, s.b);
    x += dx; dx += s.curve;
    if (s.a.z <= D || s.b.y >= s.a.y || s.b.y >= maxy) continue;
    maxy = s.a.y; vis.push(s);
  }
  const ranked = [{ d: pdist, p: 1 }, ...cars.map(c => ({ d: c.dist, c }))].sort((a, b) => b.d - a.d);
  for (let k = vis.length - 1; k >= 0; k--) {
    const s = vis[k]; drawSeg(s);
    for (const c of cars) if (c.seg === s) {
      const t = (c.dist % SEG) / SEG, sc = lerp(s.a.scale, s.b.scale, t);
      const cx = lerp(s.a.x, s.b.x, t) + sc * c.off * ROADW * W / 2, cy = lerp(s.a.y, s.b.y, t), w = sc * CARW * W / 2;
      if (w < 4) continue;
      drawCar(cx, cy, w, c.color, { brake: c.speed < c.top * MAXSPEED * .6 });
      const r = ranked.findIndex(e => e.c === c);
      if (r < 3 && w > 14) label(cx, cy - w * .68, ORD[r], OCOL[r], clamp(w * .15, 9, 20));
    }
  }
  const pw = 260, pcx = W / 2 + steerVis * 14, pby = H - 46 + (shake ? Math.random() * 4 : 0);
  drawCar(pcx, pby, pw, '#ffcf1f', { player: true, tilt: steerVis * .035, brake: inp('brake') });
  label(pcx + 30, pby - pw * .78, 'player', '#ffe94a', 20);
  hud();
}

/* ---------- HUD ---------- */
function ring(x, y, r) {
  ctx.save(); ctx.shadowColor = '#37f5e6'; ctx.shadowBlur = 14; ctx.lineWidth = 3; ctx.strokeStyle = '#4ff3e4';
  ctx.fillStyle = 'rgba(6,70,80,.55)'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
}
function hud() {
  const sr = clamp(speed / MAXSPEED, 0, 1.25), kmh = Math.round(sr * 300);
  // timer bar
  ctx.fillStyle = 'rgba(8,70,90,.35)'; ctx.fillRect(10, 27, 939, 40);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'italic 800 36px "Segoe UI",sans-serif';
  ctx.fillText(fmt(state === 'done' ? finishTime : elapsed), 480, 59);
  ctx.font = 'italic 700 16px "Segoe UI",sans-serif'; ctx.fillStyle = '#bffcf6'; ctx.textAlign = 'left';
  ctx.fillText(`LAP ${Math.min(LAPS, 1 + Math.floor(pdist / TL))}/${LAPS}`, 24, 53);
  ctx.textAlign = 'right'; ctx.fillText(`POS ${rank}/${cars.length + 1}`, 640, 53); ctx.textAlign = 'left';
  // rev arc (ticks)
  const T = 24;
  for (let i = 0; i < T; i++) {
    const f = i / (T - 1), a = (135 + 135 * f) * Math.PI / 180, on = f <= Math.min(1, sr / 1.0), cx = 205, cy = 205;
    ctx.strokeStyle = !on ? 'rgba(0,0,0,.55)' : f > .62 ? '#ff2b2b' : '#4ff3e4'; ctx.lineWidth = f > .62 ? 9 : 5;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 138, cy + Math.sin(a) * 138); ctx.lineTo(cx + Math.cos(a) * (f > .62 ? 172 : 156), cy + Math.sin(a) * (f > .62 ? 172 : 156)); ctx.stroke();
  }
  // speed, score, gear
  ring(153, 278, 45); ctx.textAlign = 'center'; ctx.fillStyle = '#7ffff2'; ctx.font = 'italic 800 34px "Segoe UI",sans-serif'; ctx.fillText(kmh, 153, 285);
  ctx.font = 'italic 700 11px "Segoe UI",sans-serif'; ctx.fillText('km/h', 153, 302);
  ring(67, 329, 30); ctx.font = '700 15px "Segoe UI",sans-serif'; ctx.fillText(String(Math.floor(pdist / 40)).padStart(5, '0'), 67, 331);
  ctx.font = '700 9px "Segoe UI",sans-serif'; ctx.fillText('PTS', 67, 346);
  ctx.save(); ctx.shadowColor = '#ff8a2a'; ctx.shadowBlur = 10; ctx.fillStyle = 'rgba(60,20,0,.7)'; ctx.strokeStyle = '#ff8a2a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(124, 340, 18, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.fillStyle = '#ff9d3a'; ctx.font = '800 20px "Segoe UI",sans-serif'; ctx.fillText(1 + Math.floor(clamp(sr, 0, 1) * 5.99), 124, 347);
  // minimap (local road ahead)
  ring(761, 82, 64); ctx.save(); ctx.beginPath(); ctx.arc(761, 82, 61, 0, 7); ctx.clip();
  let mx = 761, my = 122, ang = 0; ctx.strokeStyle = '#eafffb'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(mx, my);
  for (let i = 1; i <= 40; i++) { ang += segAt(pdist + i * SEG * 3).curve * .028; mx += Math.sin(ang) * 3.2; my -= Math.cos(ang) * 3.2; ctx.lineTo(mx, my); }
  ctx.stroke(); ctx.fillStyle = '#ffd83a'; ctx.beginPath(); ctx.moveTo(761, 108); ctx.lineTo(752, 128); ctx.lineTo(770, 128); ctx.closePath(); ctx.fill(); ctx.restore();
  // fuel gauge
  ring(878, 321, 32); ctx.font = '20px sans-serif'; ctx.fillStyle = '#7ffff2'; ctx.fillText('⛽', 878, 329);
  ctx.strokeStyle = fuel < 20 ? '#ff3b3b' : '#4ff3e4'; ctx.lineWidth = 7; ctx.shadowColor = '#37f5e6'; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.arc(878, 321, 44, 1.2 - 2.4 * fuel / 100, 1.2); ctx.stroke(); ctx.shadowBlur = 0;
  // countdown / messages
  ctx.textAlign = 'center';
  if (state === 'countdown') { ctx.font = 'italic 900 120px "Segoe UI",sans-serif'; ctx.fillStyle = '#ffd83a'; ctx.strokeStyle = '#000'; ctx.lineWidth = 6;
    const t = Math.ceil(countdown - .4); const txt = t > 0 ? t : 'GO!'; ctx.strokeText(txt, W / 2, 250); ctx.fillText(txt, W / 2, 250); }
  else if (state === 'race' && fuel <= 0) { ctx.font = '800 26px "Segoe UI",sans-serif'; ctx.fillStyle = '#ff5a5a'; ctx.fillText('OUT OF FUEL', W / 2, 110); }
  ctx.textAlign = 'left';
}

/* ---------- Controls ---------- */
const BTN = [
  { id: 'leftBtn', x: 71, y: 468, r: 36, t: '◀', k: 'left' }, { id: 'rightBtn', x: 186, y: 468, r: 36, t: '▶', k: 'right' },
  { id: 'nitroBtn', x: 187, y: 337, r: 22, t: 'N₂O', k: 'nitro', cls: 'small' },
  { id: 'camBtn', x: 479, y: 479, r: 27, t: '🎥', fn: () => camTarget = camTarget < 1400 ? 1800 : 1100 },
  { id: 'brakeBtn', x: 769, y: 467, r: 33, h: '<div class="grid"></div>', k: 'brake', cls: 'sq' },
  { id: 'gasBtn', x: 868, y: 447, r: 49, h: '<div class="pedal"></div>', k: 'gas' },
  { id: 'pauseBtn', x: 887, y: 67, r: 33, t: '❚❚', fn: () => togglePause() }
];
BTN.forEach(b => {
  const e = document.createElement('div'); e.id = b.id; e.className = 'btn ' + (b.cls || '');
  Object.assign(e.style, { left: b.x / W * 100 + '%', top: b.y / H * 100 + '%', width: b.r * 2 / W * 100 + '%' });
  e.innerHTML = b.h || b.t; $('stage').appendChild(e);
  const set = v => { if (b.k) { tc[b.k] = v; e.classList.toggle('on', v); } };
  e.addEventListener('pointerdown', ev => { ev.preventDefault(); e.setPointerCapture(ev.pointerId); set(true); if (b.fn) b.fn(); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => e.addEventListener(n, () => set(false)));
});
const KEYS = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'gas', w: 'gas', ArrowDown: 'brake', s: 'brake', Shift: 'nitro', n: 'nitro' };
addEventListener('keydown', e => {
  const k = KEYS[e.key] || KEYS[e.key.toLowerCase?.()]; if (k) { kb[k] = true; e.preventDefault(); }
  if (e.key === 'c' || e.key === 'C') camTarget = camTarget < 1400 ? 1800 : 1100;
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') togglePause();
});
addEventListener('keyup', e => { const k = KEYS[e.key] || KEYS[e.key.toLowerCase?.()]; if (k) kb[k] = false; });
addEventListener('blur', () => { for (const k in kb) kb[k] = false; });

function togglePause() {
  if (state === 'race' || state === 'countdown') { prevState = state; state = 'paused'; $('pauseBox').classList.remove('hidden'); }
  else if (state === 'paused') { state = prevState; $('pauseBox').classList.add('hidden'); }
}

/* ---------- Backend API ---------- */
async function loadBoard(id) {
  const el = $(id);
  try {
    const list = await (await fetch('/api/scores/top?limit=8')).json();
    el.innerHTML = list.length ? list.map((s, i) => `<li><span>${i + 1}</span><span>${esc(s.name)}</span><span>${fmt(s.timeMs)}</span></li>`).join('')
      : '<li class="empty">No times yet — set the first!</li>';
  } catch { el.innerHTML = '<li class="empty">Leaderboard offline</li>'; }
}
function showEnd() {
  const ord = ['st', 'nd', 'rd'][finishRank - 1] || 'th';
  $('endTitle').textContent = finishRank === 1 ? 'YOU WIN!' : 'FINISH!';
  $('endInfo').textContent = `Position ${finishRank}${ord} · Time ${fmt(finishTime)}`;
  $('nameOut').value = $('nameIn').value; $('submitRow').style.display = ''; $('submitBtn').disabled = false;
  setTimeout(() => { $('end').classList.remove('hidden'); loadBoard('board1'); }, 900);
}
$('submitBtn').onclick = async () => {
  const name = $('nameOut').value.trim() || 'Driver'; $('submitBtn').disabled = true;
  try {
    const r = await fetch('/api/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, timeMs: Math.round(finishTime) }) });
    if (!r.ok) throw 0; localStorage.setItem('driver', name); $('submitRow').style.display = 'none';
  } catch { $('submitBtn').disabled = false; alert('Could not submit time.'); }
  loadBoard('board1');
};
const start = () => { localStorage.setItem('driver', $('nameIn').value); reset(); };
$('startBtn').onclick = start; $('againBtn').onclick = start; $('resumeBtn').onclick = togglePause;
$('quitBtn').onclick = () => { state = 'menu'; $('pauseBox').classList.add('hidden'); $('menu').classList.remove('hidden'); loadBoard('board0'); };
$('nameIn').value = localStorage.getItem('driver') || '';
loadBoard('board0');

/* ---------- Loop ---------- */
reset(); state = 'menu'; ['menu'].forEach(id => $(id).classList.remove('hidden'));
let last = performance.now();
(function frame(t) {
  const dt = Math.min(.05, (t - last) / 1000); last = t;
  if (state !== 'paused') update(dt);
  render(); requestAnimationFrame(frame);
})(last);
})();
