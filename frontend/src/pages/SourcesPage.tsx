import { useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, message, Card, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'

const { Title } = Typography
const { TextArea } = Input

// Mock data
const mockSources = [
  { id: 1, name: 'Аэродинамическая труба ЦАГИ', description: 'Основная аэродинамическая труба', remark: 'Высокоточные измерения' },
  { id: 2, name: 'CFD расчеты ANSYS', description: 'Численное моделирование', remark: 'Турбулентная модель SST' },
  { id: 3, name: 'Полетные испытания', description: 'Натурные испытания', remark: 'Самолет Ан-2' },
  { id: 4, name: 'Ветровой туннель МАИ', description: 'Учебная установка', remark: 'Малые скорости' },
  { id: 5, name: 'База данных NASA', description: 'Открытые данные', remark: 'Аэродинамические профили' }
]

const SourcesPage = () => {
  const [sources, setSources] = useState(mockSources)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingSource, setEditingSource] = useState<any>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')

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
      ellipsis: true
    },
    {
      title: 'Заметка',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => (
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

  const filteredSources = sources.filter(source =>
    source.name.toLowerCase().includes(searchText.toLowerCase()) ||
    source.description.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleAdd = () => {
    setEditingSource(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (source: any) => {
    setEditingSource(source)
    form.setFieldsValue(source)
    setIsModalVisible(true)
  }

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Удалить источник?',
      content: 'Это действие нельзя отменить.',
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: () => {
        setSources(sources.filter(source => source.id !== id))
        message.success('Источник удален')
      }
    })
  }

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingSource) {
        // Update existing source
        setSources(sources.map(source => 
          source.id === editingSource.id ? { ...source, ...values } : source
        ))
        message.success('Источник обновлен')
      } else {
        // Add new source
        const newSource = {
          id: Math.max(...sources.map(s => s.id)) + 1,
          ...values
        }
        setSources([...sources, newSource])
        message.success('Источник добавлен')
      }
      setIsModalVisible(false)
      form.resetFields()
    })
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
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
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Добавить источник
          </Button>
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredSources}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
      />

      <Modal
        title={editingSource ? 'Редактировать источник' : 'Добавить источник'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
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