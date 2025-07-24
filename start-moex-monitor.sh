#!/bin/bash

echo "🚀 Запуск мониторинга MOEX и криптобирж..."
echo "==========================================="

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен! Установите его для работы MOEX сервера."
    echo "   Скачать: https://nodejs.org/"
    exit 1
fi

# Проверка и установка зависимостей
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm init -y > /dev/null 2>&1
    npm install express cors axios > /dev/null 2>&1
fi

# Остановка старого процесса
pkill -f "moex-backend-proxy.js" > /dev/null 2>&1

# Запуск backend сервера
echo "🔄 Запуск MOEX backend сервера..."
node moex-backend-proxy.js &
BACKEND_PID=$!

# Ждем запуска сервера
sleep 2

# Проверка работы сервера
if curl -s http://localhost:3001/api/moex/futures > /dev/null 2>&1; then
    echo "✅ MOEX сервер успешно запущен!"
else
    echo "❌ Ошибка запуска MOEX сервера"
    exit 1
fi

# Открытие в браузере
echo ""
echo "🌐 Открываю мониторинг в браузере..."
if command -v open &> /dev/null; then
    # macOS
    open "crypto-exchange-monitor-full.html"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "crypto-exchange-monitor-full.html"
elif command -v start &> /dev/null; then
    # Windows
    start "crypto-exchange-monitor-full.html"
fi

echo ""
echo "✅ Мониторинг запущен!"
echo ""
echo "📊 Доступные интерфейсы:"
echo "   • Полный мониторинг: crypto-exchange-monitor-full.html"
echo "   • Только MOEX (с предупреждением): crypto-exchange-monitor-moex.html"
echo "   • Оригинальная версия: crypto-exchange-monitor.html"
echo ""
echo "🛑 Для остановки нажмите Ctrl+C"
echo ""

# Ожидание завершения
wait $BACKEND_PID