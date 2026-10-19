/* 3단원: 객체인식 4가지 방식 (SVG 장면) */
const SCENE_OBJ = {
  person: (f, s) => `
    <g fill="${f || '#2f6fb3'}" stroke="${s || 'none'}">
      <line x1="145" y1="250" x2="140" y2="325" stroke="${f || '#334'}" stroke-width="14" stroke-linecap="round"/>
      <line x1="165" y1="250" x2="172" y2="325" stroke="${f || '#334'}" stroke-width="14" stroke-linecap="round"/>
      <line x1="137" y1="178" x2="112" y2="240" stroke="${f || '#f1c7a1'}" stroke-width="11" stroke-linecap="round"/>
      <line x1="173" y1="178" x2="200" y2="235" stroke="${f || '#f1c7a1'}" stroke-width="11" stroke-linecap="round"/>
      <rect x="133" y="166" width="44" height="90" rx="14"/>
      <circle cx="155" cy="143" r="23" fill="${f || '#f1c7a1'}"/>
      ${f ? '' : '<path d="M132 138 q23 -30 46 0 q-6 -16 -23 -16 q-17 0 -23 16z" fill="#3a2a1a"/>'}
    </g>`,
  dog: (f) => `
    <g fill="${f || '#c98a4b'}">
      <path d="M298 280 q-22 -8 -26 -30" stroke="${f || '#c98a4b'}" stroke-width="8" fill="none" stroke-linecap="round"/>
      <rect x="306" y="292" width="13" height="38" rx="5"/><rect x="330" y="294" width="13" height="36" rx="5"/>
      <rect x="370" y="294" width="13" height="36" rx="5"/><rect x="392" y="292" width="13" height="38" rx="5"/>
      <ellipse cx="352" cy="283" rx="58" ry="26"/>
      <circle cx="410" cy="258" r="22"/>
      <ellipse cx="427" cy="267" rx="13" ry="9"/>
      <ellipse cx="398" cy="246" rx="8" ry="16" fill="${f || '#7a4f25'}" transform="rotate(-20 398 246)"/>
      ${f ? '' : '<circle cx="416" cy="252" r="3" fill="#222"/><circle cx="437" cy="264" r="4" fill="#222"/>'}
    </g>`,
  car: (f) => `
    <g fill="${f || '#e2483d'}">
      <path d="M488 252 l16 -30 h70 l22 30z"/>
      <rect x="455" y="250" width="162" height="50" rx="12"/>
      ${f ? '' : '<path d="M498 250 l12 -22 h24 v22z M542 250 v-22 h28 l16 22z" fill="#bfe3f7"/><rect x="603" y="262" width="12" height="8" rx="2" fill="#ffe08a"/>'}
      <circle cx="492" cy="304" r="19" fill="${f || '#222'}"/><circle cx="582" cy="304" r="19" fill="${f || '#222'}"/>
      ${f ? '' : '<circle cx="492" cy="304" r="7" fill="#aaa"/><circle cx="582" cy="304" r="7" fill="#aaa"/>'}
    </g>`,
};
const SCENE_BOX = { person: [104, 116, 104, 216, 'person 0.94', '#ff3838'], dog: [268, 228, 175, 104, 'dog 0.91', '#3ddb86'], car: [452, 216, 168, 109, 'car 0.88', '#00c2ff'] };

function sceneBase() {
  return `
    <rect width="640" height="400" fill="#cfe7f6"/>
    <circle cx="560" cy="70" r="34" fill="#ffd45c"/>
    <path d="M0 290 h640 v110 h-640z" fill="#9bd28a"/>
    <path d="M0 312 h640 v40 h-640z" fill="#b9b4a8"/>
    <rect x="232" y="150" width="16" height="150" fill="#8b5a2b"/>
    <circle cx="240" cy="140" r="46" fill="#4fae5b"/><circle cx="214" cy="170" r="30" fill="#4fae5b"/><circle cx="268" cy="168" r="30" fill="#4fae5b"/>
    <path d="M40 60 q20 -20 40 0 q20 -15 35 5 h-75z M330 50 q18 -18 36 0 q18 -12 30 4 h-66z" fill="#fff" opacity=".85"/>
    ${SCENE_OBJ.person()}${SCENE_OBJ.dog()}${SCENE_OBJ.car()}`;
}

function sceneOverlay(t) {
  const lab = (x, y, txt, c) => `<g class="anim-in"><rect x="${x - 1.5}" y="${y - 22}" width="${txt.length * 8.6 + 12}" height="22" fill="${c}"/><text x="${x + 5}" y="${y - 6}" fill="#fff" font-family="JetBrains Mono, monospace" font-size="14" font-weight="600">${txt}</text></g>`;
  if (t === 'cls') {
    return `<g class="anim-in"><rect x="16" y="16" width="250" height="112" rx="12" fill="rgba(20,24,30,.82)"/>
      <text x="32" y="44" fill="#fff" font-size="15" font-weight="700" font-family="Noto Sans KR">이 사진은…</text>
      ${[['공원 풍경', .81], ['거리', .12], ['숲', .04]].map(([n, p], i) => `
        <text x="32" y="${70 + i * 22}" fill="#fff" font-size="13" font-family="Noto Sans KR">${n}</text>
        <rect x="104" y="${60 + i * 22}" width="${p * 140}" height="13" rx="4" fill="${i ? '#7d8a83' : '#f5b82e'}"/>
        <text x="${110 + p * 140}" y="${71 + i * 22}" fill="#fff" font-size="12" font-family="JetBrains Mono">${Math.round(p * 100)}%</text>`).join('')}
      </g><rect x="3" y="3" width="634" height="394" fill="none" stroke="#f5b82e" stroke-width="6" class="anim-in"/>`;
  }
  if (t === 'det') {
    return Object.values(SCENE_BOX).map(([x, y, w, h, l, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${c}" stroke-width="3.5" class="anim-in"/>${lab(x, y, l, c)}`).join('');
  }
  if (t === 'seg') {
    return `<g opacity=".62" class="anim-in">${SCENE_OBJ.person('#ff3838')}${SCENE_OBJ.dog('#3ddb86')}${SCENE_OBJ.car('#00c2ff')}</g>` +
      Object.values(SCENE_BOX).map(([x, y, w, h, l, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${c}" stroke-width="1.5" class="anim-in"/>${lab(x, y, l, c)}`).join('');
  }
  if (t === 'pose') {
    const K = { nose: [155, 145], ls: [137, 176], rs: [173, 176], le: [124, 208], re: [187, 206], lw: [112, 240], rw: [200, 235], lh: [144, 252], rh: [166, 252], lk: [142, 289], rk: [169, 289], la: [140, 325], ra: [172, 325] };
    const E = [['ls', 'rs'], ['ls', 'le'], ['le', 'lw'], ['rs', 're'], ['re', 'rw'], ['ls', 'lh'], ['rs', 'rh'], ['lh', 'rh'], ['lh', 'lk'], ['lk', 'la'], ['rh', 'rk'], ['rk', 'ra'], ['nose', 'ls'], ['nose', 'rs']];
    return `<g class="anim-in">${E.map(([a, b]) => `<line x1="${K[a][0]}" y1="${K[a][1]}" x2="${K[b][0]}" y2="${K[b][1]}" stroke="#ff37c7" stroke-width="4" stroke-linecap="round"/>`).join('')}
      ${Object.values(K).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="#ffb21d" stroke="#fff" stroke-width="2"/>`).join('')}</g>
      <rect x="104" y="116" width="104" height="216" fill="none" stroke="#ff3838" stroke-width="2" class="anim-in dash"/>${lab(104, 116, 'person 0.94', '#ff3838')}
      <g class="anim-in"><rect x="230" y="20" width="200" height="56" rx="10" fill="rgba(20,24,30,.82)"/><text x="244" y="44" fill="#fff" font-size="13" font-family="Noto Sans KR">관절 17개의 위치(x, y)를</text><text x="244" y="64" fill="#fff" font-size="13" font-family="Noto Sans KR">점으로 찾아 연결해요</text></g>`;
  }
  return '';
}

function renderScene(svg, t) { svg.innerHTML = sceneBase() + sceneOverlay(t); }

function initDetect() {
  const INFO = {
    cls: { h: '🏷️ 분류 (Image Classification)', d: '이미지 속 <b>하나의 대상을 구분</b>해 내는 것이에요. "이 사진은 무엇인가?"에 대한 답 하나(와 확률)만 알려주고, 위치는 알려주지 않아요.', ex: ['얼굴 사진으로 성별·나이 추정하기', '사진 속 동물 종류 맞히기', '불량품/정상품 판정'] },
    det: { h: '📦 객체 탐지 (Object Detection)', d: '이미지 속 <b>여러 사물을 상자(박스)로 구별</b>하고, 각각 어떤 사물인지 알아보는 것이에요. <b>YOLO의 기본 기능</b>이 바로 이것!', ex: ['CCTV 인파·위험 감지', '도로 위 차량 세기', '차량 번호판 인식', '차량 파손 부위 찾기', '화재·아이 안전 감지'] },
    seg: { h: '🎨 분할 (Segmentation)', d: '상자 대신 <b>픽셀 하나하나</b>까지 어느 물체에 속하는지 칠해요. 물체의 정확한 모양과 넓이를 알 수 있어요.', ex: ['머리카락만 골라 염색해 보기', 'MRI에서 뇌종양 크기 측정', '부품별로 나누기', '바다 위 기름 유출 탐지'] },
    pose: { h: '🦴 특징점 추출 (Keypoint Detection)', d: '이미지 속 <b>특징이 되는 점</b>(관절, 눈·코·입 등)의 위치를 찾아내요. 사람의 자세나 표정을 분석할 수 있어요.', ex: ['운동·골프 자세 교정', 'Face mesh로 얼굴 아바타 만들기', '손동작 인식'] },
  };
  const svg = $('#taskSvg');
  const set = (t) => {
    $$('#taskTabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
    renderScene(svg, t);
    const i = INFO[t];
    $('#taskInfo').innerHTML = `<h3>${i.h}</h3><p>${i.d}</p><h4>활용 사례</h4><ul class="ex-list">${i.ex.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  };
  $$('#taskTabs button').forEach((b) => b.addEventListener('click', () => set(b.dataset.t)));
  set('cls');

  /* --- 분류하기 게임 --- */
  const CARDS = [
    ['😃 얼굴 사진으로 성별 판단', 'cls'], ['🐾 사진 속 동물 종류 맞히기', 'cls'],
    ['📹 CCTV 인파 위험 감지', 'det'], ['🚗 차량 파손 부위 찾기', 'det'], ['🔢 차량 번호판 인식', 'det'], ['🔥 화재 연기 감지', 'det'],
    ['💇 머리카락만 골라 염색', 'seg'], ['🧠 뇌종양 크기 측정', 'seg'], ['🛢️ 바다 기름 유출 영역', 'seg'],
    ['🏌️ 골프 자세 교정', 'pose'], ['🎭 Face mesh 아바타', 'pose'], ['✋ 손동작 인식', 'pose'],
  ];
  makeSorter($('#sorter').closest('.card'), CARDS, '객체인식 박사네요.');
}
