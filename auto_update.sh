#!/bin/bash
LOG="/home/ubuntu/coupang-ranking/logs/update_$(date +%Y%m%d).log"
PROJECT="/home/ubuntu/coupang-ranking"
echo "===== 시작 $(date) =====" >> "$LOG"
cd "$PROJECT"
exec 200>/tmp/marketquant.lock
flock -n 200 || { echo "이미 실행 중" >> "$LOG"; exit 1; }
echo "[1/3] 데이터 수집..." >> "$LOG"
python3 build_products.py >> "$LOG" 2>&1
if [ $? -ne 0 ]; then echo "[!] 실패" >> "$LOG"; exit 1; fi
if git diff --quiet data/products.json; then
    echo "[2/3] 변경 없음" >> "$LOG"
    echo "===== 완료 $(date) =====" >> "$LOG"
    exit 0
fi
echo "[2/3] git push..." >> "$LOG"
git add data/products.json
git commit -m "auto update $(date +%Y-%m-%d)" >> "$LOG" 2>&1
git push >> "$LOG" 2>&1
echo "[3/3] 완료!" >> "$LOG"
echo "===== 완료 $(date) =====" >> "$LOG"
