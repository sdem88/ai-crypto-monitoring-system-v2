"""
Упрощенный AI Orchestrator MVP для быстрого старта
"""

import streamlit as st
import ollama
import json
from datetime import datetime
import time
import requests

st.set_page_config(page_title="AI Orchestrator MVP", page_icon="🤖", layout="wide")

st.title("🤖 AI Orchestrator MVP - Быстрый старт")
st.markdown("### Multi-AI система для автономной разработки")

# Проверка подключения к Ollama
def check_ollama():
    try:
        # Пробуем через API напрямую
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            data = response.json()
            model_names = [m['name'] for m in data.get('models', [])]
            return True, model_names
        else:
            return False, []
    except requests.exceptions.RequestException:
        # Если API не работает, пробуем через библиотеку
        try:
            models = ollama.list()
            return True, [m['name'] for m in models['models']]
        except Exception as e:
            return False, []

# Функция для выполнения задачи
def run_task(task, model="llama3.2:3b", iterations=3):
    results = []
    
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    for i in range(iterations):
        status_text.text(f"Итерация {i+1}/{iterations}: Обрабатываю задачу...")
        
        prompt = f"""
        ЗАДАЧА: {task}
        
        Ты - эксперт разработчик. Выполни эту задачу максимально качественно.
        Если это задача на создание кода - напиши полный рабочий код.
        
        ВАЖНО: Дай конкретный, применимый результат.
        """
        
        try:
            response = ollama.generate(model=model, prompt=prompt)
            result = response['response']
            results.append({
                "iteration": i + 1,
                "result": result,
                "model": model,
                "timestamp": datetime.now().isoformat()
            })
        except Exception as e:
            results.append({
                "iteration": i + 1,
                "result": f"Ошибка: {str(e)}",
                "model": model,
                "timestamp": datetime.now().isoformat()
            })
        
        progress_bar.progress((i + 1) / iterations)
        time.sleep(0.5)  # Небольшая пауза для UI
    
    status_text.text("✅ Готово!")
    return results

# UI
ollama_ok, available_models = check_ollama()

if not ollama_ok:
    st.error("❌ Ollama не запущен! Запустите: `ollama serve`")
    st.stop()

# Боковая панель
with st.sidebar:
    st.header("⚙️ Настройки")
    
    selected_model = st.selectbox(
        "Выберите модель",
        available_models if available_models else ["Нет моделей"]
    )
    
    iterations = st.slider("Количество итераций", 1, 5, 2)
    
    st.markdown("---")
    st.markdown("### 📊 Доступные модели:")
    for model in available_models:
        st.text(f"• {model}")

# Основной контент
tab1, tab2, tab3 = st.tabs(["📝 Новая задача", "📊 Результаты", "💡 Примеры"])

with tab1:
    task_input = st.text_area(
        "Опишите задачу",
        height=200,
        placeholder="Например: Создай веб-страницу для мониторинга курсов криптовалют..."
    )
    
    col1, col2 = st.columns([1, 4])
    with col1:
        if st.button("🚀 Запустить", type="primary"):
            if task_input and selected_model != "Нет моделей":
                with st.spinner("Оркестратор работает..."):
                    results = run_task(task_input, selected_model, iterations)
                    st.session_state['results'] = results
                    st.success("✅ Задача выполнена!")
                    st.balloons()
            else:
                st.error("Введите задачу и убедитесь, что модель выбрана")

with tab2:
    if 'results' in st.session_state:
        st.header("Результаты выполнения")
        
        for i, result in enumerate(st.session_state['results']):
            with st.expander(f"Итерация {result['iteration']} - {result['model']}"):
                st.text(f"Время: {result['timestamp']}")
                st.markdown("---")
                st.markdown(result['result'])
                
                # Если в результате есть код, показываем его отдельно
                if "```" in result['result']:
                    st.markdown("### 💻 Найденный код:")
                    # Простое извлечение кода между ```
                    code_blocks = result['result'].split("```")
                    for j in range(1, len(code_blocks), 2):
                        if j < len(code_blocks):
                            code = code_blocks[j]
                            # Определяем язык
                            lines = code.split('\n')
                            lang = lines[0] if lines else 'text'
                            code_content = '\n'.join(lines[1:]) if len(lines) > 1 else code
                            st.code(code_content, language=lang)
    else:
        st.info("Запустите задачу, чтобы увидеть результаты")

with tab3:
    st.header("Примеры задач")
    
    example_tasks = {
        "Криптомонитор": """Создай HTML страницу для мониторинга курсов USDT на биржах:
- RAPIRA.net: API https://api.rapira.net/market/exchange-plate-mini?symbol=USDT/RUB
- GRINEX: API https://grinex.io/api/v2/depth?market=usdtrub
- Рассчитай bid/ask для объема $50,000
- Автообновление каждые 5 секунд""",
        
        "REST API": """Создай простой REST API на Python с Flask:
- Endpoint GET /users - список пользователей
- Endpoint POST /users - создание пользователя
- Endpoint GET /users/<id> - получение пользователя
- Используй JSON для данных""",
        
        "Калькулятор": """Создай веб-калькулятор на HTML/CSS/JavaScript:
- Основные операции: +, -, *, /
- Красивый дизайн с градиентами
- История вычислений
- Адаптивный под мобильные"""
    }
    
    for name, task in example_tasks.items():
        if st.button(f"Использовать: {name}"):
            st.session_state['example_task'] = task
            st.info(f"Скопируйте этот пример в поле задачи:\n\n{task}")

# Футер
st.markdown("---")
st.markdown(
    """
    <div style='text-align: center'>
        <p>🚀 AI Orchestrator MVP | Создано за 1 день с Ollama</p>
        <p style='font-size: 12px; color: gray;'>
        Подсказка: Для лучших результатов используйте конкретные, детальные описания задач
        </p>
    </div>
    """,
    unsafe_allow_html=True
)