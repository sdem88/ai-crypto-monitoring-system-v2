# AI & Crypto Monitoring System

## 📋 Оглавление
1. [Обзор проекта](#обзор-проекта)
2. [Что было реализовано](#что-было-реализовано)
3. [Архитектура системы](#архитектура-системы)
4. [Установка и запуск](#установка-и-запуск)
5. [Детальное описание компонентов](#детальное-описание-компонентов)
6. [API и интеграции](#api-и-интеграции)
7. [Текущее состояние](#текущее-состояние)
8. [Как продолжить разработку](#как-продолжить-разработку)

## 🎯 Обзор проекта

Этот проект объединяет два основных компонента:
1. **AI Orchestrator** - система для работы с несколькими AI провайдерами (OpenAI, Google Gemini, Anthropic Claude)
2. **Crypto & MOEX Monitor** - мониторинг курсов криптовалют и фьючерсов Московской биржи

### Цель проекта
Создать систему, где человек без опыта программирования может:
- Описывать задачи на естественном языке
- Получать код от нескольких AI моделей одновременно
- Сравнивать результаты и выбирать лучшее решение
- Мониторить финансовые рынки в реальном времени

## ✅ Что было реализовано

### 1. AI Orchestrator (порт 8503)
- **Multi-provider поддержка**: OpenAI, Google Gemini, Anthropic Claude, Ollama
- **Выбор конкретных моделей**: o1, GPT-4o, Gemini 2.0, Claude 3.5 Sonnet и др.
- **Сравнение результатов**: параллельное выполнение на разных моделях
- **Три версии системы**:
  - Simple (только Ollama) - порт 8501
  - Advanced (CrewAI с агентами) - порт 8502
  - Multi-provider (все AI) - порт 8503

### 2. Crypto & MOEX Monitor
- **Криптобиржи**:
  - RAPIRA: USDT/RUB
  - GRINEX: USDT/RUB, USDT/A7A5
- **MOEX фьючерсы**:
  - USDRUBF (вечный)
  - Si-9.25, Si-12.25, Si-3.26 (с экспирацией)
- **Особенности**:
  - Расчет bid/ask для объема 50,000 USDT
  - Учет 1 лот = 1000 USD для MOEX
  - Обновление каждые 5 секунд

## 🏗 Архитектура системы

```
ai-crypto-monitoring-system/
│
├── AI Orchestrator компоненты:
│   ├── multi_provider_orchestrator.py    # Основная multi-AI система
│   ├── simple_orchestrator.py           # Простая версия с Ollama
│   ├── advanced_orchestrator.py         # CrewAI версия с агентами
│   ├── secure_config.py                 # Безопасное управление API ключами
│   ├── .env                            # API ключи (настроены)
│   └── auto_launch.sh                  # Запуск всех версий AI
│
├── Crypto Monitor компоненты:
│   ├── crypto-exchange-monitor-full.html # Веб-интерфейс мониторинга
│   ├── moex-backend-proxy.js           # Node.js прокси для MOEX API
│   ├── start-moex-monitor.sh           # Запуск мониторинга
│   └── package.json                    # Зависимости Node.js
│
└── node_modules/                       # Установленные npm пакеты
```

## 🚀 Установка и запуск

### Предварительные требования
- Python 3.8+
- Node.js 14+
- npm

### Быстрый старт

#### 1. AI Orchestrator
```bash
# Установка зависимостей Python (если еще не установлены)
pip install streamlit openai google-generativeai anthropic ollama crewai python-dotenv

# Запуск всех версий
./auto_launch.sh

# Или запуск только multi-provider версии
streamlit run multi_provider_orchestrator.py --server.port 8503
```

#### 2. Crypto & MOEX Monitor
```bash
# Установка зависимостей Node.js (уже установлены в node_modules)
npm install

# Запуск (включает backend для MOEX)
./start-moex-monitor.sh

# Или вручную:
node moex-backend-proxy.js &
open crypto-exchange-monitor-full.html
```

## 📖 Детальное описание компонентов

### AI Orchestrator

#### multi_provider_orchestrator.py
- **Функционал**: Работа с несколькими AI провайдерами
- **Особенности**:
  - Динамическое определение доступных провайдеров
  - Выбор конкретных моделей через чекбоксы
  - Кнопки быстрого выбора (самые мощные/быстрые/оптимальные)
  - Сохранение лучших результатов

#### secure_config.py
- **Функционал**: Безопасная работа с API ключами
- **Методы**:
  - `get_openai_key()` - получение ключа OpenAI
  - `get_google_key()` - получение ключа Google
  - `get_anthropic_key()` - получение ключа Anthropic
  - `validate_keys()` - проверка доступности провайдеров

### Crypto Monitor

#### crypto-exchange-monitor-full.html
- **Структура**:
  - Таблица криптобирж (RAPIRA, GRINEX)
  - Таблица MOEX фьючерсов
  - Индикатор статуса backend сервера
- **JavaScript функции**:
  - `calculateWeightedPrice()` - расчет средневзвешенной цены
  - `fetchRapiraData()` - получение данных RAPIRA
  - `fetchGrinexData()` - получение данных GRINEX
  - `fetchMoexData()` - получение данных MOEX через backend

#### moex-backend-proxy.js
- **Назначение**: Обход CORS ограничений MOEX API
- **Эндпоинты**:
  - `GET /api/moex/futures` - все фьючерсы
  - `GET /api/moex/futures/:contract` - конкретный контракт
- **Маппинг контрактов**:
  ```javascript
  'USDRUBF' -> 'USDRUBF'
  'Si-9.25' -> 'SiU5'
  'Si-12.25' -> 'SiZ5'
  'Si-3.26' -> 'SiH6'
  ```

## 🔌 API и интеграции

### Используемые API

#### 1. OpenAI
- **Ключ**: Настроен в .env
- **Модели**: o1, o1-mini, gpt-4o, gpt-4-turbo, gpt-4, gpt-3.5-turbo
- **Статус**: ✅ Работает

#### 2. Google Gemini
- **Ключ**: Настроен в .env
- **Модели**: gemini-2.0-flash-exp, gemini-1.5-pro, gemini-1.5-flash
- **Статус**: ✅ Работает

#### 3. Anthropic Claude
- **Ключ**: Настроен в .env
- **Модели**: claude-3-5-sonnet, claude-3-opus, claude-3-5-haiku
- **Статус**: ✅ Работает

#### 4. RAPIRA API
- **URL**: `https://api.rapira.net/market/exchange-plate-mini?symbol=USDT/RUB`
- **Формат**: `{ask: {items: []}, bid: {items: []}}`
- **Статус**: ✅ Работает

#### 5. GRINEX API
- **URL**: `https://grinex.io/api/v2/depth?market={market}&limit=50`
- **Маркеты**: usdtrub, usdta7a5
- **Статус**: ✅ Работает

#### 6. MOEX API
- **URL**: `https://iss.moex.com/iss/engines/futures/markets/forts/securities/{secid}.json`
- **Авторизация**: Bearer token (настроен)
- **Статус**: ✅ Работает через backend прокси

## 📊 Текущее состояние

### Что работает
1. ✅ AI Orchestrator полностью функционален
2. ✅ Все API ключи настроены и активны
3. ✅ Криптобиржи возвращают реальные данные
4. ✅ MOEX фьючерсы обновляются в реальном времени
5. ✅ Backend прокси для MOEX работает стабильно

### Известные ограничения
1. MOEX токен может истечь (срок до 2025 года)
2. Требуется запущенный backend для MOEX данных
3. API ключи хранятся в .env файле (не коммитить!)

## 🔧 Как продолжить разработку

### Возможные улучшения

#### 1. Добавление новых бирж
```javascript
// В crypto-exchange-monitor-full.html
async function fetchNewExchangeData() {
    const response = await fetch('NEW_EXCHANGE_API_URL');
    // Обработка данных
}
```

#### 2. Добавление новых AI провайдеров
```python
# В multi_provider_orchestrator.py
if new_provider and SecureConfig.get_new_provider_key():
    providers['new_provider'] = {
        'client': new_provider_client,
        'models': ['model1', 'model2'],
        'name': 'New Provider'
    }
```

#### 3. Расширение MOEX контрактов
```javascript
// В moex-backend-proxy.js
const CONTRACT_MAPPING = {
    'USDRUBF': 'USDRUBF',
    'Si-9.25': 'SiU5',
    // Добавить новые контракты
    'NEW_CONTRACT': 'MOEX_CODE'
};
```

### Структура для новых функций

1. **Для AI задач**: Добавлять в `multi_provider_orchestrator.py`
2. **Для финансовых данных**: Расширять `crypto-exchange-monitor-full.html`
3. **Для новых API с CORS**: Добавлять эндпоинты в `moex-backend-proxy.js`

## 📞 Контакты и поддержка

Проект создан с использованием:
- Claude 3.5 (Anthropic) для разработки
- Реальные API ключи пользователя
- Open-source библиотеки

### Важные файлы конфигурации
- `.env` - API ключи (НЕ ПУБЛИКОВАТЬ!)
- `package.json` - зависимости Node.js
- `requirements.txt` - зависимости Python (создать при необходимости)

## ⚠️ Безопасность

**ВАЖНО**: Файл `.env` содержит реальные API ключи. 
- Никогда не публикуйте его в Git
- Добавьте `.env` в `.gitignore`
- При передаче проекта удалите или замените ключи

---

**Последнее обновление**: 24 июля 2025
**Версия**: 1.0
**Статус**: Полностью работоспособен