# Веб-интерфейс для базы данных аэродинамических характеристик

## Обзор
Реализация веб-интерфейса для системы хранения и анализа аэродинамических данных. Проект включает полнофункциональный бэкенд на FastAPI с PostgreSQL и современный фронтенд на React с TypeScript.

## Архитектура

### Бэкенд (FastAPI + PostgreSQL)
- **FastAPI**: Современный, быстрый веб-фреймворк для Python
- **Asyncpg**: Асинхронный драйвер PostgreSQL
- **Pydantic**: Валидация данных и сериализация
- **SQLAlchemy**: ORM для работы с базой данных

### Фронтенд (React + TypeScript)
- **React 18**: Библиотека для построения пользовательских интерфейсов
- **TypeScript**: Типизированный JavaScript
- **Ant Design**: UI библиотека компонентов
- **Recharts**: Библиотека для построения графиков
- **React Router**: Навигация между страницами

## Структура проекта

```
aero_db/
├── backend/                    # FastAPI бэкенд
│   ├── main.py                # Основное приложение
│   ├── config.py              # Конфигурация
│   ├── API_DOCUMENTATION.md   # Документация API
│   ├── .env.example           # Пример переменных окружения
│   ├── Dockerfile             # Production образ
│   ├── Dockerfile.dev         # Development образ
│   ├── requirements.txt       # Python зависимости
│   ├── database/
│   │   └── database.py        # Подключение к БД
│   ├── models/                # Pydantic модели
│   │   ├── base.py
│   │   └── aero_models.py
│   └── routes/                # API endpoints
│       ├── sources.py
│       └── experiments.py
├── frontend/                  # React фронтенд
│   ├── src/
│   │   ├── components/        # React компоненты
│   │   │   └── Sidebar.tsx
│   │   ├── pages/            # Страницы приложения
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SourcesPage.tsx
│   │   │   ├── ExperimentsPage.tsx
│   │   │   └── VisualizationPage.tsx
│   │   ├── App.tsx           # Основной компонент
│   │   ├── main.tsx          # Точка входа
│   │   ├── App.css           # Стили приложения
│   │   └── index.css         # Базовые стили
│   ├── package.json          # Зависимости
│   ├── vite.config.ts        # Конфигурация Vite
│   ├── tsconfig.json         # Конфигурация TypeScript
│   ├── tsconfig.node.json    # Конфигурация TypeScript для Node
│   ├── Dockerfile            # Production образ
│   └── Dockerfile.dev        # Development образ
├── database/                  # Исходная схема БД
│   ├── Dockerfile
│   └── init_schema_postgresql.sql
├── docker-compose.yml        # Базовая контейнеризация БД
├── docker-compose.full.yml   # Полный стек (БД + бэкенд + фронтенд)
├── docker-compose.dev.yml    # Development стек с hot reload
└── README_WEB_INTERFACE.md   # Эта документация
```

## Установка и запуск

### Вариант 1: Запуск через Docker Compose (рекомендуется)

#### Для production:
```bash
# Запуск всех сервисов (БД, бэкенд, фронтенд)
docker-compose -f docker-compose.full.yml up -d

# Остановка всех сервисов
docker-compose -f docker-compose.full.yml down

# Просмотр логов
docker-compose -f docker-compose.full.yml logs -f
```

#### Для development:
```bash
# Запуск с hot reload для бэкенда и фронтенда
docker-compose -f docker-compose.dev.yml up -d

# Остановка
docker-compose -f docker-compose.dev.yml down

# Пересборка образов
docker-compose -f docker-compose.dev.yml up -d --build
```

### Вариант 2: Ручная установка

#### 1. Запуск базы данных
```bash
# Запуск PostgreSQL в Docker
docker compose up -d
```

#### 2. Настройка Python окружения
```bash
# Активация micromamba окружения
micromamba activate aero_db

# Установка зависимостей бэкенда
cd backend
pip install -r requirements.txt
```

#### 3. Запуск бэкенда
```bash
cd backend
python main.py
```
Бэкенд будет доступен по адресу: http://localhost:8000
Документация API: http://localhost:8000/docs

#### 4. Установка и запуск фронтенда
```bash
cd frontend
npm install
npm run dev
```
Фронтенд будет доступен по адресу: http://localhost:3000

## Доступные сервисы после запуска

| Сервис | URL | Описание | Порт |
|--------|-----|----------|------|
| PostgreSQL | `postgres://localhost:5432` | База данных | 5432 |
| FastAPI Backend | `http://localhost:8000` | REST API | 8000 |
| API Documentation | `http://localhost:8000/docs` | Swagger UI | 8000 |
| ReDoc Documentation | `http://localhost:8000/redoc` | Альтернативная документация | 8000 |
| React Frontend | `http://localhost:3000` | Веб-интерфейс | 3000 |
| Health Check | `http://localhost:8000/health` | Проверка состояния | 8000 |

## API Endpoints

### Источники данных
- `GET /api/sources` - Получить список источников
- `GET /api/sources/{id}` - Получить источник по ID
- `POST /api/sources` - Создать новый источник
- `PUT /api/sources/{id}` - Обновить источник
- `DELETE /api/sources/{id}` - Удалить источник

### Эксперименты
- `GET /api/experiments/starts` - Получить список экспериментов
- `GET /api/experiments/starts/{id}` - Получить эксперимент по ID
- `POST /api/experiments/starts` - Создать новый эксперимент
- `GET /api/experiments/aerodynamic-data` - Получить данные для визуализации
- `GET /api/experiments/statistics` - Получить статистику БД

### Утилиты
- `GET /health` - Проверка состояния сервиса
- `GET /` - Информация о API

## Функциональность фронтенда

### 1. Дашборд
- Общая статистика базы данных
- Графики аэродинамических характеристик
- Список последних экспериментов
- Быстрые действия

### 2. Управление источниками данных
- Просмотр списка источников
- Добавление новых источников
- Редактирование и удаление
- Поиск и фильтрация

### 3. Управление экспериментами
- Просмотр списка экспериментов
- Детальная информация об экспериментах
- Фильтрация по объектам и параметрам

### 4. Визуализация данных
- Графики зависимостей коэффициентов от числа Маха
- Сравнение различных конфигураций
- Экспорт данных

## Особенности реализации

### Бэкенд
- Асинхронная обработка запросов
- Валидация данных через Pydantic
- Пагинация и фильтрация
- Подробные сообщения об ошибках
- Поддержка CORS для фронтенда

### Фронтенд
- Типизация через TypeScript
- Адаптивный дизайн
- Модульная архитектура компонентов
- Состояние через React Hooks
- Интеграция с Ant Design

## Развитие проекта

### Планируемые улучшения
1. **Аутентификация и авторизация**
   - JWT токены
   - Ролевая модель доступа
   - Защита API endpoints

2. **Импорт/экспорт данных**
   - Поддержка CSV, Excel форматов
   - Пакетная загрузка данных
   - Экспорт отчетов

3. **Расширенная аналитика**
   - Машинное обучение для прогнозирования
   - Статистический анализ
   - Сравнение с эталонными данными

4. **Интеграция с внешними системами**
   - API для интеграции с CAD системами
   - WebSocket для реального времени
   - Уведомления и оповещения

### Оптимизация
- Кэширование часто запрашиваемых данных
- Оптимизация запросов к БД
- Ленивая загрузка компонентов фронтенда
- Сжатие статических ресурсов

## Технические требования

### Системные требования
- Python 3.11+
- Node.js 18+
- PostgreSQL 16+
- Docker (опционально)

### Зависимости
См. `backend/requirements.txt` и `frontend/package.json`

## Лицензия
Проект разработан как часть системы хранения аэродинамических данных.