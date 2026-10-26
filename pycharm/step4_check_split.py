"""
4단계. 박스 확인 → train / val 로 나누고 data.yaml 만들기

- 박스를 그린 사진 중 몇 장을 그림으로 보여줘요. 창을 닫으면 다음으로 넘어가요.
- 학습용(train) 80%, 검사용(val) 20% 로 나눠요. 모델은 train 으로 공부하고 처음 보는 val 로 시험을 봐요.
- 코랩에서 GPU 로 빠르게 학습하고 싶으면, 마지막에 만들어지는 zip 을 코랩 노트북 2-A 에 올리세요.
"""
import random
import shutil

import matplotlib.pyplot as plt
import matplotlib.patches as patches
import yaml
from PIL import Image

from config import BASE, CLASSES, DATASET, PROJECT_NAME, image_list, label_path, labeled_images, prepare, read_boxes

VAL_RATIO = 0.2
COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1']

prepare()
labeled = labeled_images()

# ---- 1) 얼마나 그렸는지 세기
counts = [0] * len(CLASSES)
n_empty = 0
for p in labeled:
    boxes = read_boxes(p)
    n_empty += not boxes
    for c, *_ in boxes:
        if c < len(counts):
            counts[c] += 1
print(f'박스 그린 사진 {len(labeled)}장 (물체 없는 사진 {n_empty}장) / 전체 {len(image_list())}장')
for name, n in zip(CLASSES, counts):
    print(f'  {name}: 박스 {n}개')

if len(labeled) < 2:
    raise SystemExit('박스 그린 사진이 2장 이상 있어야 해요. step3_label.py 를 먼저 하세요.')
if len(labeled) < 20:
    print(f'⚠️ 사진이 {len(labeled)}장뿐이에요. 학습은 되지만 30장 이상이면 훨씬 잘 찾아요.')

# ---- 2) 몇 장 그림으로 확인 (창을 닫으면 계속 진행)
sample = random.sample(labeled, min(8, len(labeled)))
cols = 4
rows = (len(sample) + cols - 1) // cols
fig, axes = plt.subplots(rows, cols, figsize=(16, 4 * rows), squeeze=False)
for ax in axes.flat:
    ax.axis('off')
for ax, p in zip(axes.flat, sample):
    im = Image.open(p)
    W, H = im.size
    ax.imshow(im)
    ax.set_title(p.name if p.name.isascii() else '', fontsize=9)   # 한글 이름은 그림에서 깨져서 생략
    for c, x, y, w, h in read_boxes(p):
        col = COLORS[c % len(COLORS)]
        ax.add_patch(patches.Rectangle(((x - w / 2) * W, (y - h / 2) * H), w * W, h * H, fill=False, lw=2, ec=col))
        ax.text((x - w / 2) * W, (y - h / 2) * H, CLASSES[c] if c < len(CLASSES) else c,
                color='white', backgroundcolor=col, fontsize=8)
fig.suptitle('Check the boxes, then close this window')
plt.tight_layout()
plt.show()

# ---- 3) train / val 나누기
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
        shutil.copy(label_path(p), DATASET / 'labels' / split / label_path(p).name)

data_yaml = DATASET / 'data.yaml'
data_yaml.write_text(yaml.safe_dump({
    'path': str(DATASET),
    'train': 'images/train',
    'val': 'images/val',
    'names': dict(enumerate(CLASSES)),
}, allow_unicode=True, sort_keys=False), encoding='utf-8')
(DATASET / 'classes.txt').write_text('\n'.join(CLASSES) + '\n', encoding='utf-8')

zip_path = shutil.make_archive(str(BASE / f'{PROJECT_NAME}_dataset'), 'zip', DATASET)

print(f'\ntrain {len(splits["train"])}장, val {len(splits["val"])}장')
print(f'📄 {data_yaml}')
print(f'📦 {zip_path}  (코랩 노트북 2-A 에 올리면 GPU 로 학습할 수 있어요)')
print('다음: step5_train.py 로 학습하세요.')
