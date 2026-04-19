import { useState, useEffect } from 'react'
import { Table, Card, Typography, Tag, Space, Input, Select, Button, Spin } from 'antd'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'
import { experimentsService, ExperimentStart, SearchParams } from '../services/api'

const { Title } = Typography
const { Option } = Select

const ExperimentsPage = () => {
  const [experiments, setExperiments] = useState<ExperimentStart[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [objectFilter, setObjectFilter] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  })

  // Загрузка данных с API
  const loadExperiments = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const params: SearchParams = {
        page,
        page_size: pagination.pageSize,
        search: search || undefined,
        sort_by: 'id',
        sort_order: 'desc'
      }
      
      const response = await experimentsService.getExperiments(params)
      setExperiments(response.items)
      setPagination(prev => ({
        ...prev,
        page,
        total: response.total
      }))
    } catch (error) {
      console.error('Ошибка при загрузке экспериментов:', error)
    } finally {
      setLoading(false)
    }
  }

  // Первоначальная загрузка
  useEffect(() => {
    loadExperiments()
  }, [])

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
      dataIndex: 'object_name',
      key: 'object',
      width: 150,
      filters: [
        { text: 'Крыло A', value: 'Крыло A' },
        { text: 'Крыло B', value: 'Крыло B' },
        { text: 'Фюзеляж B', value: 'Фюзеляж B' },
        { text: 'Хвостовое оперение', value: 'Хвостовое оперение' }
      ],
      onFilter: (value: any, record: any) => record.object_name === value,
      render: (text: string) => text || 'Не указан'
    },
    {
      title: 'Источник',
      dataIndex: 'source_name',
      key: 'source',
      width: 180,
      render: (text: string) => text || 'Не указан'
    },
    {
      title: 'Параметры',
      key: 'parameters',
      render: (_: any, record: ExperimentStart) => (
        <div>
          <div>Mach: <strong>{record.mach || '—'}</strong></div>
          <div>Re: <strong>{record.reynolds ? record.reynolds.toExponential(1) : '—'}</strong></div>
          <div>α: <strong>{record.alpha ? `${record.alpha}°` : '—'}</strong></div>
        </div>
      )
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        if (!status) return <Tag>Не указан</Tag>
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
      sorter: (a: any, b: any) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime(),
      render: (date: string) => date || '—'
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

  // Фильтрация на клиенте (можно переделать на серверную фильтрацию)
  const filteredExperiments = experiments.filter(exp => {
    const matchesSearch = exp.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                         exp.object_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                         exp.source_name?.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = !statusFilter || exp.status === statusFilter
    const matchesObject = !objectFilter || exp.object_name === objectFilter
    
    return matchesSearch && matchesStatus && matchesObject
  })

  const uniqueObjects = Array.from(new Set(experiments
    .map(exp => exp.object_name)
    .filter(Boolean)
  ))

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    // Здесь можно добавить серверную сортировку и фильтрацию
    if (pagination.current !== pagination.page) {
      loadExperiments(pagination.current)
    }
  }

  const handleSearch = () => {
    loadExperiments(1, searchText)
  }

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
              onPressEnter={handleSearch}
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
            
            <Button icon={<FilterOutlined />} onClick={handleSearch}>
              Поиск
            </Button>
          </Space>
          
          <Space>
            <Button type="primary">Новый эксперимент</Button>
            <Button>Импорт данных</Button>
          </Space>
        </Space>
      </Card>

      <Spin spinning={loading}>
        <Card>
          <Table
            columns={columns}
            dataSource={filteredExperiments}
            rowKey="id"
            pagination={{
              current: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} экспериментов`
            }}
            onChange={handleTableChange}
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
      </Spin>

      <Card title="Статистика экспериментов" style={{ marginTop: 16 }}>
        <Space size="large">
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Всего экспериментов</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>
              {experiments.length}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Среднее число Маха</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>
              {experiments.length > 0 
                ? (experiments.reduce((sum, exp) => sum + (exp.mach || 0), 0) / experiments.length).toFixed(2)
                : '0.00'
              }
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Диапазон углов атаки</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>
              {experiments.length > 0
                ? `${Math.min(...experiments.map(e => e.alpha || 0))}° - ${Math.max(...experiments.map(e => e.alpha || 0))}°`
                : '—'
              }
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
              {Array.from(new Set(experiments.map(exp => exp.source_name).filter(Boolean))).length}
            </div>
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default ExperimentsPage