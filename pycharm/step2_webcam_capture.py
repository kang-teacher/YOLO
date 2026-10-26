"""
2단계 (선택). 노트북 카메라로 사진 찍기

  Space : 찰칵 (바로 데이터셋에 저장)
  Q     : 끝내기

물체를 여러 각도, 거리, 배경, 조명에서 30장 이상 찍어 보세요.
"""
import cv2

from config import add_image, image_list, prepare

prepare()
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
if not cap.isOpened():
    raise SystemExit('카메라를 열 수 없어요. 다른 프로그램(줌 등)이 카메라를 쓰고 있지 않은지 확인하세요.')

shots = 0
flash = 0
while True:
    ok, frame = cap.read()
    if not ok:
        continue
    view = frame.copy()
    if flash:
        view[:] = 255
        flash -= 1
    cv2.putText(view, f'photos: {len(image_list())}  (this time: {shots})   [Space] shoot  [Q] quit',
                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    cv2.imshow('capture', view)

    k = cv2.waitKey(1) & 0xFF
    if k == ord(' '):
        ok, jpg = cv2.imencode('.jpg', frame)
        add_image(jpg.tobytes(), f'cam_{len(image_list()):04d}.jpg')
        shots += 1
        flash = 2
    elif k in (ord('q'), 27) or cv2.getWindowProperty('capture', cv2.WND_PROP_VISIBLE) < 1:
        break

cap.release()
cv2.destroyAllWindows()
print(f'📸 {shots}장 찍음, 지금까지 사진 {len(image_list())}장')
print('다음: step3_label.py 로 박스를 그리세요.')
