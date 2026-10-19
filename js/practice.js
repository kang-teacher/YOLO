/* 5단원: YOLO 활용 과정 */
const STEPS = [
  {
    i: '📥', t: '자료 받기', h: '실습 자료 내려받기',
    body: `<ol><li>공유 패들렛 <a href="https://padlet.com/limtelli/Physical" target="_blank" rel="noopener">padlet.com/limtelli/Physical</a> 접속</li><li><b>특강자료 → YOLO 다운로드 자료</b> 클릭 (구글 드라이브)</li><li>폴더를 <b>다운로드</b>한 뒤 <b>압축 풀기</b></li></ol><p>받은 파일에는 코드(.py)와 모델(.pt), 영상(.mp4), 소리(.mp3)가 들어 있어요.</p>`,
    mock: `<div class="mock-win"><div class="mw-bar"><i></i><i></i><i></i>&nbsp;내 드라이브 › YOLO 자료</div><div class="mw-body">
      📄 YOLO 연습.py<br>📄 YOLO_world.py · YOLO_sound.py · YOLO_sound2.py<br>🧠 yolo11n.pt · yolo11s.pt<br>🧠 yolo11n-seg.pt · yolo11n-pose.pt · yolo11n-cls.pt<br>🧠 yolov8s-world.pt<br>🎬 phonemove.mp4 · dogcatmove.mp4<br>🔊 phone.mp3 · dog.mp3 · cat.mp3</div></div>`,
  },
  {
    i: '🖥️', t: 'PyCharm 준비', h: 'PyCharm에서 새 프로젝트 만들기',
    body: `<ol><li>PyCharm Community Edition 실행</li><li><b>File → New Project</b> 클릭</li><li>이름을 원하는 이름으로 바꾸고, <b>Python 3.9.13</b> 선택</li><li>아래 체크박스 <b>2개 모두 체크</b> 후 <b>Create</b></li><li><b>This Window</b> 클릭</li><li>내려받은 파일들을 프로젝트 폴더로 끌어다 넣기</li></ol>`,
    mock: `<div class="mock-win"><div class="mw-bar"><i></i><i></i><i></i>&nbsp;New Project</div><div class="mw-body">
      <div class="row"><span>Name:</span><span class="sel">pythonProject3</span></div>
      <div class="row"><span>Interpreter:</span><span>Virtualenv</span></div>
      <div class="row"><span>Base python:</span><span class="sel">Python 3.9.13</span></div>
      ☑ Inherit packages from base interpreter<br>☑ Make available to all projects<br>
      <div class="row"><span></span><span class="sel">Create</span></div></div></div>`,
  },
  {
    i: '📦', t: '라이브러리 설치', h: '라이브러리 설치하기',
    body: `<p>PyCharm 왼쪽의 <b>Python Packages</b> 아이콘을 누르고 검색해서 <b>Install</b>.</p><ul><li><code>ultralytics</code>: YOLO를 쉽게 쓰게 해주는 라이브러리 (opencv도 함께 설치돼요)</li><li><code>openai-clip</code>: 글자로 물체를 찾는 YOLO-World에 필요해요</li></ul><p class="hint">터미널로 설치하려면: <code>pip install ultralytics openai-clip</code></p>`,
    mock: `<div class="mock-win"><div class="mw-bar"><i></i><i></i><i></i>&nbsp;Python Packages</div><div class="mw-body">🔍 ultralytics<br>▾ PyPI (27 found)<br><div class="row"><span class="sel">ultralytics</span><span>Install</span></div>ultralytics-hub<br>ultralyticsplus</div></div>`,
  },
  {
    i: '▶️', t: '첫 실행', h: 'YOLO 연습.py 실행하기',
    body: `<ol><li><b>YOLO 연습.py</b>를 더블클릭해서 코드 보기</li><li>코드 화면에서 <b>오른쪽 클릭 → Run 'YOLO 연습'</b></li><li>웹캠 창이 뜨고 물체마다 상자가 그려져요!</li><li>끝내려면 영상 창에서 <kbd>q</kbd> 키</li></ol><p>아래 <b>코드 뜯어보기</b>에서 각 줄의 의미를 확인해 보세요.</p>`,
    mock: `<div class="mock-win"><div class="mw-bar"><i></i><i></i><i></i>&nbsp;YOLO 연습.py</div><div class="mw-body">Show Context Actions<br>Paste<br>Refactor<br><span class="sel">▶ Run 'YOLO 연습'</span><br>🐞 Debug 'YOLO 연습'</div></div>`,
  },
  {
    i: '🔄', t: '모델 바꾸기', h: '다른 모델로 바꿔 실행해 보기',
    body: `<p><code>model = YOLO('yolo11n.pt')</code>의 파일 이름만 바꾸면 YOLO가 하는 일이 달라져요.</p><ul><li><code>yolo11n-seg.pt</code> → 분할</li><li><code>yolo11n-pose.pt</code> → 자세</li><li><code>yolo11n-cls.pt</code> → 분류</li><li><code>yolo11s.pt</code> → 더 정확하지만 조금 느림</li></ul><p>모델 목록은 <a href="https://docs.ultralytics.com/models/" target="_blank" rel="noopener">docs.ultralytics.com/models</a>에서 클릭해서 내려받을 수 있어요.</p>`,
    mock: `<div class="mock-win"><div class="mw-bar"><i></i><i></i><i></i>&nbsp;Supported Tasks and Modes</div><div class="mw-body"><div class="row"><span>YOLO11</span><span class="sel">Detection</span></div><div class="row"><span>YOLO11-seg</span><span>Instance Segmentation</span></div><div class="row"><span>YOLO11-pose</span><span>Pose/Keypoints</span></div><div class="row"><span>YOLO11-obb</span><span>Oriented Detection</span></div><div class="row"><span>YOLO11-cls</span><span>Classification</span></div></div></div>`,
  },
  {
    i: '🌍', t: 'YOLO-World', h: 'YOLO-World: 이름만 말하면 찾아줘요',
    body: `<p>기본 YOLO는 <b>80가지</b> 물체만 알아요. <b>YOLO-World</b>는 찾고 싶은 물체의 <b>이름(글자)</b>을 알려주면 그것을 찾아요.</p><pre class="code code-small">${['model = YOLO(\'yolov8s-world.pt\')', 'model.set_classes(["phone", "man", "woman"])'].map(highlightPy).join('\n')}</pre><p>리스트 순서대로 번호가 붙어요: <b>phone은 0번</b>, man은 1번, woman은 2번. 이 번호가 소리 재생에서 중요해요!</p>`,
    mock: `<div class="mock-win"><div class="mw-bar"><i></i><i></i><i></i>&nbsp;YOLO_world.py</div><div class="mw-body">phone → <span class="sel">0</span><br>man → 1<br>woman → 2</div></div>`,
  },
  {
    i: '🎬', t: '영상 · 소리', h: '영상 넣기와 소리 재생하기',
    body: `<ul><li>무료 영상·소리: <a href="https://pixabay.com/ko/" target="_blank" rel="noopener">pixabay.com/ko</a></li><li><code>cv2.VideoCapture(0)</code>: 컴퓨터 내장 카메라<br><code>cv2.VideoCapture('phonemove2.mp4')</code>: 저장된 영상</li><li><code>playsound</code> 라이브러리 설치</li></ul><p class="warn">⚠️ playsound는 반드시 1.2.2 버전으로 설치해야 해요! (<code>pip install playsound==1.2.2</code>)</p><p><b>응용:</b> <code>YOLO_dogcat.py</code>: 강아지(0번)가 보이면 dog.mp3, 고양이(1번)가 보이면 cat.mp3</p>`,
    mock: `<div class="mock-win"><div class="mw-bar"><i></i><i></i><i></i>&nbsp;YOLO_sound2.py</div><div class="mw-body">from playsound import playsound<br>import threading, time<br><span class="sel">if 0 in result.boxes.cls.tolist():</span><br>&nbsp;&nbsp;threading.Thread(target=play_sound).start()</div></div>`,
  },
  {
    i: '🏷️', t: 'Roboflow 라벨링', h: '나만의 데이터 만들기 (Roboflow)',
    body: `<ol><li><a href="https://universe.roboflow.com/" target="_blank" rel="noopener">universe.roboflow.com</a> 접속 → 구글 아이디로 로그인</li><li><b>New Project</b> → 프로젝트 이름과 Annotation Group에 <b>인식시키고 싶은 사물 이름</b> 적기 → Object Detection → <b>Create Public Project</b></li><li>직접 찍은 사진 업로드 (연습이니까 5장 정도) → <b>Save and Continue</b></li><li><b>Start Manual Labeling → Assign to Myself</b> → 사진마다 상자 그리기</li><li><b>Add images to Dataset</b> (Train / Valid / Test 나누기)</li><li><b>Generate New Version</b> → Continue → Create</li><li><b>Download Dataset → Format: YOLOv11 → Show download code</b> → 코드 복사</li></ol><p>👇 아래 <b>라벨링 체험</b>에서 미리 연습해 보세요!</p>`,
    mock: `<div class="mock-win"><div class="mw-bar"><i></i><i></i><i></i>&nbsp;Let's create your project.</div><div class="mw-body"><div class="row"><span>Project Name</span><span class="sel">cup</span></div><div class="row"><span>Annotation Group</span><span class="sel">cup</span></div><div class="row"><span>Project Type</span><span>Object Detection</span></div><div class="row"><span></span><span class="sel">Create Public Project</span></div></div></div>`,
  },
  {
    i: '☁️', t: 'Colab 학습', h: '구글 Colab에서 학습시키기',
    body: `<ol><li>패들렛의 <b>best.py (나만의 객체인식 만들기)</b> → Colab 열기</li><li>GPU 확인 <code>!nvidia-smi</code>, 라이브러리 설치 <code>!pip install ultralytics</code></li><li>Roboflow에서 복사한 다운로드 코드 붙여넣고 실행</li><li>학습 실행 (epochs = 몇 번 반복해서 공부할지)</li><li>왼쪽 폴더 <b>runs/detect/train/weights/best.pt</b> → 오른쪽 클릭 → <b>다운로드</b></li></ol><pre class="code code-small">!yolo task=detect mode=train model=yolov8s.pt \\\n  data={dataset.location}/data.yaml epochs=25 imgsz=800 plots=True</pre>`,
    mock: `<div class="mock-win"><div class="mw-bar"><i></i><i></i><i></i>&nbsp;Colab 파일</div><div class="mw-body">📁 runs<br>&nbsp;📁 detect<br>&nbsp;&nbsp;📁 train<br>&nbsp;&nbsp;&nbsp;📁 weights<br>&nbsp;&nbsp;&nbsp;&nbsp;<span class="sel">🧠 best.pt → 다운로드</span><br>&nbsp;&nbsp;&nbsp;&nbsp;🧠 last.pt</div></div>`,
  },
  {
    i: '🎯', t: '내 모델 쓰기', h: '내가 만든 모델로 실행하기',
    body: `<ol><li>다운로드한 <b>best.pt</b>를 알아보기 쉬운 이름(예: <code>MScup.pt</code>)으로 바꾸기</li><li>PyCharm 프로젝트 폴더에 넣기</li><li>코드에서 모델 이름만 바꾸고 실행!</li></ol><pre class="code code-small">${highlightPy("model = YOLO('MScup.pt')")}</pre><p>이제 YOLO가 원래 몰랐던 <b>우리 반 컵</b>을 알아봐요 🎉</p>`,
    mock: `<div class="mock-win"><div class="mw-bar"><i></i><i></i><i></i>&nbsp;YOLO 연습.py</div><div class="mw-body">cap = cv2.VideoCapture(0)<br><span class="sel">model = YOLO('MScup.pt')</span></div></div>`,
  },
  {
    i: '🔌', t: '피지컬 컴퓨팅', h: '피지컬 컴퓨팅 연동',
    body: `<p>YOLO가 물체를 찾으면 <b>아두이노 우노</b>로 신호를 보내 LED를 켜거나, 부저를 울리거나, 서보모터를 움직일 수 있어요.</p><ul><li>소리를 재생하던 자리에 아두이노로 신호를 보내는 코드를 넣으면 끝!</li><li>예: 컵을 올려두면 불이 켜지는 스마트 컵받침, 사람이 오면 열리는 문</li></ul><p><a href="https://www.miricanvas.com/v/13lrf8d" target="_blank" rel="noopener">마이크로컨트롤러(아두이노 우노) 연동 자료 보기 ↗</a></p>`,
    mock: `<div class="mock-win"><div class="mw-bar"><i></i><i></i><i></i>&nbsp;아이디어</div><div class="mw-body">📷 카메라 → 🧠 YOLO → 💡 아두이노<br><br>if <span class="sel">'cup' 발견</span>:<br>&nbsp;&nbsp;LED 켜기 💡</div></div>`,
  },
];

function initPractice() {
  /* --- 단계 타임라인 --- */
  const tl = $('#timeline');
  let cur = 0;
  tl.innerHTML = STEPS.map((s, i) => `<button class="tl-step" data-i="${i}"><span class="tl-dot">${s.i}</span><span>${i + 1}. ${s.t}</span></button>`).join('');
  const show = (i) => {
    cur = i;
    $$('.tl-step', tl).forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('done', k < i); });
    const s = STEPS[i];
    $('#stepCard').innerHTML = `<h3><span class="pill">STEP ${i + 1}</span> ${s.h}</h3><div class="step-body"><div>${s.body}</div><div>${s.mock}</div></div>
      <div class="step-nav"><button class="btn btn-ghost btn-sm" ${i ? '' : 'disabled'} data-go="-1">← 이전 단계</button><button class="btn btn-primary btn-sm" ${i < STEPS.length - 1 ? '' : 'disabled'} data-go="1">다음 단계 →</button></div>`;
    $$('#stepCard [data-go]').forEach((b) => b.addEventListener('click', () => show(clamp(cur + +b.dataset.go, 0, STEPS.length - 1))));
    $$('.tl-step', tl)[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  };
  $$('.tl-step', tl).forEach((b) => b.addEventListener('click', () => show(+b.dataset.i)));
  show(0);

  /* --- 코드 뜯어보기 --- */
  const CODE = [
    ['from ultralytics import YOLO', 'Ultralytics 라이브러리에서 <b>YOLO</b>를 가져와요. 이 한 줄로 YOLO를 쓸 준비 끝!'],
    ['import cv2', '<b>OpenCV</b>: 카메라·영상을 읽고 화면에 보여주는 라이브러리예요.'],
    ['', ''],
    ['cap = cv2.VideoCapture(0)', '카메라를 켜요. <b>0</b>은 컴퓨터에 달린 첫 번째(내장) 카메라. 숫자 대신 <code>\'phonemove2.mp4\'</code>처럼 파일 이름을 넣으면 영상을 읽어요.'],
    ["model = YOLO('yolo11n.pt')", '학습이 끝난 모델 파일(<b>.pt</b>)을 불러와요. 파일 이름을 바꾸면 다른 모델(seg, pose, 내가 만든 MScup.pt…)이 돼요.'],
    ['', ''],
    ['while cap.isOpened():', '카메라가 켜져 있는 동안 <b>계속 반복</b>해요. 영상은 사진(프레임)이 빠르게 이어진 것이라, 한 장씩 꺼내 검사해요.'],
    ['  success, image = cap.read()', '카메라에서 사진 한 장(<b>image</b>)을 읽어요. <b>success</b>는 잘 읽었는지(True/False).'],
    ['  if not success:', '사진을 못 읽었다면…'],
    ['    continue', '이번 장은 건너뛰고 다음 반복으로!'],
    ['', ''],
    ['  results = model(image, conf=0.3)', '⭐ 핵심! 사진을 YOLO에 넣어서 결과를 받아요. <b>conf=0.3</b>은 확신도 30% 이상인 것만 남기라는 뜻 (4단원 슬라이더 기억나죠?).'],
    ['', ''],
    ['  for result in results:', '결과를 하나씩 꺼내요.'],
    ['    print(result.boxes.xyxy.tolist(), result.boxes.conf.tolist())', '찾은 상자의 좌표(<b>xyxy</b>: 왼쪽 위 x,y와 오른쪽 아래 x,y)와 확신도(<b>conf</b>)를 출력해요. <code>result.boxes.cls</code>에는 클래스 번호가 들어 있어요.'],
    ['', ''],
    ['    result_plotted = results[0].plot()', '원래 사진 위에 상자와 이름표를 <b>그려준</b> 새 사진을 만들어요.'],
    ["    cv2.imshow('img', result_plotted)", "'img'라는 이름의 창에 결과 사진을 보여줘요."],
    ['', ''],
    ["  if cv2.waitKey(1) == ord('q'):", '1ms 동안 키보드를 기다려요. <kbd>q</kbd>를 누르면…'],
    ['    break', '반복을 멈춰요.'],
    ['cap.release()', '다 쓴 카메라를 꺼서 돌려줘요.'],
  ];
  const pre = $('#codeExplore');
  pre.innerHTML = CODE.map(([c], i) => `<span class="ln ${c ? '' : 'blank'}" data-i="${i}"><span class="lno">${i + 1}</span>${highlightPy(c) || ' '}</span>`).join('');
  $$('.ln', pre).forEach((l) => l.addEventListener('click', () => {
    const [c, e] = CODE[+l.dataset.i]; if (!c) return;
    $$('.ln', pre).forEach((x) => x.classList.toggle('on', x === l));
    $('#codeNote').innerHTML = `<h4>${c.trim().replace(/</g, '&lt;')}</h4><p>${e}</p>`;
  }));

  /* --- 코드 퍼즐 --- */
  const PZ = [
    ['from ultralytics import YOLO', 'a'], ['import cv2', 'a'],
    ["model = YOLO('yolo11n.pt')", 'b'], ['cap = cv2.VideoCapture(0)', 'b'],
    ['while cap.isOpened():', 'c'], ['    success, image = cap.read()', 'd'], ['    results = model(image, conf=0.3)', 'e'],
    ['    result_plotted = results[0].plot()', 'f'], ["    cv2.imshow('img', result_plotted)", 'g'],
    ["    if cv2.waitKey(1) == ord('q'): break", 'h'], ['cap.release()', 'i'],
  ];
  const ol = $('#puzzle');
  let dragEl = null;
  const build = () => {
    let order;
    do { order = shuffle(PZ); } while (order.every((x, i) => x[1] === PZ[i][1]));
    ol.innerHTML = '';
    order.forEach(([c, g]) => {
      const li = document.createElement('li');
      li.draggable = true; li.dataset.g = g;
      li.innerHTML = `<span class="pz-code">${highlightPy(c)}</span><span class="pz-btns"><button aria-label="위로">▲</button><button aria-label="아래로">▼</button></span>`;
      const [up, dn] = $$('button', li);
      up.addEventListener('click', () => { if (li.previousElementSibling) ol.insertBefore(li, li.previousElementSibling); clearMarks(); });
      dn.addEventListener('click', () => { if (li.nextElementSibling) ol.insertBefore(li.nextElementSibling, li); clearMarks(); });
      li.addEventListener('dragstart', () => { dragEl = li; li.classList.add('dragging'); });
      li.addEventListener('dragend', () => { li.classList.remove('dragging'); $$('li', ol).forEach((x) => x.classList.remove('over')); });
      li.addEventListener('dragover', (e) => { e.preventDefault(); li.classList.add('over'); });
      li.addEventListener('dragleave', () => li.classList.remove('over'));
      li.addEventListener('drop', (e) => {
        e.preventDefault(); li.classList.remove('over');
        if (!dragEl || dragEl === li) return;
        const items = $$('li', ol);
        ol.insertBefore(dragEl, items.indexOf(dragEl) < items.indexOf(li) ? li.nextSibling : li);
        clearMarks();
      });
      ol.appendChild(li);
    });
    $('#puzzleMsg').textContent = '';
  };
  const clearMarks = () => $$('li', ol).forEach((x) => x.classList.remove('right', 'wrong'));
  $('#puzzleCheck').addEventListener('click', () => {
    const items = $$('li', ol);
    let ok = 0;
    items.forEach((li, i) => { const r = li.dataset.g === PZ[i][1]; li.classList.toggle('right', r); li.classList.toggle('wrong', !r); if (r) ok++; });
    const m = $('#puzzleMsg');
    if (ok === items.length) { m.textContent = '🎉 완벽해요! 이제 이 코드를 PyCharm에서 실행해 보세요.'; m.className = 'result-msg good'; confetti(80); }
    else { m.textContent = `${ok} / ${items.length}줄이 제자리에 있어요. 빨간 줄을 옮겨보세요. (힌트: 준비 → 반복 → 정리)`; m.className = 'result-msg bad'; }
  });
  $('#puzzleShuffle').addEventListener('click', build);
  build();

  /* --- 모델 바꾸기 --- */
  const swapSvg = $('#swapSvg');
  const swap = (b) => {
    $$('#modelSwap button').forEach((x) => x.classList.toggle('on', x === b));
    $('#swapName').textContent = `'${b.dataset.f}'`;
    renderScene(swapSvg, b.dataset.t);
  };
  $$('#modelSwap button').forEach((b) => b.addEventListener('click', () => swap(b)));
  swap($('#modelSwap button'));

  initSoundSim();
  initLabelLab();
}

/* --- 소리 재생 시뮬레이션 --- */
function initSoundSim() {
  const cv = $('#soundCanvas'), ctx = cv.getContext('2d');
  const T = 120, SND = 30, PH = [12, 95]; // 4초(120프레임), 소리 1초, 휴대폰이 보이는 구간
  let mode = 'naive', anim = null;
  const DESC = {
    naive: '❌ <b>playsound()</b>는 소리가 끝날 때까지 프로그램을 <b>멈춰 세워요.</b> 그래서 휴대폰이 보이는 동안 영상이 뚝뚝 끊기고, 소리만 계속 반복돼요.',
    smart: '✅ <b>threading</b>으로 소리를 따로 재생하니 영상은 멈추지 않아요. <b>time</b>으로 마지막 재생 후 1초가 지났을 때만 다시 재생해서 소리가 겹치지 않아요.',
  };
  const sim = () => {
    const frames = [], sounds = [];
    if (mode === 'naive') {
      // 웹캠은 실시간이라, 소리가 끝날 때까지 멈춘 동안의 장면은 그냥 지나가 버려요
      let t = 0;
      while (t < T) { frames.push({ t, f: t }); const ph = t >= PH[0] && t <= PH[1]; t++; if (ph) { sounds.push(t); t += SND; } }
    } else {
      let last = -1e9;
      for (let t = 0; t < T; t++) { frames.push({ t, f: t }); if (t >= PH[0] && t <= PH[1] && t - last >= SND) { sounds.push(t); last = t; } }
    }
    return { frames, sounds };
  };
  const draw = (upto = T) => {
    const { frames, sounds } = sim(), W = cv.width, L = 140, R = 20, fw = (W - L - R) / T;
    ctx.clearRect(0, 0, W, cv.height);
    ctx.font = '700 14px "Noto Sans KR"'; ctx.fillStyle = cssVar('--ink');
    ctx.fillText('📷 처리한 프레임', 8, 58); ctx.fillText('🔊 소리', 8, 128); ctx.fillText('📱 휴대폰', 8, 188);
    ctx.fillStyle = cssVar('--yellow-soft'); ctx.fillRect(L + PH[0] * fw, 170, (PH[1] - PH[0]) * fw, 26);
    ctx.fillStyle = cssVar('--muted'); ctx.font = '12px "Noto Sans KR"'; ctx.fillText('화면에 휴대폰이 보이는 구간', L + PH[0] * fw + 6, 188);
    frames.filter((x) => x.t < upto).forEach(({ t, f }) => {
      ctx.fillStyle = f >= PH[0] && f <= PH[1] ? '#22a06b' : cssVar('--line');
      ctx.fillRect(L + t * fw, 36, Math.max(fw - 1, 1), 34);
    });
    sounds.filter((s) => s < upto).forEach((s, i) => {
      const w = Math.min(SND, upto - s, T - s) * fw;
      ctx.fillStyle = i % 2 ? '#f07a1a' : '#e9468b'; ctx.globalAlpha = .85;
      roundRect(ctx, L + s * fw, 104 + (mode === 'naive' ? 0 : 0), w, 34, 6); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff'; ctx.font = '700 12px "Noto Sans KR"'; if (w > 50) ctx.fillText('phone.mp3', L + s * fw + 6, 126);
    });
    if (mode === 'naive') sounds.filter((s) => s < upto).forEach((s) => {
      ctx.fillStyle = 'rgba(226,72,61,.15)'; ctx.fillRect(L + s * fw, 36, Math.min(SND, T - s) * fw, 34);
      ctx.fillStyle = '#e2483d'; ctx.font = '700 11px "Noto Sans KR"'; if (Math.min(SND, T - s) * fw > 46) ctx.fillText('영상 멈춤', L + s * fw + 6, 58);
    });
    ctx.strokeStyle = cssVar('--ink'); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(L + upto * fw, 26); ctx.lineTo(L + upto * fw, 200); ctx.stroke();
    ctx.fillStyle = cssVar('--muted'); ctx.font = '12px "JetBrains Mono"';
    for (let s = 0; s <= 4; s++) ctx.fillText(s + 's', L + s * 30 * fw - 6, 20);
    const nF = frames.filter((x) => x.t < upto).length, nS = sounds.filter((s) => s < upto).length;
    $('#soundDesc').innerHTML = `${DESC[mode]}<br><b>처리한 프레임 ${nF}장 · 소리 ${nS}번</b>`;
  };
  $$('#soundMode button').forEach((b) => b.addEventListener('click', () => {
    mode = b.dataset.m; $$('#soundMode button').forEach((x) => x.classList.toggle('on', x === b)); cancelAnimationFrame(anim); draw();
  }));
  $('#soundPlay').addEventListener('click', () => {
    cancelAnimationFrame(anim);
    const t0 = performance.now();
    const step = (now) => { const u = Math.min(T, (now - t0) / 4000 * T); draw(u); if (u < T) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step);
  });
  draw();
  document.addEventListener('themechange', () => draw());
}

/* --- 라벨링 체험 --- */
function initLabelLab() {
  const cv = $('#labelCanvas'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
  const BGS = [['#e9dcc8', '#b98b5e'], ['#d7e3ea', '#8aa1ad'], ['#efe6d2', '#7f6a55'], ['#e4e7dc', '#a3a88f'], ['#f0dede', '#b28383']];
  const imgs = BGS.map(([wall, table], i) => {
    const s = rand(.7, 1.25), cw = 90 * s, ch = 110 * s;
    const cx = rand(cw, W - cw * 1.5), cy = rand(H * .52, H * .78) - ch;
    return { wall, table, cup: { x: cx, y: cy, w: cw, h: ch }, tilt: rand(-.08, .08), box: null, seed: i };
  });
  let cur = 0, start = null, tmp = null;
  const paint = (c, im) => {
    const k = c.canvas.width / W;
    c.save(); c.scale(k, k);
    c.fillStyle = im.wall; c.fillRect(0, 0, W, H);
    c.fillStyle = im.table; c.fillRect(0, H * .62, W, H * .38);
    c.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 6; i++) c.fillRect(0, H * .62 + i * 26, W, 2);
    const { x, y, w, h } = im.cup;
    c.translate(x + w / 2, y + h); c.rotate(im.tilt); c.translate(-(x + w / 2), -(y + h));
    c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(x + w / 2 + 10, y + h, w * .5, 9, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w * .82, y + h); c.lineTo(x + w * .18, y + h); c.closePath();
    const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#c81f2b'); g.addColorStop(.35, '#ff4d4d'); g.addColorStop(1, '#a3121d');
    c.fillStyle = g; c.fill();
    c.fillStyle = '#ffd9d9'; c.beginPath(); c.ellipse(x + w / 2, y, w / 2, 7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + w * .2, y + 14, 5, h * .6);
    c.restore();
  };
  const thumbs = $('#labelThumbs');
  thumbs.innerHTML = '';
  imgs.forEach((im, i) => {
    const t = document.createElement('canvas'); t.width = 160; t.height = 100;
    paint(t.getContext('2d'), im);
    t.addEventListener('click', () => { cur = i; draw(); });
    thumbs.appendChild(t);
  });
  const lineOf = (b) => `0 ${((b.x + b.w / 2) / W).toFixed(4)} ${((b.y + b.h / 2) / H).toFixed(4)} ${(b.w / W).toFixed(4)} ${(b.h / H).toFixed(4)}`;
  const draw = () => {
    const im = imgs[cur];
    paint(ctx, im);
    const b = tmp || im.box;
    if (b && b.w > 2) {
      ctx.fillStyle = 'rgba(123,85,217,.2)'; ctx.fillRect(b.x, b.y, b.w, b.h);
      drawBox(ctx, b.x, b.y, b.w, b.h, '#7b55d9', 'cup', 3);
    }
    ctx.fillStyle = 'rgba(20,24,30,.7)'; roundRect(ctx, 10, H - 36, 150, 26, 8); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '600 13px "Noto Sans KR"'; ctx.fillText(`사진 ${cur + 1} / 5 · cup_${cur + 1}.jpg`, 20, H - 18);
    $$('canvas', thumbs).forEach((t, i) => { t.classList.toggle('on', i === cur); t.classList.toggle('done', !!imgs[i].box); });
    const done = imgs.filter((x) => x.box).length;
    $('#labelDone').textContent = `${done} / 5`;
    $('#labelTxt').textContent = im.box ? `cup_${cur + 1}.txt\n${lineOf(im.box)}` : '아직 상자가 없어요';
    $('#trainBtn').disabled = done < 5;
  };
  onDrag(cv, {
    down: (p) => { start = p; tmp = { x: p.x, y: p.y, w: 0, h: 0 }; },
    move: (p) => { tmp = { x: Math.min(start.x, p.x), y: Math.min(start.y, p.y), w: Math.abs(p.x - start.x), h: Math.abs(p.y - start.y) }; draw(); },
    up: () => {
      const b = tmp; tmp = null;
      if (!b || b.w < 10 || b.h < 10) { draw(); return; }
      const v = iou(b, imgs[cur].cup);
      if (v < .5) { toast(`컵에 더 꼭 맞게 그려보세요! (IoU ${v.toFixed(2)})`); draw(); return; }
      imgs[cur].box = b; imgs[cur].iou = v;
      toast(v > .8 ? `👍 아주 정확해요! IoU ${v.toFixed(2)}` : `좋아요! IoU ${v.toFixed(2)}`);
      const next = imgs.findIndex((x) => !x.box);
      if (next >= 0) setTimeout(() => { cur = next; draw(); }, 500);
      draw();
    },
  });
  cv.style.cursor = 'crosshair';
  $('#labelUndo').addEventListener('click', () => { imgs[cur].box = null; draw(); });
  $('#trainBtn').addEventListener('click', () => trainSim(imgs.reduce((s, x) => s + x.iou, 0) / imgs.length));
  draw();
}

function trainSim(quality) {
  const out = $('#trainOut'); out.hidden = false;
  const cv = $('#lossCanvas'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height, E = 25;
  const finalMap = clamp(.45 + (quality - .5) * 1.0 + rand(-.03, .03), .3, .97);
  const loss = [], map = [];
  for (let e = 0; e < E; e++) {
    loss.push(2.6 * Math.exp(-e / 7) + .35 + rand(-.08, .08));
    map.push(finalMap * (1 - Math.exp(-e / 5)) + rand(-.03, .03));
  }
  $('#trainFiles').innerHTML = '';
  $('#trainBtn').disabled = true;
  out.scrollIntoView({ behavior: 'smooth', block: 'center' });
  let e = 0;
  const tick = () => {
    ctx.clearRect(0, 0, W, H);
    const L = 50, R = 20, T = 30, B = 30, px = (i) => L + i * (W - L - R) / (E - 1);
    ctx.strokeStyle = cssVar('--line'); ctx.lineWidth = 1;
    for (let k = 0; k <= 4; k++) { const y = T + k * (H - T - B) / 4; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(W - R, y); ctx.stroke(); }
    const plot = (arr, max, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath();
      arr.slice(0, e + 1).forEach((v, i) => { const y = H - B - (v / max) * (H - T - B); i ? ctx.lineTo(px(i), y) : ctx.moveTo(px(i), y); });
      ctx.stroke();
    };
    plot(loss, 3.2, '#e9468b'); plot(map, 1, '#22a06b');
    ctx.font = '700 13px "Noto Sans KR"';
    ctx.fillStyle = '#e9468b'; ctx.fillText(`● box_loss (틀린 정도) ${loss[e].toFixed(2)}`, L, 18);
    ctx.fillStyle = '#22a06b'; ctx.fillText(`● mAP50 (정확도) ${Math.max(0, map[e]).toFixed(2)}`, L + 260, 18);
    ctx.fillStyle = cssVar('--ink'); ctx.fillText(`Epoch ${e + 1}/${E}`, W - 120, 18);
    ctx.fillStyle = cssVar('--muted'); ctx.font = '12px "JetBrains Mono"'; ctx.fillText('epoch →', W - 80, H - 8);
    if (++e < E) setTimeout(() => requestAnimationFrame(tick), 120);
    else {
      $('#trainFiles').innerHTML = `<span>📁 runs/detect/train/weights/</span><span class="tfile best">🧠 best.pt</span><span class="tfile">last.pt</span><span class="tfile">results.png</span><span class="tfile">confusion_matrix.png</span>
        <span class="muted">→ best.pt를 <b>MScup.pt</b>로 이름 바꿔서 <code>YOLO('MScup.pt')</code></span>`;
      toast(`학습 완료! mAP50 ${map[E - 1].toFixed(2)} · 라벨을 정확히 그릴수록 점수가 올라가요`, 3500);
      confetti(60);
      $('#trainBtn').disabled = false;
    }
  };
  tick();
}
