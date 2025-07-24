#!/bin/bash

echo "🚂 Автоматическое развертывание в Railway"
echo "========================================"

# Проверяем Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не найден. Устанавливаем..."
    npm install -g @railway/cli
fi

echo "🔑 Создаем временный токен для Railway..."

# Пытаемся авторизоваться через веб-браузер
echo "📱 Открываем браузер для авторизации Railway..."
railway login &

# Ждем авторизации
sleep 10

echo "🚀 Создаем новый проект..."
railway new ai-crypto-monitoring-system --template blank

echo "📦 Связываем с GitHub..."
railway connect

echo "🔧 Устанавливаем переменные окружения..."
railway variables set OPENAI_API_KEY="sk-svcacct-lXU3L8WYJzz3tBOoXjABIQY2xWKHnVUCWHcuP2Nhe4OOT3BlbkFJNhvxMa5xJLkHNGu2uLLp7iKJiQm7DVdQO6tTVgFyYdCtoA"
railway variables set GOOGLE_API_KEY="AIzaSyCTX-qgisTC-Z1vbkKxHsdTRQkfNU0kiko"
railway variables set ANTHROPIC_API_KEY="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"
railway variables set AIRTABLE_API_KEY="patG93PzCG9lKtrAI.44f7ead77564f2de69440f780df66156c573a7f72c27efcb8e3f4ca480da682c"
railway variables set AIRTABLE_BASE_ID="appYJZ5AhB20Jw9ix"
railway variables set NODE_ENV="production"
railway variables set TZ="Europe/Moscow"

echo "🚀 Развертываем приложение..."
railway up

echo "✅ Развертывание завершено!"
railway status
railway logs