import React, { useEffect, useState, useRef, useMemo } from 'react'
import axios from 'axios'
import { Table, Layout, Input, Button, DatePicker, Select, Modal, Tooltip, Spin, Upload, Popconfirm, notification } from 'antd'
import { UploadOutlined, DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'
import { getMainData, getDisciplines, getLanguages, deleteDocument, getUploadedFiles, updateDocument,
          getDocumentTypes, getRevisionStatuses, getRevisionSteps, getRevisionDescriptions } from './datasource.jsx'

const { Sider, Content } = Layout
const { RangePicker } = DatePicker
const { Option } = Select
const { TextArea } = Input

const columns = [
  {
    title: 'Id',
    dataIndex: 'id',
    key: 'id',
    hidden: true,
    render: text => (
      <Tooltip title={text}>
        <span>{text}</span>
      </Tooltip>
    ),
  },
  {
    title: 'Document Number',
    dataIndex: 'document_number',
    key: 'document_number',
    render: text => (
      <Tooltip title={text}>
        <span>{text}</span>
      </Tooltip>
    ),
  },
  {
    title: 'Title',
    dataIndex: 'document_title',
    key: 'document_title',
    render: text => (
      <Tooltip title={text}>
        <span>{text}</span>
      </Tooltip>
    ),
  },
  {
    title: 'Native Title',
    dataIndex: 'document_title_native',
    key: 'document_title_native',
    render: text => (
      <Tooltip title={text}>
        <span>{text}</span>
      </Tooltip>
    ),
  },
  {
    title: 'Remarks',
    dataIndex: 'remarks',
    key: 'remarks',
    render: text => (
      <Tooltip title={text}>
        <span>{text}</span>
      </Tooltip>
    ),
  },
  {
    title: 'Discipline',
    dataIndex: 'discipline',
    key: 'discipline',
    render: text => (
      <Tooltip title={text}>
        <span>{text}</span>
      </Tooltip>
    ),
  },
  {
    title: 'Document Type',
    dataIndex: 'document_type',
    key: 'document_type',
    render: text => (
      <Tooltip title={text}>
        <span>{text}</span>
      </Tooltip>
    ),
  },
  {
    title: 'Revision Status',
    dataIndex: 'revision_status',
    key: 'revision_status',
    render: text => (
      <Tooltip title={text}>
        <span>{text}</span>
      </Tooltip>
    ),
  },
  {
    title: 'Revision Step',
    dataIndex: 'revision_step',
    key: 'revision_step',
    render: text => (
      <Tooltip title={text}>
        <span>{text}</span>
      </Tooltip>
    ),
  },
  {
    title: 'Revision Description',
    dataIndex: 'revision_description',
    key: 'revision_description',
    render: text => (
      <Tooltip title={text}>
        <span>{text}</span>
      </Tooltip>
    ),
  },
  {
    title: 'Language',
    dataIndex: 'language',
    key: 'language',
    render: text => (
      <Tooltip title={text}>
        <span>{text}</span>
      </Tooltip>
    ),
  },
  {
    title: 'Revision Number',
    dataIndex: 'revision_number',
    key: 'revision_number',
    render: text => (
      <Tooltip title={text}>
        <span>{text}</span>
      </Tooltip>
    ),
  },
  {
    title: 'Created',
    dataIndex: 'created',
    key: 'created',
    render: text => (
      <Tooltip title={text}>
        <span>{text}</span>
      </Tooltip>
    ),
  },
];

const FilterSidebar = ({ onSubmit }) => {
  const [filters, setFilters] = useState({
    document_number: '',
    document_title: '',
    discipline: '',
    document_type: '',
    revision_status: '',
    revision_step: '',
    revision_description: '',
    language: '',
    created: []
  })
  
  const [disciplinesList, setDisciplinesList] = useState([])
  const [documentTypesList, setDocumentTypesList] = useState([])
  const [revisionStatusesList, setRevisionStatusesList] = useState([])
  const [revisionStepsList, setRevisionStepsList] = useState([])
  const [revisionDescriptionsList, setRevisionDescriptionsList] = useState([])
  const [languagesList, setlanguagesList] = useState([])
  const [loading, setLoading] = useState(true)

  const handleInputChange = (e, field) => {
    setFilters({ ...filters, [field]: e.target.value })
  }

  const handleDateChange = (dates) => {
    setFilters({ ...filters, created: dates })
  }

  const handleSelectChange = (value, field) => {
    setFilters({ ...filters, [field]: value })
  }

  const handleSubmit = () => {
    onSubmit(filters)
  }

  useEffect(() => {
    const fillSelects = async () => {
      try {
        setLoading(true)
        const disciplinesData = await getDisciplines()
        setDisciplinesList(disciplinesData)
        const documentTypesData = await getDocumentTypes()
        setDocumentTypesList(documentTypesData)
        const revisionStatusesData = await getRevisionStatuses()
        setRevisionStatusesList(revisionStatusesData)
        const revisionStepsData = await getRevisionSteps()
        setRevisionStepsList(revisionStepsData)
        const revisionDescriptionsData = await getRevisionDescriptions()
        setRevisionDescriptionsList(revisionDescriptionsData)
        const languagesData = await getLanguages()
        setlanguagesList(languagesData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }
    fillSelects()
  }, [])

  return (
    <Sider
      width = { '20%' }
      style = { { background: '#fff', position: 'fixed' } } >
      <div style = { { padding: '16px' } } >
        <h3>Filters</h3>
        <Input
          id = 'document_number'
          name = 'documentNumber'
          placeholder = 'Document Number'
          value = { filters.document_number }
          onChange = { (e) => handleInputChange(e, 'document_number') }
          style = { { marginBottom: 8 } }
          allowClear
        />
        <Input
          id = 'document_title'
          name = 'documentTitle'
          placeholder = 'Document Title'
          value = { filters.document_title }
          onChange = { (e) => handleInputChange(e, 'document_title') }
          style = { { marginBottom: 8 } }
          allowClear
        />
        <Select
          id = 'select_discipline'
          name = 'selectDiscipline'
          placeholder = 'Select Discipline'
          value = { filters.discipline !== '' ? filters.discipline : undefined }
          onChange = { (value) => handleSelectChange(value, 'discipline') }
          loading = { loading }
          style = { { marginBottom: 8, width: '100%' } }
          allowClear >
          {disciplinesList.map(option => (
            <Option key = { option.id } value = { option.code } >
              <div className="optionContainer" >
                <span className="optionCode" >{option.code}</span>
                <span className="optionName" >{option.name}</span>
              </div>
            </Option>
          ))}
        </Select>
        <Select
          id = 'select_document_type'
          name = 'selectDocumentType'
          placeholder = 'Select Document Type'
          value = { filters.document_type !== '' ? filters.document_type : undefined }
          onChange = { (value) => handleSelectChange(value, 'document_type') }
          loading = { loading }
          style = { { marginBottom: 8, width: '100%' } }
          allowClear >
          {documentTypesList.map(option => (
            <Option key = { option.id } value = { option.code } >
              <div className="optionContainer" >
                <span className="optionCode" >{option.code}</span>
                <span className="optionName" >{option.name}</span>
              </div>
            </Option>
          ))}
        </Select>
        <Select
          id = 'select_revision_status'
          name = 'selectRevisionStatus'
          placeholder = 'Select Revision Status'
          value = { filters.revision_status !== '' ? filters.revision_status : undefined }
          onChange = { (value) => handleSelectChange(value, 'revision_status') }
          loading = { loading }
          style = { { marginBottom: 8, width: '50%' } }
          allowClear >
          {revisionStatusesList.map(option => (
            <Option key = { option.id } value = { option.name } >
              <div className="optionContainer" >
                <span className="optionName" >{option.name}</span>
              </div>
            </Option>
          ))}
        </Select>
        <Select
          id = 'select_revision_step'
          name = 'selectRevisionStep'
          placeholder = 'Select Revision Step'
          value = { filters.revision_step !== '' ? filters.revision_step : undefined }
          onChange = { (value) => handleSelectChange(value, 'revision_step') }
          loading = { loading }
          style = { { marginBottom: 8, width: '100%' } }
          allowClear >
          {revisionStepsList.map(option => (
            <Option key = { option.id } value = { option.description } >
              <div className="optionContainer" >
                <span className="optionCode" >{option.code}</span>
                <span className="optionName" >{option.description}</span>
              </div>
            </Option>
          ))}
        </Select>
        <Select
          id = 'select_revision_description'
          name = 'selectRevisionDescription'
          placeholder = 'Select Revision Description'
          value = { filters.revision_description !== '' ? filters.revision_description : undefined }
          onChange = { (value) => handleSelectChange(value, 'revision_description') }
          loading = { loading }
          style = { { marginBottom: 8, width: '100%' } }
          allowClear >
          {revisionDescriptionsList.map(option => (
            <Option key = { option.id } value = { option.description } >
              <div className="optionContainer" >
                <span className="optionCode" >{option.code}</span>
                <span className="optionName" >{option.description}</span>
              </div>
            </Option>
          ))}
        </Select>
        <Select
          id = 'select_language'
          name = 'selectLanguage'
          placeholder = 'Select Language'
          value = { filters.language !== '' ? filters.language : undefined }
          onChange = { (value) => handleSelectChange(value, 'language') }
          loading = { loading }
          style = { { marginBottom: 8, width: '50%' } }
          allowClear >
          {languagesList.map(option => (
            <Option key = { option.id } value = { option.name } >
              <div className="optionContainer" >
                <span className="optionName" >{option.name}</span>
              </div>
            </Option>
          ))}
        </Select>
        <RangePicker
          id = 'created_from_to'
          name = 'createdFromTo'
          placeholder = { ['Created from', 'to'] }
          value = { filters.created }
          onChange = { handleDateChange }
          style = { { marginBottom: 8, width: '100%' } }
        />
        <Button
          type = 'primary'
          onClick = { handleSubmit }
          style = { { width: '100%' } } >
          Search
        </Button>
      </div>
    </Sider>
  )
}

const RecordModal = ({ record, visible, onClose }) => {
  const [disciplinesList, setDisciplinesList] = useState([])
  const [documentTypesList, setDocumentTypesList] = useState([])
  const [revisionStatusesList, setRevisionStatusesList] = useState([])
  const [revisionStepsList, setRevisionStepsList] = useState([])
  const [revisionDescriptionsList, setRevisionDescriptionsList] = useState([])
  const [languagesList, setlanguagesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [fileList, setFileList] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [editing, setEditing] = useState(false) // Состояние режима редактирования
  const [formData, setFormData] = useState({}) // Состояние для хранения данных формы


  useEffect( () => {
    const fillSelects = async () => {
      try {
        setLoading(true)
        const disciplinesData = await getDisciplines()
        setDisciplinesList(disciplinesData)
        const documentTypesData = await getDocumentTypes()
        setDocumentTypesList(documentTypesData)
        const revisionStatusesData = await getRevisionStatuses()
        setRevisionStatusesList(revisionStatusesData)
        const revisionStepsData = await getRevisionSteps()
        setRevisionStepsList(revisionStepsData)
        const revisionDescriptionsData = await getRevisionDescriptions()
        setRevisionDescriptionsList(revisionDescriptionsData)
        const languagesData = await getLanguages()
        setlanguagesList(languagesData)
        console.log(disciplinesData)
        console.log(languagesData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }
    fillSelects()

    const fetchUploadedFiles = async () => {  // получаем список прикрепленных файлов по document_id
        await getUploadedFiles(record, visible, setUploadedFiles)
    }

    fetchUploadedFiles()

    // Обновляем данные формы при изменении записи
    if (record) {
      const disciplineId = disciplinesList.find(d => d.name === record.discipline)?.id || null
      const documentTypeId = documentTypesList.find(dt => dt.name === record.document_type)?.id || null
      const revisionStatusId = revisionStatusesList.find(rs1 => rs1.name === record.revision_status)?.id || null
      const revisionStepId = revisionStepsList.find(rs2 => rs2.description === record.revision_step)?.id || null
      const revisionDescriptionId = revisionDescriptionsList.find(rd => rd.description === record.revision_description)?.id || null
      const languageId = languagesList.find(l => l.name === record.language)?.id || null
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
      })
    }
  }, [record])

  const files = useMemo(() => { // useMemo нужен, чтобы прикрепленные файлы не рендерились всякий раз
    return uploadedFiles.map((file) => ({
        uid: file.uid,
        name: file.file_name,
        type: file.mime_type,
        size: file.file_size,
        status: file.status,
        url: file.url
    }))
  }, [uploadedFiles])

  const handleInputChange = (e, fieldName) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }))
  }

  const handleSelectChange = (value, fieldName) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }))
  }

  const handleEdit = () => {
    setEditing(true) // Переключаем режим редактирования
  }

  const handleSave = async () => {
    await updateDocument(record, formData, setEditing, onClose)
    console.log(formData)
  }

  const handleUploadChange = ( { fileList } ) => {
    if (fileList !== fileList) {
      setFileList(fileList)
    }
  }

  const handleModalClose = () => {
    setEditing(false) // Отключаем режим редактирования
    setUploadedFiles([])
    onClose()
  }

  const uploadProps = {
    onChange: handleUploadChange, // Передаем функцию обратного вызова для обработки изменений
    beforeUpload: () => false, // Отменяем автоматическую загрузку
    multiple: true, // Разрешить загрузку нескольких файлов
  }

  const handleDelete = async () => {
    await deleteDocument(record, onClose)
  }
  
  return (
    <Modal
      title = 'Document Details'
      open = { visible }
      onCancel = { handleModalClose }
      footer = { [
        <Popconfirm
          title = 'Delete the document'
          description = 'Are you sure to delete this document?'
          icon = { <QuestionCircleOutlined style = { { color: 'red' } } /> }
          onConfirm = { handleDelete }
          okText = 'Yes'
          cancelText = 'No'
        >
          <Button
            key = 'delete'
            type = 'primary'
            danger >
            Delete
          </Button>
        </Popconfirm>,
        editing ? (
          <Button
            id = 'save'
            name = 'saveButton'
            key = 'save'
            type= 'primary'
            onClick = { handleSave } >
            Save
          </Button>
        ) : (
          <Button
            id = 'edit'
            name = 'editButton'
            key = 'edit'
            type = 'primary'
            onClick = { handleEdit } >
            Edit
          </Button>
        ),
        <Button
          id = 'cancel'
          name = 'cancelButton'
          key = 'cancel'
          onClick = { handleModalClose } >
          Cancel
        </Button>
      ] }
    >
      {record && (
        <div>
          <Input
            id = 'document_number'
            name = 'documentNumber'
            placeholder = 'Document Number'
            value = { editing ? formData.number : record.document_number }
            onChange = { (e) => handleInputChange(e, 'number') }
            style = { { marginBottom: 8, backgroundColor: 'white', cursor: 'text' } }
            disabled = { !editing }
          />
          <div style={{ marginBottom: 1 }}></div>
          <Input
            id = 'document_title'
            name = 'documentTitle'
            placeholder = 'Document Title'
            value = { editing ? formData.title : record.document_title }
            onChange={(e) => handleInputChange(e, 'title')}
            style = { { marginBottom: 8, backgroundColor: 'white', cursor: 'text' } }
            disabled = { !editing }
          />
          <div style={{ marginBottom: 1 }}></div>
          <Input
            id = 'document_title_native'
            name = 'documentTitleNative'
            placeholder = 'Document Title Native'
            value = { editing ? formData.title_native : record.document_title_native }
            onChange={(e) => handleInputChange(e, 'title_native')}
            style = { { marginBottom: 8, backgroundColor: 'white', cursor: 'text' } }
            disabled = { !editing }
          />
          <div style={{ marginBottom: 1 }}></div>
          <TextArea
            id = 'remarks'
            name = 'remarks'
            rows = { 3 }
            placeholder = 'Remarks'
            value = { editing ? formData.remarks : record.remarks }
            onChange={(e) => handleInputChange(e, 'remarks')}
            style = { { marginBottom: 8, backgroundColor: 'white', cursor: 'text' } }
            disabled = { !editing }
          />
          <div style={{ marginBottom: 1 }}></div>
          <Select
            id = 'discipline'
            name = 'discipline'
            placeholder = 'Select Discipline'
            value = { editing ? formData.discipline_id : disciplinesList.find(d => d.name === record.discipline)?.id } // Используем ID дисциплины
            onChange = { (value) => handleSelectChange(value, 'discipline_id') }
            loading = { loading }
            style = { { marginBottom: 8, backgroundColor: 'white', cursor: 'text', width: '100%' } }
            disabled = { !editing }
          >
            {disciplinesList.length > 0 && disciplinesList.map((discipline) => (
              <Option key = { discipline.id } value = { discipline.id } >
                { discipline.name }
              </Option>
            ))}
          </Select>
          <div style={{ marginBottom: 1 }}></div>
          <Select
            id = 'document_type'
            name = 'documentType'
            placeholder = 'Select Document Type'
            value = { editing ? formData.type_id : documentTypesList.find(dt => dt.name === record.document_type)?.id }
            onChange = { (value) => handleSelectChange(value, 'type_id') }
            loading = { loading }
            style = { { marginBottom: 8, backgroundColor: 'white', cursor: 'text', width: '100%' } }
            disabled = { !editing }
          >
            {documentTypesList.length > 0 && documentTypesList.map((document_type) => (
              <Option key = { document_type.id } value = { document_type.id } >
                { document_type.name }
              </Option>
            ))}
          </Select>
          <div style={{ marginBottom: 1 }}></div>
          <Select
            id = 'revision_status'
            name = 'revisionStatus'
            placeholder = 'Select Revision Status'
            value = { editing ? formData.revision_status_id : revisionStatusesList.find(rs1 => rs1.name === record.revision_status)?.id }
            onChange = { (value) => handleSelectChange(value, 'revision_status_id') }
            loading = { loading }
            style = { { marginBottom: 8, backgroundColor: 'white', cursor: 'text', width: '100%' } }
            disabled = { !editing }
          >
            {revisionStatusesList.length > 0 && revisionStatusesList.map((revision_status) => (
              <Option key = { revision_status.id } value = { revision_status.id } >
                { revision_status.name }
              </Option>
            ))}
          </Select>
          <div style={{ marginBottom: 1 }}></div>
          <Select
            id = 'revision_step'
            name = 'revisionStep'
            placeholder = 'Select Revision Step'
            value = { editing ? formData.revision_step_id : revisionStepsList.find(rs2 => rs2.description === record.revision_step)?.id }
            onChange = { (value) => handleSelectChange(value, 'revision_step_id') }
            loading = { loading }
            style = { { marginBottom: 8, backgroundColor: 'white', cursor: 'text', width: '100%' } }
            disabled = { !editing }
          >
            {revisionStepsList.length > 0 && revisionStepsList.map((revision_step) => (
              <Option key = { revision_step.id } value = { revision_step.id } >
                { revision_step.code }
              </Option>
            ))}
          </Select>
          <div style={{ marginBottom: 1 }}></div>
          <Select
            id = 'revision_description'
            name = 'revisionDescription'
            placeholder = 'Select Revision Description'
            value = { editing ? formData.revision_description_id : revisionDescriptionsList.find(rd => rd.description === record.revision_description)?.id }
            onChange = { (value) => handleSelectChange(value, 'revision_description_id') }
            loading = { loading }
            style = { { marginBottom: 8, backgroundColor: 'white', cursor: 'text', width: '100%' } }
            disabled = { !editing }
          >
            {revisionDescriptionsList.length > 0 && revisionDescriptionsList.map((revision_description) => (
              <Option key = { revision_description.id } value = { revision_description.id } >
                { revision_description.code }
              </Option>
            ))}
          </Select>
          <div style={{ marginBottom: 1 }}></div>
          <Input
            id = 'revision_number'
            name = 'revisionNumber'
            placeholder = 'Revision Number'
            value = { editing ? formData.revision_number : record.revision_number }
            onChange={(e) => handleInputChange(e, 'revision_number')}
            style = { { marginBottom: 8, backgroundColor: 'white', cursor: 'text' } }
            disabled = { !editing }
          />
          <div style={{ marginBottom: 1 }}></div>
          <Select
            id = 'language'
            name = 'Language'
            placeholder = 'Select Language'
            value = { editing ? formData.language_id : languagesList.find(l => l.name === record.language)?.id }
            onChange = { (value) => handleSelectChange(value, 'language_id') }
            loading = { loading }
            style = { { marginBottom: 8, backgroundColor: 'white', cursor: 'text', width: '50%' } }
            disabled = { !editing }
          >
            {languagesList.length > 0 && languagesList.map((language) => (
              <Option key = { language.id } value = { language.id } >
                { language.name }
              </Option>
            ))}
          </Select>
          <div style={{ marginBottom: 1 }}></div>
          <Upload
            { ...uploadProps }
            fileList = { files }
          >
            <Button
              icon = { <UploadOutlined /> }
              disabled = { !editing } >
              Select File(s)
            </Button>
          </Upload>
        </div>
      )}
    </Modal>
  )
}

const ExportToExcelButton = ({ dataSource, columns, filename }) => {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dataSource.map(item => {
      const row = {}
      columns.forEach(column => {
        row[column.title] = item[column.dataIndex];
      })
      return row;
    }))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }
  return (
    <Tooltip title = 'Export to Excel' placement = 'rightTop'>
      <Button
        type = 'primary'
        icon = {<DownloadOutlined />}
        onClick = { exportToExcel }
        style = {{ position: 'fixed', right: 8, top: 78, zIndex: '999' }} >
      </Button>
    </Tooltip>
  )
}

const AddNewDocumentButton = ({ setNewdocModalVisible }) => {
  const handleClick = () => {
    setNewdocModalVisible(true)
  }
  return (
    <Tooltip title = 'Create new document' placement = 'rightTop'>
      <Button
        type = 'primary'
        shape = 'circle'
        onClick = { handleClick }
        style = {{ position: 'fixed', right: 8, top: 120, zIndex: '999' }} >
          +
      </Button>
    </Tooltip>
  )
}

const AddNewDocumentModal = ({ visible, onClose }) => {
  const [disciplinesList, setDisciplinesList] = useState([])
  const [documentTypesList, setDocumentTypesList] = useState([])
  const [revisionStatusesList, setRevisionStatusesList] = useState([])
  const [revisionStepsList, setRevisionStepsList] = useState([])
  const [revisionDescriptionsList, setRevisionDescriptionsList] = useState([])
  const [languagesList, setlanguagesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [fileList, setFileList] = useState([])

  const [formData, setFormData] = useState({
    document_number: '',
    document_title: '',
    document_title_native: '',
    remarks: '',
    revision_number: '',
    //document_type: 0,
    //language: 0,
    //vendor: '',
    //discipline: '',
  })

  useEffect(() => {
    const fillSelects = async () => {
      try {
        setLoading(true)
        const disciplinesData = await getDisciplines()
        setDisciplinesList(disciplinesData)
        const documentTypesData = await getDocumentTypes()
        setDocumentTypesList(documentTypesData)
        const revisionStatusesData = await getRevisionStatuses()
        setRevisionStatusesList(revisionStatusesData)
        const revisionStepsData = await getRevisionSteps()
        setRevisionStepsList(revisionStepsData)
        const revisionDescriptionsData = await getRevisionDescriptions()
        setRevisionDescriptionsList(revisionDescriptionsData)
        const languagesData = await getLanguages()
        setlanguagesList(languagesData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }
    fillSelects()
  }, [])

  const handleInputChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value })
  }

  const handleSelectChange = (id, field) => {
    setFormData({ ...formData, [field]: id })
  }

  const handleUploadChange = (info) => {
    let fileList = [...info.fileList]
    // Ограничение на количество файлов
    fileList = fileList.slice(-5)
    // Чтение из ответа и показ ссылки на файл
    fileList = fileList.map(file => {
      if (file.response) {
        file.url = file.response.url
      }
      return file
    })
    setFileList(fileList)
  }

  const handleModalClose = () => {
    setFormData({
      document_number: '',
      document_title: '',
      document_title_native: '',
      remarks: '',
      revision_number: '',
      //document_type: '',
      //language: '',
      //vendor_name: '',
      //discipline: '',
    })
    setFileList([])
    onClose()
  }

  const uploadProps = {
    onChange: handleUploadChange, // Передаем функцию обратного вызова для обработки изменений
    beforeUpload: () => false, // Отменяем автоматическую загрузку
    multiple: true, // Разрешить загрузку нескольких файлов
  }

  const handleSubmit = async () => {
    try {
      setUploading(true)
      const newDocumentResponse = await axios.post('http://localhost:8000/api/addnewdoc', { // Отправляем запрос на добавление новой записи документа
        document_number: formData.document_number,
        document_title: formData.document_title,
        document_title_native: formData.document_title_native,
        remarks: formData.remarks,
        discipline: formData.discipline,
        document_type: formData.document_type,
        revision_status: formData.revision_status,
        revision_step: formData.revision_step,
        revision_description: formData.revision_description,
        revision_number: formData.revision_number,
        language: formData.language
      })
  
      const documentId = newDocumentResponse.data.document_id  // Получаем id новой записи из ответа
  
      if (fileList.length > 0) {
        const filesFormData = new FormData()
        fileList.forEach(file => {
          filesFormData.append('files', file.originFileObj)
        })

        await axios.post(`http://localhost:8000/api/addfiles?document_id=${documentId}`, filesFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }
  
      console.log('Document added:', newDocumentResponse.data)
  
      handleModalClose()
      notification.success({
        message: 'New document created successfully',
        placement: 'topRight'
      })
    } catch (error) {
      console.error('Error submitting data:', error)
      // Обработка ошибки при отправке данных
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal
      title = 'Create New Document'
      open = { visible }
      onCancel = { handleModalClose }
      footer = { [
        <Button
          id = 'cancel'
          name = 'cancelButton'
          key = 'cancel'
          onClick = { handleModalClose } >
          Cancel
        </Button>,
        <Button
          id = 'create'
          name = 'createButton'
          key= 'submit'
          type = 'primary'
          onClick = { handleSubmit } >
          Create
        </Button>,
      ] }
    >
      {uploading ? (
        <div style = { { textAlign: 'center' } } >
          <Spin size = 'large' />
        </div>
      ) : (
        <>
          <Input
            placeholder = 'Document Number'
            value = { formData.document_number }
            onChange = { (e) => handleInputChange(e, 'document_number') }
            style = { { marginBottom: 8 } }
          />
          <Input
            placeholder = 'Document Title'
            value={formData.document_title}
            onChange={(e) => handleInputChange(e, 'document_title')}
            style = { { marginBottom: 8 } }
          />
          <Input
            placeholder = 'Document Title Native'
            value={formData.document_title_native}
            onChange={(e) => handleInputChange(e, 'document_title_native')}
            style = { { marginBottom: 8 } }
          />
          <TextArea
            rows = { 3 }
            placeholder = 'Remarks'
            value={formData.remarks}
            onChange={(e) => handleInputChange(e, 'remarks')}
            style = { { marginBottom: 8 } }
          />
          <Select
            placeholder = 'Select Discipline'
            value = { formData.discipline !== '' ? formData.discipline : undefined }
            onChange = { (id) => handleSelectChange(id, 'discipline') }
            loading = { loading }
            style = { { marginBottom: 8, width: '100%' } }
          >
            {disciplinesList.length > 0 && disciplinesList.map((discipline) => (
              <Option key={discipline.id} value={discipline.id}>
                {discipline.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder = 'Select Document Type'
            value = { formData.document_type !== '' ? formData.document_type : undefined }
            onChange = { (id) => handleSelectChange(id, 'document_type') }
            loading = { loading }
            style = { { marginBottom: 8, width: '100%' } }
          >
            {documentTypesList.length > 0 && documentTypesList.map((document_type) => (
              <Option key={document_type.id} value={document_type.id}>
                {document_type.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder = 'Select Revision Status'
            value = { formData.revision_status !== '' ? formData.revision_status : undefined }
            onChange = { (id) => handleSelectChange(id, 'revision_status') }
            loading = { loading }
            style = { { marginBottom: 8, width: '100%' } }
          >
            {revisionStatusesList.length > 0 && revisionStatusesList.map((revision_status) => (
              <Option key={revision_status.id} value={revision_status.id}>
                {revision_status.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder = 'Select Revision Step'
            value = { formData.revision_step !== '' ? formData.revision_step : undefined }
            onChange = { (id) => handleSelectChange(id, 'revision_step') }
            loading = { loading }
            style = { { marginBottom: 8, width: '100%' } }
          >
            {revisionStepsList.length > 0 && revisionStepsList.map((revision_step) => (
              <Option key={revision_step.id} value={revision_step.id}>
                {revision_step.code}
              </Option>
            ))}
          </Select>
          <Select
            placeholder = 'Select Revision Description'
            value = { formData.revision_description !== '' ? formData.revision_description : undefined }
            onChange = { (id) => handleSelectChange(id, 'revision_description') }
            loading = { loading }
            style = { { marginBottom: 8, width: '100%' } }
          >
            {revisionDescriptionsList.length > 0 && revisionDescriptionsList.map((revision_description) => (
              <Option key={revision_description.id} value={revision_description.id}>
                {revision_description.code}
              </Option>
            ))}
          </Select>
          <Input
            placeholder = 'Revision Number'
            value={formData.revision_number}
            onChange={(e) => handleInputChange(e, 'revision_number')}
            style = { { marginBottom: 8 } }
          />
          <Select
            placeholder = 'Select Language'
            value = { formData.language !== '' ? formData.language : undefined }
            onChange = { (id) => handleSelectChange(id, 'language') }
            loading = { loading }
            style = { { marginBottom: 8, width: '50%' } }
          >
            {languagesList.length > 0 && languagesList.map((language) => (
              <Option key = { language.id } value = { language.id } >
                { language.name }
              </Option>
            ))}
          </Select>
          <div style={{ marginBottom: 1 }}></div>
          <Upload
            { ...uploadProps }
            fileList = { fileList }
          >
            <Button icon = { <UploadOutlined /> }>Select File(s)</Button>
          </Upload>
        </>
      )}
    </Modal>
  )
}

const App = () => {
  const [mainData, setMainData] = useState([])
  const [filteredDataSource, setFilteredDataSource] = useState(mainData)
  const [recModalVisible, setRecModalVisible] = useState(false)
  const [newdocModalVisible, setNewdocModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState([])
  const [tableLoading, setTableLoading] = useState(true)

  const now = new Date() // Получаем текущую дату и время
  const year = now.getFullYear() // Получаем текущий год
  const month = ('0' + (now.getMonth() + 1)).slice(-2) // Получаем текущий месяц и добавляем нули спереди, если месяц меньше 10
  const day = ('0' + now.getDate()).slice(-2) // Получаем текущий день месяца и добавляем нули спереди, если день меньше 10
  const hours = ('0' + now.getHours()).slice(-2) // Получаем текущее часы и добавляем нули спереди, если часы меньше 10
  const minutes = ('0' + now.getMinutes()).slice(-2) // Получаем текущие минуты и добавляем нули спереди, если минуты меньше 10

  useEffect(() => {
    const fetchData = async () => {
      try {
        setTableLoading(true)
        const response = await getMainData()
        setMainData(response)
        setTableLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setTableLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    handleFilterSubmit({})
  }, [mainData])

  const onClickRow = (record) => {  // обработчик события клика по записи в таблице, открывает модальное окно
    setSelectedRecord(record)
    setRecModalVisible(true)
  }

  const closeModal = () => {  // функция закрытия модального окна
    setSelectedRecord(null)
    setRecModalVisible(false)
  }

  const rowClassName = (record, index) => { // Добавляем класс для изменения курсора
    return 'no-wrap hover-cursor'
  }

  const handleFilterSubmit = (filters) => { // обработчик события нажатия на кнопку Search Для поиска по заданным критериям
    let filteredData = [...mainData]
    const textFilters = [
      'document_number',
      'document_title',
      'discipline',
      'document_type',
      'revision_status',
      'revision_step',
      'revision_description',
      'language'
    ]
    textFilters.forEach(filterKey => {
      if (filters[filterKey]) {
        if (filterKey === 'language' || filterKey === 'discipline') {
          filteredData = filteredData.filter(item => item[filterKey].toLowerCase() === filters[filterKey].toLowerCase())
        } else {
          filteredData = filteredData.filter(item => item[filterKey].toLowerCase().includes(filters[filterKey].toLowerCase()))
        }
      }
    })
    if (filters.created && filters.created.length === 2) {
      const startDate = filters.created[0].startOf('day').toDate()
      const endDate = filters.created[1].endOf('day').toDate()
      console.log({startDate})
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.created)
        return itemDate >= startDate && itemDate <= endDate;
      })
    }
    setFilteredDataSource(filteredData)
  }

  return (
    <Layout>
      <Layout.Header style = { { position: 'fixed', zIndex: 1, width: '100%', backgroundColor: 'RGB(48, 114, 251)' } } >
        
      </Layout.Header>
      <Layout>
        <Content style = { { marginTop: 67 } } >
          <FilterSidebar onSubmit = { handleFilterSubmit } />
        </Content>
      </Layout>
      <Layout style = { { minHeight: '90vh' } } >
        <Content style = { { padding: '0 50px', marginLeft: '20%' } } >
          <div className = 'site-layout-content' >
            <ExportToExcelButton
              dataSource = { filteredDataSource }
              columns = { columns }
              filename = { `documentsData_${day}.${month}.${year} ${hours}.${minutes}` } />
            <AddNewDocumentButton
              setNewdocModalVisible = { setNewdocModalVisible }
              disabled = { selectedRecord !== null } />
            <Spin
              spinning = { tableLoading }
              size = 'large' >
              <Table
                columns = { columns.filter((column) => !column.hidden) }
                dataSource = { filteredDataSource }
                loading = { tableLoading }
                style = { { width: '100%' } }
                pagination = { { pageSize: 13, showSizeChanger: false } } // убрал херню рядом с пагинацией
                scroll = { { y: 750 } }
                onRow = { (record) => {
                  return {
                    onClick: () => onClickRow(record),
                  };
                }}
                rowClassName = { rowClassName }
                rowKey = { 'id' }
              />
            </Spin>
          </div>
        </Content>
      </Layout>
      <RecordModal
        record = { selectedRecord }
        visible = { recModalVisible }
        onClose = { closeModal }
      />
      <AddNewDocumentModal
        visible = { newdocModalVisible }
        onClose = { () => setNewdocModalVisible(false) }
      />
    </Layout>
  )
}

export default App;
