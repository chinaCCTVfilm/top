@echo off
echo === GoodFilm 一键部署脚本（防 .git 丢失自动恢复）===

if not exist ".git" (
    echo ⚠️ 检测到 .git 已丢失，正在自动恢复...
    git init
    git remote add origin https://github.com/chinaCCTVfilm/top.git
    git fetch origin
    git checkout -b main origin/main 2>nul || git branch -M main
    echo ✅ .git 已自动恢复
)

git add .
git commit -m "deploy film site - %date% %time%"
git push -u origin main

echo 🎉 部署完成！
pause
