"""
3단계. 사진마다 바운딩 박스 그리기

사진 창을 한 번 클릭한 뒤
  마우스 드래그     박스 그리기 (물체에 딱 맞게!)
  오른쪽 클릭       그 자리의 박스 지우기
  Enter / Space    저장하고 다음 사진 (박스가 없으면 한 번 더 눌러야 '물체 없는 사진'으로 저장)
  Z / C            마지막 박스 지우기 / 모두 지우기
  A / D            이전 / 다음 사진 (저장 안 함)
  1 ~ 9            클래스 바꾸기 (config.py 의 CLASSES 순서)
  X                이 사진 데이터셋에서 빼기 (두 번 누르기)
  Q / Esc          끝내기

창 안의 안내 글자는 OpenCV 가 한글을 못 써서 영어로 나와요.
아직 박스를 안 그린 첫 사진부터 열리니까, 중간에 꺼도 다시 실행하면 이어서 할 수 있어요.
"""
import cv2
import numpy as np

from config import (CLASSES, COLORS_BGR, bgr_from, image_list, label_path, labeled_images, prepare,
                    read_boxes, save_boxes)

WIN_W, WIN_H = 1200, 760
BAR = 52   # 위쪽 상태 표시줄 높이


class Labeler:
    def __init__(self):
        self.imgs = image_list()
        self.idx = next((i for i, p in enumerate(self.imgs) if not label_path(p).exists()), 0)
        self.cls = 0
        self.mouse = None
        self.notice = ''
        self.load()

    def load(self):
        base = bgr_from(self.imgs[self.idx])
        h, w = base.shape[:2]
        s = min(WIN_W / w, WIN_H / h, 1.5)
        self.view = cv2.resize(base, (int(w * s), int(h * s)))
        self.boxes = read_boxes(self.imgs[self.idx])
        self.drag = None
        self.empty_ok = False
        self.del_armed = False

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
                self.notice = f'{len(self.boxes)} box(es). Press Enter when done.'
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
            col = COLORS_BGR[c % len(COLORS_BGR)]
            p1 = (int((x - w / 2) * W), int((y - h / 2) * H))
            p2 = (int((x + w / 2) * W), int((y + h / 2) * H))
            cv2.rectangle(frame, p1, p2, col, 2)
            name = CLASSES[c] if c < len(CLASSES) else f'class {c}'
            (tw, th), _ = cv2.getTextSize(name, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            ty = max(p1[1], th + 8)
            cv2.rectangle(frame, (p1[0], ty - th - 8), (p1[0] + tw + 6, ty), col, -1)
            cv2.putText(frame, name, (p1[0] + 3, ty - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        if self.mouse and not self.drag:   # 십자선
            mx, my = self.mouse
            cv2.line(frame, (mx, 0), (mx, H), (255, 255, 255), 1)
            cv2.line(frame, (0, my), (W, my), (255, 255, 255), 1)
        done = sum(label_path(p).exists() for p in self.imgs)
        mark = 'saved' if label_path(self.imgs[self.idx]).exists() else 'todo'
        top = (f'{self.idx + 1}/{len(self.imgs)} [{mark}]  done {done}  |  class {self.cls + 1}: {CLASSES[self.cls]}'
               f'  |  boxes {len(self.boxes)}')
        keys = '[drag] box  [right-click] delete  [Enter] save+next  [Z] undo  [C] clear  [A/D] prev/next  [Q] quit'
        bar = np.full((BAR, W, 3), 30, np.uint8)
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

    def delete_photo(self):
        if not self.del_armed:
            self.del_armed = True
            self.notice = 'Remove this photo from the dataset? Press X again.'
            return
        img = self.imgs.pop(self.idx)
        img.unlink(missing_ok=True)
        label_path(img).unlink(missing_ok=True)
        if not self.imgs:
            return True
        self.idx = min(self.idx, len(self.imgs) - 1)
        self.load()
        self.notice = 'Photo removed.'

    def move(self, step):
        self.idx = max(0, min(self.idx + step, len(self.imgs) - 1))
        self.load()
        self.notice = ''

    def run(self):
        win = 'YOLO labeler'
        cv2.namedWindow(win, cv2.WINDOW_AUTOSIZE)
        cv2.setMouseCallback(win, lambda e, x, y, f, p: self.on_mouse(e, x, y - BAR, f, p))
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
            elif k == ord('x'):
                if self.delete_photo():
                    break
            elif ord('1') <= k <= ord('9') and k - ord('1') < len(CLASSES):
                self.cls = k - ord('1')
        cv2.destroyAllWindows()


if __name__ == '__main__':
    prepare()
    if not image_list():
        print('사진이 없어요. step1_add_photos.py 나 step2_webcam_capture.py 로 사진을 먼저 넣으세요.')
    else:
        Labeler().run()
        print(f'박스 그린 사진 {len(labeled_images())}장 / 전체 {len(image_list())}장')
        print('다음: step4_check_split.py 로 확인하고 데이터셋을 나누세요.')
