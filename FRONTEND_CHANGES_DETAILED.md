# Детальное описание изменений фронтенда: было vs стало

## 1. Создание сервиса API

### Было: Отсутствовал централизованный сервис API
Каждая страница использовала мокированные данные:

```typescript
// Пример из SourcesPage.tsx (было)
const mockSources: Source[] = [
  { id: 1, name: 'Источник 1', description: 'Описание 1', remark: '' },
  // ...
];
```

### Стало: Создан сервис `api.ts` с полной типизацией
**Файл:** `frontend/src/services/api.ts`

```typescript
// Базовый клиент с интерцепторами
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Интерцепторы для логирования
api.interceptors.request.use((config) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Типизированные сервисы
export const sourcesService = {
  async getSources(params: SearchParams = {}): Promise<PaginatedResponse<Source>> {
    const response = await api.get('/api/sources/', { params });
    return response.data;
  },
  
  async createSource(data: SourceCreate): Promise<Source> {
    const response = await api.post('/api/sources/', data);
    return response.data;
  },
  // ... остальные методы
};
```

## 2. Интеграция SourcesPage

### Было: Статические мокированные данные
```typescript
const SourcesPage = () => {
  const [sources, setSources] = useState<Source[]>(mockSources);
  // Вся логика работала с локальными данными
};
```

### Стало: Полная интеграция с API
```typescript
const SourcesPage = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSources = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await sourcesService.getSources({
        page,
        page_size: 10,
        search,
      });
      // Защита от undefined
      const items = Array.isArray(response.items) ? response.items : [];
      setSources(items);
      setPagination({
        current: response.page,
        pageSize: response.page_size,
        total: response.total,
      });
    } catch (error) {
      message.error('Ошибка загрузки источников');
    } finally {
      setLoading(false);
    }
  };

  // CRUD операции
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingSource) {
        await sourcesService.updateSource(editingSource.id, values);
        message.success('Источник обновлен');
      } else {
        await sourcesService.createSource(values);
        message.success('Источник создан');
      }
      loadSources();
      setModalVisible(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };
};
```

## 3. Интеграция Dashboard

### Было: Статические метрики
```typescript
const Dashboard = () => {
  const stats = {
    totalExperiments: 127,
    totalObjects: 15,
    totalSources: 8,
    successRate: '94%',
  };
  // Графики использовали сгенерированные данные
  const performanceData = generateMockPerformanceData();
};
```

### Стало: Динамические данные из API
```typescript
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalExperiments: 0,
    totalObjects: 0,
    totalSources: 0,
    successRate: '0%',
  });
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Загрузка статистики
      const statsData = await statsService.getDashboardStats();
      setStats(statsData);
      
      // Загрузка данных для графиков
      const perfData = await statsService.getPerformanceData();
      setPerformanceData(perfData);
      
      // Загрузка последних экспериментов
      const recentExps = await statsService.getRecentExperiments(5);
      setRecentExperiments(recentExps);
    } catch (error) {
      message.error('Ошибка загрузки данных дашборда');
    } finally {
      setLoading(false);
    }
  };
};
```

## 4. Исправление ошибки "Cannot read properties of undefined"

### Было: Уязвимый код без проверок
```typescript
const filteredSources = sources.filter(source =>
  source.name.toLowerCase().includes(search.toLowerCase())
);
```

### Стало: Защищенный код с проверками
```typescript
// Защита от undefined при фильтрации
const filteredSources = (sources || []).filter(source =>
  source.name?.toLowerCase().includes(search.toLowerCase())
);

// Защита при установке состояния
const items = Array.isArray(response.items) ? response.items : [];
setSources(items);

// Защита в рендеринге таблицы
<Table
  dataSource={filteredSources}
  rowKey="id"
  columns={[
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text || '-', // Защита от пустых значений
    },
  ]}
/>
```

## 5. Исправление UI Layout (Sidebar)

### Было: Фиксированный Sidebar с проблемами перекрытия
```typescript
// Sidebar.tsx (было)
<Sider
  width={250}
  style={{
    background: '#fff',
    borderRight: '1px solid #f0f0f0',
    overflow: 'auto',
    height: '100vh',
    position: 'fixed', // Проблема: перекрывает контент
    left: 0,
    top: 0,
    bottom: 0
  }}
>
```

### Стало: Sidebar как часть flex-раскладки
```typescript
// Sidebar.tsx (стало)
<Sider
  width={250}
  style={{
    background: '#fff',
    borderRight: '1px solid #f0f0f0',
    overflow: 'auto',
    height: '100vh' // Убраны position: fixed, left, top, bottom
  }}
>
```

### Было: App.tsx с ручным margin
```typescript
// App.tsx (было)
<Layout style={{ minHeight: '100vh' }}>
  <Sidebar />
  <Layout style={{ marginLeft: 250 }}> {/* Ручной отступ */}
    <Header>...</Header>
    <Content>...</Content>
  </Layout>
</Layout>
```

### Стало: Естественная flex-раскладка
```typescript
// App.tsx (стало)
<Layout style={{ minHeight: '100vh' }}>
  <Sidebar />
  <Layout> {/* Убран marginLeft */}
    <Header>...</Header>
    <Content>...</Content>
  </Layout>
</Layout>
```

## 6. Исправление CSS конфликтов

### Было: Конфликтующее CSS правило
```css
/* App.css (было) */
.ant-layout-content {
  margin-left: 250px !important; /* Создавало двойной отступ */
  transition: margin-left 0.2s;
}
```

### Стало: Закомментированное правило
```css
/* App.css (стало) */
/* .ant-layout-content {
  margin-left: 250px !important;
  transition: margin-left 0.2s;
} */
```

## 7. Настройка Vite Proxy

### Было: Прямые запросы к localhost:8000
```typescript
// Проблема: браузер не мог разрешить 'backend' на хосте
const API_URL = 'http://backend:8000';
```

### Стало: Прокси через Vite
```typescript
// api.ts
const API_URL = import.meta.env.VITE_API_URL || ''; // Пустая строка для относительных путей

// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://backend:8000', // Прокси внутри Docker сети
        changeOrigin: true,
      },
    },
  },
});
```

## 8. Добавление логирования запросов

### Было: Без логирования
```typescript
// Запросы выполнялись без отладки
const response = await axios.get('/api/sources/');
```

### Стало: Детальное логирование
```typescript
// api.ts - интерцепторы
api.interceptors.request.use((config) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  console.log('[API Request Data]', config.data);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API Error]', error.response?.status, error.config?.url);
    console.error('[API Error Data]', error.response?.data);
    return Promise.reject(error);
  }
);
```

## 9. Обработка ошибок и состояния загрузки

### Было: Минимальная обработка ошибок
```typescript
try {
  const response = await axios.get('/api/sources/');
  setSources(response.data);
} catch (error) {
  console.error(error);
}
```

### Стало: Полноценная обработка
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const loadData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await sourcesService.getSources();
    setSources(response.items);
  } catch (err: any) {
    setError(err.message || 'Ошибка загрузки данных');
    message.error('Не удалось загрузить данные');
    
    // Специфичная обработка ошибок
    if (err.response?.status === 404) {
      message.warning('Данные не найдены');
    } else if (err.response?.status === 500) {
      message.error('Внутренняя ошибка сервера');
    }
  } finally {
    setLoading(false);
  }
};
```

## 10. Типизация данных

### Было: Слабая типизация
```typescript
interface Source {
  id: number;
  name: string;
  // Остальные поля могли отсутствовать
}
```

### Стало: Полная типизация с учетом API
```typescript
// Соответствует бэкенд-моделям
export interface Source {
  id: number;
  name: string;
  description: string;
  remark?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SearchParams {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}
```

## Итоговые изменения файлов фронтенда

### Созданы новые файлы:
1. `frontend/src/services/api.ts` - централизованный сервис API

### Изменены существующие файлы:
1. `frontend/src/pages/SourcesPage.tsx` - полная интеграция с API
2. `frontend/src/pages/ExperimentsPage.tsx` - интеграция с API
3. `frontend/src/pages/Dashboard.tsx` - динамические данные
4. `frontend/src/pages/VisualizationPage.tsx` - реальные данные визуализации
5. `frontend/src/components/Sidebar.tsx` - исправление layout
6. `frontend/src/App.tsx` - обновление структуры Layout
7. `frontend/src/App.css` - исправление CSS конфликтов
8. `frontend/vite.config.ts` - настройка прокси

### Ключевые улучшения:
1. **Полная замена моков на реальные данные** - все 4 основные страницы
2. **Централизованная обработка API** - единый сервис с типизацией
3. **Надежная обработка ошибок** - интерцепторы, try/catch, user feedback
4. **Исправление UI проблем** - sidebar layout, отступы, перекрытия
5. **Улучшенная отладка** - логирование всех запросов/ответов
6. **Защита от runtime ошибок** - проверки на undefined, fallback значения
7. **Производительность** - пагинация, кэширование, оптимизированные запросы

## Результат

### До:
- Статические данные, не обновляющиеся
- Нет связи с бэкендом
- UI проблемы с layout
- Слабая обработка ошибок
- Сложность отладки

### После:
- Динамические данные в реальном времени
- Полная интеграция с REST API
- Корректный responsive layout
- Надежная обработка ошибок
- Детальное логирование для отладки
- Типобезопасность TypeScript