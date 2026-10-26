"""
label_tool.py 로 만든 my_dataset 을 train / val 로 나누고, 이 컴퓨터에서 YOLO26 을 학습해요.
GPU 가 없으면 느리니 사진 수를 적게, EPOCHS 를 작게 해서 먼저 시험해 보세요.
(빠르게 학습하려면 my_dataset.zip 을 코랩 노트북 2-A 에 올리는 걸 추천해요.)
"""
import random
import shutil
from pathlib import Path

import yaml
from ultralytics import YOLO

SRC = Path('my_dataset')         # label_tool.py 결과 폴더
DATASET = Path('datasets/my_dataset')
MODEL = 'yolo26n.pt'
EPOCHS = 30
IMGSZ = 640
VAL_RATIO = 0.2


def main():
    CLASSES = [c for c in (SRC / 'classes.txt').read_text(encoding='utf-8').splitlines() if c.strip()]
    labeled = [p for p in sorted((SRC / 'images').glob('*.jpg')) if (SRC / 'labels' / f'{p.stem}.txt').exists()]
    if len(labeled) < 2:
        raise SystemExit('박스 그린 사진이 2장 이상 있어야 해요. label_tool.py 를 먼저 실행하세요.')

    random.seed(0)
    random.shuffle(labeled)
    n_val = max(1, round(len(labeled) * VAL_RATIO))
    splits = {'val': labeled[:n_val], 'train': labeled[n_val:]}

    shutil.rmtree(DATASET, ignore_errors=True)
    for split, items in splits.items():
        (DATASET / 'images' / split).mkdir(parents=True)
        (DATASET / 'labels' / split).mkdir(parents=True)
        for p in items:
            shutil.copy(p, DATASET / 'images' / split / p.name)
            shutil.copy(SRC / 'labels' / f'{p.stem}.txt', DATASET / 'labels' / split / f'{p.stem}.txt')

    data_yaml = DATASET / 'data.yaml'
    data_yaml.write_text(yaml.safe_dump({
        'path': str(DATASET.resolve()),
        'train': 'images/train',
        'val': 'images/val',
        'names': dict(enumerate(CLASSES)),
    }, allow_unicode=True, sort_keys=False), encoding='utf-8')
    print(f'train {len(splits["train"])}장, val {len(splits["val"])}장, 클래스 {CLASSES}')

    model = YOLO(MODEL)
    model.train(data=str(data_yaml), epochs=EPOCHS, imgsz=IMGSZ, batch=8, workers=0, plots=True,
                project=str(Path('runs').resolve()), name='my_dataset', exist_ok=True)
    best = Path(model.trainer.save_dir) / 'weights' / 'best.pt'
    shutil.copy(best, 'my_best.pt')
    print('✅ 학습 끝! my_best.pt 가 만들어졌어요. webcam_test.py 로 확인해 보세요.')


if __name__ == '__main__':   # 윈도우에서 학습할 때 꼭 필요해요
    main()
