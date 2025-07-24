#!/bin/bash

echo "🚂 Инициализация проекта для развертывания в Railway"
echo "=================================================="

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js версии 16+"
    exit 1
fi

# Проверка наличия npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не найден."
    exit 1
fi

echo "📦 Установка зависимостей..."
npm install

echo "🔧 Проверка конфигурации..."

# Проверка .env файла
if [ ! -f ".env" ]; then
    echo "❌ Файл .env не найден!"
    exit 1
fi

echo "✅ Конфигурация готова"

echo "🧪 Тест сборщика данных (10 секунд)..."
timeout 10s node alternative-storage.js || true

echo ""
echo "🎉 Проект готов к развертыванию!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Создайте GitHub репозиторий"
echo "2. Загрузите код: git add . && git commit -m 'Initial commit' && git push"
echo "3. Идите на https://railway.app/dashboard"  
echo "4. Выберите 'Deploy from GitHub repo'"
echo "5. Добавьте переменные окружения из .env файла"
echo ""
echo "📖 Подробная инструкция: RAILWAY-DEPLOY.md"
echo ""
echo "🚀 После развертывания система будет собирать данные 24/7!"