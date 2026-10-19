/* 2단원: 머신러닝의 종류 (지도학습 · 비지도학습 · 강화학습) */
function initTypes() {
  initTypeTree();
  initRegression();
  initKMeans();
  initRL();
  initYoloType();
  makeSorter($('#typeSorter').closest('.card'), [
    ['📧 스팸 메일 걸러내기', 'cls'], ['✍️ 손글씨 숫자 알아보기', 'cls'], ['🐾 사진 속 동물 종류 맞히기', 'cls'],
    ['🌡️ 내일 기온 예측', 'reg'], ['🏠 아파트 가격 예측', 'reg'], ['📝 공부 시간으로 점수 예측', 'reg'],
    ['🛍️ 취향이 비슷한 고객 묶기', 'clu'], ['📰 뉴스 기사 주제별로 묶기', 'clu'], ['🎵 비슷한 노래끼리 모으기', 'clu'],
    ['⚫ 알파고 바둑 두기', 'rl'], ['🦿 로봇 걷기 연습', 'rl'], ['🕹️ 게임 스스로 깨기', 'rl'],
  ], '머신러닝 종류 박사네요.');
}

/* --- 종류 지도 --- */
function initTypeTree() {
  const C = { sup: 'var(--blue)', uns: 'var(--purple)', rl: 'var(--orange)' };
  const INFO = {
    ml: { c: 'var(--green)', h: '📈 머신러닝', d: '데이터에서 스스로 규칙을 찾는 인공지능이에요.<br>어떤 방식으로 공부하느냐에 따라 <b>지도학습, 비지도학습, 강화학습</b>으로 나눠요.', a: '공부 방법이 다른 세 학생을 떠올려 보세요. 해설지가 있는 학생, 해설지 없이 스스로 정리하는 학생, 직접 해보며 혼나고 칭찬받는 학생!' },
    sup: { c: C.sup, h: '👩‍🏫 지도학습 (Supervised Learning)', d: '문제와 함께 <b>정답(라벨)</b>을 알려주고 공부시켜요.<br>많은 문제-정답 쌍을 보고, 처음 보는 문제의 답을 맞히게 돼요.', a: '📘 해설지가 있는 문제집으로 공부하기', ex: ['고양이 사진 + "고양이"', '메일 + "스팸"', '공부 시간 + 점수', 'YOLO!'] },
    cls: { c: C.sup, h: '🏷️ 분류 (Classification)', d: '지도학습 중에서 정답이 <b>종류(이름)</b>인 문제예요. 정해진 반 중 어디에 속하는지 골라요.', a: '🗳️ "강아지일까, 고양이일까?"', ex: ['강아지/고양이', '스팸/정상', '손글씨 숫자 0~9', '질병 있음/없음'] },
    reg: { c: C.sup, h: '📏 회귀 (Regression)', d: '지도학습 중에서 정답이 <b>숫자(연속된 값)</b>인 문제예요. 아래 체험에서 직선을 그려 숫자를 예측해 봐요.', a: '🔢 "몇 점일까? 얼마일까?"', ex: ['시험 점수', '집값', '내일 기온', '중고차 가격'] },
    uns: { c: C.uns, h: '🧩 비지도학습 (Unsupervised Learning)', d: '<b>정답 없이</b> 데이터만 주고, 그 안에 숨은 구조나 무리를 스스로 찾게 해요.', a: '🧺 정답 없이 빨래를 "비슷한 것끼리" 개어 보기', ex: ['고객 무리 나누기', '비슷한 뉴스 묶기', '이상한 데이터 찾기'] },
    clu: { c: C.uns, h: '🫧 군집화 (Clustering)', d: '가까이 있는(비슷한) 데이터끼리 <b>무리</b>를 지어요. 무리의 이름은 모르지만 "이것들은 서로 비슷해"를 알아내요.', a: '🍭 사탕을 색깔·모양이 비슷한 것끼리 나눠 담기', ex: ['k-평균(k-means)', '쇼핑 고객 분석', '사진 자동 앨범'] },
    dim: { c: C.uns, h: '🗜️ 차원 축소 (Dimensionality Reduction)', d: '특징이 너무 많은 데이터를 <b>중요한 특징 몇 개로 줄여서</b> 간단하게 만들어요. 그래프로 그려보기도 쉬워져요.', a: '📝 긴 책을 핵심 요약 한 장으로 줄이기', ex: ['데이터 시각화', '압축', '잡음 줄이기'] },
    rl: { c: C.rl, h: '🎮 강화학습 (Reinforcement Learning)', d: '정답을 알려주지 않고, 직접 <b>행동</b>해 보면서 받은 <b>보상(+)과 벌점(-)</b>으로 더 좋은 행동을 배워요.', a: '🐶 강아지에게 "앉아!" 훈련: 잘하면 간식, 못하면 간식 없음', ex: ['알파고', '로봇 걷기', '자율주행', '게임 AI'] },
    rlgame: { c: C.rl, h: '🤖 보상 받으며 연습하기', d: '처음엔 엉망이지만, 여러 번 해보면서 점수가 높은 행동을 점점 더 많이 고르게 돼요. 아래 미로 체험에서 직접 확인해 봐요!', a: '🎯 수없이 넘어지며 자전거 배우기', ex: ['시행착오', '보상', '정책(행동 규칙)'] },
  };
  const box = $('#typeInfo');
  const show = (k) => {
    const i = INFO[k];
    $$('#typeTree .tree-node').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
    box.style.setProperty('--info-c', i.c);
    box.innerHTML = `<h3>${i.h}</h3><p>${i.d}</p><div class="analogy">💬 비유: ${i.a}</div>${i.ex ? `<div class="ex">${i.ex.map((x) => `<span>${x}</span>`).join('')}</div>` : ''}`;
  };
  $$('#typeTree .tree-node').forEach((b) => b.addEventListener('click', () => show(b.dataset.k)));
  show('ml');
}

/* --- 회귀: 경사하강법으로 직선 맞추기 --- */
function initRegression() {
  const cv = $('#regCanvas'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height, PAD = 50;
  let pts = [], a = 0, b = 0.5, epoch = 0, training = false, trained = false;
  const toPx = (x, y) => [PAD + x / 10 * (W - PAD - 20), H - PAD - y / 100 * (H - PAD - 20)];
  const fromPx = (px, py) => [(px - PAD) / (W - PAD - 20) * 10, (H - PAD - py) / (H - PAD - 20) * 100];
  const f = (x) => (a * (x / 10) + b) * 100; // 정규화한 공간에서 학습
  const err = () => pts.length ? pts.reduce((s, p) => s + Math.abs(f(p.x) - p.y), 0) / pts.length : 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = cssVar('--line'); ctx.lineWidth = 1; ctx.fillStyle = cssVar('--muted'); ctx.font = '12px "JetBrains Mono"';
    for (let k = 0; k <= 10; k += 2) { const [x] = toPx(k, 0); ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, H - PAD); ctx.stroke(); ctx.fillText(k + 'h', x - 8, H - PAD + 18); }
    for (let k = 0; k <= 100; k += 25) { const [, y] = toPx(0, k); ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - 20, y); ctx.stroke(); ctx.fillText(k, PAD - 30, y + 4); }
    ctx.font = '13px "Noto Sans KR"'; ctx.fillText('공부 시간 →', W - 100, H - 12); ctx.fillText('↑ 점수', 8, 16);
    if (epoch > 0 || trained) {
      ctx.strokeStyle = 'rgba(226,72,61,.7)'; ctx.lineWidth = 2;
      pts.forEach((p) => { const [px, py] = toPx(p.x, p.y), [, fy] = toPx(p.x, clamp(f(p.x), -50, 150)); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, fy); ctx.stroke(); });
      const [x0, y0] = toPx(0, f(0)), [x1, y1] = toPx(10, f(10));
      ctx.save(); ctx.beginPath(); ctx.rect(PAD, 20, W - PAD - 20, H - PAD - 20); ctx.clip();
      ctx.strokeStyle = cssVar('--blue'); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore();
    }
    pts.forEach((p) => { const [px, py] = toPx(p.x, p.y); ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fillStyle = cssVar('--green'); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); });
    if (trained) {
      const x = +$('#regX').value, y = clamp(f(x), 0, 100), [px, py] = toPx(x, y);
      ctx.setLineDash([6, 5]); ctx.strokeStyle = cssVar('--orange'); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px, H - PAD); ctx.lineTo(px, py); ctx.lineTo(PAD, py); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = '22px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⭐', px, py); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      $('#regPred').textContent = `${x}시간 공부하면 약 ${Math.round(y)}점이 예상돼요`;
    }
    if (!pts.length) { ctx.font = '16px "Noto Sans KR"'; ctx.fillStyle = cssVar('--muted'); ctx.textAlign = 'center'; ctx.fillText('여기를 클릭해서 데이터를 찍어보세요', W / 2, H / 2); ctx.textAlign = 'left'; }
    $('#regEpoch').textContent = epoch;
    $('#regErr').textContent = epoch || trained ? err().toFixed(1) + '점' : '-';
  }
  function loop() {
    if (!training) return;
    for (let it = 0; it < 3; it++) {
      let ga = 0, gb = 0;
      pts.forEach((p) => { const e = (a * p.x / 10 + b) - p.y / 100; ga += e * p.x / 10; gb += e; });
      a -= 0.9 * ga / pts.length; b -= 0.9 * gb / pts.length;
    }
    epoch++; draw();
    if (epoch >= 120) { training = false; trained = true; $('#regTrain').textContent = '▶ 다시 학습'; draw(); toast(`학습 완료! 평균 오차 ${err().toFixed(1)}점`); return; }
    requestAnimationFrame(loop);
  }
  onDrag(cv, { down: (p) => { const [x, y] = fromPx(p.x, p.y); if (x < 0 || x > 10 || y < 0 || y > 100) return; pts.push({ x, y }); draw(); } });
  $('#regTrain').addEventListener('click', () => {
    if (pts.length < 2) { toast('점을 2개 이상 찍어주세요!'); return; }
    a = rand(-.3, .3); b = rand(.2, .8); epoch = 0; trained = false; training = true; $('#regTrain').textContent = '학습 중…'; loop();
  });
  $('#regRandom').addEventListener('click', () => {
    training = false; trained = false; epoch = 0; $('#regTrain').textContent = '▶ 학습 시작';
    pts = Array.from({ length: 14 }, () => { const x = rand(.5, 9.5); return { x, y: clamp(30 + x * 6.5 + rand(-12, 12), 2, 98) }; });
    draw();
  });
  $('#regClear').addEventListener('click', () => { pts = []; training = false; trained = false; epoch = 0; $('#regTrain').textContent = '▶ 학습 시작'; $('#regPred').textContent = '학습을 먼저 시켜주세요'; draw(); });
  $('#regX').addEventListener('input', (e) => { $('#regXVal').textContent = e.target.value + '시간'; draw(); });
  document.addEventListener('themechange', draw);
  draw();
}

/* --- 비지도학습: k-평균 군집화 --- */
function initKMeans() {
  const cv = $('#kmCanvas'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
  const COL = ['#3b6fe0', '#e9468b', '#f07a1a', '#22a06b', '#7b55d9'];
  let pts = [], cents = null, phase = 'assign', iter = 0, done = false, auto = null;
  const msg = (h) => { $('#kmMsg').innerHTML = h; };
  const makeData = () => {
    const blobs = Math.floor(rand(3, 5));
    pts = [];
    for (let k = 0; k < blobs; k++) {
      const cx = rand(90, W - 90), cy = rand(80, H - 80);
      for (let i = 0; i < 22; i++) pts.push({ x: clamp(cx + rand(-1, 1) * rand(10, 60), 12, W - 12), y: clamp(cy + rand(-1, 1) * rand(10, 55), 12, H - 12), c: -1 });
    }
    cents = null; iter = 0; done = false; phase = 'assign';
    msg('정답(색깔)이 없는 회색 점들이에요. <b>②</b>를 눌러 무리의 중심점을 아무 데나 놓아보세요.');
  };
  const seed = () => {
    const k = +$('#kmK').value;
    cents = Array.from({ length: k }, () => ({ x: rand(40, W - 40), y: rand(40, H - 40) }));
    pts.forEach((p) => (p.c = -1)); iter = 0; done = false; phase = 'assign';
    msg(`중심점 ${k}개를 아무 데나 놓았어요. 이제 <b>③ 한 단계 진행</b>!`);
  };
  const step = () => {
    if (!cents) seed();
    if (done) { msg('✅ 더 이상 바뀌지 않아요. <b>무리 나누기 완료!</b> k를 바꿔서 다시 해보세요.'); return false; }
    if (phase === 'assign') {
      let changed = 0;
      pts.forEach((p) => {
        let best = 0, bd = Infinity;
        cents.forEach((c, i) => { const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2; if (d < bd) { bd = d; best = i; } });
        if (p.c !== best) changed++; p.c = best;
      });
      iter++;
      if (changed === 0 && iter > 1) { done = true; msg(`✅ ${iter - 1}번 만에 무리가 정해졌어요! 정답을 알려주지 않았는데도 비슷한 점끼리 모였죠?`); confetti(40); return false; }
      msg(`<b>[${iter}회차] 색칠하기:</b> 각 점은 가장 가까운 중심점의 색으로 칠해져요. (${changed}개 바뀜)`);
      phase = 'move';
    } else {
      cents.forEach((c, i) => {
        const m = pts.filter((p) => p.c === i);
        if (m.length) { c.x = m.reduce((s, p) => s + p.x, 0) / m.length; c.y = m.reduce((s, p) => s + p.y, 0) / m.length; }
      });
      msg(`<b>[${iter}회차] 중심 옮기기:</b> 각 중심점이 자기 색 점들의 한가운데로 이동해요.`);
      phase = 'assign';
    }
    return true;
  };
  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach((p) => { ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fillStyle = p.c < 0 ? '#9aa5a0' : COL[p.c]; ctx.globalAlpha = .85; ctx.fill(); ctx.globalAlpha = 1; });
    if (cents) cents.forEach((c, i) => {
      ctx.save(); ctx.translate(c.x, c.y);
      ctx.fillStyle = COL[i]; ctx.strokeStyle = cssVar('--ink'); ctx.lineWidth = 3;
      ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 8 : 18, t = k * Math.PI / 5 - Math.PI / 2; ctx.lineTo(Math.cos(t) * r, Math.sin(t) * r); } ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    });
  }
  const stopAuto = () => { clearInterval(auto); auto = null; $('#kmAuto').textContent = '⏩ 끝까지 자동 실행'; };
  $('#kmData').addEventListener('click', () => { stopAuto(); makeData(); draw(); });
  $('#kmSeed').addEventListener('click', () => { stopAuto(); seed(); draw(); });
  $('#kmStep').addEventListener('click', () => { stopAuto(); step(); draw(); });
  $('#kmAuto').addEventListener('click', () => {
    if (auto) { stopAuto(); return; }
    if (!cents || done) seed();
    $('#kmAuto').textContent = '⏸ 멈추기';
    auto = setInterval(() => { const go = step(); draw(); if (!go) stopAuto(); }, 650);
  });
  $('#kmK').addEventListener('input', (e) => { $('#kmKVal').textContent = e.target.value; });
  makeData(); draw();
  document.addEventListener('themechange', draw);
}

/* --- 강화학습: 미로에서 쿠키 찾기 (Q-러닝) --- */
function initRL() {
  const cv = $('#rlCanvas'), ctx = cv.getContext('2d'), COLS = 6, ROWS = 4, S = cv.width / COLS;
  const MAP = ['.....G', '..F.F.', '.W....', 'S..F..'];
  const START = { x: 0, y: 3 };
  const cell = (x, y) => MAP[y][x];
  const MOVES = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  let Q, eps, history, bot, trail, anim = null;
  const reset = () => {
    Q = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => [0, 0, 0, 0]));
    eps = .5; history = []; bot = { ...START }; trail = [];
    $('#rlEp').textContent = 0; $('#rlSteps').textContent = '-';
  };
  const act = (s, explore) => {
    if (explore && Math.random() < eps) return Math.floor(Math.random() * 4);
    const q = Q[s.y][s.x], m = Math.max(...q), best = q.map((v, i) => (v === m ? i : -1)).filter((i) => i >= 0);
    return best[Math.floor(Math.random() * best.length)];
  };
  const move = (s, a) => {
    const nx = s.x + MOVES[a][0], ny = s.y + MOVES[a][1];
    if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || cell(nx, ny) === 'W') return { s, r: -2, end: false };
    const c = cell(nx, ny);
    return { s: { x: nx, y: ny }, r: c === 'G' ? 10 : c === 'F' ? -10 : -1, end: c === 'G' || c === 'F' };
  };
  const learn = (s, a, r, n, end) => {
    const target = r + (end ? 0 : .9 * Math.max(...Q[n.y][n.x]));
    Q[s.y][s.x][a] += .5 * (target - Q[s.y][s.x][a]);
  };
  const episode = () => {
    let s = { ...START }, steps = 0, end = false, res = null;
    while (!end && steps < 60) { const a = act(s, true), m = move(s, a); learn(s, a, m.r, m.s, m.end); s = m.s; end = m.end; steps++; res = cell(s.x, s.y); }
    history.push({ steps, win: res === 'G' }); eps = Math.max(.05, eps * .97);
    return steps;
  };
  function draw() {
    const maxQ = Math.max(1, ...Q.flat().map((q) => Math.max(...q)));
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const c = cell(x, y), v = Math.max(...Q[y][x]);
      ctx.fillStyle = c === 'W' ? '#5b6168' : cssVar('--surface');
      ctx.fillRect(x * S, y * S, S, S);
      if (c === '.' || c === 'S') { ctx.fillStyle = `rgba(34,160,107,${clamp(v / maxQ, 0, 1) * .55})`; ctx.fillRect(x * S, y * S, S, S); }
      ctx.strokeStyle = cssVar('--line'); ctx.lineWidth = 2; ctx.strokeRect(x * S, y * S, S, S);
      ctx.font = '44px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (c === 'G') ctx.fillText('🍪', x * S + S / 2, y * S + S / 2);
      if (c === 'F') ctx.fillText('🔥', x * S + S / 2, y * S + S / 2);
      if (c === 'W') ctx.fillText('🧱', x * S + S / 2, y * S + S / 2);
      if (c === 'S') { ctx.font = '14px "Noto Sans KR"'; ctx.fillStyle = cssVar('--muted'); ctx.fillText('출발', x * S + S / 2, y * S + S - 14); }
    }
    if (trail.length > 1) {
      ctx.strokeStyle = cssVar('--orange'); ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.globalAlpha = .7;
      ctx.beginPath(); trail.forEach((p, i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, p.x * S + S / 2, p.y * S + S / 2)); ctx.stroke(); ctx.globalAlpha = 1;
    }
    ctx.font = '48px sans-serif'; ctx.fillText('🤖', bot.x * S + S / 2, bot.y * S + S / 2 + 2);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    drawChart();
  }
  function drawChart() {
    const c = $('#rlChart'), g = c.getContext('2d'), w = c.width, h = c.height;
    g.clearRect(0, 0, w, h);
    g.fillStyle = cssVar('--muted'); g.font = '11px "Noto Sans KR"'; g.fillText('판마다 걸린 걸음 수 (낮을수록 잘함)', 6, 13);
    if (history.length < 2) return;
    const n = history.length, mx = Math.max(...history.map((d) => d.steps));
    g.strokeStyle = cssVar('--orange'); g.lineWidth = 2; g.beginPath();
    history.forEach((d, i) => { const x = 6 + i / (n - 1) * (w - 12), y = h - 6 - d.steps / mx * (h - 26); i ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.stroke();
  }
  const stop = () => { clearInterval(anim); anim = null; };
  const play = (path, ms, after) => {
    stop(); let i = 0; trail = [path[0]];
    anim = setInterval(() => { bot = path[i]; trail = path.slice(0, i + 1); draw(); if (++i >= path.length) { stop(); after && after(); } }, ms);
  };
  $('#rlOne').addEventListener('click', () => {
    stop();
    let s = { ...START }, path = [s], end = false, steps = 0;
    while (!end && steps < 60) { const a = act(s, true), m = move(s, a); learn(s, a, m.r, m.s, m.end); s = m.s; end = m.end; steps++; path.push(s); }
    const res = cell(s.x, s.y);
    history.push({ steps, win: res === 'G' }); eps = Math.max(.05, eps * .97);
    $('#rlEp').textContent = history.length; $('#rlSteps').textContent = steps;
    play(path, 110, () => toast(res === 'G' ? `🍪 쿠키 도착! (${steps}걸음)` : res === 'F' ? '🔥 앗 뜨거워! 벌점 -10' : '😵 길을 잃었어요'));
  });
  $('#rlMany').addEventListener('click', () => {
    stop(); let last = 0;
    for (let i = 0; i < 100; i++) last = episode();
    bot = { ...START }; trail = [];
    $('#rlEp').textContent = history.length; $('#rlSteps').textContent = last;
    draw(); toast('100판 연습 완료! ⭐ 최선의 길을 눌러보세요');
  });
  $('#rlBest').addEventListener('click', () => {
    let s = { ...START }, path = [s], seen = new Set(), end = false;
    while (!end && path.length < 30 && !seen.has(s.x + ',' + s.y)) { seen.add(s.x + ',' + s.y); const m = move(s, act(s, false)); s = m.s; end = m.end; path.push(s); }
    const res = cell(s.x, s.y);
    play(path, 220, () => toast(res === 'G' ? `⭐ ${path.length - 1}걸음 만에 쿠키 도착! 다 배웠어요` : '아직 길을 다 못 배웠어요. 더 연습시켜 보세요!'));
  });
  $('#rlReset').addEventListener('click', () => { stop(); reset(); draw(); });
  reset(); draw();
  document.addEventListener('themechange', draw);
}

/* --- YOLO = 분류 + 회귀 --- */
function initYoloType() {
  const [x, y, w, h] = SCENE_BOX.dog;
  const t = (tx, ty, s, c, size = 15) => `<text x="${tx}" y="${ty}" fill="${c}" font-size="${size}" font-weight="700" font-family="Noto Sans KR">${s}</text>`;
  $('#yoloTypeSvg').innerHTML = sceneBase() + `
    <rect x="0" y="0" width="640" height="400" fill="rgba(255,255,255,.35)"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#3ddb86" stroke-width="4"/>
    <rect x="${x - 2}" y="${y - 24}" width="92" height="24" fill="#3ddb86"/>
    <text x="${x + 6}" y="${y - 7}" fill="#fff" font-size="15" font-weight="700" font-family="JetBrains Mono, monospace">dog 0.91</text>
    <rect x="300" y="40" width="230" height="56" rx="12" fill="#3b6fe0"/>
    ${t(316, 64, '🏷️ 분류: 무엇인가?', '#fff')}${t(316, 86, '→ "dog" (강아지)', '#fff', 14)}
    <path d="M360 96 L ${x + 40} ${y - 26}" stroke="#3b6fe0" stroke-width="3" fill="none" marker-end="url(#ar)"/>
    <rect x="20" y="20" width="250" height="78" rx="12" fill="#f07a1a"/>
    ${t(36, 44, '📏 회귀: 어디에 있나?', '#fff')}${t(36, 66, 'x 0.56  y 0.70', '#fff', 14)}${t(36, 86, 'w 0.27  h 0.26  (숫자 4개)', '#fff', 14)}
    <path d="M200 98 L ${x + 4} ${y + 30}" stroke="#f07a1a" stroke-width="3" fill="none" marker-end="url(#ar)"/>
    <line x1="${x}" y1="${y + h + 14}" x2="${x + w}" y2="${y + h + 14}" stroke="#f07a1a" stroke-width="3"/>
    <line x1="${x + w + 12}" y1="${y}" x2="${x + w + 12}" y2="${y + h}" stroke="#f07a1a" stroke-width="3"/>
    <circle cx="${x + w / 2}" cy="${y + h / 2}" r="6" fill="#f07a1a" stroke="#fff" stroke-width="2"/>
    <defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="context-stroke"/></marker></defs>`;
}
