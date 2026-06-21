# 🗓️ Система управления расписанием колледжа
Стек: Django, Django REST Framework, Python, sqlite, CI/CD (автодеплой при коммите)

# 📋 Возможности
Кастомная админ-панель для загрузки расписания из Excel-файлов

Автоматический парсер с валидацией данных (ошибки выводятся в интерфейс для исправления)

REST API для получения расписания (документация — api.md)

CI/CD — автоматический деплой на сервер при пуше в GitHub

# 🔗 Ссылки
Работающее API: https://api.ineb-raspisanie.ru/

Документация API: api.md в репозитории

Исходный код: в репозитории

# 🚀 Локальный запуск
bash
 1. Создать виртуальное окружение
python -m venv venv

 2. Активировать (Windows)
venv\scripts\activate
 или (Linux/Mac)
source venv/bin/activate

 3. Установить зависимости
pip install -r requirements.txt

 4. Запустить сервер
python manage.py runserver
