import React from 'react';
import { Modal, Form, Input, Select } from 'antd';

//const { Option } = Select;

const CreateDocumentModal = ({
  visible,
  onClose
}) => {
  return (
    <Modal
      title="Create New Document"
      open={visible}
      onCancel={onClose}
    >
      <Form layout="vertical">
        <Form.Item label="Document Number">
          <Input
            // значение оставлено пустым
            value={''}
            // обработчик оставлен пустым
            onChange={() => {}}
          />
        </Form.Item>
        <Form.Item label="Document Title">
          <Input
            // значение оставлено пустым
            value={''}
            // обработчик оставлен пустым
            onChange={() => {}}
          />
        </Form.Item>
        <Form.Item label="Discipline">
          <Select
            showSearch
            // значение оставлено пустым
            value={undefined}
            // обработчик оставлен пустым
            onChange={() => {}}
            allowClear
            placeholder="Select Discipline"
          >
            {/* Пустой список */}
          </Select>
        </Form.Item>
        <Form.Item label="Document Type">
          <Select
            showSearch
            // значение оставлено пустым
            value={undefined}
            // обработчик оставлен пустым
            onChange={() => {}}
            allowClear
            placeholder="Select Document Type"
          >
            {/* Пустой список */}
          </Select>
        </Form.Item>
        <Form.Item label="Revision Status">
          <Select
            // значение оставлено пустым
            value={undefined}
            // обработчик оставлен пустым
            onChange={() => {}}
            allowClear
            placeholder="Select Revision Status"
          >
            {/* Пустой список */}
          </Select>
        </Form.Item>
        <Form.Item label="Revision Step">
          <Select
            showSearch
            // значение оставлено пустым
            value={undefined}
            // обработчик оставлен пустым
            onChange={() => {}}
            allowClear
            placeholder="Select Revision Step"
          >
            {/* Пустой список */}
          </Select>
        </Form.Item>
        <Form.Item label="Revision Description">
          <Select
            showSearch
            // значение оставлено пустым
            value={undefined}
            // обработчик оставлен пустым
            onChange={() => {}}
            allowClear
            placeholder="Select Revision Description"
          >
            {/* Пустой список */}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateDocumentModal;
