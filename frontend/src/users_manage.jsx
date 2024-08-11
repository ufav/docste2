import React, { useState, useEffect } from 'react';
import { Table, Spin, Input, Checkbox, Button, Drawer, Form, Select, message, Alert, Card, Popconfirm } from 'antd';
import { EditOutlined, UserAddOutlined, CloseOutlined, PlusOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { getUsers, getRoles, updateUser, getProjects, addUsersProjectAccess, getUserProjectAccess, registerUser, changePassword, deactivateUser } from './datasource';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchProjects();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const projectsData = await getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleEdit = async (user) => {
    try {
      setEditingUser(user);
      setIsCreating(false);
      setDrawerVisible(true);
      form.resetFields();
      form.setFieldsValue({
        role_id: user.role_id,
      });
      const response = await getUserProjectAccess(user.id);
      const projectIds = response.map((item) => item.project_id);
      setSelectedItems(projectIds);
      const sortedProjects = projects.sort((a, b) => {
        const aSelected = projectIds.includes(a.id);
        const bSelected = projectIds.includes(b.id);

        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
      });

      setProjects([...sortedProjects]);
    } catch (error) {
      message.error('Failed to fetch user project access');
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsCreating(true);
    setDrawerVisible(true);
    form.resetFields();
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setEditingUser(null);
    setSelectedItems([]);
  };

  const handleSave = async (values) => {
    try {
      let hasChanges = false;
      let userId;
  
      if (editingUser) {
        userId = editingUser.id;
  
        // Check for role change
        if (values.role_id !== editingUser.role_id) {
          await updateUser(userId, { role_id: values.role_id });
          hasChanges = true;
        }
  
        // Check for password change
        if (values.current_password) {
          if (values.new_password === values.confirm_new_password) {
            await changePassword({
              user_id: userId,
              current_password: values.current_password,
              new_password: values.new_password,
              confirm_new_password: values.confirm_new_password,
            });
            hasChanges = true;
          } else {
            message.error("New passwords do not match");
            return;
          }
        }
  
        // Fetch current project access
        const currentProjectAccess = await getUserProjectAccess(userId);
        const currentProjectIds = currentProjectAccess.map(item => item.project_id);
  
        // Filter out the projects that are newly added
        const newProjectIds = selectedItems.filter(
          project_id => !currentProjectIds.includes(project_id)
        );
  
        if (newProjectIds.length > 0) {
          const references = newProjectIds.map(project_id => ({
            user_id: userId,
            project_id
          }));
  
          await addUsersProjectAccess(references);
          hasChanges = true;
        }
  
        if (hasChanges) {
          message.success('User details updated successfully');
          
          // Update user in local state
          setUsers(users.map(user => 
            user.id === userId ? { ...user, ...values, projects: selectedItems } : user
          ));
        } else {
          message.info('No changes made');
        }
      } else {
        // Logic for creating a new user
        const userData = {
          username: values.username,
          password: values.password,
          role_id: values.role_id,
        };
  
        const newUser = await registerUser(userData); // `registerUser` will now return the user with ID
        userId = newUser.id; // Get the newly created user's ID
  
        if (selectedItems.length > 0) {
          const references = selectedItems.map(project_id => ({
            user_id: userId,
            project_id
          }));
  
          await addUsersProjectAccess(references); // Assign projects to the new user
        }
  
        message.success('User created successfully');
        // Add new user to local state
        setUsers([...users, { ...userData, id: userId, projects: selectedItems }]);
      }
  
      handleDrawerClose(); // Close the drawer
    } catch (error) {
      message.error('Failed to save user details');
    }
  };

  const handleSearch = (e) => {
    setFilterText(e.target.value);
  };

  const handleCheckboxChange = (checkedValues) => {
    setSelectedItems(checkedValues);
  };

  const handleDelete = async (user) => {
    try {
      await deactivateUser(user.id);
      message.success('User deactivated successfully');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      message.error('Failed to deactivate user');
      console.log(error);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: '40%',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: '40%',
    },
    {
      title: 'Delete',
      key: 'action',
      width: '10%',
      render: (text, record) => (
        <Popconfirm
          title="Are you sure you want to deactivate this user?"
          onConfirm={() => handleDelete(record)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            icon={<DeleteOutlined style={{ color: "red" }} />}
          />
        </Popconfirm>
      ),
    },
    {
      title: 'Edit',
      key: 'action',
      width: '10%',
      render: (text, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        />
      ),
    },
  ];

  const projectColumns = [
    {
      dataIndex: 'select',
      render: (_, record) => (
        <Checkbox
          checked={selectedItems.includes(record.id)}
          onChange={(e) => handleCheckboxChange(e.target.checked 
            ? [...selectedItems, record.id] 
            : selectedItems.filter(id => id !== record.id))}
        />
      ),
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
  ];

  if (loading) {
    return <Spin tip="Loading..." />;
  }

  if (error) {
    return <Alert message="Error" description="Error fetching users" type="error" showIcon />;
  }

  return (
    <>
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: false }}
      />

      <div style={{ textAlign: 'right', marginBottom: 16, marginRight: 8 }}>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleCreate}
        >
          Create User
        </Button>
      </div>

      <Drawer
        title={
          <div style={{ position: 'relative' }}>
            {editingUser ? "Edit User" : "Create User"}
            <div style={{
              position: 'absolute',
              right: 24,
              top: '50%',
              transform: 'translateY(-50%)',
            }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginRight: 8 }}
                icon={editingUser ? <SaveOutlined /> : <PlusOutlined />}
                form="userForm" // Ensure button triggers form submission
              >
                {editingUser ? 'Save' : 'Create'}
              </Button>
              <Button
                onClick={handleDrawerClose}
                icon={<CloseOutlined />}
              >
                Cancel
              </Button>
            </div>
          </div>
        }
        width={600}
        onClose={handleDrawerClose}
        open={drawerVisible}
        style={{ paddingBottom: 80 }}
      >
        <Form
          id="userForm"
          form={form}
          layout="vertical"
          onFinish={handleSave}
          autoComplete="off"
          initialValues={editingUser ? { role_id: editingUser.role_id } : {}}
        >
          {!editingUser && (
            <Card title="Username" bordered={false} style={{ marginBottom: 16, borderRadius: 8 }}>
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please input the username!' }]}
              >
                <Input placeholder="Username" autoComplete="nope"/>
              </Form.Item>
            </Card>
          )}

          {editingUser ? (
            <Card title="Change Password" bordered={false} style={{ marginBottom: 16, borderRadius: 8 }}>
              <Form.Item
                name="current_password"
                rules={[]}
              >
                <Input.Password placeholder="Current Password" autoComplete="nope" />
              </Form.Item>
              <Form.Item
                name="new_password"
                rules={[
                  ({ getFieldValue }) => ({
                    required: getFieldValue('current_password') ? true : false,
                    message: 'Please input the new password!',
                  }),
                ]}
              >
                <Input.Password placeholder="New Password" autoComplete="nope" />
              </Form.Item>
              <Form.Item
                name="confirm_new_password"
                dependencies={['new_password']}
                hasFeedback
                rules={[
                  ({ getFieldValue }) => ({
                    required: getFieldValue('current_password') ? true : false,
                    message: 'Please confirm the new password!',
                  }),
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('new_password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm New Password" autoComplete="nope" />
              </Form.Item>
            </Card>
          ) : (
            <Card title="Password" bordered={false} style={{ marginBottom: 16, borderRadius: 8 }}>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input the password!' }]}
              >
                <Input.Password placeholder="Password" autoComplete="nope" />
              </Form.Item>
              <Form.Item
                name="confirm"
                dependencies={['password']}
                hasFeedback
                rules={[
                  { required: true, message: 'Please confirm the password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm Password" autoComplete="nope" />
              </Form.Item>
            </Card>
          )}

          <Card title="Role" bordered={false} style={{ marginBottom: 16, borderRadius: 8 }}>
            <Form.Item
              name="role_id"
              rules={[{ required: true, message: 'Please select a role!' }]}
            >
              <Select placeholder="Please select a role">
                {roles.map(role => (
                  <Select.Option key={role.id} value={role.id}>
                    {role.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Card>

          <Card title="Project Access" bordered={false} style={{ marginBottom: 16, borderRadius: 8 }}>
            <Form.Item>
              <Input.Search
                placeholder="Search projects"
                onChange={handleSearch}
                style={{ marginBottom: 16 }}
              />
              <Table
                dataSource={filteredProjects}
                columns={projectColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Form.Item>
          </Card>
        </Form>
      </Drawer>
    </>
  );
};

export default Users;
