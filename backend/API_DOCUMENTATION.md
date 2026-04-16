# Документация API бэкенда Aero Database

## Обзор
FastAPI бэкенд для системы хранения и анализа аэродинамических данных. API предоставляет RESTful endpoints для работы с основными сущностями базы данных.

## Базовый URL
```
http://localhost:8000
```

## Автодокументация
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Аутентификация
*В текущей версии аутентификация не реализована. Планируется добавить JWT токены.*

## Общие параметры запросов

### Пагинация и фильтрация
Все GET endpoints, возвращающие списки, поддерживают пагинацию через query parameters:

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `page` | integer | 1 | Номер страницы (начинается с 1) |
| `page_size` | integer | 20 | Количество элементов на странице (1-100) |
| `search` | string | null | Поиск по текстовым полям |
| `sort_by` | string | "id" | Поле для сортировки |
| `sort_order` | string | "asc" | Порядок сортировки ("asc" или "desc") |

### Формат ответа
Успешный ответ:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "total_pages": 5
}
```

Ошибка:
```json
{
  "detail": "Сообщение об ошибке"
}
```

## Endpoints

### 1. Health Check

#### GET /health
Проверка состояния сервиса.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 2. Источники данных (Sources)

#### GET /api/sources
Получить список источников данных.

**Query Parameters:**
- Стандартные параметры пагинации
- Дополнительно: поиск по полям `name` и `description`

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Аэродинамическая труба ЦАГИ",
      "description": "Основная аэродинамическая труба",
      "remark": "Высокоточные измерения",
      "created_at": "2024-03-15T10:30:00Z",
      "updated_at": "2024-03-15T10:30:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 20,
  "total_pages": 3
}
```

#### GET /api/sources/{source_id}
Получить источник по ID.

**Path Parameters:**
- `source_id` (integer, required): ID источника

**Response:**
```json
{
  "id": 1,
  "name": "Аэродинамическая труба ЦАГИ",
  "description": "Основная аэродинамическая труба",
  "remark": "Высокоточные измерения",
  "created_at": "2024-03-15T10:30:00Z",
  "updated_at": "2024-03-15T10:30:00Z"
}
```

#### POST /api/sources
Создать новый источник.

**Request Body:**
```json
{
  "name": "Новый источник",
  "description": "Описание источника",
  "remark": "Заметки"
}
```

**Validation Rules:**
- `name`: обязательное, максимум 100 символов, уникальное
- `description`: необязательное, текст
- `remark`: необязательное, текст

#### PUT /api/sources/{source_id}
Обновить существующий источник.

**Path Parameters:**
- `source_id` (integer, required): ID источника

**Request Body:**
```json
{
  "name": "Обновленное название",
  "description": "Обновленное описание"
}
```

#### DELETE /api/sources/{source_id}
Удалить источник.

**Path Parameters:**
- `source_id` (integer, required): ID источника

**Response:**
```json
{
  "message": "Source deleted successfully"
}
```

### 3. Эксперименты (Experiments)

#### GET /api/experiments/starts
Получить список экспериментов.

**Query Parameters:**
- Стандартные параметры пагинации
- Дополнительно: поиск по связанным объектам

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "id_source": 1,
      "id_source_version": null,
      "id_object": 1,
      "id_object_version": null,
      "id_geometry": 1,
      "id_geometry_version": null,
      "id_report": 1,
      "id_report_version": null,
      "type": "wind_tunnel",
      "mach": 0.8,
      "reynolds_number": 1200000.0,
      "date": "2024-03-15",
      "created_at": "2024-03-15T10:30:00Z",
      "updated_at": "2024-03-15T10:30:00Z"
    }
  ],
  "total": 127,
  "page": 1,
  "page_size": 20,
  "total_pages": 7
}
```

#### GET /api/experiments/starts/{start_id}
Получить эксперимент по ID с дополнительной информацией.

**Path Parameters:**
- `start_id` (integer, required): ID эксперимента

**Response:**
Включает названия связанных объектов.

#### POST /api/experiments/starts
Создать новый эксперимент.

**Request Body:**
```json
{
  "id_source": 1,
  "id_object": 1,
  "id_geometry": 1,
  "id_report": 1,
  "type": "wind_tunnel",
  "mach": 0.8,
  "reynolds_number": 1200000.0,
  "date": "2024-03-15"
}
```

### 4. Аэродинамические данные

#### GET /api/experiments/aerodynamic-data
Получить данные для визуализации.

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `object_id` | integer | Фильтр по объекту |
| `min_mach` | float | Минимальное число Маха |
| `max_mach` | float | Максимальное число Маха |

**Response:**
```json
[
  {
    "start_id": 1,
    "base_id": 1,
    "mach": 0.8,
    "reynolds_number": 1200000.0,
    "alpha_p": 5.0,
    "phi_p": 0.0,
    "cx": 0.18,
    "cy": 0.22,
    "mz": 0.01
  }
]
```

#### GET /api/experiments/statistics
Получить статистику базы данных.

**Response:**
```json
{
  "source": 42,
  "object": 15,
  "geometry": 28,
  "report": 35,
  "start": 127,
  "base": 250,
  "total_adh": 250,
  "top_objects": [
    {
      "name": "Крыло A",
      "experiment_count": 45
    }
  ],
  "mach_range": {
    "min_mach": 0.2,
    "max_mach": 2.0,
    "avg_mach": 0.78
  }
}
```

### 5. Базовые условия (Base)

#### GET /api/experiments/bases/{base_id}
Получить базовые условия по ID.

#### POST /api/experiments/bases
Создать новые базовые условия.

**Request Body:**
```json
{
  "id_start": 1,
  "alpha": 5.0,
  "beta": 0.0,
  "alpha_p": 5.0,
  "phi_p": 0.0
}
```

### 6. Аэродинамические коэффициенты (Total Adh)

#### GET /api/experiments/total-adh/{total_adh_id}
Получить коэффициенты по ID.

#### POST /api/experiments/total-adh
Создать новые коэффициенты.

**Request Body:**
```json
{
  "id_base": 1,
  "cx": 0.18,
  "cy": 0.22,
  "cz": 0.05,
  "cxa": 0.02,
  "cya": 0.03,
  "cza": 0.01,
  "mx": 0.001,
  "my": 0.002,
  "mz": 0.01,
  "k": 1.22
}
```

## Модели данных

### Source (Источник)
```python
class SourceCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    remark: Optional[str] = None
```

### Start (Эксперимент)
```python
class StartCreate(BaseModel):
    id_source: int
    id_source_version: Optional[int] = None
    id_object: int
    id_object_version: Optional[int] = None
    id_geometry: int
    id_geometry_version: Optional[int] = None
    id_report: int
    id_report_version: Optional[int] = None
    type: Optional[str] = Field(None, max_length=45)
    mach: Optional[float] = None
    reynolds_number: Optional[float] = None
    date: Optional[date] = None
```

### Base (Базовые условия)
```python
class BaseCreate(BaseModel):
    id_start: int
    alpha: Optional[float] = None
    beta: Optional[float] = None
    alpha_p: Optional[float] = None
    phi_p: Optional[float] = None
```

### TotalAdh (Аэродинамические коэффициенты)
```python
class TotalAdhCreate(BaseModel):
    id_base: int
    cx: float
    cy: float
    cz: float
    cxa: Optional[float] = None
    cya: Optional[float] = None
    cza: Optional[float] = None
    mx: float
    my: float
    mz: float
    k: float
```

## Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Неверный запрос (валидация данных) |
| 404 | Ресурс не найден |
| 409 | Конфликт (уникальное ограничение) |
| 422 | Ошибка валидации данных |
| 500 | Внутренняя ошибка сервера |

## Примеры использования

### Python (requests)
```python
import requests

BASE_URL = "http://localhost:8000/api"

# Получить список источников
response = requests.get(f"{BASE_URL}/sources", params={"page": 1, "page_size": 10})
sources = response.json()

# Создать новый источник
new_source = {
    "name": "CFD расчет ANSYS",
    "description": "Численное моделирование",
    "remark": "Турбулентная модель SST"
}
response = requests.post(f"{BASE_URL}/sources", json=new_source)
```

### JavaScript (fetch)
```javascript
const API_URL = 'http://localhost:8000/api';

// Получить статистику
fetch(`${API_URL}/experiments/statistics`)
  .then(response => response.json())
  .then(data => console.log(data));

// Создать эксперимент
const experiment = {
  id_source: 1,
  id_object: 1,
  id_geometry: 1,
  id_report: 1,
  mach: 0.8,
  reynolds_number: 1200000
};

fetch(`${API_URL}/experiments/starts`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(experiment)
});
```

## Конфигурация

### Переменные окружения
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aero_db
DB_USER=postgres
DB_PASSWORD=postgres
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Разработка

### Запуск в development режиме
```bash
# Активировать виртуальное окружение
micromamba activate aero_db

# Установить зависимости
pip install -r backend/requirements.txt

# Запустить сервер
cd backend
python main.py
```

### Запуск через Docker
```bash
# Запустить все сервисы
docker-compose -f docker-compose.full.yml up -d

# Остановить все сервисы
docker-compose -f docker-compose.full.yml down
```

## Мониторинг и логи

### Логи приложения
```bash
# Просмотр логов бэкенда
docker logs aero_db_backend -f

# Просмотр логов базы данных
docker logs aero_db_postgres -f
```

### Метрики здоровья
- `GET /health` - общее состояние
- Проверка подключения к БД
- Время работы сервиса

## Безопасность

### Текущие ограничения
1. Нет аутентификации
2. Нет авторизации
3. CORS настроен для development

### Рекомендации для production
1. Реализовать JWT аутентификацию
2. Добавить ролевую модель доступа
3. Настроить HTTPS
4. Ограничить CORS origins
5. Добавить rate limiting
6. Использовать переменные окружения для секретов

## Миграции базы данных
*В текущей версии схема БД инициализируется при первом запуске через SQL скрипт.*

Для production рекомендуется использовать систему миграций (Alembic).

## Производительность

### Оптимизации
1. Асинхронные запросы к БД через asyncpg
2. Пагинация для больших наборов данных
3. Индексы в БД для часто запрашиваемых полей

### Мониторинг
- Время ответа API
- Количество запросов в секунду
- Использование памяти
- Загрузка CPU