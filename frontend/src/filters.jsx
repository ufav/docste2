import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Row, Col, Modal } from 'antd';
import { getDisciplines, getDocumentTypes, getRevisionStatuses, getRevisionSteps, getRevisionDescriptions } from './datasource';
import { UploadOutlined, CloseCircleOutlined, DownloadOutlined, QuestionCircleOutlined, FileAddOutlined } from '@ant-design/icons';
import CreateDocumentModal from './newdoc_modal';
import './index.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Filters = ({ onSubmit, folderId }) => {
  const initialFilters = {
    document_number: '',
    document_title: '',
    discipline: '',
    document_type: '',
    revision_status: '',
    revision_step: '',
    revision_description: '',
    created: []
  };

  const [filters, setFilters] = useState(initialFilters);
  const [disciplinesList, setDisciplinesList] = useState([]);
  const [documentTypesList, setDocumentTypesList] = useState([]);
  const [revisionStatusesList, setRevisionStatusesList] = useState([]);
  const [revisionStepsList, setRevisionStepsList] = useState([]);
  const [revisionDescriptionsList, setRevisionDescriptionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newdocModalVisible, setNewdocModalVisible] = useState(false);

  useEffect(() => {
    const fillSelects = async () => {
      try {
        setLoading(true);
        const disciplinesData = await getDisciplines();
        setDisciplinesList(disciplinesData);
        const documentTypesData = await getDocumentTypes();
        setDocumentTypesList(documentTypesData);
        const revisionStatusesData = await getRevisionStatuses();
        setRevisionStatusesList(revisionStatusesData);
        const revisionStepsData = await getRevisionSteps();
        setRevisionStepsList(revisionStepsData);
        const revisionDescriptionsData = await getRevisionDescriptions();
        setRevisionDescriptionsList(revisionDescriptionsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fillSelects();
  }, []);

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    setFilters(prevFilters => ({ ...prevFilters, [field]: value }));
    onSubmit({ ...filters, [field]: value }); // Call onSubmit with updated filters
  };

  const handleDateChange = (dates) => {
    setFilters({ ...filters, created: dates });
    onSubmit({ ...filters, created: dates }); // Call onSubmit with updated filters
  };

  const handleSelectChange = (value, field) => {
    setFilters(prevFilters => ({ ...prevFilters, [field]: value }));
    onSubmit({ ...filters, [field]: value }); // Call onSubmit with updated filters
  };

  const handleClearFilters = () => {
    setFilters(initialFilters); // Reset filters to initial state
    onSubmit(initialFilters); // Call onSubmit with initial filters to clear
  };

  return (
    <Form layout="vertical" style={{ marginBottom: 10 }}>
      <Row gutter={25}>
        <Col span={4}>
          <Form.Item>
            <Input
              placeholder="Document Number"
              value={filters.document_number}
              onChange={(e) => handleInputChange(e, 'document_number')}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item>
            <Input
              placeholder="Document Title"
              value={filters.document_title}
              onChange={(e) => handleInputChange(e, 'document_title')}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item>
            <Select
              showSearch
              placeholder="Select Discipline"
              value={filters.discipline !== '' ? filters.discipline : undefined}
              onChange={(value) => handleSelectChange(value, 'discipline')}
              loading={loading}
              allowClear
              optionFilterProp="label"
              filterOption={(input, option) => {
                const code = option.label.split(' ')[0].toLowerCase();
                const name = option.label.split(' ').slice(1).join(' ').toLowerCase();
                return code.includes(input.toLowerCase()) || name.includes(input.toLowerCase());
              }}
              filterSort={(optionA, optionB) => {
                const nameA = optionA.label.split(' ').slice(1).join(' ').toLowerCase();
                const nameB = optionB.label.split(' ').slice(1).join(' ').toLowerCase();
                return nameA.localeCompare(nameB);
              }}
              dropdownRender={menu => (
                <div>
                  <div style={{ display: 'flex', padding: '8px 8px 0', borderBottom: '1px solid #e8e8e8', fontWeight: 'bold' }}>
                    <span style={{ width: 'auto', whiteSpace: 'nowrap', marginRight: '16px' }}>Code</span>
                    <span style={{ flex: 1 }}>Name</span>
                  </div>
                  {menu}
                </div>
              )}
            >
              {disciplinesList.map(option => (
                <Option key={option.id} value={option.name} label={`${option.code} ${option.name}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ width: 30, whiteSpace: 'nowrap', marginRight: '16px' }}>{option.code}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.name}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item>
            <Select
              showSearch
              placeholder="Select Document Type"
              value={filters.document_type !== '' ? filters.document_type : undefined}
              onChange={(value) => handleSelectChange(value, 'document_type')}
              loading={loading}
              allowClear
              optionFilterProp="label"
              filterOption={(input, option) => {
                const code = option.label.split(' ')[0].toLowerCase();
                const name = option.label.split(' ').slice(1).join(' ').toLowerCase();
                return code.includes(input.toLowerCase()) || name.includes(input.toLowerCase());
              }}
              filterSort={(optionA, optionB) => {
                const nameA = optionA.label.split(' ').slice(1).join(' ').toLowerCase();
                const nameB = optionB.label.split(' ').slice(1).join(' ').toLowerCase();
                return nameA.localeCompare(nameB);
              }}
              dropdownRender={menu => (
                <div>
                  <div style={{ display: 'flex', padding: '8px 8px 0', borderBottom: '1px solid #e8e8e8', fontWeight: 'bold' }}>
                    <span style={{ width: 'auto', whiteSpace: 'nowrap', marginRight: '16px' }}>Code</span>
                    <span style={{ flex: 1 }}>Name</span>
                  </div>
                  {menu}
                </div>
              )}
            >
              {documentTypesList.map(option => (
                <Option key={option.id} value={option.name} label={`${option.code} ${option.name}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ width: 30, whiteSpace: 'nowrap', marginRight: '16px' }}>{option.code}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.name}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item>
            <Select
              placeholder="Select Revision Status"
              value={filters.revision_status !== '' ? filters.revision_status : undefined}
              onChange={(value) => handleSelectChange(value, 'revision_status')}
              loading={loading}
              allowClear
            >
              {revisionStatusesList.map(option => (
                <Option key={option.id} value={option.name}>
                  <div className="optionContainer">
                    <span className="optionName">{option.name}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item>
            <Select
              showSearch
              placeholder="Select Revision Step"
              value={filters.revision_step !== '' ? filters.revision_step : undefined}
              onChange={(value) => handleSelectChange(value, 'revision_step')}
              loading={loading}
              allowClear
              optionFilterProp="label"
              filterOption={(input, option) => {
                const code = option.label.split(' ')[0].toLowerCase();
                const description = option.label.split(' ').slice(1).join(' ').toLowerCase();
                return code.includes(input.toLowerCase()) || description.includes(input.toLowerCase());
              }}
              filterSort={(optionA, optionB) => {
                const nameA = optionA.label.split(' ').slice(1).join(' ').toLowerCase();
                const nameB = optionB.label.split(' ').slice(1).join(' ').toLowerCase();
                return nameA.localeCompare(nameB);
              }}
              dropdownRender={menu => (
                <div>
                  <div style={{ display: 'flex', padding: '8px 8px 0', borderBottom: '1px solid #e8e8e8', fontWeight: 'bold' }}>
                    <span style={{ width: 'auto', whiteSpace: 'nowrap', marginRight: '16px' }}>Code</span>
                    <span style={{ flex: 1 }}>Description</span>
                  </div>
                  {menu}
                </div>
              )}
            >
              {revisionStepsList.map(option => (
                <Option key={option.id} value={option.description} label={`${option.code} ${option.description}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ width: 30, whiteSpace: 'nowrap', marginRight: '16px' }}>{option.code}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.description}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={25}>
        <Col span={4}>
          <Form.Item>
            <Select
              showSearch
              placeholder="Select Revision Description"
              value={filters.revision_description !== '' ? filters.revision_description : undefined}
              onChange={(value) => handleSelectChange(value, 'revision_description')}
              loading={loading}
              allowClear
              optionFilterProp="label"
              filterOption={(input, option) => {
                const code = option.label.split(' ')[0].toLowerCase();
                const description = option.label.split(' ').slice(1).join(' ').toLowerCase();
                return code.includes(input.toLowerCase()) || description.includes(input.toLowerCase());
              }}
              filterSort={(optionA, optionB) => {
                const nameA = optionA.label.split(' ').slice(1).join(' ').toLowerCase();
                const nameB = optionB.label.split(' ').slice(1).join(' ').toLowerCase();
                return nameA.localeCompare(nameB);
              }}
              dropdownRender={menu => (
                <div>
                  <div style={{ display: 'flex', padding: '8px 8px 0', borderBottom: '1px solid #e8e8e8', fontWeight: 'bold' }}>
                    <span style={{ width: 'auto', whiteSpace: 'nowrap', marginRight: '16px' }}>Code</span>
                    <span style={{ flex: 1 }}>Description</span>
                  </div>
                  {menu}
                </div>
              )}
            >
              {revisionDescriptionsList.map(option => (
                <Option key={option.id} value={option.description} label={`${option.code} ${option.description}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ width: 30, whiteSpace: 'nowrap', marginRight: '16px' }}>{option.code}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.description}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item>
            <RangePicker
              placeholder={['Created from', 'to']}
              value={filters.created}
              onChange={handleDateChange}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item>
            {/* Additional filters can be added here */}
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item>
            {/* Additional filters can be added here */}
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item>
            {/* Additional filters can be added here */}
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button type="default" style={{ flex: 1 }} onClick={handleClearFilters} icon={<CloseCircleOutlined />}>
              Clear
            </Button>
            <Button type="default" style={{ marginLeft: '10px' }} icon={<DownloadOutlined />}>
            </Button>
            <Button type="primary" style={{ marginLeft: '10px' }} icon={<FileAddOutlined />} onClick={() => setNewdocModalVisible(true)}>
            add
            </Button>
            <CreateDocumentModal
  visible={newdocModalVisible}
  onClose={() => setNewdocModalVisible(false)}
/>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default Filters;
