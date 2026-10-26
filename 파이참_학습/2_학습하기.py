"""
2번. 내 데이터셋으로 YOLO 학습하기 (이 파일이 진짜 '머신러닝' 부분이에요!)

🧠 무슨 일이 일어날까?
   - 이미 80가지 물체를 아는 yolo26n.pt 에서 출발해서, 내 사진과 상자(정답)를 보며 새 물체를 배워요.
     (처음부터 배우는 것보다 훨씬 빨라요. 이걸 '전이 학습'이라고 해요)
   - epoch 1번 = train 사진을 모두 한 번씩 보고 공부하기. EPOCHS 번 반복해요.
   - epoch 이 끝날 때마다 val 사진(처음 보는 사진)으로 시험을 쳐서 실력을 확인해요.

👀 실행 중 화면 읽는 법
   - box_loss : 상자 위치를 얼마나 틀렸는지 → 내려가면 좋아요
   - cls_loss : 물체 이름을 얼마나 틀렸는지 → 내려가면 좋아요
   - mAP50    : val 시험 점수 (0~1). 올라가면 좋아요. 0.8 넘으면 아주 잘한 거예요

⏱️ 처음 실행하면 yolo26n.pt 를 자동으로 내려받아요(인터넷 필요).
   GPU 가 없으면 CPU 로 학습해서 사진 50장 · 30번 반복에 수십 분 걸릴 수 있어요.
   급하면 공통.py 에서 EPOCHS = 10, IMGSZ = 416 으로 줄여서 먼저 해 보세요.
"""
import shutil
from pathlib import Path

import torch
from ultralytics import YOLO

from 공통 import EPOCHS, IMGSZ, MODEL, RUNS, best_path, load_info


def main():
    info = load_info()                    # 1번 파일이 읽어 둔 물체 이름과 데이터셋 위치
    PROJECT_NAME, CLASSES = info['project'], info['classes']
    print(f'📁 데이터셋: {PROJECT_NAME}   🏷️ 배울 물체: {CLASSES}')

    if torch.cuda.is_available():
        device = 0
        print(f'🚀 GPU 로 학습해요: {torch.cuda.get_device_name(0)}')
    elif torch.backends.mps.is_available():
        device = 'mps'
        print('🍎 맥 GPU(mps)로 학습해요.')
    else:
        device = 'cpu'
        print('🐢 GPU 가 없어서 CPU 로 학습해요. 시간이 꽤 걸리니 기다려 주세요.')

    model = YOLO(MODEL)                   # ① 이미 많이 배운 모델에서 출발
    model.train(                          # ② 내 데이터로 더 배우기
        data=info['data_yaml'],           #    사진·상자 위치와 물체 이름 (1번 파일이 만든 data.yaml)
        epochs=EPOCHS,                    #    반복 횟수
        imgsz=IMGSZ,                      #    사진 크기
        batch=8,                          #    한 번에 공부하는 사진 수
        workers=0,                        #    윈도우에서 오류가 덜 나게
        device=device,
        project=str(RUNS),                #    기록 저장 위치: runs/데이터셋이름/
        name=PROJECT_NAME,
        exist_ok=True,
    )

    # ③ 가장 시험 점수가 좋았던 모델(best.pt)을 알아보기 쉬운 이름으로 복사
    run_dir = Path(model.trainer.save_dir)
    best = best_path(PROJECT_NAME)
    shutil.copy(run_dir / 'weights' / 'best.pt', best)

    metrics = model.trainer.metrics or {}
    print('\n✅ 학습 끝!')
    print(f'   내 모델      : {best}')
    if 'metrics/mAP50(B)' in metrics:
        print(f'   val 시험 점수: mAP50 = {metrics["metrics/mAP50(B)"]:.2f}  (1에 가까울수록 잘 찾아요)')
    print(f'   학습 그래프  : {run_dir / "results.png"}  (loss 는 내려가고 mAP 는 올라가면 잘 배운 거예요)')
    print('   weights/last.pt 는 마지막 반복의 모델, best.pt 는 점수가 가장 좋았던 모델이에요.')
    print('다음: 3_사진으로_시험하기.py 또는 4_웹캠으로_시험하기.py')


if __name__ == '__main__':   # 윈도우에서 학습할 때 꼭 필요해요
    main()
