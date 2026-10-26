"""
3번. 내 모델로 새 사진 시험하기

- '시험사진' 폴더에 학습에 안 쓴 사진을 넣고 실행하세요. (비어 있으면 val 사진으로 시험해요)
- 사진마다 창이 뜨고, 아무 키나 누르면 다음 사진, Q 를 누르면 끝나요.
- 결과 그림은 '시험결과' 폴더에 저장돼요.
"""
import cv2
from PIL import Image
from ultralytics import YOLO

from 공통 import BASE, CONF, IMG_EXTS, TEST_DIR, best_path, bgr_from, load_info

info = load_info()
best = best_path(info['project'])
if not best.exists():
    raise SystemExit(f'{best.name} 이 없어요. 2_학습하기.py 로 먼저 학습하세요.')

TEST_DIR.mkdir(exist_ok=True)
photos = sorted(p for p in TEST_DIR.rglob('*') if p.suffix.lower() in IMG_EXTS)
if not photos:
    val_dir = BASE / 'datasets' / info['project'] / 'images' / 'val'
    photos = sorted(p for p in val_dir.glob('*') if p.suffix.lower() in IMG_EXTS)
    print(f'시험사진 폴더가 비어 있어서 val 사진 {len(photos)}장으로 시험해요.')

out_dir = BASE / '시험결과'
out_dir.mkdir(exist_ok=True)
model = YOLO(str(best))

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
print('다음: 4_웹캠으로_시험하기.py 로 웹캠에서 찾아보세요.')
