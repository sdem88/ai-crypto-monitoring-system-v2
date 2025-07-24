"""
Безопасная конфигурация для API ключей
ВАЖНО: Никогда не храните ключи в коде!
"""

import os
from dotenv import load_dotenv

# Загружаем переменные из .env файла
load_dotenv()

class SecureConfig:
    """Безопасное управление API ключами"""
    
    @staticmethod
    def get_openai_key():
        key = os.getenv('OPENAI_API_KEY')
        if not key or key == 'your-openai-api-key-here':
            return None
        return key
    
    @staticmethod
    def get_google_key():
        key = os.getenv('GOOGLE_API_KEY')
        if not key or key == 'your-google-api-key-here':
            return None
        return key
    
    @staticmethod
    def get_anthropic_key():
        key = os.getenv('ANTHROPIC_API_KEY')
        if not key or key == 'your-anthropic-api-key-here':
            return None
        return key
    
    @staticmethod
    def get_default_provider():
        return os.getenv('DEFAULT_PROVIDER', 'ollama')
    
    @staticmethod
    def validate_keys():
        """Проверка доступности ключей"""
        available_providers = ['ollama']  # Ollama всегда доступен
        
        if SecureConfig.get_openai_key():
            available_providers.append('openai')
        
        if SecureConfig.get_google_key():
            available_providers.append('google')
        
        if SecureConfig.get_anthropic_key():
            available_providers.append('anthropic')
        
        return available_providers

# НЕ ИСПОЛЬЗУЙТЕ ЭТО! Только для примера опасности
LEAKED_KEYS_WARNING = """
⚠️ ВНИМАНИЕ: Никогда не публикуйте API ключи!
Если вы видите ключи в коде или коммитах:
1. Немедленно отзовите их
2. Создайте новые
3. Используйте .env файлы
4. Добавьте .env в .gitignore
"""