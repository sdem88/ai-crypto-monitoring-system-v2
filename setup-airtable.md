# Настройка Airtable для хранения данных

## 1. Создание базы данных в Airtable

### Шаг 1: Создайте аккаунт
1. Зайдите на https://airtable.com
2. Зарегистрируйтесь или войдите

### Шаг 2: Создайте новую базу
1. Нажмите "Add a base" → "Start from scratch"
2. Назовите базу: "Crypto Exchange Monitor"

### Шаг 3: Создайте таблицу "CryptoRates"
Создайте поля со следующими типами:

| Поле | Тип | Описание |
|------|-----|----------|
| Exchange | Single line text | Название биржи (RAPIRA, GRINEX, MOEX) |
| Pair | Single line text | Торговая пара (USDT/RUB, Si-9.25 и т.д.) |
| Bid | Number (decimal) | Цена покупки для 50k USDT |
| Ask | Number (decimal) | Цена продажи для 50k USDT |
| Last | Number (decimal) | Последняя цена (для MOEX) |
| Spread | Number (decimal) | Спред в процентах |
| Volume | Number (integer) | Объем торгов |
| Change | Number (decimal) | Изменение в % |
| Timestamp | Date & time | Время записи |

## 2. Получение API ключей

### Получите API ключ:
1. Перейдите на https://airtable.com/create/tokens
2. Нажмите "Create new token"
3. Дайте имя: "Crypto Monitor"
4. Выберите scopes:
   - data.records:read
   - data.records:write
5. Выберите вашу базу "Crypto Exchange Monitor"
6. Скопируйте ключ

### Получите Base ID:
1. Откройте вашу базу
2. Нажмите "Help" → "API documentation"
3. В URL будет Base ID (начинается с app...)

## 3. Настройка переменных окружения

Добавьте в файл `.env`:

```env
# Airtable
AIRTABLE_API_KEY=pat...
AIRTABLE_BASE_ID=app...
```

## 4. Установка зависимостей

```bash
npm install airtable
```

## 5. Запуск сборщика данных

### Обычный запуск:
```bash
node crypto-data-collector.js
```

### Запуск через PM2 (рекомендуется для 24/7):
```bash
# Установка PM2
npm install -g pm2

# Запуск
pm2 start crypto-data-collector.js --name "crypto-collector"

# Автозапуск при перезагрузке
pm2 startup
pm2 save

# Просмотр логов
pm2 logs crypto-collector

# Остановка
pm2 stop crypto-collector
```

## 6. Создание представлений в Airtable

### Представление "Последние данные"
1. Создайте новое Grid view
2. Сортировка: Timestamp (Z → A)
3. Фильтр: последние 100 записей

### Представление "По биржам"
1. Создайте Kanban view
2. Группировка по полю Exchange
3. Сортировка по Timestamp

### Представление "Анализ спредов"
1. Создайте Grid view
2. Фильтр: Spread > 0.5%
3. Сортировка по Spread (по убыванию)

## 7. Автоматизации Airtable

### Уведомление о больших спредах:
1. Automations → Create automation
2. Trigger: When record matches conditions
3. Condition: Spread > 1%
4. Action: Send email/Slack notification

### Очистка старых данных:
1. Создайте представление "Старые записи"
2. Фильтр: Timestamp < 30 дней назад
3. Периодически удаляйте старые записи

## 8. Анализ данных

### Экспорт для анализа:
- CSV экспорт для Excel
- Интеграция с Google Sheets
- API для получения данных

### Встроенные графики:
1. Apps → Add an app → Charts
2. Создайте графики:
   - Линейный график курсов по времени
   - Сравнение спредов между биржами
   - Объемы торгов MOEX

## 9. Мониторинг работы

### Проверка записи данных:
```bash
# Логи PM2
pm2 logs crypto-collector --lines 50

# Статус процесса
pm2 status
```

### Дашборд в Airtable:
- Количество записей за последний час
- Последнее время обновления по каждой бирже
- Средние значения курсов

---

**Готово!** Теперь данные собираются каждые 30 секунд и сохраняются в Airtable для дальнейшего анализа.