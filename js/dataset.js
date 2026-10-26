/* 6단원: 내 데이터셋 만들기 (사진 모으기 → 상자 그리기 → YOLO 형식 zip 내려받기)
   모든 처리는 브라우저 안에서만 해요. 사진은 IndexedDB에 저장되어 새로고침해도 남아요.
   zip 구조는 파이참(pycharm/step1_add_photos.py)과 코랩 노트북이 그대로 불러올 수 있는 형식이에요. */

// 파이참 step3_label.py와 같은 색 순서
const DS_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1'];
const dsColor = (c) => DS_COLORS[c % DS_COLORS.length];
const DS_MAX_SIDE = 1280;

/* ---------- IndexedDB: 사진과 상자 저장 ---------- */
const dsDB = (() => {
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('yolo-dataset', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('items', { keyPath: 'id' });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  const run = async (mode, fn) => {
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction('items', mode);
      const req = fn(t.objectStore('items'));
      t.oncomplete = () => res(req.result);
      t.onerror = () => rej(t.error);
    });
  };
  return {
    all: () => run('readonly', (s) => s.getAll()),
    put: (it) => run('readwrite', (s) => s.put(it)),
    del: (id) => run('readwrite', (s) => s.delete(id)),
    clear: () => run('readwrite', (s) => s.clear()),
  };
})();

/* ---------- zip 만들기 / 읽기 (압축 없이 저장, jpg는 이미 압축돼 있어요) ---------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makeZip(files) {
  const enc = new TextEncoder(), parts = [], central = [];
  const d = new Date();
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name), crc = crc32(f.data), size = f.data.length;
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true);
    h.setUint16(10, time, true); h.setUint16(12, date, true); h.setUint32(14, crc, true);
    h.setUint32(18, size, true); h.setUint32(22, size, true); h.setUint16(26, name.length, true);
    parts.push(h, name, f.data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
    c.setUint16(12, time, true); c.setUint16(14, date, true); c.setUint32(16, crc, true);
    c.setUint32(20, size, true); c.setUint32(24, size, true); c.setUint16(28, name.length, true); c.setUint32(42, offset, true);
    central.push(c, name);
    offset += 30 + name.length + size;
  }
  const cdSize = central.reduce((s, p) => s + p.byteLength, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
  e.setUint32(12, cdSize, true); e.setUint32(16, offset, true);
  return new Blob([...parts, ...central, e], { type: 'application/zip' });
}

async function readZip(file) {
  const buf = new Uint8Array(await file.arrayBuffer()), dv = new DataView(buf.buffer);
  let e = buf.length - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('zip 파일이 아니에요');
  const n = dv.getUint16(e + 10, true), dec = new TextDecoder(), out = [];
  let p = dv.getUint32(e + 16, true);
  for (let i = 0; i < n && dv.getUint32(p, true) === 0x02014b50; i++) {
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), lo = dv.getUint32(p + 42, true);
    const nl = dv.getUint16(p + 28, true), name = dec.decode(buf.subarray(p + 46, p + 46 + nl));
    p += 46 + nl + dv.getUint16(p + 30, true) + dv.getUint16(p + 32, true);
    if (name.endsWith('/') || name.startsWith('__MACOSX')) continue;
    const start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true);
    const raw = buf.subarray(start, start + csize);
    out.push({
      name,
      read: async () => {
        if (method === 0) return raw;
        if (method !== 8 || typeof DecompressionStream === 'undefined') throw new Error('이 브라우저는 압축된 zip을 못 열어요');
        const s = new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        return new Uint8Array(await new Response(s).arrayBuffer());
      },
    });
  }
  return out;
}

/* ---------- 사진 다루기 ---------- */
async function dsBitmap(blob) {
  try { return await createImageBitmap(blob, { imageOrientation: 'from-image' }); } catch { /* 옛 브라우저 */ }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally { URL.revokeObjectURL(url); }
}

// 회전 보정 + 긴 변 1280px로 줄이기 + jpg (파이참 add_image와 같은 규칙)
async function dsToJpeg(src) {
  const w0 = src.videoWidth || src.width, h0 = src.videoHeight || src.height;
  const s = Math.min(1, DS_MAX_SIDE / Math.max(w0, h0));
  const w = Math.round(w0 * s), h = Math.round(h0 * s);
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  cv.getContext('2d').drawImage(src, 0, 0, w, h);
  const blob = await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.92));
  return { blob, w, h };
}

const escHtml = (t) => String(t).replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
const fileStem = (n) => n.split('/').pop().replace(/\.[^.]+$/, '');

function initDataset() {
  const root = $('.chapter[data-ch="dataset"]');
  if (!root) return;
  const cv = $('#dsCanvas'), ctx = cv.getContext('2d');
  const S = {
    items: [], cur: -1, cls: 0, sel: -1, img: null, imgId: null, persist: true, urls: new Map(),
    classes: store.get('ds:classes', ['cup']), project: store.get('ds:project', 'my_cup'),
  };

  /* ----- ① 이름 정하기 ----- */
  const clsInput = $('#dsClasses'), projInput = $('#dsProject');
  clsInput.value = S.classes.join(', ');
  projInput.value = S.project;
  const parseClasses = () => {
    const list = clsInput.value.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    return list.filter((c, i) => list.indexOf(c) === i);
  };
  const cleanProject = () => projInput.value.trim().replace(/[^A-Za-z0-9_\-]/g, '_') || 'my_dataset';
  const applyNames = () => {
    const list = parseClasses();
    S.classes = list.length ? list : ['object'];
    S.project = cleanProject();
    S.cls = Math.min(S.cls, S.classes.length - 1);
    store.set('ds:classes', S.classes); store.set('ds:project', S.project);
    const esc = (t) => t.replace(/['\\]/g, '_');
    $('#dsConfig').innerHTML = [`CLASSES = [${S.classes.map((c) => `'${esc(c)}'`).join(', ')}]`, `PROJECT_NAME = '${S.project}'`].map(highlightPy).join('\n');
    $('#dsNameWarn').hidden = !S.classes.some((c) => /[^\x20-\x7E]/.test(c));
    renderClassBtns(); draw(); renderSummary();
  };
  clsInput.addEventListener('input', applyNames);
  projInput.addEventListener('input', applyNames);
  projInput.addEventListener('change', () => { projInput.value = S.project; });

  const renderClassBtns = () => {
    $('#dsClassBtns').innerHTML = S.classes.map((c, i) =>
      `<button class="ds-cls${i === S.cls ? ' on' : ''}" data-c="${i}" style="--c:${dsColor(i)}"><kbd>${i + 1}</kbd> ${escHtml(c)}</button>`).join('');
  };
  $('#dsClassBtns').addEventListener('click', (e) => {
    const b = e.target.closest('.ds-cls');
    if (b) pickClass(+b.dataset.c);
  });
  const pickClass = (c) => {
    if (c >= S.classes.length) return;
    S.cls = c;
    const it = curItem();
    if (it && S.sel >= 0) { it.boxes[S.sel][0] = c; changed(it); }
    renderClassBtns(); draw();
  };

  /* ----- 저장 ----- */
  const curItem = () => S.items[S.cur];
  const isDone = (it) => it.boxes.length > 0 || it.empty;
  const save = (it) => { if (S.persist) dsDB.put(it).catch(storageFail); };
  const storageFail = (err) => {
    console.warn(err);
    if (!S.persist) return;
    S.persist = false;
    $('#dsSaveNote').textContent = '⚠️ 이 브라우저에서는 저장이 안 돼요. 창을 닫기 전에 zip을 꼭 내려받으세요!';
  };
  const changed = (it) => { save(it); updateThumb(it); renderTxt(); renderSummary(); };

  const usedNames = () => new Set(S.items.map((it) => it.name));
  const uniqueName = (base, used) => {
    let stem = base.replace(/[^A-Za-z0-9_\-]/g, '_');
    if (!/[A-Za-z0-9]/.test(stem)) stem = 'photo';
    let cand = stem, i = 1;
    while (used.has(cand)) cand = `${stem}_${i++}`;
    used.add(cand);
    return cand;
  };

  const addItem = async (src, name, boxes = [], empty = false, used = usedNames()) => {
    const { blob, w, h } = await dsToJpeg(src);
    const it = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), name: uniqueName(name, used), blob, w, h, boxes, empty, t: Date.now() };
    S.items.push(it);
    if (S.persist) await dsDB.put(it).catch(storageFail);
    return it;
  };

  /* ----- ② 사진 모으기 ----- */
  const busy = (msg) => { $('#dsBusy').hidden = !msg; $('#dsBusy').textContent = msg || ''; };
  $('#dsFiles').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    const before = S.items.length, used = usedNames();
    let nLbl = 0, k = 0;
    for (const f of files) {
      k++;
      try {
        if (/\.zip$/i.test(f.name)) {
          busy(`zip 여는 중… ${f.name}`);
          nLbl += await importZip(f, used);
        } else if (f.type.startsWith('image/') || /\.(jpe?g|png|bmp|webp|gif)$/i.test(f.name)) {
          busy(`사진 넣는 중… ${k} / ${files.length}`);
          const bmp = await dsBitmap(f);
          await addItem(bmp, fileStem(f.name), [], false, used);
          bmp.close && bmp.close();
        }
      } catch (err) { console.warn(err); toast(`⚠️ ${f.name}: ${err.message || '열 수 없어요'}`); }
    }
    busy('');
    const n = S.items.length - before;
    toast(n ? `🖼️ 사진 ${n}장 추가${nLbl ? ` (상자 있는 사진 ${nLbl}장)` : ''}` : '추가된 사진이 없어요');
    renderThumbs();
    if (n) show(before);
  });

  const importZip = async (file, used) => {
    const entries = await readZip(file);
    const txts = new Map(), parse = (t) => t.split(/\r?\n/).map((l) => l.trim().split(/\s+/)).filter((p) => p.length === 5).map((p) => [parseInt(p[0], 10), ...p.slice(1).map(Number)]);
    const cls = entries.find((m) => m.name.split('/').pop() === 'classes.txt');
    if (cls) {
      const zc = new TextDecoder().decode(await cls.read()).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      if (!S.items.some((it) => it.boxes.length)) { clsInput.value = zc.join(', '); applyNames(); }
      else if (zc.join(',') !== S.classes.join(',')) toast(`⚠️ zip의 물체 이름 [${zc.join(', ')}]이 지금 이름과 달라요`, 4000);
    }
    for (const m of entries) if (/\.txt$/i.test(m.name) && m.name.split('/').pop() !== 'classes.txt') txts.set(fileStem(m.name), m);
    let nLbl = 0;
    for (const m of entries) {
      if (!/\.(jpe?g|png|bmp|webp)$/i.test(m.name)) continue;
      const data = await m.read();
      const bmp = await dsBitmap(new Blob([data]));
      const t = txts.get(fileStem(m.name));
      const boxes = t ? parse(new TextDecoder().decode(await t.read())) : [];
      await addItem(bmp, fileStem(m.name), boxes, !!t && !boxes.length, used);
      bmp.close && bmp.close();
      if (t) nLbl++;
    }
    return nLbl;
  };

  // 웹캠으로 찍기 (step2_webcam_capture.py와 같은 일)
  const video = $('#dsVideo');
  let stream = null, burst = null;
  const camOff = () => {
    clearInterval(burst); burst = null;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null; video.srcObject = null;
    $('#dsCam').hidden = true;
  };
  $('#dsCamBtn').addEventListener('click', async () => {
    if (stream) return camOff();
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      video.srcObject = stream;
      $('#dsCam').hidden = false;
      await video.play();
    } catch (err) { console.warn(err); camOff(); toast('📷 웹캠을 켤 수 없어요. 카메라 권한을 확인하세요.'); }
  });
  const snap = async () => {
    if (!stream || !video.videoWidth) return;
    const flash = $('#dsFlash');
    flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
    await addItem(video, 'cam');
    renderThumbs();
    $('#dsCamCount').textContent = `${S.items.length}장`;
  };
  $('#dsSnap').addEventListener('click', snap);
  $('#dsBurst').addEventListener('click', () => {
    if (burst) return;
    let n = 0;
    $('#dsBurst').disabled = true;
    burst = setInterval(async () => {
      await snap();
      if (++n >= 5) { clearInterval(burst); burst = null; $('#dsBurst').disabled = false; toast('📸 5장 찍었어요. 물체를 조금씩 옮겨가며 찍어보세요!'); }
    }, 1000);
  });
  $('#dsCamOff').addEventListener('click', camOff);
  document.addEventListener('chapter', (e) => { if (e.detail !== 'dataset') camOff(); });

  /* ----- ③ 상자 그리기 ----- */
  const renderThumbs = () => {
    S.urls.forEach((u, id) => { if (!S.items.some((it) => it.id === id)) { URL.revokeObjectURL(u); S.urls.delete(id); } });
    $('#dsThumbs').innerHTML = S.items.map((it, i) => {
      if (!S.urls.has(it.id)) S.urls.set(it.id, URL.createObjectURL(it.blob));
      return `<button class="ds-thumb${i === S.cur ? ' on' : ''}${isDone(it) ? ' done' : ''}" data-i="${i}" title="${it.name}"><img src="${S.urls.get(it.id)}" alt="${it.name}" loading="lazy"><i></i></button>`;
    }).join('') || '<p class="muted ds-thumbs-empty">아직 사진이 없어요</p>';
    renderSummary();
  };
  const updateThumb = (it) => {
    const b = $(`.ds-thumb[data-i="${S.items.indexOf(it)}"]`);
    if (b) b.classList.toggle('done', isDone(it));
  };
  $('#dsThumbs').addEventListener('click', (e) => {
    const b = e.target.closest('.ds-thumb');
    if (b) show(+b.dataset.i);
  });

  const show = async (i) => {
    if (!S.items.length) { S.cur = -1; S.img = null; S.imgId = null; draw(); renderTxt(); return; }
    S.cur = clamp(i, 0, S.items.length - 1);
    S.sel = -1;
    const it = curItem();
    $$('.ds-thumb').forEach((b) => b.classList.toggle('on', +b.dataset.i === S.cur));
    $(`.ds-thumb[data-i="${S.cur}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (S.imgId !== it.id) {
      const bmp = await dsBitmap(it.blob);
      if (curItem() !== it) { bmp.close && bmp.close(); return; }
      S.img && S.img.close && S.img.close();
      S.img = bmp; S.imgId = it.id;
    }
    const k = Math.min(1, 960 / Math.max(it.w, it.h));
    cv.width = Math.round(it.w * k); cv.height = Math.round(it.h * k);
    draw(); renderTxt();
  };

  // 정규화 좌표(가운데 x, y, 너비, 높이) ↔ 캔버스 픽셀 모서리
  const toRect = (b) => [(b[1] - b[3] / 2) * cv.width, (b[2] - b[4] / 2) * cv.height, (b[1] + b[3] / 2) * cv.width, (b[2] + b[4] / 2) * cv.height];
  const fromRect = (c, x1, y1, x2, y2) => {
    const W = cv.width, H = cv.height;
    const a = clamp(Math.min(x1, x2), 0, W), b = clamp(Math.min(y1, y2), 0, H), r = clamp(Math.max(x1, x2), 0, W), d = clamp(Math.max(y1, y2), 0, H);
    return [c, (a + r) / 2 / W, (b + d) / 2 / H, (r - a) / W, (d - b) / H];
  };

  let drag = null, hover = null;
  const px = () => cv.width / (cv.getBoundingClientRect().width || cv.width); // 화면 1px이 캔버스 몇 px인지
  const handleR = () => 10 * px();
  const draw = () => {
    const W = cv.width, H = cv.height, it = curItem();
    ctx.clearRect(0, 0, W, H);
    if (!it || !S.img) {
      ctx.fillStyle = cssVar('--muted') || '#888';
      ctx.font = '600 22px "Noto Sans KR", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('② 에서 사진을 올리거나 웹캠으로 찍어주세요', W / 2, H / 2);
      ctx.textAlign = 'left';
      return;
    }
    ctx.drawImage(S.img, 0, 0, W, H);
    const k = px(), lw = 2.5 * k, fs = Math.round(14 * k);
    const boxes = drag && drag.preview ? [...it.boxes, drag.preview] : it.boxes;
    boxes.forEach((b, i) => {
      const [x1, y1, x2, y2] = toRect(b), bad = b[0] >= S.classes.length;
      const col = bad ? '#888888' : dsColor(b[0]), on = i === S.sel;
      ctx.fillStyle = col + (on ? '33' : '1a'); ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      ctx.strokeStyle = col; ctx.lineWidth = on ? lw * 1.8 : lw; ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      const label = bad ? `? (${b[0]}번)` : `${b[0] + 1} ${S.classes[b[0]]}`;
      ctx.font = `700 ${fs}px "JetBrains Mono", "Noto Sans KR", monospace`;
      const tw = ctx.measureText(label).width + 10, ly = y1 - fs - 6 < 0 ? y1 : y1 - fs - 6;
      ctx.fillStyle = col; ctx.fillRect(x1, ly, tw, fs + 6);
      ctx.fillStyle = '#fff'; ctx.fillText(label, x1 + 5, ly + fs);
      if (on) {
        const r = handleR();
        [[x1, y1], [x2, y1], [x2, y2], [x1, y2]].forEach(([x, y]) => { ctx.fillStyle = '#fff'; ctx.fillRect(x - r / 2, y - r / 2, r, r); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(x - r / 2, y - r / 2, r, r); });
      }
    });
    if (it.empty) {
      ctx.font = `700 ${fs}px "Noto Sans KR", sans-serif`;
      const t = '🚫 물체 없는 사진', tw = ctx.measureText(t).width;
      ctx.fillStyle = 'rgba(0,0,0,.55)'; roundRect(ctx, 8 * k, 8 * k, tw + 20 * k, fs + 16 * k, 8 * k); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillText(t, 18 * k, 8 * k + fs + 4 * k);
    }
    // 그리기 도우미 십자선
    if (hover && !drag) {
      ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(hover.x, 0); ctx.lineTo(hover.x, H); ctx.moveTo(0, hover.y); ctx.lineTo(W, hover.y); ctx.stroke();
      ctx.restore();
    }
  };

  const hitHandle = (p) => {
    const it = curItem();
    if (!it || S.sel < 0) return -1;
    const [x1, y1, x2, y2] = toRect(it.boxes[S.sel]), r = handleR() * 1.4;
    return [[x1, y1], [x2, y1], [x2, y2], [x1, y2]].findIndex(([x, y]) => Math.abs(p.x - x) < r && Math.abs(p.y - y) < r);
  };
  const hitBox = (p) => {
    const it = curItem();
    let best = -1, area = Infinity;
    it.boxes.forEach((b, i) => {
      const [x1, y1, x2, y2] = toRect(b), a = (x2 - x1) * (y2 - y1);
      if (p.x >= x1 && p.x <= x2 && p.y >= y1 && p.y <= y2 && a < area) { best = i; area = a; }
    });
    return best;
  };

  cv.addEventListener('contextmenu', (e) => e.preventDefault());
  cv.addEventListener('pointerdown', (e) => {
    const it = curItem();
    if (!it || !S.img) return;
    const p = canvasPoint(cv, e);
    if (e.button === 2) { // 오른쪽 클릭: 상자 지우기
      const i = hitBox(p);
      if (i >= 0) { it.boxes.splice(i, 1); S.sel = -1; changed(it); draw(); }
      return;
    }
    cv.setPointerCapture(e.pointerId);
    const h = hitHandle(p);
    if (h >= 0) { // 모서리 잡고 크기 바꾸기: 반대쪽 모서리를 고정
      const [x1, y1, x2, y2] = toRect(it.boxes[S.sel]);
      drag = { mode: 'resize', ax: h === 0 || h === 3 ? x2 : x1, ay: h < 2 ? y2 : y1 };
      return;
    }
    const i = hitBox(p);
    if (i >= 0) {
      S.sel = i; S.cls = it.boxes[i][0] < S.classes.length ? it.boxes[i][0] : S.cls;
      drag = { mode: 'move', sx: p.x, sy: p.y, orig: it.boxes[i].slice() };
      renderClassBtns(); draw(); renderTxt();
      return;
    }
    S.sel = -1;
    drag = { mode: 'new', ax: p.x, ay: p.y };
    draw(); renderTxt();
  });
  cv.addEventListener('pointermove', (e) => {
    const it = curItem();
    if (!it) return;
    const p = canvasPoint(cv, e);
    if (!drag) {
      hover = p;
      cv.style.cursor = hitHandle(p) >= 0 ? 'nwse-resize' : hitBox(p) >= 0 ? 'move' : 'crosshair';
      draw();
      return;
    }
    if (drag.mode === 'new') drag.preview = fromRect(S.cls, drag.ax, drag.ay, p.x, p.y);
    else if (drag.mode === 'resize') it.boxes[S.sel] = fromRect(it.boxes[S.sel][0], drag.ax, drag.ay, p.x, p.y);
    else {
      const o = drag.orig, dx = (p.x - drag.sx) / cv.width, dy = (p.y - drag.sy) / cv.height;
      it.boxes[S.sel] = [o[0], clamp(o[1] + dx, o[3] / 2, 1 - o[3] / 2), clamp(o[2] + dy, o[4] / 2, 1 - o[4] / 2), o[3], o[4]];
    }
    draw();
  });
  const endDrag = () => {
    const it = curItem();
    if (!drag || !it) { drag = null; return; }
    const d = drag;
    drag = null;
    if (d.mode === 'new') {
      const b = d.preview;
      if (b && b[3] * cv.width > 5 && b[4] * cv.height > 5) {
        it.boxes.push(b); it.empty = false; S.sel = -1;
        changed(it);
      }
    } else changed(it);
    draw(); renderTxt();
  };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);
  cv.addEventListener('pointerleave', () => { hover = null; if (!drag) draw(); });

  const delBox = () => {
    const it = curItem();
    if (!it) return;
    if (S.sel >= 0) it.boxes.splice(S.sel, 1);
    else if (it.boxes.length) it.boxes.pop();
    else return toast('지울 상자가 없어요');
    S.sel = -1; changed(it); draw();
  };
  const toggleEmpty = () => {
    const it = curItem();
    if (!it) return;
    if (it.boxes.length) return toast('상자가 있는 사진이에요. 물체가 없다면 상자를 먼저 지우세요.');
    it.empty = !it.empty;
    changed(it); draw();
    if (it.empty && S.cur < S.items.length - 1) show(S.cur + 1);
  };
  const delImg = async () => {
    const it = curItem();
    if (!it) return;
    S.items.splice(S.cur, 1);
    if (S.persist) dsDB.del(it.id).catch(storageFail);
    S.imgId = null;
    renderThumbs(); show(S.cur);
  };
  $('#dsPrev').addEventListener('click', () => show(S.cur - 1));
  $('#dsNext').addEventListener('click', () => show(S.cur + 1));
  $('#dsNextTodo').addEventListener('click', () => {
    const n = S.items.length;
    for (let k = 1; k <= n; k++) { const j = (S.cur + k) % n; if (!isDone(S.items[j])) return show(j); }
    toast(n ? '🎉 모든 사진에 상자를 그렸어요!' : '사진을 먼저 올려주세요');
  });
  $('#dsDelBox').addEventListener('click', delBox);
  $('#dsNone').addEventListener('click', toggleEmpty);
  $('#dsDelImg').addEventListener('click', delImg);

  document.addEventListener('keydown', (e) => {
    if (!root.classList.contains('on') || e.target.closest('input, textarea, select') || e.altKey || e.ctrlKey || e.metaKey) return;
    if (/^[1-9]$/.test(e.key)) pickClass(+e.key - 1);
    else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); delBox(); }
    else if (e.key === 'ArrowRight' || e.key === 'd') show(S.cur + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'a') show(S.cur - 1);
    else if (e.key === 'Escape') { S.sel = -1; draw(); renderTxt(); }
    else return;
  });

  const lineOf = (b) => `${b[0]} ${b.slice(1).map((v) => v.toFixed(6)).join(' ')}`;
  const renderTxt = () => {
    const it = curItem();
    $('#dsPos').textContent = it ? `${S.cur + 1} / ${S.items.length}` : '0 / 0';
    $('#dsNone').classList.toggle('on', !!(it && it.empty));
    if (!it) { $('#dsTxt').textContent = '사진을 고르면 라벨 파일 내용이 여기에 보여요'; return; }
    const body = it.boxes.length ? it.boxes.map((b, i) => (i === S.sel ? '▶ ' : '  ') + lineOf(b)).join('\n') : it.empty ? '  (빈 파일: 물체가 없는 사진이라고 알려줘요)' : '  (아직 상자가 없어요)';
    $('#dsTxt').textContent = `📄 ${it.name}.txt   클래스 x중심 y중심 너비 높이\n${body}`;
  };

  /* ----- ④ 나누고 내려받기 ----- */
  const valRatio = () => +$('#dsVal').value;
  const splitItems = () => {
    const done = S.items.filter(isDone).sort((a, b) => (a.name < b.name ? -1 : 1));
    let seed = 42; // 같은 사진이면 늘 같은 결과가 나오도록 고정된 난수
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = done.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [done[i], done[j]] = [done[j], done[i]]; }
    const nVal = done.length < 2 ? 0 : clamp(Math.round(done.length * valRatio()), 1, done.length - 1);
    return { val: done.slice(0, nVal), train: done.slice(nVal) };
  };

  const renderSummary = () => {
    const n = S.items.length, done = S.items.filter(isDone);
    const counts = S.classes.map(() => 0);
    let bad = 0;
    done.forEach((it) => it.boxes.forEach((b) => { if (b[0] < counts.length) counts[b[0]]++; else bad++; }));
    $('#dsStats').innerHTML = `<div><span>사진</span><b>${n}</b></div><div><span>라벨 완료</span><b>${done.length}</b></div>` +
      `<div><span>물체 없는 사진</span><b>${done.filter((it) => it.empty).length}</b></div>`;
    $('#dsClassCount').innerHTML = S.classes.map((c, i) => {
      const pct = Math.min(100, counts[i] / 50 * 100);
      return `<div class="ds-bar"><span>${escHtml(c)}</span><div><i style="width:${pct}%;background:${dsColor(i)}"></i></div><b>${counts[i]}</b></div>`;
    }).join('');
    const { train, val } = splitItems();
    $('#dsValTxt').textContent = Math.round(valRatio() * 100) + '%';
    $('#dsSplitBar').innerHTML = `<span class="sp-train" style="flex:${Math.max(train.length, 1)}">train ${train.length}장</span><span class="sp-valid" style="flex:${Math.max(val.length, 1)}">val ${val.length}장</span>`;
    const msg = $('#dsMsg');
    let warn = '';
    if (bad) warn = `⚠️ 지금 이름 목록에 없는 번호의 상자가 ${bad}개 있어요. ① 에서 물체 이름을 원래대로 돌려주세요.`;
    else if (done.length < 2) warn = '상자를 그린 사진이 2장 이상 있어야 train / val로 나눌 수 있어요.';
    else if (counts.some((c) => c === 0)) warn = `상자가 하나도 없는 물체가 있어요: ${S.classes.filter((_, i) => !counts[i]).join(', ')}`;
    else if (counts.some((c) => c < 30)) warn = '💡 물체마다 상자가 30개 이상이면 더 잘 배워요. 지금도 내려받을 수는 있어요.';
    msg.textContent = warn;
    msg.className = 'result-msg' + (bad || done.length < 2 ? ' bad' : '');
    $('#dsDownload').disabled = !!bad || done.length < 2;
    $('#dsSkip').textContent = n - done.length ? `상자를 안 그린 사진 ${n - done.length}장은 zip에 들어가지 않아요.` : '';
    const ex = (arr, f) => (arr[0] ? arr[0].name : 'photo') + f;
    $('#dsTree').textContent = `📦 ${S.project}_dataset.zip
├─ images/
│  ├─ train/   ${ex(train, '.jpg')} … (${train.length}장)
│  └─ val/     ${ex(val, '.jpg')} … (${val.length}장)
├─ labels/
│  ├─ train/   ${ex(train, '.txt')} … (${train.length}개)
│  └─ val/     ${ex(val, '.txt')} … (${val.length}개)
├─ classes.txt   ${S.classes.join(', ')}
└─ data.yaml     train / val 위치와 물체 이름`;
    $$('.ds-proj').forEach((el) => { el.textContent = S.project; });
    $('#dsTrainCode').innerHTML = ['from ultralytics import YOLO', '', "model = YOLO('yolo26n.pt')   # 또는 yolo11n.pt",
      `model.train(data='${S.project}_dataset/data.yaml', epochs=30, imgsz=640)`].map(highlightPy).join('\n');
  };
  $('#dsVal').addEventListener('input', renderSummary);

  const dataYaml = () => `# YOLO 데이터셋 설정 (YOLO 수업 웹페이지에서 만듦)
# path 를 비워두면 이 파일이 있는 폴더를 기준으로 찾아요.
train: images/train
val: images/val

nc: ${S.classes.length}
names:
${S.classes.map((c, i) => `  ${i}: ${c}`).join('\n')}
`;

  $('#dsDownload').addEventListener('click', async () => {
    const { train, val } = splitItems();
    const enc = new TextEncoder(), files = [];
    busy('zip 만드는 중…');
    try {
      for (const [part, arr] of [['train', train], ['val', val]]) {
        for (const it of arr) {
          files.push({ name: `images/${part}/${it.name}.jpg`, data: new Uint8Array(await it.blob.arrayBuffer()) });
          const lines = it.boxes.filter((b) => b[3] > 0.002 && b[4] > 0.002).map(lineOf);
          files.push({ name: `labels/${part}/${it.name}.txt`, data: enc.encode(lines.join('\n') + (lines.length ? '\n' : '')) });
        }
      }
      files.push({ name: 'classes.txt', data: enc.encode(S.classes.join('\n') + '\n') });
      files.push({ name: 'data.yaml', data: enc.encode(dataYaml()) });
      const url = URL.createObjectURL(makeZip(files));
      const a = document.createElement('a');
      a.href = url; a.download = `${S.project}_dataset.zip`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      toast(`📦 ${S.project}_dataset.zip 저장! (train ${train.length} · val ${val.length})`, 3500);
      confetti(80);
    } catch (err) { console.error(err); toast('zip을 만들지 못했어요: ' + err.message); }
    busy('');
  });

  $('#dsClear').addEventListener('click', async () => {
    if (!S.items.length || !confirm(`사진 ${S.items.length}장과 상자를 모두 지울까요? 되돌릴 수 없어요.`)) return;
    S.items = []; S.imgId = null;
    if (S.persist) await dsDB.clear().catch(storageFail);
    renderThumbs(); show(0);
  });

  /* ----- 시작: 저장된 작업 불러오기 ----- */
  applyNames();
  renderThumbs(); show(-1);
  const restore = async () => {
    try {
      if (!window.indexedDB) throw new Error('no indexedDB');
      const saved = await dsDB.all();
      S.items = saved.sort((a, b) => a.t - b.t);
      renderThumbs();
      if (S.items.length) { show(0); if (root.classList.contains('on')) toast(`💾 저장된 사진 ${S.items.length}장을 불러왔어요`); }
    } catch (err) { storageFail(err); }
  };
  restore();
}
