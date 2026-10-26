# YOLO 객체인식 교실

대현고 해커톤 특강 「객체 인식 활용 (YOLO)」을 학생들이 웹페이지에서 클릭하며 배울 수 있도록 만든 인터랙티브 수업 사이트입니다. 빌드 도구 없이 HTML/CSS/JS만으로 되어 있어 GitHub Pages에 그대로 올릴 수 있어요.

## 수업 구성

| 단원 | 내용 | 활동 |
| --- | --- | --- |
| 시작 | 오늘의 학습 목표, 수업 지도 | 격자 스캔 애니메이션 |
| 1. 머신러닝·딥러닝 | AI ⊃ ML ⊃ DL, 기존 프로그래밍 vs 머신러닝, 인공신경망 | 원 클릭 설명, 강아지/고양이 데이터 찍고 직접 학습시키기, 은닉층 신호 애니메이션, 퀴즈 |
| 2. 머신러닝의 종류 | 지도학습(분류·회귀), 비지도학습(군집화), 강화학습, YOLO는 어디에? | 종류 지도, 회귀선 맞추기, k-평균 군집화 단계별 실행, 미로 탈출 강화학습, 사례 분류 게임, 퀴즈 |
| 3. 객체인식 | 분류·탐지·분할·특징점 | 탭으로 같은 장면 비교, 활용 사례 분류 게임(드래그), 퀴즈 |
| 4. YOLO의 특징 | You Only Look Once, 격자 예측, conf·NMS, IoU, YOLO 좌표, 모델 가족, COCO 80 클래스 | 슬라이딩 윈도우 vs YOLO 레이스, 격자 크기 조절, 확신도 슬라이더, IoU 상자 끌기 미션, 상자 그려서 라벨 줄 만들기, 모델 크기 막대그래프, 클래스 검색, 퀴즈 |
| 5. YOLO 활용 실습 | 자료 받기 → PyCharm → 라이브러리 → 실행 → 모델 바꾸기 → YOLO-World → 영상·소리 → Roboflow → Colab → 내 모델 → 피지컬 컴퓨팅 | 11단계 타임라인, 코드 한 줄씩 설명, 코드 순서 퍼즐, 모델 파일 바꾸기, playsound/threading 시뮬레이션, 컵 라벨링 체험 → 학습 그래프 → best.pt |
| 6. YOLO 직접 실행 | 브라우저에서 진짜 **yolo11n** 실행 | 웹캠·수업 영상·내 사진 인식, conf 조절, 찾을 물체 고르기, 소리 알림(1초 간격) |
| 마무리 | 골든벨 10문제 | 만점 시 수료증 |

학생의 진도(본 단원, 퀴즈 점수)는 각자 브라우저에만 저장됩니다.

## 내 데이터셋 만들고 YOLO26 학습하기 (Roboflow 없이)

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/kang-teacher/YOLO/blob/main/colab/yolo26_custom_dataset.ipynb)

`colab/yolo26_custom_dataset.ipynb` 하나로 사진 올리기(업로드·웹캠·드라이브) → 셀 화면에서 마우스로 바운딩 박스 그리기 → train/val 나누기 → YOLO26 학습 → 예측 → `best.pt` 내려받기까지 해요. 외부 라벨링 사이트를 쓰지 않아서 학교망에서 Roboflow 가 막혀도 상관없고, 라벨은 구글 드라이브에 바로 저장돼 연결이 끊겨도 이어서 할 수 있어요.

같은 과정을 파이참(내 컴퓨터)에서 하려면 [`pycharm/`](pycharm/README.md) 의 단계별 스크립트(`step1` ~ `step7`)를 순서대로 실행하면 돼요. 두 쪽에서 만든 데이터셋 zip 은 서로 주고받을 수 있어서, 박스는 파이참에서 그리고 학습은 코랩 GPU 로 해도 돼요.

## GitHub Pages로 공개하기

1. 저장소 **Settings → Pages**
2. **Source: Deploy from a branch**, **Branch: `main` / `(root)`** 선택 후 Save
3. 잠시 뒤 `https://kang-teacher.github.io/YOLO/` 주소로 접속할 수 있어요.

## 내 컴퓨터에서 미리 보기

```bash
python -m http.server 8000
# 브라우저에서 http://localhost:8000
```

`index.html`을 더블클릭해서 열면 6단원(모델 불러오기)과 웹캠이 동작하지 않을 수 있어요. 꼭 위처럼 서버로 열어주세요.

## 폴더 구조

```
index.html              모든 단원 화면
css/style.css           디자인 (밝은/어두운 테마)
js/common.js            공통 도우미, COCO 클래스 이름
js/ml.js                1단원
js/types.js             2단원 (지도·비지도·강화학습)
js/detect.js            3단원 (SVG 장면)
js/yolo.js              4단원
js/practice.js          5단원
js/live.js              6단원 (onnxruntime-web 추론)
js/quiz.js              퀴즈 문제 (여기서 문제를 고치면 돼요)
js/main.js              페이지 이동, 진도
models/yolo11n.onnx     수업용 yolo11n.pt를 ONNX로 변환한 모델
colab/                  코랩 노트북 (내 데이터셋 → YOLO26 학습)
pycharm/                파이참용 단계별 스크립트 (같은 과정)
vendor/onnxruntime-web/ 브라우저 추론 엔진 (학교망에서 CDN이 막혀도 동작하도록 포함)
assets/media/           수업 영상·소리 (dogcatmove.mp4, phonemove2.mp4, *.mp3)
```

모델을 다시 만들려면: `yolo export model=yolo11n.pt format=onnx imgsz=640 opset=12 simplify=True`

## 수정한 뒤 주의할 점

css나 js 파일을 고치면 `index.html` 아래쪽의 `?v=3` 숫자를 모두 하나씩 올려주세요(예: `?v=4`). 그래야 학생들 브라우저가 예전 파일을 쓰지 않고 새 파일을 받아요.
