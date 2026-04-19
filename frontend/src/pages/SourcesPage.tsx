import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, message, Card, Typography, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { sourcesService, Source, SourceCreate, SourceUpdate, SearchParams } from '../services/api'

const { Title } = Typography
const { TextArea } = Input

const SourcesPage = () => {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingSource, setEditingSource] = useState<Source | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  })

  // Загрузка данных с API
  const loadSources = async (page = 1, search = '') => {
    console.log('loadSources called with page:', page, 'search:', search)
    setLoading(true)
    try {
      const params: SearchParams = {
        page,
        page_size: pagination.pageSize,
        search: search || undefined
      }
      console.log('API params:', params)
      
      const response = await sourcesService.getSources(params)
      console.log('API response:', response)
      // Защита от undefined
      const items = Array.isArray(response.items) ? response.items : []
      setSources(items)
      setPagination(prev => ({
        ...prev,
        page,
        total: response.total || 0
      }))
    } catch (error) {
      console.error('Ошибка при загрузке источников:', error)
      message.error('Не удалось загрузить источников данных')
      setSources([]) // Устанавливаем пустой массив при ошибке
    } finally {
      setLoading(false)
    }
  }

  // Первоначальная загрузка
  useEffect(() => {
    loadSources()
  }, [])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '-'
    },
    {
      title: 'Заметка',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (text: string) => text || '-'
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      render: (_: any, record: Source) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
          />
        </Space>
      )
    }
  ]

  const filteredSources = (sources || []).filter(source =>
    (source.name && source.name.toLowerCase().includes(searchText.toLowerCase())) ||
    (source.description && source.description.toLowerCase().includes(searchText.toLowerCase()))
  )

  const handleAdd = () => {
    setEditingSource(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (source: Source) => {
    setEditingSource(source)
    form.setFieldsValue(source)
    setIsModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Удалить источник?',
      content: 'Это действие нельзя отменить.',
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          await sourcesService.deleteSource(id)
          setSources(sources.filter(source => source.id !== id))
          message.success('Источник удален')
        } catch (error) {
          console.error('Ошибка при удалении источника:', error)
          message.error('Не удалось удалить источник')
        }
      }
    })
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      console.log('Form values:', values)
      
      if (editingSource) {
        // Обновление существующего источника
        console.log('Updating source:', editingSource.id, values)
        const updatedSource = await sourcesService.updateSource(editingSource.id, values as SourceUpdate)
        console.log('Update response:', updatedSource)
        setSources(sources.map(source =>
          source.id === editingSource.id ? updatedSource : source
        ))
        message.success('Источник обновлен')
      } else {
        // Добавление нового источника
        console.log('Creating source with data:', values)
        const newSource = await sourcesService.createSource(values as SourceCreate)
        console.log('Create response:', newSource)
        setSources([newSource, ...sources])
        message.success('Источник добавлен')
      }
      
      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      console.error('Ошибка при сохранении источника:', error)
      message.error('Не удалось сохранить источник')
    }
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleTableChange = (pagination: any) => {
    loadSources(pagination.current)
  }

  return (
    <div>
      <Title level={2}>Источники данных</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Input
            placeholder="Поиск источников..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => {
              setSearchText(e.target.value)
              // Можно добавить debounce для поиска по API
            }}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Добавить источник
          </Button>
        </Space>
      </Card>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredSources}
          rowKey="id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} источников`
          }}
          onChange={handleTableChange}
          bordered
        />
      </Spin>

      <Modal
        title={editingSource ? 'Редактировать источник' : 'Добавить источник'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название источника' }]}
          >
            <Input placeholder="Например: Аэродинамическая труба ЦАГИ" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Описание"
          >
            <TextArea rows={3} placeholder="Подробное описание источника данных" />
          </Form.Item>
          
          <Form.Item
            name="remark"
            label="Заметка"
          >
            <TextArea rows={2} placeholder="Дополнительные заметки" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SourcesPage