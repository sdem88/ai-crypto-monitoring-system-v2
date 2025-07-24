"""
Multi-Provider AI Orchestrator с поддержкой OpenAI, Google, Anthropic
"""

import streamlit as st
import os
from dotenv import load_dotenv
from datetime import datetime
import json

# Загружаем конфигурацию
load_dotenv()

# Безопасный импорт конфигурации
from secure_config import SecureConfig

# Импорт провайдеров
try:
    import openai
except:
    openai = None

try:
    import google.generativeai as genai
except:
    genai = None

try:
    import anthropic
except:
    anthropic = None

try:
    import ollama
except:
    ollama = None

class MultiProviderOrchestrator:
    def __init__(self):
        self.providers = self._init_providers()
        
    def _init_providers(self):
        """Инициализация доступных провайдеров"""
        providers = {}
        
        # Ollama (локальный)
        if ollama:
            try:
                models = ollama.list()
                providers['ollama'] = {
                    'client': ollama,
                    'models': [m['name'] for m in models['models']],
                    'name': 'Ollama (Локальный)'
                }
            except:
                pass
        
        # OpenAI
        if openai and SecureConfig.get_openai_key():
            try:
                openai.api_key = SecureConfig.get_openai_key()
                providers['openai'] = {
                    'client': openai,
                    'models': [
                        'o1',  # Самая мощная модель рассуждений
                        'o1-mini',  # Быстрая версия o1
                        'gpt-4o',  # GPT-4 Omni (мультимодальная)
                        'gpt-4-turbo',  # GPT-4 Turbo
                        'gpt-4',  # Классический GPT-4
                        'gpt-3.5-turbo'  # Быстрая версия
                    ],
                    'name': 'OpenAI'
                }
            except:
                pass
        
        # Google Gemini
        if genai and SecureConfig.get_google_key():
            try:
                genai.configure(api_key=SecureConfig.get_google_key())
                providers['google'] = {
                    'client': genai,
                    'models': [
                        'gemini-2.0-flash-exp',  # Gemini 2.0 экспериментальная
                        'gemini-1.5-pro-002',  # Gemini 1.5 Pro последняя версия
                        'gemini-1.5-pro',  # Gemini 1.5 Pro
                        'gemini-1.5-flash',  # Быстрая версия
                        'gemini-pro'  # Базовая Pro версия
                    ],
                    'name': 'Google Gemini'
                }
            except:
                pass
        
        # Anthropic Claude
        if anthropic and SecureConfig.get_anthropic_key():
            try:
                client = anthropic.Anthropic(api_key=SecureConfig.get_anthropic_key())
                providers['anthropic'] = {
                    'client': client,
                    'models': [
                        'claude-3-5-sonnet-20241022',  # Claude 3.5 Sonnet (самая мощная)
                        'claude-3-opus-20240229',  # Claude 3 Opus
                        'claude-3-sonnet-20240229',  # Claude 3 Sonnet
                        'claude-3-5-haiku-20241022',  # Claude 3.5 Haiku (быстрая)
                        'claude-3-haiku-20240307'  # Claude 3 Haiku
                    ],
                    'name': 'Anthropic Claude'
                }
            except:
                pass
        
        return providers
    
    def generate(self, prompt, provider, model, temperature=0.7):
        """Универсальная генерация для всех провайдеров"""
        
        try:
            if provider == 'ollama':
                response = ollama.generate(model=model, prompt=prompt)
                return response['response']
            
            elif provider == 'openai':
                response = openai.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=temperature
                )
                return response.choices[0].message.content
            
            elif provider == 'google':
                model_obj = genai.GenerativeModel(model)
                response = model_obj.generate_content(prompt)
                return response.text
            
            elif provider == 'anthropic':
                client = self.providers['anthropic']['client']
                response = client.messages.create(
                    model=model,
                    max_tokens=4096,
                    temperature=temperature,
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.content[0].text
            
        except Exception as e:
            return f"Ошибка при генерации: {str(e)}"
    
    def run_multi_provider_task(self, task, selected_models, iterations=1):
        """Запуск задачи через выбранные модели"""
        
        results = []
        
        # Универсальный промпт
        prompt = f"""
        🧠 ПРИНЦИПЫ РАБОТЫ:
        1. Обдумай задачу перед ответом
        2. Проверь решение на корректность
        3. Дай практичный результат
        
        ЗАДАЧА: {task}
        
        ТРЕБОВАНИЯ:
        - Если это код, напиши полный рабочий код
        - Добавь комментарии и объяснения
        - Учти все edge cases
        """
        
        # Обрабатываем выбранные модели
        for model_key in selected_models:
            provider_key, model = model_key.split(':', 1)
            
            if provider_key in self.providers:
                provider_info = self.providers[provider_key]
                st.info(f"🤖 Обработка через {model} ({provider_info['name']})...")
                
                for i in range(iterations):
                    with st.spinner(f"Итерация {i+1} с {model}..."):
                        result = self.generate(prompt, provider_key, model)
                        
                        results.append({
                            'provider': provider_info['name'],
                            'model': model,
                            'iteration': i + 1,
                            'result': result,
                            'timestamp': datetime.now().isoformat()
                        })
        
        return results

# Streamlit интерфейс
st.set_page_config(page_title="Multi-Provider AI Orchestrator", page_icon="🌐", layout="wide")

st.title("🌐 Multi-Provider AI Orchestrator")
st.markdown("### Используйте мощь всех AI провайдеров одновременно")

# Предупреждение о безопасности
if not os.path.exists('.env'):
    st.warning("""
    ⚠️ **Настройка API ключей:**
    1. Скопируйте `.env.example` в `.env`
    2. Добавьте свои API ключи в `.env`
    3. Перезапустите приложение
    """)

# Инициализация оркестратора
orchestrator = MultiProviderOrchestrator()

# Боковая панель
with st.sidebar:
    st.header("🔑 Статус провайдеров")
    
    for provider_key, provider_info in orchestrator.providers.items():
        st.success(f"✅ {provider_info['name']}")
        with st.expander(f"Модели {provider_info['name']}"):
            for model in provider_info['models']:
                st.text(f"• {model}")
    
    if not orchestrator.providers:
        st.error("❌ Нет доступных провайдеров!")
    
    st.markdown("---")
    
    iterations = st.slider("Итераций на провайдера", 1, 3, 1)
    
    st.markdown("---")
    st.markdown("### 💰 Примерная стоимость")
    st.markdown("""
    - **Ollama**: Бесплатно
    - **GPT-4o**: ~$0.01-0.05 за запрос
    - **Gemini**: ~$0.001-0.01 за запрос
    - **Claude**: ~$0.01-0.03 за запрос
    """)

# Основной контент
tab1, tab2, tab3 = st.tabs(["🚀 Новая задача", "📊 Сравнение результатов", "⚙️ Настройки"])

with tab1:
    st.header("Создание задачи")
    
    # Примеры
    example = st.selectbox(
        "Примеры задач",
        [
            "Пользовательская задача",
            "Криптомонитор с графиками",
            "AI чат-бот с памятью",
            "Анализатор данных с ML"
        ]
    )
    
    if example == "Криптомонитор с графиками":
        default_task = """Создай полноценное приложение для мониторинга криптовалют:
1. Отслеживание курсов BTC, ETH, USDT
2. Интерактивные графики с Chart.js
3. Расчет прибыли/убытков
4. Уведомления при изменении цены
5. Сохранение истории в localStorage"""
    else:
        default_task = ""
    
    task = st.text_area(
        "Опишите задачу",
        value=default_task,
        height=200
    )
    
    # Выбор моделей
    st.subheader("🎯 Выберите модели для выполнения задачи")
    
    selected_models = []
    
    # Группируем модели по провайдерам
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if 'openai' in orchestrator.providers:
            st.markdown("**🟢 OpenAI**")
            openai_models = orchestrator.providers['openai']['models']
            for model in openai_models:
                if st.checkbox(model, key=f"openai:{model}"):
                    selected_models.append(f"openai:{model}")
    
    with col2:
        if 'google' in orchestrator.providers:
            st.markdown("**🔵 Google Gemini**")
            google_models = orchestrator.providers['google']['models']
            for model in google_models:
                if st.checkbox(model, key=f"google:{model}"):
                    selected_models.append(f"google:{model}")
    
    with col3:
        if 'anthropic' in orchestrator.providers:
            st.markdown("**🟣 Anthropic Claude**")
            anthropic_models = orchestrator.providers['anthropic']['models']
            for model in anthropic_models:
                if st.checkbox(model, key=f"anthropic:{model}"):
                    selected_models.append(f"anthropic:{model}")
    
    # Кнопки быстрого выбора
    col_quick1, col_quick2, col_quick3 = st.columns(3)
    with col_quick1:
        if st.button("⚡ Самые мощные"):
            selected_models = [
                "openai:o1",
                "google:gemini-2.0-flash-exp",
                "anthropic:claude-3-5-sonnet-20241022"
            ]
            st.rerun()
    
    with col_quick2:
        if st.button("🚀 Самые быстрые"):
            selected_models = [
                "openai:gpt-3.5-turbo",
                "google:gemini-1.5-flash",
                "anthropic:claude-3-5-haiku-20241022"
            ]
            st.rerun()
    
    with col_quick3:
        if st.button("🎯 Оптимальные"):
            selected_models = [
                "openai:gpt-4o",
                "google:gemini-1.5-pro",
                "anthropic:claude-3-5-sonnet-20241022"
            ]
            st.rerun()
    
    if st.button("🚀 Запустить выбранные модели", type="primary"):
        if task and selected_models:
            with st.spinner(f"Оркестратор работает с {len(selected_models)} моделями..."):
                results = orchestrator.run_multi_provider_task(task, selected_models, iterations)
                st.session_state['results'] = results
                st.success(f"✅ Получено {len(results)} результатов!")
                st.balloons()
        else:
            st.error("Введите задачу и выберите хотя бы одну модель")

with tab2:
    st.header("📊 Сравнение результатов")
    
    if 'results' in st.session_state:
        # Группируем по провайдерам
        providers_results = {}
        for result in st.session_state['results']:
            provider = result['provider']
            if provider not in providers_results:
                providers_results[provider] = []
            providers_results[provider].append(result)
        
        # Отображаем в колонках
        cols = st.columns(len(providers_results))
        
        for i, (provider, results) in enumerate(providers_results.items()):
            with cols[i]:
                st.markdown(f"### {provider}")
                for result in results:
                    with st.expander(f"Итерация {result['iteration']}"):
                        st.markdown(result['result'])
                        
                        # Кнопка выбора лучшего
                        if st.button(f"⭐ Выбрать как лучший", key=f"{provider}_{result['iteration']}"):
                            st.session_state['best_result'] = result
                            st.success("Выбрано как лучший результат!")
        
        # Лучший результат
        if 'best_result' in st.session_state:
            st.markdown("---")
            st.markdown("### 🏆 Лучший результат")
            best = st.session_state['best_result']
            st.info(f"Провайдер: {best['provider']} | Модель: {best['model']}")
            st.markdown(best['result'])
            
            # Сохранение
            if st.button("💾 Сохранить лучший результат"):
                filename = f"best_result_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(f"# Лучший результат\n\n")
                    f.write(f"**Провайдер:** {best['provider']}\n")
                    f.write(f"**Модель:** {best['model']}\n")
                    f.write(f"**Время:** {best['timestamp']}\n\n")
                    f.write(best['result'])
                st.success(f"Сохранено в {filename}")
    else:
        st.info("Запустите задачу для сравнения результатов")

with tab3:
    st.header("⚙️ Настройки API")
    
    st.warning("""
    ⚠️ **Безопасность:**
    - Никогда не вводите API ключи прямо в интерфейсе
    - Используйте файл `.env` для хранения ключей
    - Не коммитьте `.env` в Git
    """)
    
    st.markdown("### 📝 Инструкция по настройке")
    
    st.code("""
# 1. Создайте файл .env в папке проекта
# 2. Добавьте ваши ключи:

OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...

# 3. Перезапустите приложение
    """, language='bash')
    
    st.markdown("### 🔗 Где получить API ключи")
    st.markdown("""
    - **OpenAI**: [platform.openai.com](https://platform.openai.com/api-keys)
    - **Google**: [console.cloud.google.com](https://console.cloud.google.com)
    - **Anthropic**: [console.anthropic.com](https://console.anthropic.com)
    """)

# Футер
st.markdown("---")
st.markdown("""
<div style='text-align: center'>
    <p>🌐 Multi-Provider AI Orchestrator | Объединяя мощь всех AI</p>
    <p style='font-size: 12px; color: gray;'>
    Помните: храните API ключи в безопасности!
    </p>
</div>
""", unsafe_allow_html=True)