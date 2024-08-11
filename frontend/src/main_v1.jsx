import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, theme } from 'antd';
import Sidebar from './sidebar';
import CustomTable from './main_table';
import Charts from './dashboard.jsx';
import Settings from './project_settings.jsx';
import Users from './users_manage.jsx';
import './index.css';

const { Content, Footer, Sider } = Layout;

const Main = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const [folderId, setFolderId] = useState(null);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const id = localStorage.getItem('id');
  
    if (!token) {
      navigate('/');
    } else {
      console.log(`Logged in as ${username}, ID: ${id}`);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('id');
    navigate('/');
  };

  const handleMenuClick = ({ key, folder_id }) => {
    setSelectedKey(key);
    setFolderId(folder_id);
  };

  const renderContent = () => {
    switch (selectedKey) {
      case 'tree':
        return <CustomTable colorBgContainer={colorBgContainer} borderRadiusLG={borderRadiusLG} folderId={folderId} />;
      case 'charts':
        return <Charts />;
      case 'project_settings':
        return <Settings />;
      case 'users_manage':
        return <Users />;
      default:
        return <div>Select an option from the menu</div>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => {
          console.log('Sidebar collapsed:', value); // Logging collapsed state
          setCollapsed(value);
        }}
        width={400}
        style={{ position: 'fixed', height: '100vh', left: 0 }}
      >
        <div className="demo-logo-vertical" />
        <Sidebar
          onMenuClick={handleMenuClick}
          onLogout={handleLogout}
          collapsed={collapsed}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 400, transition: 'margin-left 0.2s' }}>
        <Content
          style={{
            margin: '0 16px',
            overflow: 'initial',
            maxWidth: '100vw',
            width: 'auto',
            height: 'calc(100vh - 69px)',
          }}
        >
          {renderContent()}
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          {new Date().getFullYear()} Created by Docste Team
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Main;
