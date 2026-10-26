"""
파이참용 바운딩 박스 그리기 도구 (코랩이 안 될 때 쓰는 대안)

준비
  1. pip install -U ultralytics pillow    (opencv 도 같이 설치돼요)
  2. 이 파일과 같은 폴더에 photos 폴더를 만들고 사진을 넣기
  3. 아래 CLASSES 를 찾을 물체 이름(영어)으로 바꾸고 실행

조작 (사진 창을 한 번 클릭한 뒤)
  마우스 드래그     박스 그리기
  오른쪽 클릭       그 자리의 박스 지우기
  Enter / Space    저장하고 다음 사진
  Z / C            마지막 박스 지우기 / 모두 지우기
  A / D            이전 / 다음 사진 (저장 안 함)
  1 ~ 9            클래스 바꾸기
  Q / Esc          끝내기 → my_dataset.zip 이 만들어져요

결과
  my_dataset/images/*.jpg, my_dataset/labels/*.txt (YOLO 형식), my_dataset/classes.txt
  my_dataset.zip 을 코랩 노트북 2-A 에 올리면 박스까지 그대로 들어가고,
  train_local.py 로 이 컴퓨터에서 바로 학습할 수도 있어요.
"""
import re
import shutil
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps

CLASSES = ['cup']            # 찾을 물체 이름 (영어). 순서를 바꾸면 라벨 번호가 꼬여요!
PHOTO_DIR = Path('photos')   # 원본 사진 폴더
OUT_DIR = Path('my_dataset')

IMG_DIR = OUT_DIR / 'images'
LBL_DIR = OUT_DIR / 'labels'
IMG_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
MAX_SIDE = 1280
WIN_W, WIN_H = 1200, 760
COLORS = [(68, 68, 239), (246, 130, 59), (94, 197, 34), (11, 158, 245), (247, 85, 168),
          (153, 72, 236), (166, 184, 20), (22, 115, 249), (22, 204, 132), (241, 102, 99)]


def import_photos():
    """photos 폴더의 사진을 회전 보정 + 크기 줄여서 my_dataset/images 로 복사 (이미 있으면 건너뜀)"""
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    LBL_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / 'classes.txt').write_text('\n'.join(CLASSES) + '\n', encoding='utf-8')
    if not PHOTO_DIR.exists():
        PHOTO_DIR.mkdir()
        print(f'{PHOTO_DIR.resolve()} 폴더를 만들었어요. 여기에 사진을 넣고 다시 실행하세요.')
        return
    n = 0
    for p in sorted(PHOTO_DIR.rglob('*')):
        if p.suffix.lower() not in IMG_EXTS:
            continue
        stem = re.sub(r'[^\w\-]', '_', p.stem) or 'img'
        if (IMG_DIR / f'{stem}.jpg').exists():
            continue
        try:
            im = ImageOps.exif_transpose(Image.open(p)).convert('RGB')
        except Exception:
            print(f'  ✗ {p.name}: 사진이 아니에요')
            continue
        im.thumbnail((MAX_SIDE, MAX_SIDE))
        im.save(IMG_DIR / f'{stem}.jpg', quality=92)
        n += 1
    if n:
        print(f'새 사진 {n}장을 가져왔어요.')


def image_list():
    return sorted(p for p in IMG_DIR.iterdir() if p.suffix.lower() == '.jpg')


def label_path(img):
    return LBL_DIR / (img.stem + '.txt')


def read_boxes(img):
    boxes = []
    if label_path(img).exists():
        for line in label_path(img).read_text().splitlines():
            parts = line.split()
            if len(parts) == 5:
                boxes.append([int(parts[0])] + [float(v) for v in parts[1:]])
    return boxes


def save_boxes(img, boxes):
    lines = [f'{c} {x:.6f} {y:.6f} {w:.6f} {h:.6f}' for c, x, y, w, h in boxes if w > 0.002 and h > 0.002]
    label_path(img).write_text('\n'.join(lines) + ('\n' if lines else ''))


class Labeler:
    def __init__(self):
        self.imgs = image_list()
        self.idx = next((i for i, p in enumerate(self.imgs) if not label_path(p).exists()), 0)
        self.cls = 0
        self.drag = None
        self.mouse = None
        self.notice = ''
        self.empty_ok = False
        self.load()

    def load(self):
        img = self.imgs[self.idx]
        rgb = np.array(Image.open(img).convert('RGB'))   # PIL 로 읽어서 한글 경로도 OK
        self.base = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
        h, w = self.base.shape[:2]
        s = min(WIN_W / w, WIN_H / h, 1.5)
        self.view = cv2.resize(self.base, (int(w * s), int(h * s)))
        self.boxes = read_boxes(img)
        self.drag = None
        self.empty_ok = False

    def to_box(self, x0, y0, x1, y1):
        H, W = self.view.shape[:2]
        l, r = sorted((min(max(x0, 0), W), min(max(x1, 0), W)))
        t, b = sorted((min(max(y0, 0), H), min(max(y1, 0), H)))
        return [self.cls, (l + r) / 2 / W, (t + b) / 2 / H, (r - l) / W, (b - t) / H]

    def on_mouse(self, event, x, y, flags, param):
        self.mouse = (x, y)
        if event == cv2.EVENT_LBUTTONDOWN:
            self.drag = [x, y, x, y]
            self.empty_ok = False
        elif event == cv2.EVENT_MOUSEMOVE and self.drag:
            self.drag[2:] = [x, y]
        elif event == cv2.EVENT_LBUTTONUP and self.drag:
            x0, y0 = self.drag[:2]
            if abs(x - x0) > 4 and abs(y - y0) > 4:
                self.boxes.append(self.to_box(x0, y0, x, y))
            self.drag = None
        elif event == cv2.EVENT_RBUTTONDOWN:
            H, W = self.view.shape[:2]
            hits = [i for i, (c, bx, by, bw, bh) in enumerate(self.boxes)
                    if abs(x / W - bx) <= bw / 2 and abs(y / H - by) <= bh / 2]
            if hits:
                self.boxes.pop(min(hits, key=lambda i: self.boxes[i][3] * self.boxes[i][4]))

    def render(self):
        frame = self.view.copy()
        H, W = frame.shape[:2]
        boxes = list(self.boxes)
        if self.drag:
            boxes.append(self.to_box(*self.drag))
        for c, x, y, w, h in boxes:
            col = COLORS[c % len(COLORS)]
            p1 = (int((x - w / 2) * W), int((y - h / 2) * H))
            p2 = (int((x + w / 2) * W), int((y + h / 2) * H))
            cv2.rectangle(frame, p1, p2, col, 2)
            name = CLASSES[c] if c < len(CLASSES) else f'class {c}'
            (tw, th), _ = cv2.getTextSize(name, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(frame, (p1[0], p1[1] - th - 8), (p1[0] + tw + 6, p1[1]), col, -1)
            cv2.putText(frame, name, (p1[0] + 3, p1[1] - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        if self.mouse and not self.drag:
            mx, my = self.mouse
            cv2.line(frame, (mx, 0), (mx, H), (255, 255, 255), 1)
            cv2.line(frame, (0, my), (W, my), (255, 255, 255), 1)
        done = sum(label_path(p).exists() for p in self.imgs)
        mark = 'saved' if label_path(self.imgs[self.idx]).exists() else 'todo'
        top = (f'{self.idx + 1}/{len(self.imgs)} [{mark}]  done {done}  |  class {self.cls + 1}: {CLASSES[self.cls]}'
               f'  |  boxes {len(self.boxes)}')
        keys = '[drag] box  [right-click] delete  [Enter] save+next  [Z] undo  [C] clear  [A/D] prev/next  [Q] quit'
        bar = np.full((52, W, 3), 30, np.uint8)
        cv2.putText(bar, top, (8, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)
        cv2.putText(bar, self.notice or keys, (8, 42), cv2.FONT_HERSHEY_SIMPLEX, 0.45,
                    (80, 200, 255) if self.notice else (180, 180, 180), 1)
        return np.vstack([bar, frame])

    def save_and_next(self):
        if not self.boxes and not self.empty_ok:
            self.empty_ok = True
            self.notice = 'No box! Press Enter again to save as an EMPTY photo (no object).'
            return
        save_boxes(self.imgs[self.idx], self.boxes)
        if self.idx + 1 < len(self.imgs):
            self.idx += 1
            self.load()
            self.notice = 'Saved.'
        else:
            self.load()
            self.notice = 'Last photo saved! Press Q to finish.'

    def move(self, step):
        self.idx = max(0, min(self.idx + step, len(self.imgs) - 1))
        self.load()
        self.notice = ''

    def run(self):
        win = 'YOLO labeler'
        cv2.namedWindow(win, cv2.WINDOW_AUTOSIZE)
        # 위에 상태 표시줄(52px)이 있으므로 마우스 좌표를 그만큼 내려서 전달
        cv2.setMouseCallback(win, lambda e, x, y, f, p: self.on_mouse(e, x, y - 52, f, p))
        while True:
            cv2.imshow(win, self.render())
            k = cv2.waitKey(20) & 0xFF
            if k in (ord('q'), 27) or cv2.getWindowProperty(win, cv2.WND_PROP_VISIBLE) < 1:
                break
            if k in (13, 10, 32):
                self.save_and_next()
            elif k == ord('z') and self.boxes:
                self.boxes.pop()
            elif k == ord('c'):
                self.boxes = []
            elif k == ord('a'):
                self.move(-1)
            elif k == ord('d'):
                self.move(1)
            elif ord('1') <= k <= ord('9') and k - ord('1') < len(CLASSES):
                self.cls = k - ord('1')
        cv2.destroyAllWindows()


if __name__ == '__main__':
    import_photos()
    if not image_list():
        print('사진이 없어요. photos 폴더에 사진을 넣고 다시 실행하세요.')
    else:
        Labeler().run()
        done = sum(label_path(p).exists() for p in image_list())
        zip_path = shutil.make_archive(str(OUT_DIR), 'zip', OUT_DIR)
        print(f'박스 그린 사진 {done}장 / 전체 {len(image_list())}장')
        print(f'📦 {Path(zip_path).resolve()}')
        print('   이 zip 을 코랩 노트북 2-A 에 올리거나, train_local.py 로 바로 학습하세요.')
