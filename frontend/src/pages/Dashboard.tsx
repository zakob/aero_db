import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Table, Typography, Spin } from 'antd'
import {
  DatabaseOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  RocketOutlined
} from '@ant-design/icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { statsService, experimentsService, ExperimentStart } from '../services/api'

const { Title } = Typography

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    sources: 0,
    experiments: 0,
    objects: 0,
    geometries: 0
  })
  const [recentExperiments, setRecentExperiments] = useState<ExperimentStart[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])

  // Загрузка данных для дашборда
  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Загрузка статистики (если есть соответствующий эндпоинт)
      // Пока используем заглушку, можно получить из агрегации других данных
      const experimentsResponse = await experimentsService.getExperiments({ page_size: 1 })
      const sourcesResponse = await experimentsService.getExperiments({ page_size: 1 }) // Заглушка
      
      // Для демонстрации используем приблизительные данные
      setStats({
        sources: 5, // Можно получить из API sources
        experiments: experimentsResponse.total || 0,
        objects: 3, // Можно получить из API объектов
        geometries: 2 // Можно получить из API геометрий
      })

      // Загрузка последних экспериментов
      const recentResponse = await experimentsService.getExperiments({
        page: 1,
        page_size: 5,
        sort_by: 'id',
        sort_order: 'desc'
      })
      setRecentExperiments(recentResponse.items)

      // Загрузка данных для графиков (если есть соответствующий эндпоинт)
      // Пока используем демо-данные
      setPerformanceData([
        { mach: 0.2, cx: 0.05, cy: 0.12, mz: -0.03 },
        { mach: 0.4, cx: 0.08, cy: 0.15, mz: -0.02 },
        { mach: 0.6, cx: 0.12, cy: 0.18, mz: -0.01 },
        { mach: 0.8, cx: 0.18, cy: 0.22, mz: 0.01 },
        { mach: 1.0, cx: 0.25, cy: 0.28, mz: 0.03 },
        { mach: 1.2, cx: 0.32, cy: 0.35, mz: 0.05 }
      ])
    } catch (error) {
      console.error('Ошибка при загрузке данных дашборда:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const experimentColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Объект',
      dataIndex: 'object_name',
      key: 'object',
      render: (text: string) => text || '—'
    },
    {
      title: 'Число Маха',
      dataIndex: 'mach',
      key: 'mach',
      render: (value: number) => value ? value.toFixed(2) : '—'
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => date || '—'
    }
  ]

  return (
    <div>
      <Title level={2}>Дашборд</Title>
      
      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Источников данных"
                value={stats.sources}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Экспериментов"
                value={stats.experiments}
                prefix={<ExperimentOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Объектов"
                value={stats.objects}
                prefix={<RocketOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Геометрий"
                value={stats.geometries}
                prefix={<LineChartOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title="Аэродинамические характеристики (Cx, Cy, Mz)">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="mach" 
                      label={{ value: 'Число Маха', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis 
                      label={{ value: 'Коэффициенты', angle: -90, position: 'insideLeft' }} 
                    />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="cx" 
                      stroke="#1890ff" 
                      name="Cx" 
                      strokeWidth={2} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cy" 
                      stroke="#52c41a" 
                      name="Cy" 
                      strokeWidth={2} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mz" 
                      stroke="#722ed1" 
                      name="Mz" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card title="Последние эксперименты">
              <Table
                dataSource={recentExperiments}
                columns={experimentColumns}
                size="small"
                pagination={false}
                rowKey="id"
              />
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title="Быстрые действия">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" hoverable>
                    <div style={{ textAlign: 'center' }}>
                      <DatabaseOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                      <div style={{ marginTop: 8 }}>Добавить источник</div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" hoverable>
                    <div style={{ textAlign: 'center' }}>
                      <ExperimentOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                      <div style={{ marginTop: 8 }}>Создать эксперимент</div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" hoverable>
                    <div style={{ textAlign: 'center' }}>
                      <LineChartOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                      <div style={{ marginTop: 8 }}>Анализ данных</div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card size="small" hoverable>
                    <div style={{ textAlign: 'center' }}>
                      <RocketOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                      <div style={{ marginTop: 8 }}>Импорт данных</div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default Dashboard