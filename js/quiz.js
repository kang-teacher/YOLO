/* 단원별 퀴즈와 마무리 골든벨 */
const QUIZ = {
  ml: [
    { q: '인공지능, 머신러닝, 딥러닝의 포함 관계로 옳은 것은?', o: ['딥러닝 ⊃ 머신러닝 ⊃ 인공지능', '인공지능 ⊃ 머신러닝 ⊃ 딥러닝', '머신러닝 ⊃ 인공지능 ⊃ 딥러닝', '셋은 서로 관계가 없다'], a: 1, e: '인공지능이 가장 큰 개념이고, 그 안에 데이터로 배우는 머신러닝, 다시 그 안에 인공신경망을 깊게 쌓은 딥러닝이 있어요.' },
    { q: '머신러닝이 기존 프로그래밍과 가장 다른 점은?', o: ['사람이 규칙을 하나하나 직접 작성한다', '데이터와 정답을 주면 컴퓨터가 규칙을 스스로 찾는다', '인터넷이 꼭 필요하다', '그림만 처리할 수 있다'], a: 1, e: '머신러닝은 데이터 + 정답 → 규칙(모델)을 만들어 내요. 그래서 "학습"이라고 부릅니다.' },
    { q: '딥러닝에서 "딥(Deep)"이 뜻하는 것은?', o: ['데이터가 아주 많다', '컴퓨터가 깊은 생각을 한다', '인공신경망의 층(은닉층)이 여러 겹으로 깊다', '바다 속 사진을 분석한다'], a: 2, e: '은닉층을 여러 겹 쌓아 단순한 특징(선)부터 복잡한 특징(물체)까지 단계적으로 배워요.' },
  ],
  detect: [
    { q: '이미지 속 여러 물체를 "상자"로 표시하고 무엇인지 알려주는 기술은?', o: ['분류 (Classification)', '객체 탐지 (Object Detection)', '분할 (Segmentation)', '특징점 추출 (Keypoint)'], a: 1, e: '객체 탐지는 "무엇이(클래스) 어디에(상자)" 있는지를 함께 알려줘요. YOLO의 기본 기능입니다.' },
    { q: 'MRI 사진에서 뇌종양의 정확한 모양과 크기를 재려면 어떤 기술이 가장 알맞을까?', o: ['분류', '객체 탐지', '분할', '특징점 추출'], a: 2, e: '분할은 상자가 아니라 픽셀 단위로 물체의 모양을 칠해서 정확한 넓이를 알 수 있어요.' },
    { q: '골프 스윙 자세를 교정해 주는 앱에 가장 알맞은 기술은?', o: ['특징점 추출 (Pose)', '분류', '분할', '번역'], a: 0, e: '어깨, 팔꿈치, 무릎 같은 관절의 위치(특징점)를 찾아 자세를 분석해요.' },
  ],
  yolo: [
    { q: 'YOLO는 무엇의 약자일까?', o: ['You Only Learn Once', 'You Only Look Once', 'Your Object Location Output', 'You Often Look Outside'], a: 1, e: '"한 번만 본다"는 뜻으로, 이미지를 한 번에 보고 모든 물체를 예측하기 때문에 빨라요.' },
    { q: '예측 상자와 정답 상자가 얼마나 겹치는지 나타내는 값은?', o: ['FPS', 'IoU', 'conf', 'epoch'], a: 1, e: 'IoU = 겹친 넓이 ÷ 합친 넓이. 1에 가까울수록 잘 맞춘 거예요.' },
    { q: '이미지 크기가 640×480일 때, YOLO 라벨에서 x = 0.5는 무엇을 뜻할까?', o: ['상자 왼쪽 끝이 0.5픽셀', '상자 중심이 이미지 가로의 정중앙', '상자 너비가 절반', '확신도가 50%'], a: 1, e: 'YOLO 좌표는 0~1로 정규화된 상자 "중심" 위치예요. 0.5면 가로의 한가운데(320픽셀)입니다.' },
    { q: '같은 YOLO11이라도 가장 빠르고 가벼운 모델은?', o: ['yolo11x', 'yolo11l', 'yolo11m', 'yolo11n'], a: 3, e: 'n(nano) < s < m < l < x 순서로 커져요. 수업에서는 노트북에서도 잘 돌아가는 yolo11n을 써요.' },
  ],
  practice: [
    { q: '저장된 영상 파일로 YOLO를 실행하려면 VideoCapture를 어떻게 바꿔야 할까?', o: ["cv2.VideoCapture(0)", "cv2.VideoCapture('phonemove2.mp4')", "cv2.imshow('phonemove2.mp4')", "YOLO('phonemove2.mp4')"], a: 1, e: 'VideoCapture(0)은 컴퓨터 내장 카메라, 파일 이름을 넣으면 그 영상을 읽어요.' },
    { q: 'YOLO-World 모델에서 찾고 싶은 물체 이름을 정해주는 코드는?', o: ["model.set_classes(['phone', 'man'])", "model.train('phone')", "cv2.find('phone')", "playsound('phone')"], a: 0, e: 'YOLO-World는 학습하지 않은 물체도 이름(글자)만 알려주면 찾을 수 있어요.' },
    { q: '소리를 재생할 때 threading과 1초 간격 검사를 쓰는 이유는?', o: ['소리를 더 크게 하려고', '영상이 멈추지 않고, 소리가 매 프레임 겹쳐 울리지 않게 하려고', '모델 정확도를 높이려고', '인터넷 속도를 높이려고'], a: 1, e: 'playsound는 소리가 끝날 때까지 기다리기 때문에 영상이 멈춰요. 따로 실행(thread)하고 시간 간격을 두면 해결돼요.' },
    { q: 'Roboflow + Colab으로 직접 학습시킨 뒤 받아야 하는 파일은?', o: ['last.mp4', 'best.pt', 'data.yaml', 'train.jpg'], a: 1, e: 'runs/detect/train/weights/best.pt가 가장 성능이 좋은 모델이에요. YOLO("MScup.pt")처럼 불러서 써요.' },
  ],
};

const GOLDEN = [
  ...QUIZ.ml.slice(0, 2), QUIZ.detect[0], QUIZ.detect[1], QUIZ.yolo[0], QUIZ.yolo[1], QUIZ.yolo[2],
  { q: "수업 코드 model(image, conf=0.3)에서 conf=0.3의 의미는?", o: ['30번 반복해서 검사', '확신도 30% 이상인 결과만 보여주기', '이미지를 30% 크기로 줄이기', '0.3초마다 검사'], a: 1, e: '확신도(confidence)가 0.3보다 낮은 상자는 버려요. 값을 올리면 확실한 것만 남아요.' },
  QUIZ.practice[0], QUIZ.practice[3],
];

function makeQuiz(el, qs, { title = '✅ 확인 퀴즈', key, final = false } = {}) {
  let i = 0, score = 0;
  const res = [];
  const render = () => {
    if (i >= qs.length) return done();
    const q = qs[i];
    el.innerHTML = `
      <div class="quiz-card">
        <h2><span>${title}</span><span class="pill">${i + 1} / ${qs.length}</span></h2>
        <div class="quiz-q">Q${i + 1}. ${q.q}</div>
        <div class="quiz-opts">${shuffle(q.o.map((o, k) => [o, k])).map(([o, k], n) => `<button class="quiz-opt" data-k="${k}">${'①②③④'[n]} ${o}</button>`).join('')}</div>
        <div class="quiz-exp" hidden></div>
        <div class="quiz-foot">
          <div class="quiz-dots">${qs.map((_, k) => `<i class="${res[k] === true ? 'r' : res[k] === false ? 'w' : ''} ${k === i ? 'cur' : ''}"></i>`).join('')}</div>
          <button class="btn btn-primary btn-sm quiz-next" hidden>${i + 1 < qs.length ? '다음 문제 →' : '결과 보기'}</button>
        </div>
      </div>`;
    $$('.quiz-opt', el).forEach((b) => b.addEventListener('click', () => {
      const k = +b.dataset.k, ok = k === q.a;
      res[i] = ok; if (ok) score++;
      $$('.quiz-opt', el).forEach((x) => { x.disabled = true; if (+x.dataset.k === q.a) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      const ex = $('.quiz-exp', el); ex.hidden = false;
      ex.innerHTML = (ok ? '⭕ <b>정답!</b> ' : '❌ <b>아쉬워요.</b> ') + q.e;
      $('.quiz-next', el).hidden = false;
      $$('.quiz-dots i', el)[i].className = ok ? 'r cur' : 'w cur';
    }));
    $('.quiz-next', el).addEventListener('click', () => { i++; render(); });
  };
  const done = () => {
    const all = score === qs.length;
    if (key) { const best = store.get('quiz:' + key, 0); store.set('quiz:' + key, Math.max(best, score)); document.dispatchEvent(new Event('progress')); }
    el.innerHTML = `
      <div class="quiz-card">
        <h2>${title} 결과</h2>
        <div class="score-big">${score} / ${qs.length}</div>
        <p class="center">${all ? '🎉 완벽해요! 모두 맞혔어요.' : score >= qs.length * 0.6 ? '👍 잘했어요! 틀린 문제를 다시 확인해 봐요.' : '💪 위의 활동을 한 번 더 해보고 다시 도전!'}</p>
        ${final && all ? `<div class="cert"><h3>🏆 YOLO 객체인식 수료증</h3><p><input placeholder="이름을 입력하세요" aria-label="이름"></p><p>위 학생은 머신러닝·딥러닝의 개념과 객체인식, YOLO 모델의 특징과 활용 과정을 성실히 학습하고 골든벨 10문제를 모두 맞혔기에 이 증서를 드립니다.</p><p class="muted">대현고 해커톤 특강</p></div>` : ''}
        <div class="btn-row center"><button class="btn btn-ghost quiz-retry">다시 풀기</button></div>
      </div>`;
    $('.quiz-retry', el).addEventListener('click', () => { i = 0; score = 0; res.length = 0; render(); });
    if (all) confetti(final ? 220 : 90);
  };
  render();
}

function initQuizzes() {
  $$('.quiz[data-quiz]').forEach((el) => makeQuiz(el, QUIZ[el.dataset.quiz], { key: el.dataset.quiz }));
  makeQuiz($('#golden'), GOLDEN, { title: '🔔 YOLO 골든벨', key: 'final', final: true });
}
