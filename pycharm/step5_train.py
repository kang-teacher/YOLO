"""
5단계. YOLO26 학습

- 처음 실행하면 yolo26n.pt 를 자동으로 내려받아요 (인터넷 필요, 5MB 정도).
- GPU(NVIDIA) 가 없으면 CPU 로 학습해서 느려요. 사진 50장 · 30번 반복에 수십 분 걸릴 수 있어요.
  급하면 config.py 에서 EPOCHS 를 10, IMGSZ 를 416 으로 줄여서 먼저 시험해 보세요.
- 끝나면 이 폴더에 '프로젝트이름_best.pt' 가 생겨요. 이게 내 모델이에요.
- 학습 그래프는 runs/프로젝트이름/results.png 에 있어요. loss 는 내려가고 mAP 는 올라가면 잘 배운 거예요.

예전 코랩 코드의 !yolo task=detect mode=train ... 와 같은 일을 해요.
"""
import shutil
from pathlib import Path

import torch
from ultralytics import YOLO

from config import BEST, DATASET, EPOCHS, IMGSZ, MODEL, PROJECT_NAME, RUNS


def main():
    data_yaml = DATASET / 'data.yaml'
    if not data_yaml.exists():
        raise SystemExit('data.yaml 이 없어요. step4_check_split.py 를 먼저 실행하세요.')

    if torch.cuda.is_available():
        device = 0
        print(f'🚀 GPU 로 학습해요: {torch.cuda.get_device_name(0)}')
    elif torch.backends.mps.is_available():
        device = 'mps'
        print('🍎 맥 GPU(mps)로 학습해요.')
    else:
        device = 'cpu'
        print('🐢 GPU 가 없어서 CPU 로 학습해요. 시간이 꽤 걸려요.')

    model = YOLO(MODEL)
    model.train(
        data=str(data_yaml),
        epochs=EPOCHS,
        imgsz=IMGSZ,
        batch=8,
        workers=0,          # 윈도우에서 오류가 덜 나게
        device=device,
        plots=True,
        project=str(RUNS),
        name=PROJECT_NAME,
        exist_ok=True,
    )

    run_dir = Path(model.trainer.save_dir)
    shutil.copy(run_dir / 'weights' / 'best.pt', BEST)
    print(f'\n✅ 학습 끝! 내 모델: {BEST}')
    print(f'   학습 그래프: {run_dir / "results.png"}')
    print('다음: step6_predict.py 로 시험해 보세요.')


if __name__ == '__main__':   # 윈도우에서 학습할 때 꼭 필요해요
    main()
