"""
4번. 내 모델로 웹캠에서 물체 찾기. q 를 누르면 끝나요.

수업 때 쓴 YOLO 연습.py 와 똑같은 모양이에요. 바뀐 건 모델 파일 이름 하나뿐!
   model = YOLO('yolo11n.pt')   →   model = YOLO('내데이터셋_best.pt')
"""
import cv2
from ultralytics import YOLO

from 공통 import CONF, best_path, load_info

info = load_info()
best = best_path(info['project'])
if not best.exists():
    raise SystemExit(f'{best.name} 이 없어요. 2_학습하기.py 로 먼저 학습하세요.')

model = YOLO(str(best))
cap = cv2.VideoCapture(0)
print(f'📷 {info["classes"]} 를 찾는 중… 끝내려면 영상 창을 누르고 q')

while cap.isOpened():
    success, image = cap.read()
    if not success:
        continue

    results = model(image, conf=CONF, verbose=False)
    names = [results[0].names[int(c)] for c in results[0].boxes.cls.tolist()]
    if names:
        print(names, [round(s, 2) for s in results[0].boxes.conf.tolist()])
    cv2.imshow('my model (q: quit)', results[0].plot())

    if cv2.waitKey(1) == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
