# 파이참에서 내 데이터셋 만들고 YOLO26 학습하기

코랩 노트북(`colab/yolo26_custom_dataset.ipynb`)과 **같은 과정**을 내 컴퓨터의 파이참에서 해요.
인터넷은 처음 설치할 때와 `yolo26n.pt` 를 처음 내려받을 때만 필요해요.

## 준비

1. 이 폴더의 파일을 모두 파이참 프로젝트 폴더에 넣어요. (한글 폴더 이름이어도 괜찮아요)
2. 파이참 아래쪽 **Terminal** 에서 설치

   ```bash
   pip install -U -r requirements.txt
   ```

3. `config.py` 맨 위의 설정만 바꿔요.

   ```python
   CLASSES = ['cup']          # 찾을 물체 이름 (영어). 여러 개면 ['cup', 'phone']
   PROJECT_NAME = 'my_cup'    # 내 데이터셋 이름
   EPOCHS = 30                # GPU 가 없으면 10~30
   ```

## 순서 (파일을 열고 ▶ Run)

| 단계 | 파일 | 하는 일 |
| --- | --- | --- |
| 1 | `step1_add_photos.py` | `photos` 폴더에 넣은 사진(또는 zip)을 데이터셋으로 가져오기. 휴대폰 사진 회전 보정, 크기 줄이기 |
| 2 | `step2_webcam_capture.py` | (선택) 노트북 카메라로 찍기. `Space` 찰칵, `Q` 끝 |
| 3 | `step3_label.py` | 사진마다 마우스로 바운딩 박스 그리기 |
| 4 | `step4_check_split.py` | 박스 확인 그림 → train 80% / val 20% 나누기 → `data.yaml`, 데이터셋 zip |
| 5 | `step5_train.py` | YOLO26 학습 → `my_cup_best.pt` |
| 6 | `step6_predict.py` | `test_photos` 폴더의 새 사진으로 예측, 결과는 `predictions` 폴더 |
| 7 | `step7_webcam.py` | 내 모델로 웹캠에서 물체 찾기 |

`config.py` 는 모든 단계가 같이 쓰는 설정 파일이라 직접 실행하지 않아요.

### 3단계 박스 그리기 조작 (사진 창을 한 번 클릭한 뒤)

| 키 | 동작 |
| --- | --- |
| 드래그 | 박스 그리기 |
| 오른쪽 클릭 | 그 자리의 박스 지우기 |
| `Enter` / `Space` | 저장하고 다음 (박스가 없으면 한 번 더 눌러야 '물체 없는 사진'으로 저장) |
| `Z` / `C` | 마지막 박스 지우기 / 모두 지우기 |
| `A` / `D` | 이전 / 다음 (저장 안 함) |
| `1`~`9` | 클래스 바꾸기 |
| `X` 두 번 | 이 사진 빼기 |
| `Q` / `Esc` | 끝내기 (다시 실행하면 안 한 사진부터 이어서) |

창 안의 안내 글자는 OpenCV 가 한글을 못 써서 영어로 나와요.

## 코랩과 주고받기

- **파이참 → 코랩:** 4단계에서 만들어지는 `my_cup_dataset.zip` 을 코랩 노트북 2-A 에 올리면 박스까지 그대로 들어가요. GPU 가 없는 컴퓨터라면 박스는 파이참에서 그리고 학습은 코랩에서 하는 걸 추천해요.
- **코랩 → 파이참:** 코랩에서 만든 데이터셋 zip 을 `photos` 폴더에 넣고 1단계를 실행하면 박스까지 들어와요. 코랩에서 내려받은 `best.pt` 는 7단계의 `MODEL_FILE` 에 이름을 적어 쓰면 돼요.

## 폴더 구조 (실행하면 생겨요)

```
photos/                    1단계: 내가 넣는 원본 사진
test_photos/               6단계: 시험용 사진
my_datasets/my_cup/        정리된 사진(images)과 박스(labels)  ← 이게 진짜 데이터셋
datasets/my_cup/           4단계에서 train/val 로 나눈 학습용 복사본, data.yaml
runs/my_cup/               5단계 학습 기록 (results.png 그래프 등)
my_cup_best.pt             5단계 결과: 내 모델
predictions/               6단계 결과 그림
```

## 문제가 생기면

| 증상 | 해결 |
| --- | --- |
| `No module named 'ultralytics'` | 파이참 Terminal 에서 `pip install -U -r requirements.txt`. 파이참 인터프리터가 설치한 파이썬과 같은지 확인 |
| `yolo26n.pt` 가 없다는 오류 | ultralytics 가 옛 버전이에요. `pip install -U ultralytics` (8.4 이상) |
| 학습이 너무 느림 | `config.py` 에서 `EPOCHS = 10`, `IMGSZ = 416` 으로 줄이거나, 4단계 zip 을 코랩에 올려 GPU 로 학습 |
| 카메라가 안 켜짐 | 다른 프로그램(줌 등)을 끄고, 맥은 시스템 설정 → 개인정보 보호 → 카메라에서 파이참 허용 |
| 키를 눌러도 반응 없음 | 사진 창을 한 번 클릭한 뒤 눌러요. 한글 입력 상태면 영어로 바꿔요 |
