import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Button, Input, Select, Upload, Popconfirm } from 'antd';
import { UploadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  getDisciplines,
  getDocumentTypes,
  getRevisionStatuses,
  getRevisionSteps,
  getRevisionDescriptions,
  getLanguages,
  getUploadedFiles,
  updateDocument,
  deleteDocument,
} from './datasource';

const { Option } = Select;
const { TextArea } = Input

const RecordModal = ({ record, visible, onClose, onDelete }) => {
  const [disciplinesList, setDisciplinesList] = useState([]);
  const [documentTypesList, setDocumentTypesList] = useState([]);
  const [revisionStatusesList, setRevisionStatusesList] = useState([]);
  const [revisionStepsList, setRevisionStepsList] = useState([]);
  const [revisionDescriptionsList, setRevisionDescriptionsList] = useState([]);
  const [languagesList, setlanguagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

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
        const languagesData = await getLanguages();
        setlanguagesList(languagesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fillSelects();

    const fetchUploadedFiles = async () => {
      await getUploadedFiles(record, visible, setUploadedFiles);
    };

    fetchUploadedFiles();

    if (record) {
      const disciplineId = disciplinesList.find((d) => d.name === record.discipline)?.id || null;
      const documentTypeId = documentTypesList.find((dt) => dt.name === record.document_type)?.id || null;
      const revisionStatusId = revisionStatusesList.find((rs1) => rs1.name === record.revision_status)?.id || null;
      const revisionStepId = revisionStepsList.find((rs2) => rs2.description === record.revision_step)?.id || null;
      const revisionDescriptionId = revisionDescriptionsList.find((rd) => rd.description === record.revision_description)?.id || null;
      const languageId = languagesList.find((l) => l.name === record.language)?.id || null;
      setFormData({
        number: record.document_number,
        title: record.document_title,
        title_native: record.document_title_native,
        remarks: record.remarks,
        discipline_id: disciplineId,
        type_id: documentTypeId,
        revision_status_id: revisionStatusId,
        revision_step_id: revisionStepId,
        revision_description_id: revisionDescriptionId,
        revision_number: record.revision_number,
        language_id: languageId,
      });
    }
  }, [record]);

  const files = useMemo(() => {
    return uploadedFiles.map((file) => ({
      uid: file.uid,
      name: file.file_name,
      type: file.mime_type,
      size: file.file_size,
      status: file.status,
      url: file.url,
    }));
  }, [uploadedFiles]);

  const handleInputChange = (e, fieldName) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  const handleSelectChange = (value, fieldName) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    await updateDocument(record, formData, setEditing, onClose);
    console.log(formData);
  };

  const handleUploadChange = ({ fileList }) => {
    if (fileList !== fileList) {
      setFileList(fileList);
    }
  };

  const handleModalClose = () => {
    setEditing(false);
    setUploadedFiles([]);
    onClose();
  };

  const uploadProps = {
    onChange: handleUploadChange,
    beforeUpload: () => false,
    multiple: true,
  };

  const handleDelete = async () => {
    try {
      await deleteDocument(record, onClose);
      onDelete(record.id); // Удаление записи из таблицы
      onClose();
    } catch (error) {
      console.error('Ошибка при удалении документа:', error);
    }
  };

  return (
    <Modal
      title='Document Details'
      open={visible}
      onCancel={handleModalClose}
      footer={[
        <Popconfirm
          title='Delete the document'
          description='Are you sure to delete this document?'
          icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          onConfirm={handleDelete}
          okText='Yes'
          cancelText='No'
        >
          <Button key='delete' type='primary' danger>
            Delete
          </Button>
        </Popconfirm>,
        editing ? (
          <Button id='save' name='saveButton' key='save' type='primary' onClick={handleSave}>
            Save
          </Button>
        ) : (
          <Button id='edit' name='editButton' key='edit' type='primary' onClick={handleEdit}>
            Edit
          </Button>
        ),
        <Button id='cancel' name='cancelButton' key='cancel' onClick={handleModalClose}>
          Cancel
        </Button>,
      ]}
    >
      {record && (
        <div>
          <Input
            id='document_number'
            name='documentNumber'
            placeholder='Document Number'
            value={editing ? formData.number : record.document_number}
            onChange={(e) => handleInputChange(e, 'number')}
            style={{ marginBottom: 8, backgroundColor: 'white', cursor: 'text' }}
            disabled={!editing}
          />
          <div style={{ marginBottom: 1 }}></div>
          <Input
            id='document_title'
            name='documentTitle'
            placeholder='Document Title'
            value={editing ? formData.title : record.document_title}
            onChange={(e) => handleInputChange(e, 'title')}
            style={{ marginBottom: 8, backgroundColor: 'white', cursor: 'text' }}
            disabled={!editing}
          />
          <div style={{ marginBottom: 1 }}></div>
          <Input
            id='document_title_native'
            name='documentTitleNative'
            placeholder='Document Title Native'
            value={editing ? formData.title_native : record.document_title_native}
            onChange={(e) => handleInputChange(e, 'title_native')}
            style={{ marginBottom: 8, backgroundColor: 'white', cursor: 'text' }}
            disabled={!editing}
          />
          <div style={{ marginBottom: 1 }}></div>
          <TextArea
            id='remarks'
            name='remarks'
            rows={3}
            placeholder='Remarks'
            value={editing ? formData.remarks : record.remarks}
            onChange={(e) => handleInputChange(e, 'remarks')}
            style={{ marginBottom: 8, backgroundColor: 'white', cursor: 'text' }}
            disabled={!editing}
          />
          <div style={{ marginBottom: 1 }}></div>
          <Select
            id='discipline'
            name='discipline'
            placeholder='Select Discipline'
            value={editing ? formData.discipline_id : disciplinesList.find((d) => d.name === record.discipline)?.id}
            onChange={(value) => handleSelectChange(value, 'discipline_id')}
            loading={loading}
            style={{ marginBottom: 8, backgroundColor: 'white', cursor: 'text', width: '100%' }}
            disabled={!editing}
          >
            {disciplinesList.length > 0 &&
              disciplinesList.map((discipline) => (
                <Option key={discipline.id} value={discipline.id}>
                  {discipline.name}
                </Option>
              ))}
          </Select>
          <div style={{ marginBottom: 1 }}></div>
          <Select
            id='document_type'
            name='documentType'
            placeholder='Select Document Type'
            value={editing ? formData.type_id : documentTypesList.find((dt) => dt.name === record.document_type)?.id}
            onChange={(value) => handleSelectChange(value, 'type_id')}
            loading={loading}
            style={{ marginBottom: 8, backgroundColor: 'white', cursor: 'text', width: '100%' }}
            disabled={!editing}
          >
            {documentTypesList.length > 0 &&
              documentTypesList.map((type) => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>
              ))}
          </Select>
          <div style={{ marginBottom: 1 }}></div>
          <Select
            id='revision_status'
            name='revisionStatus'
            placeholder='Select Revision Status'
            value={editing ? formData.revision_status_id : revisionStatusesList.find((rs1) => rs1.name === record.revision_status)?.id}
            onChange={(value) => handleSelectChange(value, 'revision_status_id')}
            loading={loading}
            style={{ marginBottom: 8, backgroundColor: 'white', cursor: 'text', width: '100%' }}
            disabled={!editing}
          >
            {revisionStatusesList.length > 0 &&
              revisionStatusesList.map((status) => (
                <Option key={status.id} value={status.id}>
                  {status.name}
                </Option>
              ))}
          </Select>
          <div style={{ marginBottom: 1 }}></div>
          <Select
            id='revision_step'
            name='revisionStep'
            placeholder='Select Revision Step'
            value={editing ? formData.revision_step_id : revisionStepsList.find((rs2) => rs2.description === record.revision_step)?.id}
            onChange={(value) => handleSelectChange(value, 'revision_step_id')}
            loading={loading}
            style={{ marginBottom: 8, backgroundColor: 'white', cursor: 'text', width: '100%' }}
            disabled={!editing}
          >
            {revisionStepsList.length > 0 &&
              revisionStepsList.map((step) => (
                <Option key={step.id} value={step.id}>
                  {step.description}
                </Option>
              ))}
          </Select>
          <div style={{ marginBottom: 1 }}></div>
          <Select
            id='revision_description'
            name='revisionDescription'
            placeholder='Select Revision Description'
            value={editing ? formData.revision_description_id : revisionDescriptionsList.find((rd) => rd.description === record.revision_description)?.id}
            onChange={(value) => handleSelectChange(value, 'revision_description_id')}
            loading={loading}
            style={{ marginBottom: 8, backgroundColor: 'white', cursor: 'text', width: '100%' }}
            disabled={!editing}
          >
            {revisionDescriptionsList.length > 0 &&
              revisionDescriptionsList.map((description) => (
                <Option key={description.id} value={description.id}>
                  {description.description}
                </Option>
              ))}
          </Select>
          <div style={{ marginBottom: 1 }}></div>
          <Input
            id='revision_number'
            name='revisionNumber'
            placeholder='Revision Number'
            value={editing ? formData.revision_number : record.revision_number}
            onChange={(e) => handleInputChange(e, 'revision_number')}
            style={{ marginBottom: 8, backgroundColor: 'white', cursor: 'text' }}
            disabled={!editing}
          />
          <div style={{ marginBottom: 1 }}></div>
          <Select
            id='language'
            name='language'
            placeholder='Select Language'
            value={editing ? formData.language_id : languagesList.find((l) => l.name === record.language)?.id}
            onChange={(value) => handleSelectChange(value, 'language_id')}
            loading={loading}
            style={{ marginBottom: 8, backgroundColor: 'white', cursor: 'text', width: '100%' }}
            disabled={!editing}
          >
            {languagesList.length > 0 &&
              languagesList.map((language) => (
                <Option key={language.id} value={language.id}>
                  {language.name}
                </Option>
              ))}
          </Select>
          <div style={{ marginBottom: 1 }}></div>
          <Upload {...uploadProps} fileList={fileList}>
            <Button id='upload' name='uploadButton' icon={<UploadOutlined />} disabled={!editing}>
              Upload
            </Button>
          </Upload>
          <div style={{ marginBottom: 1 }}></div>
          <div>
            <ul>
              {files.map((file) => (
                <li key={file.uid}>
                  <a href={file.url} target='_blank' rel='noopener noreferrer'>
                    {file.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RecordModal;
