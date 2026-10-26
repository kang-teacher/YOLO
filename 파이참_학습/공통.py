"""
모든 파일이 같이 쓰는 설정과 도우미 함수
👉 직접 실행하지 않아요. 학습이 너무 느릴 때만 아래 설정값을 바꿔요.

CLASSES(물체 이름)와 PROJECT_NAME(데이터셋 이름)은 따로 적지 않아도 돼요.
웹페이지에서 내려받은 데이터셋 zip 안에 들어 있어서, 1번 파일이 자동으로 읽어와요.
"""
import json
import re
import shutil
import zipfile
from pathlib import Path

# ======================== 필요할 때만 바꾸세요 ========================
MODEL = 'yolo26n.pt'   # 처음 모델. yolo26n(작고 빠름, 추천) / yolo26s(크고 더 정확) / yolo11n.pt 도 OK
EPOCHS = 30            # 전체 사진을 몇 번 반복해서 공부할지. 느리면 10~20
IMGSZ = 640            # 학습할 때 사진 크기. 느리면 416
CONF = 0.5             # 시험할 때 확신도가 이 값 이상인 상자만 보여줘요
# ===================================================================

BASE = Path(__file__).resolve().parent     # 이 파일이 있는 폴더 (파이참 프로젝트 폴더)
INFO_FILE = BASE / '내_데이터셋_정보.json'  # 1번 파일이 만들어요 (물체 이름, 데이터셋 이름, 위치)
DATASETS = BASE / 'datasets'               # zip 을 풀어 두는 곳
RUNS = BASE / 'runs'                       # 학습 기록 (그래프, 가중치)
TEST_DIR = BASE / '시험사진'                # 3번 파일: 학습에 안 쓴 사진을 넣는 곳
IMG_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}


def is_dataset_zip(path):
    """웹페이지에서 만든 데이터셋 zip 인지 확인 (classes.txt 와 images/ 가 있어야 해요)"""
    try:
        names = zipfile.ZipFile(path).namelist()
    except (zipfile.BadZipFile, OSError):
        return False
    return any(n.endswith('classes.txt') for n in names) and any('images/' in n for n in names)


def find_zip():
    """이 폴더 → 다운로드 폴더 순서로 가장 최근 데이터셋 zip 찾기"""
    for folder in (BASE, Path.home() / 'Downloads', Path.home() / '다운로드'):
        if not folder.is_dir():
            continue
        zips = sorted(folder.glob('*_dataset*.zip'), key=lambda p: p.stat().st_mtime, reverse=True)
        zips = [z for z in zips if is_dataset_zip(z)]
        if zips:
            return zips[0]
    return None


def project_from(zip_path, yaml_text):
    """data.yaml 의 project: 값 → 없으면 zip 파일 이름(my_cup_dataset (1).zip → my_cup)"""
    m = re.search(r'^project:\s*(\S+)', yaml_text, re.M)
    name = m.group(1) if m else re.sub(r'_dataset.*$', '', zip_path.stem)
    return re.sub(r'[^A-Za-z0-9_\-]', '_', name) or 'my_dataset'


def save_info(info):
    INFO_FILE.write_text(json.dumps(info, ensure_ascii=False, indent=2), encoding='utf-8')


def load_info():
    """1번 파일이 저장한 정보 읽기: {'project', 'classes', 'data_yaml', ...}"""
    if not INFO_FILE.exists():
        raise SystemExit('아직 데이터셋을 가져오지 않았어요. 1_데이터셋_가져오기.py 를 먼저 실행하세요.')
    return json.loads(INFO_FILE.read_text(encoding='utf-8'))


def best_path(project):
    return BASE / f'{project}_best.pt'


def clear_folder(folder):
    """예전에 풀어 둔 같은 이름의 데이터셋 지우기 (zip 을 새로 받았을 때)"""
    if folder.exists() and folder.resolve().parent == DATASETS.resolve():
        shutil.rmtree(folder)


def bgr_from(path):
    """한글 경로에서도 열리도록 PIL 로 읽어서 OpenCV(BGR) 배열로"""
    import numpy as np
    from PIL import Image, ImageOps
    return np.array(ImageOps.exif_transpose(Image.open(path)).convert('RGB'))[:, :, ::-1].copy()
