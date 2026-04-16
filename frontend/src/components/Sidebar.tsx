import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'

const { Sider } = Layout

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Дашборд'
    },
    {
      key: '/sources',
      icon: <DatabaseOutlined />,
      label: 'Источники данных'
    },
    {
      key: '/experiments',
      icon: <ExperimentOutlined />,
      label: 'Эксперименты'
    },
    {
      key: '/visualization',
      icon: <LineChartOutlined />,
      label: 'Визуализация'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Настройки'
    }
  ]
  
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }
  
  return (
    <Sider
      width={250}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0
      }}
    >
      <div style={{ padding: '24px 16px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, color: '#1890ff' }}>AeroDB</h2>
        <p style={{ margin: '8px 0 0', color: '#666', fontSize: '12px' }}>
          Аэродинамическая база данных
        </p>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
      
      <div style={{ padding: '16px', position: 'absolute', bottom: 0, width: '100%' }}>
        <div style={{ 
          background: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: 6,
          padding: 12,
          fontSize: '12px'
        }}>
          <strong>База данных:</strong> aero_db
          <br />
          <strong>Экспериментов:</strong> 127
          <br />
          <strong>Объектов:</strong> 15
        </div>
      </div>
    </Sider>
  )
}

export default Sidebar