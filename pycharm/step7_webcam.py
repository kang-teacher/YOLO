"""
7단계. 내 모델로 웹캠에서 물체 찾기. q 를 누르면 끝나요.

코랩에서 학습했다면 내려받은 best.pt 를 이 폴더에 넣고 아래 MODEL_FILE 을 그 이름으로 바꾸세요.
"""
from ultralytics import YOLO
import cv2

from config import BEST, CONF

MODEL_FILE = BEST            # 예: 'my_cup_best.pt'

model = YOLO(str(MODEL_FILE))
cap = cv2.VideoCapture(0)

while cap.isOpened():
    success, image = cap.read()
    if not success:
        continue

    results = model(image, conf=CONF, verbose=False)
    print(results[0].boxes.cls.tolist(), results[0].boxes.conf.tolist())
    cv2.imshow('img', results[0].plot())

    if cv2.waitKey(1) == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
