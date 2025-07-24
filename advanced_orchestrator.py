"""
Продвинутый AI Orchestrator с CrewAI и универсальным промптом
"""

import streamlit as st
from crewai import Agent, Task, Crew, Process
from langchain.llms import Ollama
import json
from datetime import datetime
import os

st.set_page_config(page_title="AI Orchestrator Pro", page_icon="🚀", layout="wide")

# Универсальный промпт из вашего запроса
UNIVERSAL_PROMPT = """
🧠 ФУНДАМЕНТАЛЬНЫЕ ПРИНЦИПЫ МЫШЛЕНИЯ
1. ОБЯЗАТЕЛЬНАЯ ПАУЗА И ПЛАНИРОВАНИЕ
Перед КАЖДЫМ ответом:
* СТОП → Пауза для обдумывания
* Создай четкий план действий
* Оцени сложность задачи
* Уверенность в плане: __%

2. TRIPLE VERIFICATION
Проверка 1 - Техническая корректность → Уверенность: __%
Проверка 2 - Оптимальность решения → Уверенность: __%
Проверка 3 - Качество результата → Уверенность: __%

3. УРОВНИ УВЕРЕННОСТИ
95-100%: Проверенные факты
85-94%: Логические выводы
<85%: Требуется дополнительная проверка

ЗАДАЧА: {task}
КОНТЕКСТ: {context}
"""

class AdvancedOrchestrator:
    def __init__(self):
        self.history = []
        
    def create_agents(self, model="llama3.2:3b"):
        """Создание специализированных агентов"""
        
        # LLM для всех агентов
        llm = Ollama(model=model, temperature=0.1)
        
        # Агент-аналитик
        analyst = Agent(
            role='Системный аналитик',
            goal='Проанализировать требования и создать детальное техническое задание',
            backstory='Senior аналитик с опытом McKinsey, эксперт по декомпозиции задач',
            llm=llm,
            verbose=True,
            allow_delegation=False
        )
        
        # Агент-архитектор
        architect = Agent(
            role='Архитектор решений',
            goal='Спроектировать оптимальную архитектуру решения',
            backstory='Principal архитектор с 15+ лет опыта в проектировании систем',
            llm=llm,
            verbose=True,
            allow_delegation=False
        )
        
        # Агент-разработчик
        developer = Agent(
            role='Full-stack разработчик',
            goal='Написать качественный, рабочий код согласно архитектуре',
            backstory='Senior developer, контрибьютор open-source проектов',
            llm=llm,
            verbose=True,
            allow_delegation=False
        )
        
        # Агент-тестировщик
        tester = Agent(
            role='QA инженер',
            goal='Проверить качество кода и предложить улучшения',
            backstory='Lead QA с экспертизой в автоматизации тестирования',
            llm=llm,
            verbose=True,
            allow_delegation=False
        )
        
        return [analyst, architect, developer, tester]
    
    def create_tasks(self, task_description, agents):
        """Создание задач для каждого агента"""
        
        analyst, architect, developer, tester = agents
        
        # Задача анализа
        analysis_task = Task(
            description=UNIVERSAL_PROMPT.format(
                task=f"Проанализируй следующую задачу и создай детальное ТЗ: {task_description}",
                context="Необходимо учесть все аспекты и edge cases"
            ),
            expected_output="Детальное техническое задание с требованиями",
            agent=analyst
        )
        
        # Задача проектирования
        architecture_task = Task(
            description=UNIVERSAL_PROMPT.format(
                task="Спроектируй архитектуру решения на основе ТЗ от аналитика",
                context="Фокус на масштабируемости и производительности"
            ),
            expected_output="Архитектурное решение с диаграммами и описанием компонентов",
            agent=architect
        )
        
        # Задача разработки
        development_task = Task(
            description=UNIVERSAL_PROMPT.format(
                task="Напиши код согласно архитектуре от архитектора",
                context="Код должен быть production-ready с обработкой ошибок"
            ),
            expected_output="Полностью рабочий код с комментариями",
            agent=developer
        )
        
        # Задача тестирования
        testing_task = Task(
            description=UNIVERSAL_PROMPT.format(
                task="Проверь код от разработчика и предложи улучшения",
                context="Проверь безопасность, производительность и best practices"
            ),
            expected_output="Отчет о качестве кода с рекомендациями",
            agent=tester
        )
        
        return [analysis_task, architecture_task, development_task, testing_task]
    
    def run_crew(self, task_description, model="llama3.2:3b", iterations=1):
        """Запуск команды агентов"""
        
        results = []
        
        for i in range(iterations):
            st.info(f"🔄 Итерация {i+1}/{iterations}")
            
            # Создаем агентов и задачи
            agents = self.create_agents(model)
            tasks = self.create_tasks(task_description, agents)
            
            # Создаем Crew
            crew = Crew(
                agents=agents,
                tasks=tasks,
                process=Process.sequential,
                verbose=True
            )
            
            # Запускаем
            with st.spinner(f"Команда работает над итерацией {i+1}..."):
                try:
                    result = crew.kickoff()
                    results.append({
                        "iteration": i + 1,
                        "result": str(result),
                        "timestamp": datetime.now().isoformat(),
                        "model": model
                    })
                except Exception as e:
                    st.error(f"Ошибка в итерации {i+1}: {str(e)}")
                    results.append({
                        "iteration": i + 1,
                        "result": f"Ошибка: {str(e)}",
                        "timestamp": datetime.now().isoformat(),
                        "model": model
                    })
        
        return results
    
    def save_results(self, results, task_description):
        """Сохранение результатов в файл"""
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"results_{timestamp}.json"
        
        data = {
            "task": task_description,
            "timestamp": datetime.now().isoformat(),
            "results": results
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return filename

# Главный интерфейс
st.title("🚀 AI Orchestrator Pro - Продвинутая версия")
st.markdown("### Multi-agent система с CrewAI и универсальным промптом")

# Инициализация оркестратора
if 'orchestrator' not in st.session_state:
    st.session_state.orchestrator = AdvancedOrchestrator()

# Боковая панель
with st.sidebar:
    st.header("⚙️ Настройки")
    
    # Проверка Ollama
    try:
        import ollama
        models = ollama.list()
        available_models = [m['name'] for m in models['models']]
        model = st.selectbox("AI Модель", available_models)
    except:
        st.error("Ollama не доступен!")
        available_models = []
        model = None
    
    iterations = st.slider("Количество итераций", 1, 3, 1)
    
    st.markdown("---")
    st.header("📊 Статистика")
    st.metric("Выполнено задач", len(st.session_state.orchestrator.history))

# Основной контент
tab1, tab2, tab3, tab4 = st.tabs(["📝 Новая задача", "🤖 Агенты", "📊 Результаты", "📚 История"])

with tab1:
    st.header("Создание новой задачи")
    
    # Примеры задач
    example = st.selectbox(
        "Выберите пример или введите свою задачу",
        [
            "Своя задача",
            "Криптомонитор USDT (RAPIRA + GRINEX)",
            "REST API с аутентификацией",
            "React компонент с графиками"
        ]
    )
    
    if example == "Криптомонитор USDT (RAPIRA + GRINEX)":
        default_task = """Создай веб-страницу для мониторинга курсов USDT:
1. RAPIRA.net - пара USDT/RUB
   API: https://api.rapira.net/market/exchange-plate-mini?symbol=USDT/RUB
2. GRINEX - пары USDT/RUB и USDT/A7A5
   API: https://grinex.io/api/v2/depth?market=usdtrub
3. Рассчитай bid/ask для объема $50,000
4. Автообновление каждые 5 секунд
5. Красивый дизайн с графиками"""
    else:
        default_task = ""
    
    task_input = st.text_area(
        "Описание задачи",
        value=default_task,
        height=200,
        placeholder="Опишите детально, что нужно создать..."
    )
    
    col1, col2, col3 = st.columns([1, 1, 3])
    
    with col1:
        if st.button("🚀 Запустить", type="primary", disabled=not model):
            if task_input:
                results = st.session_state.orchestrator.run_crew(
                    task_input, 
                    model=model,
                    iterations=iterations
                )
                st.session_state['current_results'] = results
                st.session_state.orchestrator.history.append({
                    "task": task_input,
                    "results": results,
                    "timestamp": datetime.now()
                })
                st.success("✅ Задача выполнена!")
                st.balloons()
    
    with col2:
        if st.button("💾 Сохранить результаты"):
            if 'current_results' in st.session_state:
                filename = st.session_state.orchestrator.save_results(
                    st.session_state['current_results'],
                    task_input
                )
                st.success(f"Сохранено в {filename}")

with tab2:
    st.header("🤖 Команда агентов")
    
    agents_info = [
        {
            "role": "Системный аналитик",
            "icon": "🔍",
            "skills": ["Анализ требований", "Декомпозиция задач", "Создание ТЗ"],
            "approach": "McKinsey Framework"
        },
        {
            "role": "Архитектор решений",
            "icon": "🏗️",
            "skills": ["Проектирование систем", "Выбор технологий", "Оптимизация"],
            "approach": "TOGAF методология"
        },
        {
            "role": "Full-stack разработчик",
            "icon": "💻",
            "skills": ["Frontend/Backend", "Базы данных", "API интеграции"],
            "approach": "Clean Code принципы"
        },
        {
            "role": "QA инженер",
            "icon": "🔧",
            "skills": ["Тестирование", "Code review", "Оптимизация производительности"],
            "approach": "Shift-left testing"
        }
    ]
    
    cols = st.columns(2)
    for i, agent in enumerate(agents_info):
        with cols[i % 2]:
            st.markdown(f"### {agent['icon']} {agent['role']}")
            st.markdown(f"**Подход:** {agent['approach']}")
            st.markdown("**Навыки:**")
            for skill in agent['skills']:
                st.markdown(f"- {skill}")

with tab3:
    st.header("📊 Результаты выполнения")
    
    if 'current_results' in st.session_state:
        for result in st.session_state['current_results']:
            with st.expander(f"Итерация {result['iteration']} - {result['timestamp']}"):
                st.markdown(result['result'])
                
                # Извлечение кода
                if "```" in result['result']:
                    st.markdown("### 💻 Сгенерированный код:")
                    code_blocks = result['result'].split("```")
                    for i in range(1, len(code_blocks), 2):
                        if i < len(code_blocks):
                            code = code_blocks[i]
                            lines = code.split('\n')
                            lang = lines[0] if lines else 'text'
                            code_content = '\n'.join(lines[1:]) if len(lines) > 1 else code
                            st.code(code_content, language=lang)
                            
                            # Кнопка копирования
                            if st.button(f"📋 Копировать код {i//2 + 1}", key=f"copy_{result['iteration']}_{i}"):
                                st.write("Код скопирован в буфер обмена!")
    else:
        st.info("Запустите задачу для просмотра результатов")

with tab4:
    st.header("📚 История задач")
    
    if st.session_state.orchestrator.history:
        for i, item in enumerate(reversed(st.session_state.orchestrator.history)):
            with st.expander(f"{item['timestamp'].strftime('%Y-%m-%d %H:%M')} - {item['task'][:50]}..."):
                st.markdown(f"**Задача:** {item['task']}")
                st.markdown(f"**Итераций:** {len(item['results'])}")
                if st.button(f"Загрузить результаты", key=f"load_{i}"):
                    st.session_state['current_results'] = item['results']
                    st.success("Результаты загружены!")
    else:
        st.info("История пуста")

# Футер
st.markdown("---")
st.markdown(
    """
    <div style='text-align: center'>
        <p>🚀 AI Orchestrator Pro | CrewAI + Универсальный промпт</p>
        <p style='font-size: 12px; color: gray;'>
        Система использует multi-agent подход с тройной проверкой качества
        </p>
    </div>
    """,
    unsafe_allow_html=True
)