"""
1번. 웹페이지에서 만든 데이터셋 zip 가져오기

📦 웹페이지 6단원에서 내려받은 '이름_dataset.zip' 을 찾아서 압축을 풀어요.
   - zip 을 이 폴더에 넣어도 되고, 다운로드 폴더에 그대로 둬도 알아서 찾아요. (가장 최근 것)
   - zip 안의 classes.txt 와 data.yaml 에서 CLASSES(물체 이름)와 PROJECT_NAME(데이터셋 이름)을 읽어요.
     그래서 이름을 코드에 따로 적을 필요가 없어요!
   - 사진을 더 찍어서 zip 을 새로 받았다면 이 파일만 다시 실행하면 돼요.

다 되면 datasets/데이터셋이름/ 폴더와 '확인_그림.jpg' 가 생겨요. 상자가 제자리에 있는지 눈으로 확인해 보세요.
"""
import zipfile
from pathlib import Path

import yaml
from PIL import Image, ImageDraw

from 공통 import DATASETS, IMG_EXTS, clear_folder, find_zip, project_from, save_info

COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1']

# ① zip 찾기
zip_path = find_zip()
if zip_path is None:
    raise SystemExit('데이터셋 zip 을 못 찾았어요.\n'
                     '웹페이지 6단원에서 zip 을 내려받은 뒤, 이 폴더나 다운로드 폴더에 두고 다시 실행하세요.')
print(f'📦 찾은 zip: {zip_path}')

zf = zipfile.ZipFile(zip_path)
read = lambda name: zf.read(name).decode('utf-8')
classes_name = next(n for n in zf.namelist() if n.endswith('classes.txt'))
prefix = classes_name[:-len('classes.txt')]        # zip 안에 폴더가 하나 더 있어도 괜찮게
yaml_name = prefix + 'data.yaml'
yaml_text = read(yaml_name) if yaml_name in zf.namelist() else ''

# ② CLASSES, PROJECT_NAME 자동으로 읽기
CLASSES = [c.strip() for c in read(classes_name).splitlines() if c.strip()]
PROJECT_NAME = project_from(zip_path, yaml_text)
print(f'🏷️ CLASSES      = {CLASSES}')
print(f'📁 PROJECT_NAME = {PROJECT_NAME!r}')

# ③ 압축 풀기: datasets/PROJECT_NAME/images/train ... 
root = DATASETS / PROJECT_NAME
clear_folder(root)
root.mkdir(parents=True)
for m in zf.namelist():
    if m.startswith(prefix) and not m.endswith('/') and not m.startswith('__MACOSX'):
        out = root / m[len(prefix):]
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(zf.read(m))

# ④ data.yaml 다시 쓰기: 어느 폴더에서 실행해도 찾도록 절대 경로(path)를 넣어요
data = {
    'path': str(root.resolve()),
    'train': 'images/train',
    'val': 'images/val',
    'nc': len(CLASSES),
    'names': {i: c for i, c in enumerate(CLASSES)},
}
data_yaml = root / 'data.yaml'
data_yaml.write_text(yaml.safe_dump(data, allow_unicode=True, sort_keys=False), encoding='utf-8')

# ⑤ 데이터 세어 보기
print('\n📊 데이터셋 살펴보기')
box_count = [0] * len(CLASSES)
samples = []
for split in ('train', 'val'):
    imgs = sorted(p for p in (root / 'images' / split).glob('*') if p.suffix.lower() in IMG_EXTS)
    empty = 0
    for img in imgs:
        lbl = root / 'labels' / split / (img.stem + '.txt')
        lines = [l.split() for l in lbl.read_text().splitlines() if l.strip()] if lbl.exists() else []
        if not lines:
            empty += 1
        for parts in lines:
            if int(parts[0]) < len(CLASSES):
                box_count[int(parts[0])] += 1
        if split == 'train' and lines and len(samples) < 6:
            samples.append((img, lines))
    print(f'   {split:5s}: 사진 {len(imgs)}장 (그중 물체 없는 사진 {empty}장)')
for c, n in zip(CLASSES, box_count):
    tip = '  ← 30개 이상이면 더 잘 배워요' if n < 30 else ''
    print(f'   {c:>10s}: 상자 {n}개{tip}')

# ⑥ 확인 그림: 상자가 제자리에 있는지 6장만 그려 보기
if samples:
    tiles = []
    for img, lines in samples:
        im = Image.open(img).convert('RGB')
        im.thumbnail((400, 400))
        d = ImageDraw.Draw(im)
        W, H = im.size
        for c, x, y, w, h in ((int(p[0]), *map(float, p[1:])) for p in lines):
            color = COLORS[c % len(COLORS)]
            d.rectangle([(x - w / 2) * W, (y - h / 2) * H, (x + w / 2) * W, (y + h / 2) * H], outline=color, width=3)
            d.text(((x - w / 2) * W + 4, (y - h / 2) * H + 2), CLASSES[c] if c < len(CLASSES) else '?', fill=color)
        tiles.append(im)
    sheet = Image.new('RGB', (400 * min(3, len(tiles)), 400 * ((len(tiles) + 2) // 3)), 'white')
    for i, t in enumerate(tiles):
        sheet.paste(t, (400 * (i % 3), 400 * (i // 3)))
    sheet.save(root / '확인_그림.jpg')
    print(f'\n🖼️ 상자 확인 그림: {root / "확인_그림.jpg"}')

save_info({'project': PROJECT_NAME, 'classes': CLASSES, 'data_yaml': str(data_yaml.resolve()), 'zip': str(zip_path)})
print('\n✅ 준비 끝! 다음: 2_학습하기.py 를 실행하세요.')
