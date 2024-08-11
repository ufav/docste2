import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Tree, Button, Typography, message, Tag, Switch } from 'antd';
import { DeleteOutlined, CloseOutlined, SaveOutlined } from '@ant-design/icons';
import TableTransfer from './table_transfer';
import axios from 'axios';
import { createFolder, deleteFolder, getFolders, getDisciplines } from './datasource';

const { TreeNode } = Tree;
const { Title } = Typography;

const ProjectModal = ({ isModalVisible, selectedProject, onCancel }) => {
  const [folders, setFolders] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [folderForm] = Form.useForm();
  const [selectedFolder, setSelectedFolder] = useState(null);

  useEffect(() => {
    if (selectedProject) {
      fetchFolders(selectedProject.id);
      fetchDisciplines();
    }
  }, [selectedProject]);

  const fetchFolders = async (projectId) => {
    try {
      const foldersData = await getFolders(projectId);
      setFolders(foldersData);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const fetchDisciplines = async () => {
    try {
      const allDisciplinesData = await getDisciplines();
      const allDisciplines = allDisciplinesData.map(discipline => ({
        key: discipline.id.toString(),
        title: discipline.name,
        tag: discipline.code,
      }));

      const response = await axios.get(`http://localhost:8000/api/get_discipline_references/${selectedProject.id}`);
      const projectDisciplineIds = response.data.map(ref => ref.discipline_id.toString());

      const selectedDisciplines = allDisciplines.filter(discipline =>
        projectDisciplineIds.includes(discipline.key)
      );
      const remainingDisciplines = allDisciplines.filter(discipline =>
        !projectDisciplineIds.includes(discipline.key)
      );

      setDisciplines([...selectedDisciplines, ...remainingDisciplines]);
      setTargetKeys(projectDisciplineIds);
    } catch (error) {
      console.error('Error loading disciplines:', error);
    }
  };

  const handleCreateFolder = async (values) => {
    try {
      const { name } = values;
      const parent_id = selectedFolder || null;
      await createFolder({ name, parent_id, project_id: selectedProject.id.toString(), deleted: "0" });
      await fetchFolders(selectedProject.id);
      message.success('Folder created successfully');
      folderForm.resetFields();
    } catch (error) {
      message.error('Error creating folder');
      console.error('Error creating folder:', error);
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolder) {
      message.error('No folder selected for deletion');
      return;
    }

    try {
      await deleteFolder(selectedFolder);
      await fetchFolders(selectedProject.id);
      message.success('Folder deleted successfully');
      setSelectedFolder(null);
    } catch (error) {
      message.error('Error deleting folder');
      console.error('Error deleting folder:', error);
    }
  };

  const handleSaveDisciplines = async () => {
    try {
      const disciplineReferences = targetKeys.map(discipline_id => ({
        project_id: selectedProject.id,
        discipline_id: parseInt(discipline_id, 10),
      }));

      await axios.post('http://localhost:8000/api/save_discipline_references', disciplineReferences);
      message.success('Disciplines successfully saved');
    } catch (error) {
      message.error('Error saving disciplines');
      console.error('Error saving disciplines:', error);
    }
  };

  const onSelectFolder = (selectedKeys) => {
    setSelectedFolder(selectedKeys[0]);
  };

  const renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.name} key={item.id} dataRef={item}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.id} title={item.name} dataRef={item} />;
    });
  };

  const transferColumns = [
    {
      dataIndex: 'title',
      title: 'Name',
    },
    {
      dataIndex: 'tag',
      title: 'Code',
      render: (tag) => (
        <Tag style={{ marginInlineEnd: 0 }} color="cyan">
          {typeof tag === 'string' ? tag.toUpperCase() : 'N/A'}
        </Tag>
      ),
    },
  ];

  const filterOption = (input, item) => item.title.toLowerCase().includes(input.toLowerCase()) || item.tag.toLowerCase().includes(input.toLowerCase());

  const handleTransferChange = (nextTargetKeys) => {
    setTargetKeys(nextTargetKeys);
  };

  const toggleDisabled = (checked) => {
    setDisabled(checked);
  };

  return (
    <Modal
      title={`Project: ${selectedProject?.name}`}
      visible={isModalVisible}
      onCancel={onCancel}
      footer={[
        <Button key="save" type="primary" onClick={handleSaveDisciplines} icon={<SaveOutlined />}>
          Save
        </Button>,
        <Button key="cancel" onClick={onCancel} icon={<CloseOutlined />}>
          Close
        </Button>,
      ]}
      width="95vw"
      style={{ maxHeight: '95vh', overflowY: 'auto', transition: 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '45%' }}>
          <Title level={4} style={{ marginBottom: '16px' }}>Project folder structure</Title>
          <Tree showLine defaultExpandAll onSelect={onSelectFolder}>
            {renderTreeNodes(folders)}
          </Tree>
          <br />
          <Form form={folderForm} onFinish={handleCreateFolder}>
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Enter folder name!' }]}
            >
              <Input placeholder="Folder name" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: '8px' }}>
                Create
              </Button>
              <Button key="delete" danger icon={<DeleteOutlined />} onClick={handleDeleteFolder}>
                Delete
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div style={{ width: '45%' }}>
          <Title level={4} style={{ marginBottom: '16px' }}>Project disciplines</Title>
          <TableTransfer
            dataSource={disciplines}
            targetKeys={targetKeys}
            disabled={disabled}
            showSearch
            showSelectAll={false}
            onChange={handleTransferChange}
            filterOption={filterOption}
            leftColumns={transferColumns}
            rightColumns={transferColumns}
          />
          <Switch
            unCheckedChildren="Disabled"
            checkedChildren="Enabled"
            checked={disabled}
            onChange={toggleDisabled}
            style={{ marginTop: '16px' }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ProjectModal;
