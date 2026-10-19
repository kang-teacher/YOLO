/* 1단원: 인공지능 · 머신러닝 · 딥러닝 */
function initML() {
  /* --- 포함 관계 원 --- */
  const INFO = {
    ai: { t: '🤖 인공지능 (AI)', d: '사람처럼 생각하고 판단하는 능력을 컴퓨터로 구현한 모든 기술을 말해요. 규칙을 사람이 직접 넣어주는 프로그램도 넓게 보면 인공지능이에요.', ex: ['체스 두는 컴퓨터', '음성 비서', '게임 속 NPC', '추천 시스템'] },
    ml: { t: '📈 머신러닝 (Machine Learning)', d: '사람이 규칙을 일일이 알려주지 않아도, <b>데이터를 보고 스스로 규칙(패턴)을 찾아내는</b> 인공지능이에요. 많은 예시를 보여줄수록 더 똑똑해져요.', ex: ['스팸 메일 걸러내기', '집값 예측', '쇼핑 추천'] },
    dl: { t: '🧠 딥러닝 (Deep Learning)', d: '사람 뇌의 신경망을 흉내 낸 <b>인공신경망을 여러 층으로 깊게</b> 쌓은 머신러닝이에요. 사진·소리·글처럼 복잡한 데이터에서 특징을 스스로 뽑아내요. <b>YOLO도 딥러닝 모델</b>이랍니다!', ex: ['YOLO 객체인식', '얼굴 인식', '번역기', '자율주행', 'ChatGPT·Claude'] },
  };
  $$('#nestSvg .nest-c').forEach((c) => c.addEventListener('click', (e) => {
    e.stopPropagation();
    const k = c.dataset.k, inf = INFO[k];
    $$('#nestSvg .nest-c').forEach((x) => x.classList.toggle('on', x === c));
    $('#nestInfo').innerHTML = `<h3>${inf.t}</h3><p>${inf.d}</p><div class="ex">${inf.ex.map((x) => `<span>${x}</span>`).join('')}</div>`;
  }));

  /* --- 기존 프로그래밍 vs 머신러닝 --- */
  const FLOW = {
    rule: { in1: '규칙<small>"귀가 뾰족하고 수염이 있으면 고양이"</small>', in2: '데이터<small>새 사진 한 장</small>', out: '답<small>"고양이"</small>', d: '사람이 규칙을 직접 생각해서 코드로 적어야 해요. 그런데 고양이를 설명하는 규칙을 빠짐없이 적을 수 있을까요? 🤔', hl: 1 },
    ml: { in1: '데이터<small>고양이·강아지 사진 수천 장</small>', in2: '답(정답 라벨)<small>"이건 고양이, 이건 강아지"</small>', out: '규칙(모델)<small>스스로 찾은 판단 기준 → .pt 파일</small>', d: '데이터와 정답을 잔뜩 보여주면 컴퓨터가 <b>규칙을 스스로 찾아내요.</b> 이렇게 만들어진 규칙 덩어리가 "모델"이고, YOLO에서는 .pt 파일로 저장돼요.', hl: 0 },
  };
  const setFlow = (m) => {
    const f = FLOW[m];
    $('#flowIn1').innerHTML = f.in1; $('#flowIn2').innerHTML = f.in2; $('#flowOut').innerHTML = f.out;
    $('#flowDesc').innerHTML = f.d;
    $('#flowIn1').classList.toggle('hl-box', f.hl === 1);
    $('#flowOut').classList.toggle('hl-box', m === 'ml');
    $$('#progToggle button').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
  };
  $$('#progToggle button').forEach((b) => b.addEventListener('click', () => setFlow(b.dataset.mode)));
  setFlow('rule');

  /* --- 퍼셉트론(로지스틱 회귀) 학습 체험 --- */
  const cv = $('#percCanvas'), ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, PAD = 40;
  let pts = [], cls = 1, w = [0, 0, 0], epoch = 0, training = false, trained = false, hoverP = null;
  const toPx = (x, y) => [PAD + x * (W - PAD * 1.5), H - PAD - y * (H - PAD * 1.5)];
  const fromPx = (px, py) => [(px - PAD) / (W - PAD * 1.5), (H - PAD - py) / (H - PAD * 1.5)];
  const sig = (z) => 1 / (1 + Math.exp(-z));
  const pred = (x, y) => sig(w[0] * x + w[1] * y + w[2]);
  const acc = () => pts.length ? pts.filter((p) => (pred(p.x, p.y) > .5 ? 1 : -1) === p.c).length / pts.length : 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const A = cssVar('--c-a'), B = cssVar('--c-b');
    if (epoch > 0) {
      const step = 12;
      for (let px = PAD; px < W; px += step) for (let py = 0; py < H - PAD; py += step) {
        const [x, y] = fromPx(px + step / 2, py + step / 2);
        const p = pred(x, y);
        ctx.fillStyle = p > .5 ? A : B;
        ctx.globalAlpha = Math.abs(p - .5) * .35;
        ctx.fillRect(px, py, step, step);
      }
      ctx.globalAlpha = 1;
      // 경계선 w0 x + w1 y + w2 = 0
      if (Math.abs(w[1]) > 1e-6) {
        const y0 = -(w[2]) / w[1], y1 = -(w[0] + w[2]) / w[1];
        const [ax, ay] = toPx(0, y0), [bx, by] = toPx(1, y1);
        ctx.strokeStyle = cssVar('--ink'); ctx.lineWidth = 3; ctx.setLineDash([10, 6]);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    // 축
    ctx.strokeStyle = cssVar('--muted'); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(PAD, 10); ctx.lineTo(PAD, H - PAD); ctx.lineTo(W - 10, H - PAD); ctx.stroke();
    ctx.fillStyle = cssVar('--muted'); ctx.font = '13px "Noto Sans KR"';
    ctx.fillText('귀 길이 →', W - 80, H - PAD + 22);
    ctx.save(); ctx.translate(16, 90); ctx.rotate(-Math.PI / 2); ctx.fillText('몸무게 →', 0, 0); ctx.restore();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '22px sans-serif';
    for (const p of pts) {
      const [px, py] = toPx(p.x, p.y);
      ctx.fillStyle = p.c === 1 ? A : B;
      ctx.beginPath(); ctx.arc(px, py, 15, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(p.c === 1 ? '🐶' : '🐱', px, py + 1);
      if (epoch > 0 && (pred(p.x, p.y) > .5 ? 1 : -1) !== p.c) { ctx.strokeStyle = '#e2483d'; ctx.lineWidth = 3; ctx.stroke(); }
    }
    if (!pts.length) { ctx.font = '16px "Noto Sans KR"'; ctx.fillStyle = cssVar('--muted'); ctx.fillText('여기를 클릭해서 데이터를 찍어보세요', W / 2, H / 2); }
    if (hoverP && trained) {
      const [x, y] = fromPx(hoverP.x, hoverP.y), p = pred(x, y);
      const lab = p > .5 ? `🐶 강아지 ${(p * 100).toFixed(0)}%` : `🐱 고양이 ${((1 - p) * 100).toFixed(0)}%`;
      ctx.font = '700 14px "Noto Sans KR"'; ctx.textAlign = 'left';
      const tw = ctx.measureText(lab).width + 16;
      const bx = Math.min(hoverP.x + 12, W - tw - 4);
      ctx.fillStyle = cssVar('--ink'); roundRect(ctx, bx, hoverP.y - 34, tw, 26, 8); ctx.fill();
      ctx.fillStyle = cssVar('--bg'); ctx.fillText(lab, bx + 8, hoverP.y - 21);
      ctx.beginPath(); ctx.arc(hoverP.x, hoverP.y, 5, 0, Math.PI * 2); ctx.fillStyle = cssVar('--ink'); ctx.fill();
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    $('#percEpoch').textContent = epoch;
    $('#percAcc').textContent = epoch ? Math.round(acc() * 100) + '%' : '-';
  }
  function trainStep() {
    const lr = 1.2, n = pts.length;
    for (let it = 0; it < 4; it++) {
      const g = [0, 0, 0];
      for (const p of pts) { const t = p.c === 1 ? 1 : 0, e = pred(p.x, p.y) - t; g[0] += e * p.x; g[1] += e * p.y; g[2] += e; }
      for (let k = 0; k < 3; k++) w[k] -= lr * g[k] / n;
    }
    epoch++;
  }
  function loop() {
    if (!training) return;
    trainStep(); draw();
    if (epoch >= 150 || (acc() === 1 && epoch > 30)) {
      training = false; trained = true;
      $('#percTrain').textContent = '▶ 다시 학습';
      toast(acc() === 1 ? '학습 완료! 모든 데이터를 정확히 나눴어요 🎉' : `학습 완료! 정확도 ${Math.round(acc() * 100)}%`);
      draw(); return;
    }
    requestAnimationFrame(loop);
  }
  onDrag(cv, {
    down: (p) => {
      const [x, y] = fromPx(p.x, p.y);
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      pts.push({ x, y, c: cls }); draw();
    },
    hover: (p) => { hoverP = p; if (trained) draw(); },
  });
  $$('#percClass button').forEach((b) => b.addEventListener('click', () => { cls = +b.dataset.c; $$('#percClass button').forEach((x) => x.classList.toggle('on', x === b)); }));
  $('#percTrain').addEventListener('click', () => {
    if (pts.length < 2 || !pts.some((p) => p.c === 1) || !pts.some((p) => p.c === -1)) { toast('강아지와 고양이 데이터를 둘 다 찍어주세요!'); return; }
    w = [rand(-1, 1), rand(-1, 1), 0]; epoch = 0; trained = false; training = true; $('#percTrain').textContent = '학습 중…'; loop();
  });
  $('#percRandom').addEventListener('click', () => {
    pts = []; epoch = 0; trained = false;
    for (let i = 0; i < 12; i++) pts.push({ x: clamp(rand(.5, .92), 0, 1), y: clamp(rand(.45, .9), 0, 1), c: 1 });
    for (let i = 0; i < 12; i++) pts.push({ x: clamp(rand(.08, .5), 0, 1), y: clamp(rand(.08, .5), 0, 1), c: -1 });
    draw();
  });
  $('#percClear').addEventListener('click', () => { pts = []; epoch = 0; trained = false; training = false; $('#percTrain').textContent = '▶ 학습 시작'; draw(); });
  draw();
  document.addEventListener('themechange', draw);

  /* --- 인공신경망 시각화 --- */
  const nn = $('#nnCanvas'), nctx = nn.getContext('2d');
  let layers = 3, pulses = [], firing = false, t0 = 0;
  const FEAT = ['선·모서리', '모양·질감', '눈·귀·코', '얼굴 전체', '몸 형태', '종합 판단'];
  const nodes = () => {
    const L = [5, ...Array(layers).fill(6), 2];
    const NW = nn.width, NH = nn.height;
    return L.map((n, li) => Array.from({ length: n }, (_, k) => ({ x: 70 + li * (NW - 140) / (L.length - 1), y: 50 + (k + .5) * (NH - 90) / n })));
  };
  function drawNN(now = 0) {
    const N = nodes(), NW = nn.width, NH = nn.height;
    nctx.clearRect(0, 0, NW, NH);
    const phase = firing ? (now - t0) / 450 : -1;
    for (let li = 0; li < N.length - 1; li++) {
      const act = phase >= li && phase < li + 1.6;
      for (const a of N[li]) for (const b of N[li + 1]) {
        nctx.strokeStyle = act ? cssVar('--yellow') : cssVar('--line');
        nctx.lineWidth = act ? 1.6 : 1;
        nctx.globalAlpha = act ? .9 : .7;
        nctx.beginPath(); nctx.moveTo(a.x, a.y); nctx.lineTo(b.x, b.y); nctx.stroke();
        if (firing && phase >= li && phase < li + 1) {
          const f = phase - li;
          nctx.fillStyle = cssVar('--orange'); nctx.globalAlpha = 1;
          nctx.beginPath(); nctx.arc(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, 2.5, 0, Math.PI * 2); nctx.fill();
        }
      }
    }
    nctx.globalAlpha = 1;
    N.forEach((col, li) => {
      const isIn = li === 0, isOut = li === N.length - 1;
      const lit = firing && phase >= li;
      col.forEach((p, k) => {
        nctx.beginPath(); nctx.arc(p.x, p.y, isOut ? 16 : 12, 0, Math.PI * 2);
        nctx.fillStyle = isIn ? cssVar('--yellow') : isOut ? cssVar('--blue') : cssVar('--green-2');
        nctx.globalAlpha = lit || !firing ? 1 : .35; nctx.fill(); nctx.globalAlpha = 1;
        if (isOut) {
          nctx.fillStyle = cssVar('--ink'); nctx.font = '700 13px "Noto Sans KR"'; nctx.textAlign = 'left';
          const done = firing && phase >= li + .3;
          nctx.fillText(k === 0 ? `🐱 ${done ? '97%' : '?'}` : `🐶 ${done ? '3%' : '?'}`, p.x + 22, p.y + 5);
        }
      });
      nctx.fillStyle = cssVar('--muted'); nctx.font = '12px "Noto Sans KR"'; nctx.textAlign = 'center';
      nctx.fillText(isIn ? '입력층' : isOut ? '출력층' : `은닉층 ${li}`, col[0].x, 24);
      if (!isIn && !isOut) nctx.fillText(FEAT[Math.min(li - 1, FEAT.length - 1)], col[0].x, NH - 12);
      if (isIn) nctx.fillText('픽셀', col[0].x, NH - 12);
    });
    if (firing) {
      if (phase < N.length + .5) requestAnimationFrame(drawNN);
      else { firing = false; drawNN(); }
    }
  }
  $('#nnLayers').addEventListener('input', (e) => { layers = +e.target.value; $('#nnLayersVal').textContent = layers; firing = false; drawNN(); });
  $('#nnFire').addEventListener('click', () => { firing = true; t0 = performance.now(); requestAnimationFrame(drawNN); });
  drawNN();
  document.addEventListener('themechange', () => drawNN());
}
