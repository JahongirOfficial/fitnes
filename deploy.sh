#!/bin/bash
# deploy.sh — serverda yangilanish va qayta ishga tushirish

set -e
cd /var/www/fitnes

echo "=== [1/5] Git pull ==="
git pull origin main

echo "=== [2/5] Frontend dependencies & build ==="
npm install
npm run build:frontend

echo "=== [3/5] Backend dependencies ==="
cd server && npm install && cd ..

echo "=== [4/5] Bot dependencies ==="
cd telegram-bot && npm install
# Agar data.json bo'lmasa yoki bo'sh bo'lsa — seed qilish
node seed.js
cd ..

echo "=== [5/5] PM2 restart ==="
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo ""
echo "=== Deploy muvaffaqiyatli yakunlandi ==="
pm2 list
