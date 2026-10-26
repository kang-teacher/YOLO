"""내가 학습시킨 모델(best.pt)로 웹캠에서 물체 찾기. q 를 누르면 끝나요."""
from ultralytics import YOLO
import cv2

model = YOLO('my_best.pt')     # 코랩에서 내려받은 파일이면 그 이름으로 바꾸세요 (예: my_cup_best.pt)
cap = cv2.VideoCapture(0)

while cap.isOpened():
    success, image = cap.read()
    if not success:
        continue

    results = model(image, conf=0.5)
    print(results[0].boxes.cls.tolist(), results[0].boxes.conf.tolist())
    cv2.imshow('img', results[0].plot())

    if cv2.waitKey(1) == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
