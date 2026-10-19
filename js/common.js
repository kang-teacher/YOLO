/* 공통 도우미 */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

const store = {
  get(k, d) { try { const v = localStorage.getItem('yolo-class:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('yolo-class:' + k, JSON.stringify(v)); } catch { /* 저장 불가 환경 */ } },
};

function toast(msg, ms = 2200) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), ms);
}

function confetti(n = 120) {
  const box = $('#confetti');
  const colors = ['#22a06b', '#f5b82e', '#3b6fe0', '#e9468b', '#f07a1a', '#7b55d9'];
  for (let i = 0; i < n; i++) {
    const d = document.createElement('i');
    d.className = 'cf';
    d.style.left = rand(0, 100) + 'vw';
    d.style.background = colors[i % colors.length];
    d.style.animationDuration = rand(1.8, 3.6) + 's';
    d.style.animationDelay = rand(0, .6) + 's';
    d.style.transform = `rotate(${rand(0, 360)}deg)`;
    box.appendChild(d);
    setTimeout(() => d.remove(), 4400);
  }
}

/* 캔버스 좌표: CSS 크기 → 내부 해상도 */
function canvasPoint(cv, e) {
  const r = cv.getBoundingClientRect();
  const p = e.touches ? e.touches[0] : e;
  return { x: (p.clientX - r.left) * cv.width / r.width, y: (p.clientY - r.top) * cv.height / r.height };
}

/* 마우스/터치 드래그 공통 처리 */
function onDrag(cv, { down, move, up, hover }) {
  let dragging = false;
  cv.addEventListener('pointerdown', (e) => { dragging = true; cv.setPointerCapture(e.pointerId); down && down(canvasPoint(cv, e), e); });
  cv.addEventListener('pointermove', (e) => { const p = canvasPoint(cv, e); if (dragging) move && move(p, e); else hover && hover(p, e); });
  const end = (e) => { if (!dragging) return; dragging = false; up && up(canvasPoint(cv, e), e); };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);
  cv.addEventListener('pointerleave', (e) => { if (!dragging && hover) hover(null, e); });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/* 라벨 붙은 상자 그리기 (YOLO 결과 스타일) */
function drawBox(ctx, x, y, w, h, color, label, lw = 3) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = lw;
  ctx.strokeRect(x, y, w, h);
  if (label) {
    ctx.font = '600 14px "JetBrains Mono", monospace';
    const tw = ctx.measureText(label).width + 10;
    const ly = y - 20 < 0 ? y : y - 20;
    ctx.fillStyle = color; ctx.fillRect(x - lw / 2, ly, tw, 20);
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + 4, ly + 10);
  }
  ctx.restore();
}

function iou(a, b) {
  const x1 = Math.max(a.x, b.x), y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w), y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const uni = a.w * a.h + b.w * b.h - inter;
  return uni > 0 ? inter / uni : 0;
}

/* 화면에 보일 때만 애니메이션 돌리기 */
function whenVisible(el, cb) {
  const io = new IntersectionObserver((ents) => ents.forEach((en) => cb(en.isIntersecting)), { threshold: 0.05 });
  io.observe(el);
}

/* COCO 80 클래스 (YOLO 기본 모델이 아는 물체) */
const COCO = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'];
const COCO_KO = ['사람', '자전거', '자동차', '오토바이', '비행기', '버스', '기차', '트럭', '보트', '신호등', '소화전', '정지 표지판', '주차 미터기', '벤치', '새', '고양이', '강아지', '말', '양', '소', '코끼리', '곰', '얼룩말', '기린', '배낭', '우산', '핸드백', '넥타이', '여행가방', '원반', '스키', '스노보드', '공', '연', '야구 배트', '야구 글러브', '스케이트보드', '서핑보드', '테니스 라켓', '병', '와인잔', '컵', '포크', '나이프', '숟가락', '그릇', '바나나', '사과', '샌드위치', '오렌지', '브로콜리', '당근', '핫도그', '피자', '도넛', '케이크', '의자', '소파', '화분', '침대', '식탁', '변기', 'TV', '노트북', '마우스', '리모컨', '키보드', '휴대폰', '전자레인지', '오븐', '토스터', '싱크대', '냉장고', '책', '시계', '꽃병', '가위', '곰인형', '헤어드라이어', '칫솔'];
const PALETTE = ['#ff3838', '#ff9d97', '#ff701f', '#ffb21d', '#cfd231', '#48f90a', '#92cc17', '#3ddb86', '#1a9334', '#00d4bb', '#2c99a8', '#00c2ff', '#344593', '#6473ff', '#0018ec', '#8438ff', '#520085', '#cb38ff', '#ff95c8', '#ff37c7'];
const classColor = (i) => PALETTE[i % PALETTE.length];

/* 간단한 파이썬 문법 색칠 */
function highlightPy(line) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const out = [];
  const re = /(#.*$)|('[^']*'|"[^"]*")|\b(from|import|while|if|for|in|not|def|return|continue|break|True|False|None|and|or)\b|\b(\d+\.?\d*)\b|\b([A-Za-z_]\w*)(?=\()/g;
  let last = 0, m;
  while ((m = re.exec(line))) {
    out.push(esc(line.slice(last, m.index)));
    if (m[1]) out.push(`<span class="tok-com">${esc(m[1])}</span>`);
    else if (m[2]) out.push(`<span class="tok-str">${esc(m[2])}</span>`);
    else if (m[3]) out.push(`<span class="tok-kw">${m[3]}</span>`);
    else if (m[4]) out.push(`<span class="tok-num">${m[4]}</span>`);
    else if (m[5]) out.push(`<span class="tok-fn">${m[5]}</span>`);
    last = re.lastIndex;
  }
  out.push(esc(line.slice(last)));
  return out.join('');
}

/* 카드를 알맞은 상자로 옮기는 분류 게임 (클릭 또는 드래그) */
function makeSorter(root, cards, praise) {
  let sel = null;
  const pool = $('.sort-pool', root), bins = $$('.bin', root), msg = $('.result-msg', root);
  const reset = () => {
    pool.innerHTML = ''; $$('.bin-drop', root).forEach((b) => (b.innerHTML = '')); msg.textContent = '';
    shuffle(cards).forEach(([t, a]) => {
      const c = document.createElement('div');
      c.className = 'sort-card'; c.textContent = t; c.dataset.a = a; c.draggable = true;
      c.addEventListener('click', (e) => { e.stopPropagation(); sel = sel === c ? null : c; $$('.sort-card', root).forEach((x) => x.classList.toggle('sel', x === sel)); });
      c.addEventListener('dragstart', (e) => { sel = c; c.classList.add('dragging'); e.dataTransfer.setData('text', ''); });
      c.addEventListener('dragend', () => c.classList.remove('dragging'));
      pool.appendChild(c);
    });
  };
  const place = (bin) => {
    if (!sel) return;
    sel.classList.remove('sel', 'right', 'wrong');
    $('.bin-drop', bin).appendChild(sel); sel = null;
  };
  bins.forEach((bin) => {
    bin.addEventListener('click', () => place(bin));
    bin.addEventListener('dragover', (e) => { e.preventDefault(); bin.classList.add('over'); });
    bin.addEventListener('dragleave', () => bin.classList.remove('over'));
    bin.addEventListener('drop', (e) => { e.preventDefault(); bin.classList.remove('over'); place(bin); });
  });
  pool.addEventListener('click', () => { if (sel) { pool.appendChild(sel); sel.classList.remove('sel'); sel = null; } });
  $('.sort-check', root).addEventListener('click', () => {
    let right = 0;
    bins.forEach((bin) => $$('.sort-card', bin).forEach((c) => {
      const ok = c.dataset.a === bin.dataset.bin; c.classList.toggle('right', ok); c.classList.toggle('wrong', !ok); if (ok) right++;
    }));
    const left = pool.children.length;
    if (right === cards.length) { msg.textContent = `🎉 ${cards.length}개 모두 정답! ${praise}`; msg.className = 'result-msg good'; confetti(80); }
    else { msg.textContent = `${right} / ${cards.length} 정답${left ? ` (남은 카드 ${left}개)` : ''} · 빨간 카드를 다른 상자로 옮겨보세요.`; msg.className = 'result-msg bad'; }
  });
  $('.sort-reset', root).addEventListener('click', reset);
  reset();
}
