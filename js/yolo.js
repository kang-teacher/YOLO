/* 3단원: YOLO의 특징 */

/* SVG 장면을 캔버스에 그릴 수 있는 이미지로 변환 (640×400 기준) */
let _sceneImg = null;
function sceneImage() {
  if (_sceneImg) return _sceneImg;
  _sceneImg = new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">${sceneBase()}</svg>`);
  });
  return _sceneImg;
}
const OBJS = Object.entries(SCENE_BOX).map(([name, [x, y, w, h, , color]]) => ({ name, x, y, w, h, color, ko: { person: '사람', dog: '강아지', car: '자동차' }[name] }));

function initYOLO() {
  sceneImage().then((img) => {
    initRace(img); initGrid(img); initNMS(img); initIoU(img); initCoord(img);
  });
  initModels();
  initCoco();
}

/* --- 레이스: 슬라이딩 윈도우 vs YOLO --- */
function initRace(img) {
  const A = $('#raceSlow'), B = $('#raceFast'), a = A.getContext('2d'), b = B.getContext('2d');
  const sx = A.width / 640, sy = A.height / 400;
  const base = (ctx) => ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
  base(a); base(b);
  let running = false;
  $('#raceGo').addEventListener('click', () => {
    if (running) return;
    running = true;
    const wins = [];
    for (const s of [140, 100, 70]) for (let y = 0; y + s <= 400; y += s / 2) for (let x = 0; x + s <= 640; x += s / 2) wins.push({ x, y, w: s, h: s });
    let i = 0, found = [];
    const slowTick = () => {
      base(a);
      found.forEach((o) => drawBox(a, o.x * sx, o.y * sy, o.w * sx, o.h * sy, o.color, o.name, 2));
      if (i < wins.length) {
        for (let k = 0; k < 2 && i < wins.length; k++, i++) {
          const w = wins[i];
          OBJS.forEach((o) => { if (!found.includes(o) && iou(w, o) > .3) found.push(o); });
        }
        const w = wins[i - 1];
        a.strokeStyle = '#f5b82e'; a.lineWidth = 3; a.strokeRect(w.x * sx, w.y * sy, w.w * sx, w.h * sy);
        $('#raceSlowN').textContent = i; $('#raceSlowT').textContent = (i * 0.045).toFixed(1) + 's';
        requestAnimationFrame(slowTick);
      } else { running = false; $('#raceSlowN').textContent = wins.length; }
    };
    slowTick();
    // YOLO: 격자를 한 번 훑고 끝
    let f = 0;
    const fastTick = () => {
      base(b);
      const S = 7, gw = B.width / S, gh = B.height / S;
      b.strokeStyle = 'rgba(255,255,255,' + Math.max(0, 1 - f / 40) + ')'; b.lineWidth = 1.5;
      for (let k = 1; k < S; k++) { b.beginPath(); b.moveTo(k * gw, 0); b.lineTo(k * gw, B.height); b.moveTo(0, k * gh); b.lineTo(B.width, k * gh); b.stroke(); }
      if (f > 10) OBJS.forEach((o) => drawBox(b, o.x * sx, o.y * sy, o.w * sx, o.h * sy, o.color, o.name, 2));
      if (f === 10) { $('#raceFastN').textContent = 1; $('#raceFastT').textContent = '0.02s'; }
      if (f++ < 45) requestAnimationFrame(fastTick);
    };
    $('#raceFastN').textContent = 0; $('#raceFastT').textContent = '0.0s';
    fastTick();
  });
}

/* --- 격자 --- */
function initGrid(img) {
  const cv = $('#gridCanvas'), ctx = cv.getContext('2d');
  let S = 7, hover = null;
  const draw = () => {
    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    const gw = cv.width / S, gh = cv.height / S;
    OBJS.forEach((o) => {
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2, c = Math.floor(cx / gw), r = Math.floor(cy / gh);
      ctx.fillStyle = o.color; ctx.globalAlpha = .35; ctx.fillRect(c * gw, r * gh, gw, gh); ctx.globalAlpha = 1;
    });
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.5;
    for (let k = 1; k < S; k++) { ctx.beginPath(); ctx.moveTo(k * gw, 0); ctx.lineTo(k * gw, cv.height); ctx.moveTo(0, k * gh); ctx.lineTo(cv.width, k * gh); ctx.stroke(); }
    let owner = null;
    if (hover) {
      const c = Math.floor(hover.x / gw), r = Math.floor(hover.y / gh);
      owner = OBJS.find((o) => Math.floor((o.x + o.w / 2) / gw) === c && Math.floor((o.y + o.h / 2) / gh) === r);
      ctx.strokeStyle = '#f5b82e'; ctx.lineWidth = 4; ctx.strokeRect(c * gw, r * gh, gw, gh);
      if (owner) drawBox(ctx, owner.x, owner.y, owner.w, owner.h, owner.color, `${owner.name} 0.9`, 3);
      $('#cellInfo').innerHTML = owner
        ? `<b>칸 (${r + 1}행, ${c + 1}열)</b> → <b style="color:${owner.color}">${owner.ko}</b>의 중심이 이 칸에 있어요!<br>예측: <code>x=${((owner.x + owner.w / 2) / 640).toFixed(2)} y=${((owner.y + owner.h / 2) / 400).toFixed(2)} w=${(owner.w / 640).toFixed(2)} h=${(owner.h / 400).toFixed(2)}</code> · 확신도 <code>0.9</code> · 클래스 <code>${owner.name}</code>`
        : `<b>칸 (${r + 1}행, ${c + 1}열)</b> → 물체의 중심이 없어요. 확신도 ≈ <code>0.0</code> (아무것도 없음)`;
    }
    OBJS.forEach((o) => {
      ctx.beginPath(); ctx.arc(o.x + o.w / 2, o.y + o.h / 2, 7, 0, Math.PI * 2);
      ctx.fillStyle = o.color; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke();
    });
  };
  onDrag(cv, { hover: (p) => { hover = p; draw(); }, down: (p) => { hover = p; draw(); }, move: (p) => { hover = p; draw(); } });
  $('#gridS').addEventListener('input', (e) => { S = +e.target.value; $('#gridSVal').textContent = `${S} × ${S}`; draw(); });
  draw();
}

/* --- 확신도 + NMS --- */
function initNMS(img) {
  const cv = $('#nmsCanvas'), ctx = cv.getContext('2d');
  const sx = cv.width / 640, sy = cv.height / 400;
  const cands = [];
  OBJS.forEach((o) => {
    cands.push({ ...o, conf: .88 + Math.random() * .08 });
    for (let k = 0; k < 7; k++) {
      const j = .12;
      cands.push({ name: o.name, color: o.color, x: o.x + rand(-j, j) * o.w, y: o.y + rand(-j, j) * o.h, w: o.w * rand(.8, 1.2), h: o.h * rand(.8, 1.2), conf: rand(.25, .85) });
    }
  });
  for (let k = 0; k < 14; k++) {
    const o = OBJS[k % 3], w = rand(50, 160), h = rand(40, 130);
    cands.push({ name: o.name, color: o.color, x: rand(0, 640 - w), y: rand(0, 400 - h), w, h, conf: rand(.02, .32) });
  }
  const draw = () => {
    const conf = +$('#nmsConf').value, on = $('#nmsOn').checked, th = +$('#nmsIou').value;
    $('#nmsConfVal').textContent = conf.toFixed(2); $('#nmsIouVal').textContent = th.toFixed(2);
    let keep = cands.filter((c) => c.conf >= conf).sort((a, b) => b.conf - a.conf);
    if (on) {
      const out = [];
      keep.forEach((c) => { if (!out.some((k) => k.name === c.name && iou(k, c) > th)) out.push(c); });
      keep = out;
    }
    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    keep.slice().reverse().forEach((c) => {
      ctx.globalAlpha = .35 + c.conf * .65;
      drawBox(ctx, c.x * sx, c.y * sy, c.w * sx, c.h * sy, c.color, on || keep.length < 6 ? `${c.name} ${c.conf.toFixed(2)}` : '', 2);
    });
    ctx.globalAlpha = 1;
    $('#nmsCount').textContent = keep.length;
  };
  ['#nmsConf', '#nmsOn', '#nmsIou'].forEach((s) => $(s).addEventListener('input', draw));
  draw();
}

/* --- IoU 놀이터 --- */
function initIoU(img) {
  const cv = $('#iouCanvas'), ctx = cv.getContext('2d');
  const gt = { x: 200, y: 110, w: 180, h: 160 };
  const pr = { x: 280, y: 170, w: 180, h: 150 };
  const MISSIONS = [
    { t: 'IoU를 0.70 이상으로 만들어 보세요!', ok: (v) => v >= .7 },
    { t: 'IoU를 0.90 이상으로! (거의 완벽하게)', ok: (v) => v >= .9 },
    { t: '두 상자가 전혀 겹치지 않게 (IoU = 0)', ok: (v) => v === 0 },
    { t: 'IoU를 0.45 ~ 0.55 사이로 맞춰보세요', ok: (v) => v >= .45 && v <= .55 },
    { t: '주황 상자를 초록 상자 안에 쏙 넣되 IoU는 0.5 미만으로', ok: (v) => v > 0 && v < .5 && pr.x >= gt.x && pr.y >= gt.y && pr.x + pr.w <= gt.x + gt.w && pr.y + pr.h <= gt.y + gt.h },
  ];
  let mi = 0, cleared = false, drag = null;
  const draw = () => {
    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(0, 0, cv.width, cv.height);
    const x1 = Math.max(gt.x, pr.x), y1 = Math.max(gt.y, pr.y), x2 = Math.min(gt.x + gt.w, pr.x + pr.w), y2 = Math.min(gt.y + gt.h, pr.y + pr.h);
    ctx.fillStyle = 'rgba(59,111,224,.18)'; ctx.fillRect(gt.x, gt.y, gt.w, gt.h); ctx.fillRect(pr.x, pr.y, pr.w, pr.h);
    if (x2 > x1 && y2 > y1) { ctx.fillStyle = 'rgba(123,85,217,.55)'; ctx.fillRect(x1, y1, x2 - x1, y2 - y1); }
    drawBox(ctx, gt.x, gt.y, gt.w, gt.h, '#22a06b', '정답', 3);
    drawBox(ctx, pr.x, pr.y, pr.w, pr.h, '#f07a1a', '예측', 3);
    [gt, pr].forEach((b, k) => [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]].forEach(([x, y]) => {
      ctx.fillStyle = '#fff'; ctx.strokeStyle = k ? '#f07a1a' : '#22a06b'; ctx.lineWidth = 2;
      ctx.fillRect(x - 6, y - 6, 12, 12); ctx.strokeRect(x - 6, y - 6, 12, 12);
    }));
    const v = iou(gt, pr);
    $('#iouVal').textContent = v.toFixed(2);
    $('#iouMeter').style.width = v * 100 + '%';
    const m = $('#iouMsg');
    if (v >= .9) { m.textContent = '🎯 거의 완벽해요!'; m.className = 'result-msg good'; }
    else if (v >= .5) { m.textContent = '✅ IoU ≥ 0.5 → 보통 "맞혔다"고 인정해요'; m.className = 'result-msg good'; }
    else if (v > 0) { m.textContent = '⚠️ IoU < 0.5 → 위치가 많이 빗나갔어요'; m.className = 'result-msg bad'; }
    else { m.textContent = '❌ 전혀 겹치지 않아요'; m.className = 'result-msg bad'; }
    if (!cleared && MISSIONS[mi].ok(v) && !drag) { cleared = true; toast('🎯 미션 성공!'); confetti(50); $('#iouMission').textContent = '✅ ' + MISSIONS[mi].t; }
  };
  const hit = (p) => {
    for (const b of [pr, gt]) {
      const cs = [['tl', b.x, b.y], ['tr', b.x + b.w, b.y], ['bl', b.x, b.y + b.h], ['br', b.x + b.w, b.y + b.h]];
      for (const [k, x, y] of cs) if (Math.abs(p.x - x) < 14 && Math.abs(p.y - y) < 14) return { b, k };
    }
    for (const b of [pr, gt]) if (p.x > b.x && p.x < b.x + b.w && p.y > b.y && p.y < b.y + b.h) return { b, k: 'move' };
    return null;
  };
  onDrag(cv, {
    down: (p) => { drag = hit(p); if (drag) { drag.sx = p.x; drag.sy = p.y; drag.o = { ...drag.b }; } },
    move: (p) => {
      if (!drag) return;
      const { b, k, o } = drag, dx = p.x - drag.sx, dy = p.y - drag.sy, W = cv.width, H = cv.height;
      if (k === 'move') { b.x = clamp(o.x + dx, 0, W - o.w); b.y = clamp(o.y + dy, 0, H - o.h); }
      else {
        let x1 = o.x, y1 = o.y, x2 = o.x + o.w, y2 = o.y + o.h;
        if (k[1] === 'l') x1 = clamp(o.x + dx, 0, x2 - 20); else x2 = clamp(x2 + dx, x1 + 20, W);
        if (k[0] === 't') y1 = clamp(o.y + dy, 0, y2 - 20); else y2 = clamp(y2 + dy, y1 + 20, H);
        Object.assign(b, { x: x1, y: y1, w: x2 - x1, h: y2 - y1 });
      }
      draw();
    },
    up: () => { drag = null; draw(); },
    hover: (p) => { const h = p && hit(p); cv.style.cursor = !h ? 'default' : h.k === 'move' ? 'move' : 'nwse-resize'; },
  });
  $('#iouShuffle').addEventListener('click', () => { mi = (mi + 1) % MISSIONS.length; cleared = false; $('#iouMission').textContent = MISSIONS[mi].t; draw(); });
  draw();
}

/* --- YOLO 좌표 체계 --- */
function initCoord(img) {
  const cv = $('#coordCanvas'), ctx = cv.getContext('2d');
  let box = { x: 268 * cv.width / 640, y: 228 * cv.height / 400, w: 175 * cv.width / 640, h: 104 * cv.height / 400 }, start = null;
  const draw = () => {
    const W = cv.width, H = cv.height;
    ctx.drawImage(img, 0, 0, W, H);
    ctx.font = '600 13px "JetBrains Mono", monospace'; ctx.fillStyle = '#1f2a24';
    ctx.fillText('(0,0)', 6, 16); ctx.fillText('(1,0)', W - 44, 16); ctx.fillText('(0,1)', 6, H - 8); ctx.fillText('(1,1)', W - 44, H - 8);
    if (!box || box.w < 3 || box.h < 3) return;
    const { x, y, w, h } = box, cx = x + w / 2, cy = y + h / 2;
    ctx.fillStyle = 'rgba(245,184,46,.25)'; ctx.fillRect(x, y, w, h);
    drawBox(ctx, x, y, w, h, '#f07a1a', '', 3);
    ctx.setLineDash([5, 5]); ctx.strokeStyle = '#1a9334'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(cx, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, cy); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fillStyle = '#e2483d'; ctx.fill();
    ctx.fillStyle = '#1f2a24'; ctx.font = '700 13px "Noto Sans KR"';
    ctx.fillText(`Width = ${(w / W).toFixed(2)}`, x + 4, y + h + 18 > H ? y - 8 : y + h + 18);
    ctx.save(); ctx.translate(x + w + 16 > W - 10 ? x - 6 : x + w + 16, y + h / 2 + 40); ctx.rotate(-Math.PI / 2); ctx.fillText(`Height = ${(h / H).toFixed(2)}`, 0, 0); ctx.restore();
    const X = cx / W, Y = cy / H;
    $('#cX').textContent = X.toFixed(3); $('#cY').textContent = Y.toFixed(3); $('#cW').textContent = (w / W).toFixed(3); $('#cH').textContent = (h / H).toFixed(3);
    $('#cLine').textContent = `${$('#cClass').value} ${X.toFixed(6)} ${Y.toFixed(6)} ${(w / W).toFixed(6)} ${(h / H).toFixed(6)}`;
  };
  onDrag(cv, {
    down: (p) => { start = p; box = { x: p.x, y: p.y, w: 0, h: 0 }; },
    move: (p) => { box = { x: Math.min(start.x, p.x), y: Math.min(start.y, p.y), w: Math.abs(p.x - start.x), h: Math.abs(p.y - start.y) }; draw(); },
    up: () => draw(),
  });
  cv.style.cursor = 'crosshair';
  $('#cClass').addEventListener('change', draw);
  draw();
}

/* --- 모델 가족 --- */
function initModels() {
  const T = [
    ['📦', 'Detect', '객체 탐지', 'yolo11n.pt', '물체를 상자로 찾아요. 가장 기본!'],
    ['🎨', 'Segment', '분할', 'yolo11n-seg.pt', '물체 모양대로 픽셀을 칠해요.'],
    ['🦴', 'Pose', '자세 추정', 'yolo11n-pose.pt', '사람 관절 17개 위치를 찾아요.'],
    ['🧭', 'OBB', '회전 상자 탐지', 'yolo11n-obb.pt', '비스듬한 물체(항공사진 속 배·차)를 기울어진 상자로.'],
    ['🏷️', 'Classify', '분류', 'yolo11n-cls.pt', '사진 전체가 무엇인지 하나로 답해요.'],
  ];
  const box = $('#modelTasks');
  box.innerHTML = T.map(([e, en, ko, f, d]) => `<div class="mtask" tabindex="0"><div class="em">${e}</div><b>${ko}</b><small class="muted">${en}</small><br><code>${f}</code><p>${d}</p></div>`).join('');
  $$('.mtask', box).forEach((m) => m.addEventListener('click', () => m.classList.toggle('on')));

  const D = { n: { map: 39.5, cpu: 56.1, params: 2.6 }, s: { map: 47.0, cpu: 90.0, params: 9.4 }, m: { map: 51.5, cpu: 183.2, params: 20.1 }, l: { map: 53.4, cpu: 238.6, params: 25.3 }, x: { map: 54.7, cpu: 462.8, params: 56.9 } };
  const MAX = { map: 60, cpu: 480, params: 60 };
  const bars = $('#sizeBars');
  bars.innerHTML = Object.keys(D).map((k) => `<div class="bar-row ${k}"><span class="bn">yolo11${k}</span><div class="bar-track"><div class="bar-fill"></div></div><span class="bv"></span></div>`).join('');
  const set = (m) => {
    $$('#sizeMetric button').forEach((b) => b.classList.toggle('on', b.dataset.m === m));
    Object.keys(D).forEach((k, i) => {
      const row = bars.children[i];
      $('.bar-fill', row).style.width = (D[k][m] / MAX[m]) * 100 + '%';
      $('.bv', row).textContent = D[k][m] + (m === 'cpu' ? 'ms' : m === 'params' ? 'M' : '');
    });
  };
  $$('#sizeMetric button').forEach((b) => b.addEventListener('click', () => set(b.dataset.m)));
  set('map');
}

function initCoco() {
  const g = $('#cocoGrid');
  g.innerHTML = COCO.map((n, i) => `<span class="coco" data-s="${n} ${COCO_KO[i]}"><i>${i}</i>${n} · ${COCO_KO[i]}</span>`).join('');
  $('#cocoSearch').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    let first = null;
    $$('.coco', g).forEach((c) => {
      const m = q && c.dataset.s.toLowerCase().includes(q);
      c.classList.toggle('match', !!m);
      if (m && !first) first = c;
    });
    if (first) g.scrollTop = first.offsetTop - g.offsetTop - 10;
  });
}
