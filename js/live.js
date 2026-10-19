/* 5단원: 브라우저에서 진짜 YOLO11n 실행 (onnxruntime-web) */
const ORT_URL = 'vendor/onnxruntime-web/'; // onnxruntime-web 1.19.2 (학교망에서도 되도록 저장소에 포함)
const MODEL_URL = 'models/yolo11n.onnx';
const SZ = 640;

function initLive() {
  const video = $('#liveVideo'), img = $('#liveImg'), cv = $('#liveCanvas'), ctx = cv.getContext('2d');
  let session = null, loading = null, stream = null, src = null, busy = false, running = false, dets = [], lastSound = 0, fpsT = [];
  const SOUNDS = { 16: 'assets/media/dog.mp3', 15: 'assets/media/cat.mp3', 67: 'assets/media/phone.mp3' };
  const audio = {};

  const setLoading = (msg) => { $('#liveLoading').hidden = !msg; if (msg) $('#liveLoadingMsg').textContent = msg; };
  const status = (s) => { $('#liveStatus').textContent = s; };

  function loadScript(u) {
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = u; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }
  async function getSession() {
    if (session) return session;
    if (!loading) loading = (async () => {
      setLoading('YOLO 엔진 불러오는 중…');
      if (!window.ort) await loadScript(ORT_URL + 'ort.wasm.min.js');
      ort.env.wasm.wasmPaths = new URL(ORT_URL, location.href).href;
      ort.env.wasm.numThreads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 1) : 1;
      setLoading('yolo11n 모델(약 10MB) 내려받는 중…');
      session = await ort.InferenceSession.create(MODEL_URL, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
      setLoading(null); status('모델 준비 완료 ✅');
      return session;
    })().catch((e) => { loading = null; setLoading(null); status('모델을 불러오지 못했어요'); toast('모델을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.'); throw e; });
    return loading;
  }

  /* 전처리: 640×640 레터박스 */
  const pre = document.createElement('canvas'); pre.width = pre.height = SZ;
  const pctx = pre.getContext('2d', { willReadFrequently: true });
  function preprocess(el, w, h) {
    const r = Math.min(SZ / w, SZ / h), nw = Math.round(w * r), nh = Math.round(h * r), dx = (SZ - nw) / 2, dy = (SZ - nh) / 2;
    pctx.fillStyle = 'rgb(114,114,114)'; pctx.fillRect(0, 0, SZ, SZ);
    pctx.drawImage(el, dx, dy, nw, nh);
    const d = pctx.getImageData(0, 0, SZ, SZ).data, N = SZ * SZ, f = new Float32Array(3 * N);
    for (let i = 0; i < N; i++) { f[i] = d[i * 4] / 255; f[i + N] = d[i * 4 + 1] / 255; f[i + 2 * N] = d[i * 4 + 2] / 255; }
    return { tensor: new ort.Tensor('float32', f, [1, 3, SZ, SZ]), r, dx, dy };
  }
  function wanted() {
    const q = $('#liveFilter').value.split(/[,，]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (!q.length) return null;
    const ids = new Set();
    q.forEach((w) => COCO.forEach((n, i) => { if (n === w || COCO_KO[i] === w || (w.length > 2 && n.includes(w)) || (COCO_KO[i].includes(w) && w.length > 1)) ids.add(i); }));
    return ids;
  }
  function postprocess(out, { r, dx, dy }, conf, allow) {
    const d = out.data, n = out.dims[2], C = out.dims[1] - 4, boxes = [];
    for (let i = 0; i < n; i++) {
      let best = 0, bc = -1;
      for (let c = 0; c < C; c++) { const s = d[(4 + c) * n + i]; if (s > best) { best = s; bc = c; } }
      if (best < conf || (allow && !allow.has(bc))) continue;
      const cx = d[i], cy = d[n + i], w = d[2 * n + i], h = d[3 * n + i];
      boxes.push({ x: (cx - w / 2 - dx) / r, y: (cy - h / 2 - dy) / r, w: w / r, h: h / r, conf: best, cls: bc });
    }
    boxes.sort((a, b) => b.conf - a.conf);
    const keep = [];
    for (const b of boxes) if (!keep.some((k) => k.cls === b.cls && iou(k, b) > .45)) keep.push(b);
    return keep;
  }
  async function detect(el, w, h) {
    const s = await getSession();
    const p = preprocess(el, w, h);
    const t = performance.now();
    const res = await s.run({ [s.inputNames[0]]: p.tensor });
    const ms = performance.now() - t;
    fpsT.push(ms); if (fpsT.length > 10) fpsT.shift();
    const avg = fpsT.reduce((a, b) => a + b, 0) / fpsT.length;
    $('#liveFps').textContent = `추론 ${avg.toFixed(0)}ms · ${(1000 / avg).toFixed(1)} FPS`;
    return postprocess(res[s.outputNames[0]], p, +$('#liveConf').value, wanted());
  }

  function render(w, h) {
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    ctx.clearRect(0, 0, w, h);
    const lw = Math.max(2, Math.round(Math.max(w, h) / 320));
    dets.forEach((b) => {
      ctx.save(); ctx.font = `600 ${lw * 7}px "JetBrains Mono", monospace`;
      ctx.strokeStyle = classColor(b.cls); ctx.lineWidth = lw; ctx.strokeRect(b.x, b.y, b.w, b.h);
      const lab = `${COCO[b.cls]} ${b.conf.toFixed(2)}`, tw = ctx.measureText(lab).width + lw * 4, th = lw * 10;
      const ly = b.y - th < 0 ? b.y : b.y - th;
      ctx.fillStyle = classColor(b.cls); ctx.fillRect(b.x - lw / 2, ly, tw, th);
      ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(lab, b.x + lw * 2, ly + th / 2); ctx.restore();
    });
    const counts = {};
    dets.forEach((b) => (counts[b.cls] = (counts[b.cls] || 0) + 1));
    const ul = $('#detList');
    ul.innerHTML = Object.keys(counts).length
      ? Object.entries(counts).map(([c, k]) => `<li style="border-left-color:${classColor(+c)}">${COCO_KO[c]} (${COCO[c]}) × ${k}</li>`).join('')
      : '<li class="muted">찾은 물체 없음</li>';
    if ($('#liveSound').checked) {
      const hit = dets.find((b) => SOUNDS[b.cls]);
      const now = performance.now();
      if (hit && now - lastSound >= 1000) {
        lastSound = now;
        const a = audio[hit.cls] || (audio[hit.cls] = new Audio(SOUNDS[hit.cls]));
        a.currentTime = 0; a.play().catch(() => {});
      }
    }
  }

  async function loop() {
    if (!running) return;
    if (src === 'video' && video.readyState >= 2 && !busy) {
      busy = true;
      try { dets = await detect(video, video.videoWidth, video.videoHeight); render(video.videoWidth, video.videoHeight); status(stream ? '웹캠 분석 중' : '영상 분석 중'); }
      catch (e) { console.error(e); running = false; }
      busy = false;
    }
    requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
    video.pause(); video.removeAttribute('src'); video.srcObject = null; video.load();
    video.style.display = 'none'; img.style.display = 'none';
    dets = []; ctx.clearRect(0, 0, cv.width, cv.height);
  }
  async function startVideo(setup) {
    stop();
    $('#liveEmpty').style.display = 'none';
    try {
      await getSession();
      await setup();
      video.style.display = 'block';
      await video.play();
      src = 'video'; running = true; loop();
    } catch (e) {
      console.error(e);
      if (e && e.name === 'NotAllowedError') toast('카메라 사용을 허용해 주세요 🙏');
      else if (e && e.name === 'NotFoundError') toast('카메라를 찾을 수 없어요');
      $('#liveEmpty').style.display = '';
    }
  }
  $('#srcCam').addEventListener('click', () => startVideo(async () => {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('getUserMedia 미지원');
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 960 }, height: { ideal: 540 } }, audio: false });
    video.srcObject = stream;
  }));
  $('#srcDogcat').addEventListener('click', () => startVideo(async () => { video.src = 'assets/media/dogcatmove.mp4'; }));
  $('#srcPhone').addEventListener('click', () => startVideo(async () => { video.src = 'assets/media/phonemove2.mp4'; }));
  $('#srcFile').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    if (f.type.startsWith('video')) { startVideo(async () => { video.src = url; }); return; }
    stop(); $('#liveEmpty').style.display = 'none';
    img.onload = async () => { img.style.display = 'block'; src = 'image'; await runImage(); };
    img.src = url;
    e.target.value = '';
  });
  async function runImage() {
    if (src !== 'image' || !img.naturalWidth) return;
    status('사진 분석 중…');
    dets = await detect(img, img.naturalWidth, img.naturalHeight);
    render(img.naturalWidth, img.naturalHeight);
    status(`사진 분석 완료 · ${dets.length}개 발견`);
  }

  const updateCode = () => {
    const conf = (+$('#liveConf').value).toFixed(2);
    $('#liveConfVal').textContent = conf;
    const names = $('#liveFilter').value.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
    const lines = names.length
      ? ['model = YOLO(\'yolov8s-world.pt\')', `model.set_classes([${names.map((n) => `"${n}"`).join(', ')}])`]
      : ['model = YOLO(\'yolo11n.pt\')'];
    lines.push('cap = cv2.VideoCapture(0)', '', 'while cap.isOpened():', '  success, image = cap.read()', `  results = model(image, conf=${conf})`);
    $('#liveCode').innerHTML = '# 이 화면을 파이썬으로 쓰면 이런 코드예요\n' + lines.map(highlightPy).join('\n');
  };
  ['#liveConf', '#liveFilter'].forEach((s) => $(s).addEventListener('input', () => { updateCode(); if (src === 'image') runImage(); }));
  updateCode();

  document.addEventListener('chapter', (e) => { if (e.detail !== 'live' && (stream || running)) { stop(); src = null; $('#liveEmpty').style.display = ''; status('일시 정지'); } });
}
