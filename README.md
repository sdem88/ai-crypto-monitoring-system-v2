# 🚀 AI Crypto Monitoring System

Полноценная система мониторинга криптовалютных курсов с AI-оркестрацией для развертывания в Railway.

## 📊 Возможности системы

- 🔄 **24/7 мониторинг**: RAPIRA, GRINEX, MOEX
- 📈 **Анализ арбитража**: автоматический расчет спредов
- 🤖 **AI оркестрация**: OpenAI o1, Gemini 2.0, Claude Opus 4
- ☁️ **Railway готово**: развертывание одной командой

## 🚦 Быстрый старт

```bash
# Локальный мониторинг
node alternative-storage.js

# Веб-интерфейс  
node server.js

# AI система
streamlit run multi_provider_orchestrator.py
```

## ☁️ Развертывание в Railway

```bash
# Подготовка
./init-railway.sh

# Следуйте RAILWAY-DEPLOY.md
```

## 📁 Ключевые файлы

- `alternative-storage.js` - 24/7 сборщик данных
- `crypto-exchange-monitor-full.html` - веб-интерфейс
- `multi_provider_orchestrator.py` - AI система
- `railway.json` - конфигурация Railway
- `.env` - API ключи (уже настроены)

## 🔧 API ключи готовы

Все ключи настроены в `.env`:
- ✅ OpenAI, Google, Anthropic
- ✅ Airtable база: appYJZ5AhB20Jw9ix

## 📊 Данные сохраняются в

- `crypto-data/` - локальные JSON/CSV файлы
- Airtable - облачная база данных

---

**🎉 Система готова к работе 24/7!**