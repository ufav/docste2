import React, { useState, useEffect } from 'react';
import { Menu, Tree, Select, Button } from 'antd';
import {
  TableOutlined,
  FileOutlined,
  FileDoneOutlined,
  AreaChartOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { getUserProjects, getFolders } from './datasource';

const { SubMenu } = Menu;
const { DirectoryTree } = Tree;
const { Option } = Select;

const items = [
  {
    label: 'Dashboard',
    key: 'charts',
    icon: <AreaChartOutlined />,
  },
  {
    label: 'Projects',
    key: 'sub1',
    icon: <UserOutlined />,
    children: [
      { label: 'Work Breakdown Structure', key: '5' },
      { label: 'Summary', key: '6' },
      { label: 'Run Down Curves', key: '7' },
      { label: 'Settings', key: 'project_settings' },
    ],
  },
  {
    label: 'Transmittals',
    key: '11',
    icon: <FileDoneOutlined />,
  },
  {
    label: 'Files',
    key: '12',
    icon: <FileOutlined />,
  },
];

const Sidebar = ({ onMenuClick, onLogout, collapsed }) => {
  const [projects, setProjects] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [selectedMenuKey, setSelectedMenuKey] = useState('');
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [role_id, setRoleId] = useState(Number(localStorage.getItem('role_id')));
  const [openKeys, setOpenKeys] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const id = localStorage.getItem('id');
        const projectData = await getUserProjects(id);
        setProjects(projectData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setUsername(localStorage.getItem('username'));
      setRoleId(Number(localStorage.getItem('role_id')));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (selectedProject) {
      const fetchFolders = async () => {
        try {
          const folderData = await getFolders(selectedProject);
          setTreeData(folderData);
          // Automatically open the "Document Register" menu when a project is selected
          setOpenKeys(['sub0']);
        } catch (error) {
          console.error('Error fetching folders:', error);
        }
      };

      fetchFolders();
    } else {
      setTreeData([]);
      setOpenKeys([]);
    }
  }, [selectedProject]);

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
  };

  const handleTreeSelect = (selectedKeys, info) => {
    if (selectedKeys.length > 0) {
      const selectedKey = selectedKeys[0].toString();
      const folderId = info.node.key;
      setSelectedKeys(selectedKeys);
      setSelectedMenuKey('');
      onMenuClick({ key: 'tree', folder_id: folderId });
    }
  };

  const handleMenuClick = ({ key }) => {
    setSelectedKeys([]);
    setSelectedMenuKey(key);
    onMenuClick({ key });
  };

  // Debugging role_id
  console.log('Role ID:', role_id);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '10px 10px 0 10px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'space-between',
        transition: 'justify-content 0.2s',
        overflow: 'hidden',
      }}>
        {!collapsed && (
          <div style={{ 
            color: 'rgba(255, 255, 255, 0.65)', 
            marginRight: collapsed ? 0 : 'auto',
            display: collapsed ? 'None' : 'auto',
          }}>
            {username}
          </div>
        )}
        <Button
          onClick={onLogout}
          icon={<LogoutOutlined />}
          type="primary"
          shape="square"
          size="middle"
          style={{ marginLeft: collapsed ? 0 : 'auto' }}
        />
      </div>
      <Menu
        theme="dark"
        defaultSelectedKeys={[selectedMenuKey]}
        selectedKeys={[selectedMenuKey]}
        openKeys={openKeys}
        mode="inline"
        onClick={handleMenuClick}
        onOpenChange={keys => setOpenKeys(keys)}
        style={{ flex: 1, paddingTop: '10px' }}
      >
        <Menu.Item key="select-project" icon={<UserOutlined />} title="Select Project">
          <Select
            value={selectedProject || undefined}
            placeholder="Select Project"
            style={{ width: '100%' }}
            onChange={handleProjectChange}
          >
            {projects.map(project => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
        </Menu.Item>
        <SubMenu key="sub0" icon={<TableOutlined />} title="Document Register">
          <div style={{ paddingLeft: '24px', backgroundColor: '#001529' }}>
            <DirectoryTree
              multiple={false}
              defaultExpandAll
              expandedKeys={selectedProject ? treeData.map(folder => folder.key) : []}
              treeData={treeData}
              selectedKeys={selectedKeys}
              onSelect={handleTreeSelect}
              style={{ backgroundColor: '#001529', color: 'rgba(255, 255, 255, 0.65)' }}
              titleRender={node => (
                <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{node.title}</span>
              )}
            />
          </div>
        </SubMenu>
        {role_id === 1 && (
          <Menu.Item key="users_manage" icon={<TeamOutlined />}>User Settings</Menu.Item>
        )}
        {items.map(item => (
          item.key !== 'users_manage' && (
            item.children ? (
              <SubMenu key={item.key} icon={item.icon} title={item.label}>
                {item.children.map(subItem => (
                  <Menu.Item key={subItem.key}>{subItem.label}</Menu.Item>
                ))}
              </SubMenu>
            ) : (
              <Menu.Item key={item.key} icon={item.icon}>{item.label}</Menu.Item>
            )
          )
        ))}
      </Menu>
    </div>
  );
};

export default Sidebar;
