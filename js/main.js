/* 페이지 이동, 진도, 첫 화면 */
const CHAPTERS = [
  { id: 'home', emoji: '🏠', short: '시작' },
  { id: 'ml', emoji: '🧠', short: 'ML·DL', desc: '인공지능 ⊃ 머신러닝 ⊃ 딥러닝, 직접 학습시켜 보기' },
  { id: 'types', emoji: '🗂️', short: 'ML 종류', desc: '지도·비지도·강화학습, 분류와 회귀, 군집화와 미로 체험' },
  { id: 'detect', emoji: '🔍', short: '객체인식', desc: '분류·탐지·분할·특징점, 활용 사례 분류 게임' },
  { id: 'yolo', emoji: '⚡', short: 'YOLO 특징', desc: '한 번 보기 레이스, 격자, IoU, 좌표, 모델 가족' },
  { id: 'practice', emoji: '🛠️', short: '활용 실습', desc: 'PyCharm 실행부터 Roboflow·Colab으로 나만의 모델까지' },
  { id: 'live', emoji: '📷', short: 'YOLO 실행', desc: '브라우저에서 진짜 yolo11n으로 웹캠·영상 인식' },
  { id: 'final', emoji: '🔔', short: '골든벨', desc: '10문제 마무리 퀴즈와 수료증' },
];

function initNav() {
  const nav = $('#chapnav');
  nav.innerHTML = CHAPTERS.map((c, i) => `<a href="#${c.id}" data-id="${c.id}">${c.emoji} ${i ? c.short : '시작'}<span class="ck"></span></a>`).join('');
  $('#chapterCards').innerHTML = CHAPTERS.slice(1).map((c, i) => {
    const title = $(`.chapter[data-ch="${c.id}"]`).dataset.title;
    return `<a class="chapter-card" href="#${c.id}" data-id="${c.id}"><span class="cc-done"></span><div class="cc-emoji">${c.emoji}</div><h3>${i + 1 < CHAPTERS.length - 1 ? i + 1 + '. ' : ''}${title}</h3><p>${c.desc}</p></a>`;
  }).join('');

  const go = () => {
    let id = location.hash.slice(1);
    if (!CHAPTERS.some((c) => c.id === id)) id = 'home';
    const idx = CHAPTERS.findIndex((c) => c.id === id);
    $$('.chapter').forEach((s) => s.classList.toggle('on', s.dataset.ch === id));
    $$('a', nav).forEach((a) => a.classList.toggle('on', a.dataset.id === id));
    $('.on', nav)?.scrollIntoView({ inline: 'center', block: 'nearest' });
    $('#progressFill').style.width = (idx / (CHAPTERS.length - 1)) * 100 + '%';
    $('#prevBtn').disabled = idx === 0;
    $('#nextBtn').disabled = idx === CHAPTERS.length - 1;
    $('#pagerTitle').textContent = `${idx + 1} / ${CHAPTERS.length} · ${$(`.chapter[data-ch="${id}"]`).dataset.title}`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    const seen = store.get('seen', []);
    if (!seen.includes(id)) { seen.push(id); store.set('seen', seen); }
    markDone();
    document.dispatchEvent(new CustomEvent('chapter', { detail: id }));
  };
  const step = (d) => {
    const idx = CHAPTERS.findIndex((c) => c.id === (location.hash.slice(1) || 'home'));
    location.hash = CHAPTERS[clamp(idx + d, 0, CHAPTERS.length - 1)].id;
  };
  $('#prevBtn').addEventListener('click', () => step(-1));
  $('#nextBtn').addEventListener('click', () => step(1));
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    if (e.key === 'ArrowRight' && e.altKey) step(1);
    if (e.key === 'ArrowLeft' && e.altKey) step(-1);
  });
  window.addEventListener('hashchange', go);
  document.addEventListener('progress', markDone);
  go();
}

function markDone() {
  CHAPTERS.slice(1).forEach((c) => {
    const quiz = store.get('quiz:' + c.id, 0), seen = store.get('seen', []).includes(c.id);
    const label = quiz ? `✔ 퀴즈 ${quiz}점` : seen ? '👀 봤어요' : '';
    const card = $(`.chapter-card[data-id="${c.id}"] .cc-done`); if (card) card.textContent = label;
    const ck = $(`#chapnav a[data-id="${c.id}"] .ck`); if (ck) ck.textContent = quiz ? '✔' : '';
  });
}

function initTheme() {
  const root = document.documentElement;
  const saved = store.get('theme', null);
  if (saved) root.dataset.theme = saved;
  $('#themeBtn').addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    store.set('theme', root.dataset.theme);
    document.dispatchEvent(new Event('themechange'));
  });
}

/* 첫 화면: 격자 스캔 → 상자가 뜨는 애니메이션 */
function initHero() {
  const cv = $('#heroCanvas'), ctx = cv.getContext('2d');
  let visible = true;
  whenVisible(cv, (v) => { visible = v; });
  sceneImage().then((img) => {
    const W = cv.width, H = cv.height, s = Math.min(W / 640, H / 400), ox = (W - 640 * s) / 2, oy = (H - 400 * s) / 2;
    const t0 = performance.now();
    const frame = (now) => {
      requestAnimationFrame(frame);
      if (!visible || !$('.chapter[data-ch="home"]').classList.contains('on')) return;
      const t = ((now - t0) / 1000) % 6;
      ctx.fillStyle = '#cfe7f6'; ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, ox, oy, 640 * s, 400 * s);
      const S = 7, gw = 640 * s / S, gh = 400 * s / S;
      if (t < 1.6) {
        const sweep = t / 1.6;
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.5;
        for (let k = 1; k < S; k++) {
          if (k / S > sweep) break;
          ctx.beginPath(); ctx.moveTo(ox + k * gw, oy); ctx.lineTo(ox + k * gw, oy + 400 * s); ctx.moveTo(ox, oy + k * gh); ctx.lineTo(ox + 640 * s, oy + k * gh); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(245,184,46,.25)'; ctx.fillRect(ox, oy, 640 * s * sweep, 400 * s);
        ctx.fillStyle = '#f5b82e'; ctx.fillRect(ox + 640 * s * sweep - 2, oy, 4, 400 * s);
      } else {
        OBJS.forEach((o, i) => {
          const a = clamp((t - 1.6 - i * .25) / .3, 0, 1);
          if (!a) return;
          ctx.globalAlpha = a;
          drawBox(ctx, ox + o.x * s, oy + o.y * s, o.w * s, o.h * s, o.color, `${o.name} ${(0.94 - i * .03).toFixed(2)}`, 3);
          ctx.globalAlpha = 1;
        });
        if (t > 2.6) {
          ctx.fillStyle = 'rgba(20,24,30,.75)'; roundRect(ctx, 12, H - 44, 230, 32, 10); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = '600 14px "JetBrains Mono", monospace'; ctx.fillText('3 objects · 1 look · 2ms', 24, H - 23);
        }
      }
    };
    requestAnimationFrame(frame);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initHero();
  initML();
  initTypes();
  initDetect();
  initYOLO();
  initPractice();
  initLive();
  initQuizzes();
});
