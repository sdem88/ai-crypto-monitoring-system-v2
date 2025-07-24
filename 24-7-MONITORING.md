# 24/7 Мониторинг - Полная настройка

## ✅ Что уже готово

### 1. Сборщик данных (2 версии)

#### A. С Airtable (crypto-data-collector.js)
- Сохраняет данные в облачную базу Airtable
- Требует API ключ и Base ID
- Удобный веб-интерфейс для анализа

#### B. Локальное хранение (alternative-storage.js) 
- Сохраняет в JSON и CSV файлы
- Не требует внешних сервисов
- Работает сразу из коробки

### 2. Данные собираются каждые 30 секунд:
- **RAPIRA**: USDT/RUB (bid/ask для 50k)
- **GRINEX**: USDT/RUB, USDT/A7A5
- **MOEX**: USDRUBF, Si-9.25, Si-12.25, Si-3.26

## 🚀 Запуск 24/7 мониторинга

### Вариант 1: Локальное хранение (рекомендуется для начала)

```bash
# Простой запуск
node alternative-storage.js

# Или через PM2 для 24/7
pm2 start alternative-storage.js --name "crypto-local"
```

**Где искать данные:**
- `crypto-data/latest.json` - последние курсы
- `crypto-data/crypto-rates-YYYY-MM-DD.json` - все данные за день
- `crypto-data/crypto-rates-YYYY-MM-DD.csv` - для Excel

### Вариант 2: С Airtable (требует настройки)

1. Создайте базу в Airtable (инструкция в setup-airtable.md)
2. Получите Base ID из URL: app...
3. Обновите .env файл:
```env
AIRTABLE_BASE_ID=appXXXXXXXXXXXX
```

4. Запустите:
```bash
./start-24-7-collector.sh
```

## 📊 Пример собранных данных

```json
{
  "RAPIRA_USDT/RUB": {
    "exchange": "RAPIRA",
    "pair": "USDT/RUB",
    "bid": 79.16,
    "ask": 79.17,
    "spread": 0.013,
    "timestamp": "2025-07-24T21:35:33.123Z"
  },
  "MOEX_USDRUBF": {
    "exchange": "MOEX",
    "pair": "USDRUBF",
    "last": 79220,
    "pricePerUSD": 79.22,
    "volume": 9961,
    "change": 0.2
  }
}
```

## 🔧 Настройка автозапуска

### Linux/Mac (systemd)
```bash
# Создать сервис
sudo nano /etc/systemd/system/crypto-monitor.service

[Unit]
Description=Crypto Exchange Monitor
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/ai-crypto-monitoring-system
ExecStart=/usr/bin/node alternative-storage.js
Restart=always

[Install]
WantedBy=multi-user.target

# Включить автозапуск
sudo systemctl enable crypto-monitor
sudo systemctl start crypto-monitor
```

### Windows (Task Scheduler)
1. Откройте Task Scheduler
2. Create Basic Task → "Crypto Monitor"
3. Trigger: When computer starts
4. Action: Start a program
5. Program: node.exe
6. Arguments: C:\path\to\alternative-storage.js

## 📈 Анализ данных

### Excel/Google Sheets
1. Импортируйте CSV файлы
2. Создайте сводные таблицы
3. Постройте графики изменения курсов

### Python анализ
```python
import pandas as pd
import json

# Загрузка данных
with open('crypto-data/crypto-rates-2025-07-24.json') as f:
    data = json.load(f)

df = pd.DataFrame(data)

# Средние курсы
print(df.groupby('exchange')['bid'].mean())

# График
df.plot(x='timestamp', y=['bid', 'ask'])
```

## 🛡 Мониторинг здоровья системы

### Проверка работы
```bash
# PM2 статус
pm2 status

# Последние логи
pm2 logs crypto-local --lines 50

# Проверка файлов
ls -la crypto-data/
```

### Алерты (опционально)
Добавьте в сборщик отправку уведомлений при:
- Спред > 1%
- Недоступность биржи
- Резкое изменение курса

## 💡 Советы

1. **Резервное копирование**: Настройте копирование crypto-data/ в облако
2. **Очистка**: Удаляйте файлы старше 30 дней
3. **Мониторинг**: Используйте Grafana для визуализации
4. **API лимиты**: Текущий интервал (30 сек) безопасен для всех API

---

**Статус**: Система полностью готова к 24/7 работе. Данные уже собираются!