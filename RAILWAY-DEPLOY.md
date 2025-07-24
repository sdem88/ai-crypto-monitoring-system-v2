# 🚂 Развертывание в Railway

## 📋 Автоматическое развертывание (рекомендуется)

### Шаг 1: Подготовка GitHub репозитория

```bash
# Инициализация Git (если еще не сделано)
git init
git add .
git commit -m "Initial commit: Crypto monitoring system"

# Создание репозитория на GitHub
# Идите на github.com и создайте новый репозиторий

# Подключение к GitHub
git remote add origin https://github.com/YOUR_USERNAME/ai-crypto-monitoring-system.git
git branch -M main
git push -u origin main
```

### Шаг 2: Развертывание в Railway

1. **Зайдите на https://railway.app/dashboard**
2. **Нажмите "New Project"**
3. **Выберите "Deploy from GitHub repo"**
4. **Выберите ваш репозиторий `ai-crypto-monitoring-system`**
5. **Railway автоматически определит настройки**

### Шаг 3: Настройка переменных окружения

В Railway Dashboard → Variables, добавьте:

```env
OPENAI_API_KEY=your_openai_key_here
GOOGLE_API_KEY=your_google_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
AIRTABLE_API_KEY=your_airtable_key_here
AIRTABLE_BASE_ID=your_base_id_here
NODE_ENV=production
TZ=Europe/Moscow
```

## 🐳 Альтернативный способ: Docker Deploy

### Если у вас есть Railway CLI:

```bash
# Установка Railway CLI
npm install -g @railway/cli

# Логин
railway login

# Создание нового проекта
railway new

# Развертывание
railway up
```

## 📊 Проверка развертывания

### Логи приложения:
```bash
railway logs
```

### Статус сервиса:
- Идите в Railway Dashboard
- Выберите ваш проект  
- Проверьте вкладку "Deployments"

## ⚙️ Что происходит после развертывания

1. **Railway автоматически:**
   - Установит зависимости (`npm ci`)
   - Запустит `npm start` (наш alternative-storage.js)
   - Настроит автоматические рестарты при сбоях

2. **Сборщик данных начнет:**
   - Собирать данные каждые 30 секунд
   - Сохранять в crypto-data/ директорию
   - Создавать JSON и CSV файлы

3. **Данные будут доступны:**
   - JSON файлы: daily files по датам
   - CSV файлы: для анализа в Excel
   - latest.json: текущие курсы

## 🔍 Мониторинг

### Проверка здоровья:
Railway будет автоматически перезапускать сервис при сбоях.

### Просмотр логов:
```bash
railway logs --tail
```

### Доступ к файлам:
Файлы сохраняются в контейнере. Для постоянного хранения рекомендуется:
- Настроить Airtable (уже настроен)
- Или добавить Railway Volume для постоянного хранения файлов

## 📱 Использование после развертывания

1. **Проверьте логи** - данные должны собираться каждые 30 секунд
2. **Мониторьте Airtable** - записи должны появляться там  
3. **Система работает 24/7** без вашего участия

## 🆘 Устранение неполадок

### Проблема: Deployment failed
**Решение:** Проверьте логи с `railway logs`

### Проблема: Переменные окружения не работают  
**Решение:** Убедитесь, что все переменные добавлены в Railway Dashboard

### Проблема: Сборщик не запускается
**Решение:** Проверьте `railway logs` на ошибки API

---

## ✅ Финальная проверка

После успешного развертывания вы должны видеть в логах:
```
🚀 Запуск 24/7 сборщика данных (локальное хранение)
📊 Интервал сбора: каждые 30 секунд  
💾 Сохранение в: /app/crypto-data

📊 Сбор данных: [timestamp]
Собрано записей: X
✅ Записано X записей в crypto-rates-YYYY-MM-DD.json
```

**🎉 Система запущена и работает 24/7!**