import axios from 'axios'
import { notification } from 'antd'

const API_URL = 'http://localhost:8000/api'

export const getMainData = async () => {
    try {
        const response = await axios.get(`${API_URL}/data`)
        return response.data
    } catch (error) {
        console.error('Error fetching documents data:', error)
        throw error
    }
}

export const getDisciplines = async () => {
    try {
        const response = await axios.get(`${API_URL}/disciplines`)
        return response.data
    } catch (error) {
        console.error('Error fetching disciplines:', error)
        throw error
    }
}

export const getDocumentTypes = async () => {
    try {
        const response = await axios.get(`${API_URL}/document_types`)
        return response.data
    } catch (error) {
        console.error('Error fetching document types:', error)
        throw error
    }
}

export const getRevisionStatuses = async () => {
    try {
        const response = await axios.get(`${API_URL}/revision_statuses`)
        return response.data
    } catch (error) {
        console.error('Error fetching revision statuses:', error)
        throw error
    }
}

export const getRevisionSteps = async () => {
    try {
        const response = await axios.get(`${API_URL}/revision_steps`)
        return response.data
    } catch (error) {
        console.error('Error fetching revision steps:', error)
        throw error
    }
}

export const getRevisionDescriptions = async () => {
    try {
        const response = await axios.get(`${API_URL}/revision_descriptions`)
        return response.data
    } catch (error) {
        console.error('Error fetching revision descriptions:', error)
        throw error
    }
}

export const getLanguages = async () => {
    try {
        const response = await axios.get(`${API_URL}/languages`)
        return response.data
    } catch (error) {
        console.error('Error fetching languages:', error)
        throw error;
    }
}

export const deleteDocument = async (record, onClose) => {
    try {
        if (!record || !record.id) {    // Если нет записи или id, выходим из функции
            return
        }
        const response_document = await axios.put(`${API_URL}/deldoc/${record.id}`)
        const response_files = await axios.put(`${API_URL}/deldocfil/${record.id}`)
        console.log('Record deleted:', response_document.data)
        console.log('Records deleted:', response_files.data)
        notification.success(
            {
                message: 'Document deleted successfully',
                placement: 'topRight'
            }
        )
        onClose()
    } catch (error) {
        console.error('Error deleting record:', error)
        notification.error(
            {
                message: 'Failed to delete record',
                placement: 'topRight'
            }
        )
    }
}

export const getUploadedFiles = async (record, visible, setUploadedFiles) => {
    if (visible && record) {
        try {
            const response = await axios.get(`${API_URL}/getfiles/${record.id}`)
            setUploadedFiles(response.data)
        } catch (error) {
            console.error('Error fetching uploaded files:', error)
        }
    }
}

export const updateDocument = async (record, formData, setEditing, onClose) => {
    try {
        const response = await axios.put(`${API_URL}/upddoc/${record.id}`, formData)
        console.log('Record updated:', response.data)
        notification.success(
            {
                message: 'Document updated successfully',
                placement: 'topRight',
            })
        setEditing(false) // Отключаем режим редактирования
        onClose() // Закрываем модальное окно после сохранения
    } catch (error) {
        console.error('Error updating record:', error)
        notification.error(
            {
                message: 'Failed to update document',
                placement: 'topRight',
            }
        )
    }
}