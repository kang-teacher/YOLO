"""
1단계. photos 폴더의 사진을 데이터셋으로 가져오기

- 이 파일 옆의 photos 폴더에 사진(jpg, png …)을 넣고 실행하세요. 처음 실행하면 폴더가 생겨요.
- 사진을 묶은 .zip 도 넣어도 돼요. 코랩 노트북에서 만든 데이터셋 zip 이면 박스(라벨)까지 들어와요.
- 이미 가져온 사진은 다시 가져오지 않아요. 사진을 더 모으면 photos 에 추가하고 또 실행하면 돼요.
- 노트북 카메라로 찍고 싶으면 step2_webcam_capture.py 를 쓰세요.
"""
from config import (PHOTO_DIR, IMG_DIR, IMG_EXTS, DATA_ROOT, add_image, import_zip, image_list,
                    labeled_images, prepare)

prepare()
done_file = DATA_ROOT / 'imported.txt'   # 이미 가져온 파일 목록 (두 번 가져오지 않도록)
done = set(done_file.read_text(encoding='utf-8').splitlines()) if done_file.exists() else set()

files = sorted(p for p in PHOTO_DIR.rglob('*') if p.is_file())
new = [p for p in files if str(p.relative_to(PHOTO_DIR)) not in done]
if not files:
    print(f'📁 {PHOTO_DIR} 폴더에 사진을 넣고 다시 실행하세요.')

n = 0
for p in new:
    if p.suffix.lower() in IMG_EXTS:
        n += add_image(p.read_bytes(), p.name) is not None
    elif p.suffix.lower() == '.zip':
        import_zip(p)
    else:
        continue
    done.add(str(p.relative_to(PHOTO_DIR)))
done_file.write_text('\n'.join(sorted(done)) + '\n', encoding='utf-8')

print(f'새 사진 {n}장 가져옴')
print(f'🖼️ 지금까지 사진 {len(image_list())}장, 박스 그린 사진 {len(labeled_images())}장  ({IMG_DIR})')
print('다음: step3_label.py 로 박스를 그리세요.')
