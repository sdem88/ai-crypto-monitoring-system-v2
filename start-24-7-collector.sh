#!/bin/bash

echo "🚀 Запуск 24/7 сборщика данных криптобирж и MOEX"
echo "================================================"

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен!"
    exit 1
fi

# Установка зависимостей
if [ ! -d "node_modules/airtable" ]; then
    echo "📦 Установка зависимостей Airtable..."
    npm install
fi

# Проверка PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Установка PM2 для 24/7 работы..."
    npm install -g pm2
fi

# Проверка .env файла
if [ ! -f ".env" ]; then
    echo "⚠️  Создаю шаблон .env файла..."
    echo "# Airtable конфигурация" >> .env
    echo "AIRTABLE_API_KEY=YOUR_AIRTABLE_API_KEY" >> .env
    echo "AIRTABLE_BASE_ID=YOUR_BASE_ID" >> .env
    echo ""
    echo "❗ ВАЖНО: Добавьте ваши Airtable ключи в .env файл!"
    echo "   Инструкция в файле setup-airtable.md"
fi

# Остановка старого процесса
pm2 stop crypto-collector 2>/dev/null

# Запуск сборщика
echo ""
echo "🔄 Запуск сборщика данных..."
pm2 start crypto-data-collector.js \
    --name "crypto-collector" \
    --log-date-format "YYYY-MM-DD HH:mm:ss" \
    --merge-logs \
    --time

# Настройка автозапуска
echo ""
echo "⚙️  Настройка автозапуска при перезагрузке..."
pm2 startup 2>/dev/null
pm2 save

# Информация о статусе
echo ""
echo "✅ Сборщик данных запущен!"
echo ""
echo "📊 Полезные команды:"
echo "   pm2 status          - статус процесса"
echo "   pm2 logs            - просмотр логов"
echo "   pm2 monit           - мониторинг в реальном времени"
echo "   pm2 stop crypto-collector   - остановка"
echo "   pm2 restart crypto-collector - перезапуск"
echo ""
echo "💾 Данные сохраняются в Airtable каждые 30 секунд"
echo ""

# Показать логи
pm2 logs crypto-collector --lines 20