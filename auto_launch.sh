#!/bin/bash

echo "🚀 AI Orchestrator - Автоматический запуск с полной поддержкой API"
echo "======================================================="

# Переход в директорию проекта
cd ~/ai-orchestrator-mvp

# Проверка наличия виртуального окружения
if [ ! -d "venv" ]; then
    echo "📦 Создаю виртуальное окружение..."
    python3 -m venv venv
fi

# Активация виртуального окружения
source venv/bin/activate

# Установка зависимостей если нужно
echo "📚 Проверка зависимостей..."
pip install -q streamlit python-dotenv openai google-generativeai anthropic ollama crewai 2>/dev/null

# Проверка Ollama
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "🔄 Запускаю Ollama..."
    ollama serve > /dev/null 2>&1 &
    sleep 5
fi

# Остановка старых процессов
echo "🧹 Очистка старых процессов..."
pkill -f streamlit > /dev/null 2>&1
sleep 2

# Запуск всех версий
echo ""
echo "🎯 Запускаю AI Orchestrator системы..."
echo ""

# Простая версия - только Ollama
echo "1️⃣ Простая версия (Ollama) на порту 8501..."
streamlit run simple_orchestrator.py --server.port 8501 --server.headless true > logs/simple.log 2>&1 &
sleep 2

# Продвинутая версия с CrewAI
echo "2️⃣ Продвинутая версия (CrewAI) на порту 8502..."
streamlit run advanced_orchestrator.py --server.port 8502 --server.headless true > logs/advanced.log 2>&1 &
sleep 2

# Multi-provider версия с всеми API
echo "3️⃣ Multi-provider версия (ВСЕ API) на порту 8503..."
streamlit run multi_provider_orchestrator.py --server.port 8503 --server.headless true > logs/multi.log 2>&1 &
sleep 2

echo ""
echo "✅ Все системы запущены!"
echo ""
echo "🌐 Доступные интерфейсы:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣ Простая версия (бесплатно): http://localhost:8501"
echo "2️⃣ CrewAI версия (бесплатно):  http://localhost:8502"
echo "3️⃣ Multi-API версия (платно):  http://localhost:8503"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Подключенные API:"
echo "   ✅ OpenAI (GPT-4o, GPT-3.5)"
echo "   ✅ Google Gemini (2.0 Flash, 1.5 Pro)"
echo "   ✅ Anthropic Claude (3.5 Sonnet, 3.5 Haiku)"
echo "   ✅ Ollama (локальные модели)"
echo ""
echo "📝 Логи сохраняются в папке logs/"
echo ""
echo "🛑 Для остановки: pkill -f streamlit"
echo ""

# Открытие браузера через 3 секунды
sleep 3

# Определение команды для открытия браузера
if command -v open &> /dev/null; then
    # macOS
    echo "🌐 Открываю Multi-provider версию в браузере..."
    open "http://localhost:8503"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "http://localhost:8503"
elif command -v start &> /dev/null; then
    # Windows
    start "http://localhost:8503"
fi

echo ""
echo "🎉 Готово к работе!"
echo ""
echo "💰 ВНИМАНИЕ: Multi-provider версия использует платные API!"
echo "   Следите за расходами в консолях провайдеров."
echo ""