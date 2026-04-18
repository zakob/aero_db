import { useState } from 'react'
import { Card, Row, Col, Select, Slider, Typography, Button, Space } from 'antd'
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons'

const { Title } = Typography
const { Option } = Select

// Mock data for visualization
const machData = [
  { mach: 0.2, cx: 0.05, cy: 0.12, mz: -0.03 },
  { mach: 0.4, cx: 0.08, cy: 0.15, mz: -0.02 },
  { mach: 0.6, cx: 0.12, cy: 0.18, mz: -0.01 },
  { mach: 0.8, cx: 0.18, cy: 0.22, mz: 0.01 },
  { mach: 1.0, cx: 0.25, cy: 0.28, mz: 0.03 },
  { mach: 1.2, cx: 0.32, cy: 0.35, mz: 0.05 }
]

const alphaData = [
  { alpha: -5, cx: 0.10, cy: -0.15 },
  { alpha: 0, cx: 0.12, cy: 0.02 },
  { alpha: 5, cx: 0.18, cy: 0.22 },
  { alpha: 10, cx: 0.28, cy: 0.45 },
  { alpha: 15, cx: 0.42, cy: 0.68 },
  { alpha: 20, cx: 0.58, cy: 0.85 }
]

const objectComparison = [
  { object: 'Крыло A', cx: 0.18, cy: 0.22, efficiency: 1.22 },
  { object: 'Крыло B', cx: 0.15, cy: 0.20, efficiency: 1.33 },
  { object: 'Крыло C', cx: 0.22, cy: 0.25, efficiency: 1.14 },
  { object: 'Профиль NACA', cx: 0.12, cy: 0.18, efficiency: 1.50 }
]

const pressureDistribution = [
  { x: 0.0, cp: 1.0 },
  { x: 0.1, cp: 0.8 },
  { x: 0.2, cp: 0.5 },
  { x: 0.3, cp: 0.2 },
  { x: 0.4, cp: -0.1 },
  { x: 0.5, cp: -0.3 },
  { x: 0.6, cp: -0.5 },
  { x: 0.7, cp: -0.4 },
  { x: 0.8, cp: -0.2 },
  { x: 0.9, cp: 0.1 },
  { x: 1.0, cp: 0.3 }
]

const VisualizationPage = () => {
  const [selectedObject, setSelectedObject] = useState('Крыло A')
  const [machRange, setMachRange] = useState([0.2, 1.2])
  const [alphaRange, setAlphaRange] = useState([-5, 20])
  const [_chartType, _setChartType] = useState('mach')

  const filteredMachData = machData.filter(
    d => d.mach >= machRange[0] && d.mach <= machRange[1]
  )

  const filteredAlphaData = alphaData.filter(
    d => d.alpha >= alphaRange[0] && d.alpha <= alphaRange[1]
  )

  const handleDownload = () => {
    // In a real app, this would generate and download a file
    alert('Функция экспорта данных будет реализована в следующей версии')
  }

  const handleReset = () => {
    setMachRange([0.2, 1.2])
    setAlphaRange([-5, 20])
    setSelectedObject('Крыло A')
  }

  return (
    <div>
      <Title level={2}>Визуализация аэродинамических данных</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <div>
              <div style={{ marginBottom: 8 }}>Объект:</div>
              <Select
                value={selectedObject}
                onChange={setSelectedObject}
                style={{ width: '100%' }}
              >
                <Option value="Крыло A">Крыло A</Option>
                <Option value="Крыло B">Крыло B</Option>
                <Option value="Крыло C">Крыло C</Option>
                <Option value="Профиль NACA">Профиль NACA</Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} md={8}>
            <div>
              <div style={{ marginBottom: 8 }}>
                Диапазон чисел Маха: {machRange[0]} - {machRange[1]}
              </div>
              <Slider
                range
                min={0}
                max={2}
                step={0.1}
                value={machRange}
                onChange={setMachRange}
                marks={{ 0: '0', 0.5: '0.5', 1: '1.0', 1.5: '1.5', 2: '2.0' }}
              />
            </div>
          </Col>
          
          <Col xs={24} md={8}>
            <div>
              <div style={{ marginBottom: 8 }}>
                Диапазон углов атаки: {alphaRange[0]}° - {alphaRange[1]}°
              </div>
              <Slider
                range
                min={-10}
                max={30}
                step={1}
                value={alphaRange}
                onChange={setAlphaRange}
                marks={{ '-10': '-10°', 0: '0°', 10: '10°', 20: '20°', 30: '30°' }}
              />
            </div>
          </Col>
          
          <Col xs={24} md={2}>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                Экспорт
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Сброс
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Зависимость коэффициентов от числа Маха">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredMachData}>
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
                    name="Cx (лобовое сопротивление)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cy" 
                    stroke="#52c41a" 
                    name="Cy (подъемная сила)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mz" 
                    stroke="#722ed1" 
                    name="Mz (момент крена)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Поляра крыла (Cx vs Cy)">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="cx" 
                    name="Cx"
                    label={{ value: 'Коэффициент лобового сопротивления', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="cy" 
                    name="Cy"
                    label={{ value: 'Коэффициент подъемной силы', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter 
                    name="Зависимость Cx(Cy)" 
                    data={filteredAlphaData} 
                    fill="#1890ff" 
                    shape="circle"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Сравнение эффективности объектов">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={objectComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="object" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cx" name="Cx" fill="#1890ff" />
                  <Bar dataKey="cy" name="Cy" fill="#52c41a" />
                  <Bar dataKey="efficiency" name="Аэродинамическое качество" fill="#722ed1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Распределение давления по хорде">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pressureDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="x" 
                    label={{ value: 'Относительная хорда (x/c)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Коэффициент давления Cp', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cp" 
                    stroke="#fa8c16" 
                    name="Коэффициент давления" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="x" 
                    stroke="transparent" 
                    name="Нулевая линия"
                    strokeWidth={0}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Интерпретация результатов" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div style={{ padding: 16, background: '#f6ffed', borderRadius: 8 }}>
              <h4 style={{ marginTop: 0 }}>📈 Анализ трендов</h4>
              <p>С увеличением числа Маха наблюдается рост всех аэродинамических коэффициентов.</p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ padding: 16, background: '#fff7e6', borderRadius: 8 }}>
              <h4 style={{ marginTop: 0 }}>⚡ Оптимальные параметры</h4>
              <p>Максимальное аэродинамическое качество достигается при Mach = 0.6-0.8.</p>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ padding: 16, background: '#e6f7ff', borderRadius: 8 }}>
              <h4 style={{ marginTop: 0 }}>🎯 Рекомендации</h4>
              <p>Для повышения эффективности рекомендуется использовать профиль NACA.</p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default VisualizationPage