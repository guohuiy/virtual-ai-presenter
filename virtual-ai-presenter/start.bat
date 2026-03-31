@echo off
echo ========================================
echo AI虚拟人演讲者 - 启动脚本
echo ========================================
echo.

REM 切换到脚本所在目录
cd /d "%~dp0"

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js
    echo 请从 https://nodejs.org/ 安装Node.js
    pause
    exit /b 1
)

REM 检查npm是否安装
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到npm
    echo 请确保Node.js安装正确
    pause
    exit /b 1
)

echo 检查Node.js版本...
node --version
echo.

echo 当前目录: %cd%
echo.

echo 检查项目依赖...
if not exist "node_modules" (
    echo 正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
    echo 依赖安装完成！
) else (
    echo 依赖已安装
)

echo.
echo ========================================
echo 启动开发服务器...
echo ========================================
echo.
echo 应用将在浏览器中自动打开...
echo 如果未自动打开，请访问: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务器
echo.

REM 启动开发服务器
call npm run dev

pause
