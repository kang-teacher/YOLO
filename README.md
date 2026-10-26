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
| 6. 내 데이터셋 만들기 | 사진 모으기 → 상자 그리기(라벨링) → train/val 나누기 → YOLO 형식 zip. 학습은 파이참(또는 코랩)에서 | 사진 여러 장 올리기, 웹캠 촬영(1초마다 5장), 드래그로 상자 그리기·옮기기·크기 조절, 물체 없는 사진 표시, 물체별 상자 수, zip 내려받기·다시 불러오기 |
| 7. YOLO 직접 실행 | 브라우저에서 진짜 **yolo11n** 실행 | 웹캠·수업 영상·내 사진 인식, conf 조절, 찾을 물체 고르기, 소리 알림(1초 간격) |
| 마무리 | 골든벨 10문제 | 만점 시 수료증 |

학생의 진도(본 단원, 퀴즈 점수)는 각자 브라우저에만 저장됩니다. 6단원에서 모은 사진과 상자도 서버로 올라가지 않고 각자 브라우저(IndexedDB)에만 저장돼서, 30명이 동시에 해도 사이트에 부담이 없어요.

6단원에서 내려받는 `프로젝트이름_dataset.zip` 구조:

```
images/train/*.jpg   labels/train/*.txt   (사진과 같은 이름, 한 줄에 "클래스 x y w h")
images/val/*.jpg     labels/val/*.txt
classes.txt          물체 이름 (한 줄에 하나, 번호 순서)
data.yaml            train / val 위치와 names (압축을 풀고 바로 model.train(data=...)에 써도 돼요)
```

이 zip을 파이참 프로젝트의 `photos` 폴더에 넣고 `step1_add_photos.py` → `step4_check_split.py` → `step5_train.py` 순서로 실행하면 학습돼요. 코랩 노트북은 2-A 칸에서 올리면 됩니다.

## GitHub Pages로 공개하기

1. 저장소 **Settings → Pages**
2. **Source: Deploy from a branch**, **Branch: `main` / `(root)`** 선택 후 Save
3. 잠시 뒤 `https://kang-teacher.github.io/YOLO/` 주소로 접속할 수 있어요.

## 내 컴퓨터에서 미리 보기

```bash
python -m http.server 8000
# 브라우저에서 http://localhost:8000
```

`index.html`을 더블클릭해서 열면 6단원(웹캠 촬영), 7단원(모델 불러오기)과 웹캠이 동작하지 않을 수 있어요. 꼭 위처럼 서버로 열어주세요.

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
js/dataset.js           6단원 (라벨링 도구, zip 만들기·읽기)
js/live.js              7단원 (onnxruntime-web 추론)
js/quiz.js              퀴즈 문제 (여기서 문제를 고치면 돼요)
js/main.js              페이지 이동, 진도
models/yolo11n.onnx     수업용 yolo11n.pt를 ONNX로 변환한 모델
vendor/onnxruntime-web/ 브라우저 추론 엔진 (학교망에서 CDN이 막혀도 동작하도록 포함)
assets/media/           수업 영상·소리 (dogcatmove.mp4, phonemove2.mp4, *.mp3)
```

모델을 다시 만들려면: `yolo export model=yolo11n.pt format=onnx imgsz=640 opset=12 simplify=True`

## 수정한 뒤 주의할 점

css나 js 파일을 고치면 `index.html` 아래쪽의 `?v=4` 숫자를 모두 하나씩 올려주세요(예: `?v=5`). 그래야 학생들 브라우저가 예전 파일을 쓰지 않고 새 파일을 받아요.
