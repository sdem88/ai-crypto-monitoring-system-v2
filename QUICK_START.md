# 🚀 Quick Start - Быстрый запуск

## За 2 минуты запустить все

### 1. AI Orchestrator
```bash
cd ai-crypto-monitoring-system
./auto_launch.sh
```
Откроется 3 вкладки:
- http://localhost:8501 - Simple версия
- http://localhost:8502 - Advanced версия
- http://localhost:8503 - Multi-provider версия ⭐

### 2. Crypto & MOEX Monitor
```bash
cd ai-crypto-monitoring-system
./start-moex-monitor.sh
```
Автоматически:
- Запустит backend на порту 3001
- Откроет мониторинг в браузере

## 🎯 Что можно делать

### В AI Orchestrator (порт 8503)
1. Написать задачу (например: "Создай калькулятор на React")
2. Выбрать модели или нажать "⚡ Самые мощные"
3. Нажать "🚀 Запустить выбранные модели"
4. Сравнить результаты от разных AI
5. Выбрать лучший и сохранить

### В Crypto Monitor
- Смотреть курсы USDT в реальном времени
- Видеть bid/ask для объема $50,000
- Отслеживать MOEX фьючерсы USD/RUB
- Данные обновляются каждые 5 секунд

## ⚠️ Если что-то не работает

### AI не отвечает
- Проверьте .env файл (должны быть реальные ключи)
- Проверьте интернет соединение

### MOEX показывает "Нет данных"
- Убедитесь что backend запущен (порт 3001)
- Проверьте в терминале логи node moex-backend-proxy.js

### Порт занят
```bash
pkill -f streamlit     # Для AI Orchestrator
pkill -f moex-backend  # Для MOEX proxy
```

## 📱 Полезные команды

```bash
# Остановить все
pkill -f streamlit
pkill -f node

# Посмотреть логи
tail -f logs/multi.log

# Проверить порты
lsof -i :8503  # AI Orchestrator
lsof -i :3001  # MOEX Backend
```

---
Готово! Теперь вы можете использовать обе системы 🎉