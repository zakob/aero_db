import { useState, useEffect } from 'react'
import { Card, Row, Col, Select, Slider, Typography, Button, Space, Spin } from 'antd'
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons'
import { experimentsService, ExperimentStart } from '../services/api'

const { Title } = Typography
const { Option } = Select

// Демо-данные для визуализации (используются, если нет реальных данных)
const demoMachData = [
  { mach: 0.2, cx: 0.05, cy: 0.12, mz: -0.03 },
  { mach: 0.4, cx: 0.08, cy: 0.15, mz: -0.02 },
  { mach: 0.6, cx: 0.12, cy: 0.18, mz: -0.01 },
  { mach: 0.8, cx: 0.18, cy: 0.22, mz: 0.01 },
  { mach: 1.0, cx: 0.25, cy: 0.28, mz: 0.03 },
  { mach: 1.2, cx: 0.32, cy: 0.35, mz: 0.05 }
]

const demoAlphaData = [
  { alpha: -5, cx: 0.10, cy: -0.15 },
  { alpha: 0, cx: 0.12, cy: 0.02 },
  { alpha: 5, cx: 0.18, cy: 0.22 },
  { alpha: 10, cx: 0.28, cy: 0.45 },
  { alpha: 15, cx: 0.42, cy: 0.68 },
  { alpha: 20, cx: 0.58, cy: 0.85 }
]

const demoObjectComparison = [
  { object: 'Крыло A', cx: 0.18, cy: 0.22, efficiency: 1.22 },
  { object: 'Крыло B', cx: 0.15, cy: 0.20, efficiency: 1.33 },
  { object: 'Крыло C', cx: 0.22, cy: 0.25, efficiency: 1.14 },
  { object: 'Профиль NACA', cx: 0.12, cy: 0.18, efficiency: 1.50 }
]

const demoPressureDistribution = [
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
  const [loading, setLoading] = useState(false)
  const [experiments, setExperiments] = useState<ExperimentStart[]>([])
  const [chartType, setChartType] = useState('mach')

  // Загрузка экспериментов для визуализации
  const loadExperimentsForVisualization = async () => {
    setLoading(true)
    try {
      const response = await experimentsService.getExperiments({
        page: 1,
        page_size: 100, // Получаем больше данных для визуализации
        sort_by: 'mach',
        sort_order: 'asc'
      })
      setExperiments(response.items)
    } catch (error) {
      console.error('Ошибка при загрузке данных для визуализации:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExperimentsForVisualization()
  }, [])

  // Преобразование реальных данных экспериментов в формат для графиков
  const getRealMachData = () => {
    if (experiments.length === 0) return demoMachData
    
    return experiments
      .filter(exp => exp.mach !== null && exp.mach !== undefined)
      .sort((a, b) => (a.mach || 0) - (b.mach || 0))
      .map(exp => ({
        mach: exp.mach || 0,
        cx: exp.mach ? exp.mach * 0.2 + 0.05 : 0, // Заглушка - в реальном приложении нужно использовать реальные коэффициенты
        cy: exp.mach ? exp.mach * 0.15 + 0.1 : 0,
        mz: exp.mach ? exp.mach * 0.05 - 0.03 : 0
      }))
  }

  const getRealAlphaData = () => {
    if (experiments.length === 0) return demoAlphaData
    
    return experiments
      .filter(exp => exp.alpha !== null && exp.alpha !== undefined)
      .sort((a, b) => (a.alpha || 0) - (b.alpha || 0))
      .map(exp => ({
        alpha: exp.alpha || 0,
        cx: exp.alpha ? Math.abs(exp.alpha) * 0.02 + 0.1 : 0,
        cy: exp.alpha ? Math.abs(exp.alpha) * 0.03 + 0.1 : 0
      }))
  }

  const getRealObjectComparison = () => {
    if (experiments.length === 0) return demoObjectComparison
    
    // Группировка по объектам
    const objectsMap = new Map()
    experiments.forEach(exp => {
      if (exp.object_name) {
        if (!objectsMap.has(exp.object_name)) {
          objectsMap.set(exp.object_name, {
            object: exp.object_name,
            cx: 0,
            cy: 0,
            count: 0
          })
        }
        const obj = objectsMap.get(exp.object_name)
        obj.cx += exp.mach ? exp.mach * 0.2 + 0.05 : 0.15
        obj.cy += exp.mach ? exp.mach * 0.15 + 0.1 : 0.12
        obj.count += 1
      }
    })
    
    return Array.from(objectsMap.values()).map(obj => ({
      object: obj.object,
      cx: obj.cx / obj.count,
      cy: obj.cy / obj.count,
      efficiency: (obj.cy / obj.count) / (obj.cx / obj.count) || 1.0
    }))
  }

  const filteredMachData = getRealMachData().filter(
    d => d.mach >= machRange[0] && d.mach <= machRange[1]
  )

  const filteredAlphaData = getRealAlphaData().filter(
    d => d.alpha >= alphaRange[0] && d.alpha <= alphaRange[1]
  )

  const objectComparison = getRealObjectComparison()

  const handleDownload = () => {
    // В реальном приложении здесь был бы экспорт данных
    alert('Функция экспорта данных будет реализована в следующей версии')
  }

  const handleReset = () => {
    setMachRange([0.2, 1.2])
    setAlphaRange([-5, 20])
    setSelectedObject('Крыло A')
  }

  const handleRefresh = () => {
    loadExperimentsForVisualization()
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
            <Space direction="vertical">
              <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                Экспорт
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                Обновить
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
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
                      name="Cx" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cy" 
                      stroke="#52c41a" 
                      name="Cy" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mz" 
                      stroke="#722ed1" 
                      name="Mz" 
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
                      label={{ value: 'Коэффициент сопротивления Cx', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="cy" 
                      name="Cy" 
                      label={{ value: 'Коэффициент подъемной силы Cy', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter 
                      name="Экспериментальные точки" 
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
                    <Bar dataKey="efficiency" name="Эффективность (Cy/Cx)" fill="#52c41a" />
                    <Bar dataKey="cx" name="Cx" fill="#1890ff" />
                    <Bar dataKey="cy" name="Cy" fill="#722ed1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Распределение давления по хорде">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demoPressureDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="x" 
                      label={{ value: 'Относительная хорда x/c', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Коэффициент давления Cp', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="cp" 
                      stroke="#1890ff" 
                      name="Коэффициент давления" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
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
              <div>
                <h4>Анализ поляры</h4>
                <p>
                  Поляра крыла показывает зависимость коэффициента подъемной силы Cy 
                  от коэффициента сопротивления Cx. Идеальная поляра имеет минимальный Cx 
                  при максимальном Cy.
                </p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <h4>Влияние числа Маха</h4>
                <p>
                  С увеличением числа Маха коэффициенты Cx и Cy обычно возрастают 
                  из-за сжимаемости воздуха. Критическое число Маха определяет 
                  начало волнового кризиса.
                </p>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <h4>Эффективность объектов</h4>
                <p>
                  Отношение Cy/Cx характеризует аэродинамическое качество. 
                  Более высокие значения указывают на лучшую эффективность 
                  объекта при заданных условиях.
                </p>
              </div>
            </Col>
          </Row>
        </Card>
      </Spin>
    </div>
  )
}

export default VisualizationPage