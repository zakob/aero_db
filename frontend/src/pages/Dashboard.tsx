import { Row, Col, Card, Statistic, Table, Typography } from 'antd'
import {
  DatabaseOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  RocketOutlined
} from '@ant-design/icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const { Title } = Typography

// Mock data for demonstration
const mockStats = {
  sources: 42,
  experiments: 127,
  objects: 15,
  geometries: 28
}

const recentExperiments = [
  { id: 1, name: 'Test #1', object: 'Wing A', mach: 0.8, date: '2024-03-15' },
  { id: 2, name: 'Test #2', object: 'Fuselage B', mach: 0.6, date: '2024-03-14' },
  { id: 3, name: 'Test #3', object: 'Wing A', mach: 1.2, date: '2024-03-13' },
  { id: 4, name: 'Test #4', object: 'Tail C', mach: 0.4, date: '2024-03-12' },
  { id: 5, name: 'Test #5', object: 'Wing B', mach: 0.9, date: '2024-03-11' }
]

const performanceData = [
  { mach: 0.2, cx: 0.05, cy: 0.12, mz: -0.03 },
  { mach: 0.4, cx: 0.08, cy: 0.15, mz: -0.02 },
  { mach: 0.6, cx: 0.12, cy: 0.18, mz: -0.01 },
  { mach: 0.8, cx: 0.18, cy: 0.22, mz: 0.01 },
  { mach: 1.0, cx: 0.25, cy: 0.28, mz: 0.03 },
  { mach: 1.2, cx: 0.32, cy: 0.35, mz: 0.05 }
]

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
    dataIndex: 'object',
    key: 'object'
  },
  {
    title: 'Число Маха',
    dataIndex: 'mach',
    key: 'mach'
  },
  {
    title: 'Дата',
    dataIndex: 'date',
    key: 'date'
  }
]

const Dashboard = () => {
  return (
    <div>
      <Title level={2}>Дашборд</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Источников данных"
              value={mockStats.sources}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Экспериментов"
              value={mockStats.experiments}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Объектов"
              value={mockStats.objects}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Геометрий"
              value={mockStats.geometries}
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
                  <XAxis dataKey="mach" label={{ value: 'Число Маха', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Коэффициенты', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cx" stroke="#1890ff" name="Cx" strokeWidth={2} />
                  <Line type="monotone" dataKey="cy" stroke="#52c41a" name="Cy" strokeWidth={2} />
                  <Line type="monotone" dataKey="mz" stroke="#722ed1" name="Mz" strokeWidth={2} />
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
    </div>
  )
}

export default Dashboard