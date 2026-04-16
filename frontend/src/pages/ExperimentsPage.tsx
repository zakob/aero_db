import { useState } from 'react'
import { Table, Card, Typography, Tag, Space, Input, Select, Button } from 'antd'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'

const { Title } = Typography
const { Option } = Select

// Mock data
const mockExperiments = [
  { 
    id: 1, 
    name: 'Эксперимент #1', 
    object: 'Крыло A', 
    source: 'Аэродинамическая труба',
    mach: 0.8,
    reynolds: 1.2e6,
    alpha: 5.0,
    date: '2024-03-15',
    status: 'completed'
  },
  { 
    id: 2, 
    name: 'Эксперимент #2', 
    object: 'Фюзеляж B', 
    source: 'CFD расчет',
    mach: 0.6,
    reynolds: 0.8e6,
    alpha: 3.0,
    date: '2024-03-14',
    status: 'completed'
  },
  { 
    id: 3, 
    name: 'Эксперимент #3', 
    object: 'Крыло A', 
    source: 'Полетные испытания',
    mach: 1.2,
    reynolds: 2.5e6,
    alpha: 2.0,
    date: '2024-03-13',
    status: 'processing'
  },
  { 
    id: 4, 
    name: 'Эксперимент #4', 
    object: 'Хвостовое оперение', 
    source: 'Аэродинамическая труба',
    mach: 0.4,
    reynolds: 0.5e6,
    alpha: 8.0,
    date: '2024-03-12',
    status: 'completed'
  },
  { 
    id: 5, 
    name: 'Эксперимент #5', 
    object: 'Крыло B', 
    source: 'CFD расчет',
    mach: 0.9,
    reynolds: 1.8e6,
    alpha: 4.0,
    date: '2024-03-11',
    status: 'completed'
  }
]

const ExperimentsPage = () => {
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [objectFilter, setObjectFilter] = useState<string | null>(null)

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a: any, b: any) => a.id - b.id
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: 'Объект',
      dataIndex: 'object',
      key: 'object',
      width: 150,
      filters: [
        { text: 'Крыло A', value: 'Крыло A' },
        { text: 'Крыло B', value: 'Крыло B' },
        { text: 'Фюзеляж B', value: 'Фюзеляж B' },
        { text: 'Хвостовое оперение', value: 'Хвостовое оперение' }
      ],
      onFilter: (value: any, record: any) => record.object === value
    },
    {
      title: 'Источник',
      dataIndex: 'source',
      key: 'source',
      width: 180
    },
    {
      title: 'Параметры',
      key: 'parameters',
      render: (_: any, record: any) => (
        <div>
          <div>Mach: <strong>{record.mach}</strong></div>
          <div>Re: <strong>{record.reynolds.toExponential(1)}</strong></div>
          <div>α: <strong>{record.alpha}°</strong></div>
        </div>
      )
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const color = status === 'completed' ? 'green' : 'orange'
        const text = status === 'completed' ? 'Завершен' : 'В обработке'
        return <Tag color={color}>{text}</Tag>
      },
      filters: [
        { text: 'Завершен', value: 'completed' },
        { text: 'В обработке', value: 'processing' }
      ],
      onFilter: (value: any, record: any) => record.status === value
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 100,
      render: () => (
        <Space>
          <Button type="link" size="small">Просмотр</Button>
        </Space>
      )
    }
  ]

  const filteredExperiments = mockExperiments.filter(exp => {
    const matchesSearch = exp.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         exp.object.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = !statusFilter || exp.status === statusFilter
    const matchesObject = !objectFilter || exp.object === objectFilter
    
    return matchesSearch && matchesStatus && matchesObject
  })

  const uniqueObjects = Array.from(new Set(mockExperiments.map(exp => exp.object)))

  return (
    <div>
      <Title level={2}>Эксперименты</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Space>
            <Input
              placeholder="Поиск экспериментов..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            
            <Select
              placeholder="Статус"
              allowClear
              style={{ width: 150 }}
              onChange={setStatusFilter}
            >
              <Option value="completed">Завершен</Option>
              <Option value="processing">В обработке</Option>
            </Select>
            
            <Select
              placeholder="Объект"
              allowClear
              style={{ width: 180 }}
              onChange={setObjectFilter}
            >
              {uniqueObjects.map(obj => (
                <Option key={obj} value={obj}>{obj}</Option>
              ))}
            </Select>
            
            <Button icon={<FilterOutlined />}>
              Фильтры
            </Button>
          </Space>
          
          <Space>
            <Button type="primary">Новый эксперимент</Button>
            <Button>Импорт данных</Button>
          </Space>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredExperiments}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <strong>Всего экспериментов:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <strong>{filteredExperiments.length}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <strong>Завершено:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <Tag color="green">
                    {filteredExperiments.filter(e => e.status === 'completed').length}
                  </Tag>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      <Card title="Статистика экспериментов" style={{ marginTop: 16 }}>
        <Space size="large">
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Среднее число Маха</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>
              {(
                mockExperiments.reduce((sum, exp) => sum + exp.mach, 0) / mockExperiments.length
              ).toFixed(2)}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Диапазон углов атаки</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>
              {Math.min(...mockExperiments.map(e => e.alpha))}° - {Math.max(...mockExperiments.map(e => e.alpha))}°
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Различных объектов</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>
              {uniqueObjects.length}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Источников данных</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>
              {Array.from(new Set(mockExperiments.map(exp => exp.source))).length}
            </div>
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default ExperimentsPage