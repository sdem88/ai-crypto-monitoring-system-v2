#!/bin/bash

echo "🚀 Запуск полной системы AI Orchestrator..."

# Проверка Ollama
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "🔄 Запускаю Ollama..."
    ollama serve > /dev/null 2>&1 &
    sleep 3
fi

# Активация окружения
cd ~/ai-orchestrator-mvp
source venv/bin/activate

# Запуск всех версий на разных портах
echo "📊 Запускаю системы..."

# Простая версия на порту 8501
streamlit run simple_orchestrator.py --server.port 8501 --server.headless true > /dev/null 2>&1 &
echo "✅ Простая версия: http://localhost:8501"

# Продвинутая версия на порту 8502  
streamlit run advanced_orchestrator.py --server.port 8502 --server.headless true > /dev/null 2>&1 &
echo "✅ Продвинутая версия: http://localhost:8502"

# Multi-provider версия на порту 8503
streamlit run multi_provider_orchestrator.py --server.port 8503 --server.headless true > /dev/null 2>&1 &
echo "✅ Multi-provider версия: http://localhost:8503"

echo ""
echo "🎉 Все системы запущены!"
echo ""
echo "Доступные интерфейсы:"
echo "1️⃣ Простая версия: http://localhost:8501"
echo "2️⃣ Продвинутая версия (CrewAI): http://localhost:8502"  
echo "3️⃣ Multi-provider версия: http://localhost:8503"
echo ""
echo "Для остановки всех систем используйте: pkill -f streamlit"