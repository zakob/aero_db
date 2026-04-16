import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import SourcesPage from './pages/SourcesPage'
import ExperimentsPage from './pages/ExperimentsPage'
import VisualizationPage from './pages/VisualizationPage'
import './App.css'

const { Header, Content, Footer } = Layout

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout>
          <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
            <h2 style={{ margin: 0 }}>Аэродинамическая база данных</h2>
          </Header>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sources" element={<SourcesPage />} />
              <Route path="/experiments" element={<ExperimentsPage />} />
              <Route path="/visualization" element={<VisualizationPage />} />
            </Routes>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Aero Database ©{new Date().getFullYear()} - Система хранения аэродинамических данных
          </Footer>
        </Layout>
      </Layout>
    </Router>
  )
}

export default App