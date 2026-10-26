"""
모든 단계가 같이 쓰는 설정과 도우미 함수
👉 학생은 맨 위의 설정값만 바꾸면 돼요. 이 파일은 직접 실행하지 않아요.
"""
import io
import re
import zipfile
from pathlib import Path

from PIL import Image, ImageOps

# ======================== 여기만 바꾸세요 ========================
CLASSES = ['cup']          # 찾을 물체 이름 (영어). 박스를 그린 뒤에는 순서를 바꾸지 마세요!
PROJECT_NAME = 'my_cup'    # 내 데이터셋 이름 (영어, 띄어쓰기 없이)
MODEL = 'yolo26n.pt'       # yolo26n.pt (작고 빠름, 추천) / yolo26s.pt (크고 더 정확)
EPOCHS = 30                # 반복 학습 횟수. GPU 가 없으면 10~30 정도로
IMGSZ = 640                # 학습 사진 크기. 느리면 416
CONF = 0.5                 # 예측할 때 이 확신도 이상만 표시
# ================================================================

BASE = Path(__file__).resolve().parent         # 이 파일이 있는 폴더 (파이참 프로젝트 폴더)
PHOTO_DIR = BASE / 'photos'                    # 1단계: 여기에 사진을 넣어요
TEST_DIR = BASE / 'test_photos'                # 6단계: 학습에 안 쓴 시험용 사진
DATA_ROOT = BASE / 'my_datasets' / PROJECT_NAME
IMG_DIR = DATA_ROOT / 'images'                 # 정리된 사진 (회전 보정, 최대 1280px)
LBL_DIR = DATA_ROOT / 'labels'                 # 사진마다 같은 이름의 .txt (YOLO 형식)
DATASET = BASE / 'datasets' / PROJECT_NAME     # 4단계: train / val 로 나눈 학습용 데이터셋
RUNS = BASE / 'runs'                           # 5단계: 학습 기록
BEST = BASE / f'{PROJECT_NAME}_best.pt'        # 5단계 결과: 내 모델

IMG_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
MAX_SIDE = 1280
COLORS_BGR = [(68, 68, 239), (246, 130, 59), (94, 197, 34), (11, 158, 245), (247, 85, 168),
              (153, 72, 236), (166, 184, 20), (22, 115, 249), (22, 204, 132), (241, 102, 99)]


def prepare():
    """폴더를 만들고, 클래스 순서가 바뀌지 않았는지 확인"""
    for d in (PHOTO_DIR, TEST_DIR, IMG_DIR, LBL_DIR):
        d.mkdir(parents=True, exist_ok=True)
    classes_file = DATA_ROOT / 'classes.txt'
    if classes_file.exists():
        old = [c for c in classes_file.read_text(encoding='utf-8').splitlines() if c.strip()]
        if old != CLASSES[:len(old)]:
            print('⚠️ 전에 쓰던 클래스와 순서가 달라요!', old, '→', CLASSES)
            print('   이미 그린 박스의 번호가 다른 물체를 가리키게 돼요. 일부러 바꾼 게 아니면 config.py 를 되돌리세요.')
    classes_file.write_text('\n'.join(CLASSES) + '\n', encoding='utf-8')


def image_list():
    return sorted(p for p in IMG_DIR.iterdir() if p.suffix.lower() == '.jpg') if IMG_DIR.exists() else []


def label_path(img):
    return LBL_DIR / (img.stem + '.txt')


def labeled_images():
    return [p for p in image_list() if label_path(p).exists()]


def read_boxes(img):
    """[[class, x, y, w, h], ...]  (x, y 는 박스 가운데, 모두 0~1 비율)"""
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


def _unique_stem(stem):
    stem = re.sub(r'[^\w\-]', '_', stem) or 'img'
    cand, i = stem, 1
    while (IMG_DIR / f'{cand}.jpg').exists():
        cand = f'{stem}_{i}'
        i += 1
    return cand


def add_image(data, name):
    """사진 바이트 → 회전 보정 + 크기 줄이기 + jpg 저장. 저장한 이름(stem)을 돌려줌"""
    try:
        im = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert('RGB')
    except Exception:
        print(f'  ✗ {name}: 사진이 아니에요')
        return None
    im.thumbnail((MAX_SIDE, MAX_SIDE))
    stem = _unique_stem(Path(name).stem)
    im.save(IMG_DIR / f'{stem}.jpg', quality=92)
    return stem


def import_zip(path):
    """zip 안의 사진과 같은 이름의 라벨(.txt)을 가져오기 (코랩 노트북에서 만든 zip 도 OK)"""
    zf = zipfile.ZipFile(path)
    members = [m for m in zf.namelist() if not m.startswith('__MACOSX') and not m.endswith('/')]
    txts = {Path(m).stem: m for m in members if m.lower().endswith('.txt') and Path(m).name != 'classes.txt'}
    n_img = n_lbl = 0
    for m in members:
        if Path(m).suffix.lower() in IMG_EXTS:
            stem = add_image(zf.read(m), Path(m).name)
            if stem is None:
                continue
            n_img += 1
            if Path(m).stem in txts:
                (LBL_DIR / f'{stem}.txt').write_bytes(zf.read(txts[Path(m).stem]))
                n_lbl += 1
        elif Path(m).name == 'classes.txt':
            zc = [c for c in zf.read(m).decode('utf-8').splitlines() if c.strip()]
            if zc != CLASSES:
                print(f'  ⚠️ zip 의 클래스 {zc} 와 config.py 의 CLASSES {CLASSES} 가 달라요.')
    print(f'  📦 {Path(path).name}: 사진 {n_img}장, 라벨 {n_lbl}개')


def bgr_from(path):
    """한글 경로에서도 열리도록 PIL 로 읽어서 OpenCV(BGR) 배열로"""
    import numpy as np
    return np.array(Image.open(path).convert('RGB'))[:, :, ::-1].copy()
