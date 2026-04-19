import axios from 'axios';

// Базовый URL API берется из переменной окружения
// Если VITE_API_URL не установлен, используем пустую строку (относительные пути)
// Vite dev server будет проксировать запросы через vite.config.ts
const API_URL = import.meta.env.VITE_API_URL || '';

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд таймаут
});

// Добавляем перехватчики для логирования
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data ? { data: config.data } : '');
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Интерфейсы для типизации данных
export interface Source {
  id: number;
  name: string;
  description?: string;
  remark?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SourceCreate {
  name: string;
  description?: string;
  remark?: string;
}

export interface SourceUpdate {
  name?: string;
  description?: string;
  remark?: string;
}

export interface ExperimentStart {
  id: number;
  name: string;
  id_source?: number;
  id_object?: number;
  id_geometry?: number;
  id_report?: number;
  mach?: number;
  reynolds?: number;
  alpha?: number;
  date?: string;
  status?: string;
  source_name?: string;
  object_name?: string;
  geometry_name?: string;
  report_name?: string;
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
  sort_order?: 'asc' | 'desc';
}

// Сервис для работы с источниками (sources)
export const sourcesService = {
  // Получить список источников с пагинацией
  async getSources(params: SearchParams = {}): Promise<PaginatedResponse<Source>> {
    const response = await api.get('/api/sources/', { params });
    return response.data;
  },

  // Получить источник по ID
  async getSource(id: number): Promise<Source> {
    const response = await api.get(`/api/sources/${id}`);
    return response.data;
  },

  // Создать новый источник
  async createSource(data: SourceCreate): Promise<Source> {
    const response = await api.post('/api/sources/', data);
    return response.data;
  },

  // Обновить источник
  async updateSource(id: number, data: SourceUpdate): Promise<Source> {
    const response = await api.put(`/api/sources/${id}`, data);
    return response.data;
  },

  // Удалить источник
  async deleteSource(id: number): Promise<void> {
    await api.delete(`/api/sources/${id}`);
  },
};

// Сервис для работы с экспериментами (experiments)
export const experimentsService = {
  // Получить список экспериментов (starts) с пагинацией
  async getExperiments(params: SearchParams = {}): Promise<PaginatedResponse<ExperimentStart>> {
    const response = await api.get('/api/experiments/starts', { params });
    return response.data;
  },

  // Получить эксперимент по ID
  async getExperiment(id: number): Promise<ExperimentStart> {
    const response = await api.get(`/api/experiments/starts/${id}`);
    return response.data;
  },

  // Создать новый эксперимент
  async createExperiment(data: any): Promise<ExperimentStart> {
    const response = await api.post('/api/experiments/starts', data);
    return response.data;
  },

  // Обновить эксперимент
  async updateExperiment(id: number, data: any): Promise<ExperimentStart> {
    const response = await api.put(`/api/experiments/starts/${id}`, data);
    return response.data;
  },

  // Удалить эксперимент
  async deleteExperiment(id: number): Promise<void> {
    await api.delete(`/api/experiments/starts/${id}`);
  },

  // Получить аэродинамические данные для визуализации
  async getAerodynamicData(params: {
    object_id?: number;
    mach_min?: number;
    mach_max?: number;
    alpha_min?: number;
    alpha_max?: number;
  } = {}): Promise<any[]> {
    const response = await api.get('/api/experiments/aerodynamic-data', { params });
    return response.data;
  },
};

// Сервис для работы со статистикой
export const statsService = {
  // Получить общую статистику
  async getDashboardStats(): Promise<{
    sources: number;
    experiments: number;
    objects: number;
    geometries: number;
  }> {
    const response = await api.get('/stats/dashboard');
    return response.data;
  },

  // Получить последние эксперименты
  async getRecentExperiments(limit: number = 5): Promise<ExperimentStart[]> {
    const response = await api.get('/stats/recent-experiments', { params: { limit } });
    return response.data;
  },

  // Получить данные для графиков производительности
  async getPerformanceData(objectId?: number): Promise<any[]> {
    const response = await api.get('/stats/performance-data', { 
      params: { object_id: objectId } 
    });
    return response.data;
  },
};

// Экспортируем экземпляр axios для кастомных запросов
export default api;