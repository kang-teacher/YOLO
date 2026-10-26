"""
6단계. 새 사진으로 예측해 보기

- test_photos 폴더에 학습에 안 쓴 사진을 넣고 실행하세요. (비어 있으면 val 사진으로 시험해요)
- 사진마다 창이 뜨고, 아무 키나 누르면 다음 사진, Q 를 누르면 끝나요.
- 결과 그림은 predictions 폴더에 저장돼요.
"""
import cv2
from PIL import Image
from ultralytics import YOLO

from config import BASE, BEST, CONF, DATASET, IMG_EXTS, TEST_DIR, bgr_from, prepare

prepare()
if not BEST.exists():
    raise SystemExit(f'{BEST.name} 이 없어요. step5_train.py 로 먼저 학습하세요.')

photos = sorted(p for p in TEST_DIR.rglob('*') if p.suffix.lower() in IMG_EXTS)
if not photos:
    photos = sorted((DATASET / 'images' / 'val').glob('*.jpg'))
    print(f'test_photos 가 비어 있어서 val 사진 {len(photos)}장으로 시험해요.')

out_dir = BASE / 'predictions'
out_dir.mkdir(exist_ok=True)
model = YOLO(str(BEST))

for p in photos:
    r = model.predict(bgr_from(p), conf=CONF, verbose=False)[0]
    found = [f'{r.names[int(c)]} {s:.2f}' for c, s in zip(r.boxes.cls.tolist(), r.boxes.conf.tolist())]
    print(f'{p.name}: {len(found)}개 찾음 {found}')

    plotted = r.plot()
    Image.fromarray(plotted[:, :, ::-1]).save(out_dir / f'{p.stem}.jpg')   # 한글 경로에서도 저장되게 PIL 사용

    h, w = plotted.shape[:2]
    s = min(1200 / w, 800 / h, 1)
    cv2.imshow('predict (any key: next, Q: quit)', cv2.resize(plotted, (int(w * s), int(h * s))))
    if cv2.waitKey(0) & 0xFF in (ord('q'), 27):
        break

cv2.destroyAllWindows()
print(f'🖼️ 결과 그림: {out_dir}')
print('다음: step7_webcam.py 로 웹캠에서 찾아보세요.')
