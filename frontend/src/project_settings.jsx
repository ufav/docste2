// Settings.jsx
import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Button, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { getProjects } from './datasource';
import ProjectModal from './project_modal';

const Settings = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await getProjects();
        setProjects(projectsData);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleEdit = (record) => {
    setSelectedProject(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedProject(null);
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Native Name',
      dataIndex: 'name_native',
      key: 'name_native',
    },
    {
      title: 'Edit',
      key: 'action',
      render: (text, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        />
      ),
    },
  ];

  if (loading) {
    return <Spin tip="Loading..." />;
  }

  if (error) {
    return <Alert message="Error" description="Error fetching projects" type="error" showIcon />;
  }

  return (
    <>
      <Table 
        dataSource={projects} 
        columns={columns} 
        rowKey="id"
        pagination={false}
      />
      <ProjectModal
        isModalVisible={isModalVisible}
        selectedProject={selectedProject}
        onCancel={handleCancel}
      />
    </>
  );
};

export default Settings;
