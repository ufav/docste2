import axios from 'axios'
import { notification } from 'antd'

const API_URL = 'http://localhost:8000/api'

export const getMainData = async (folder_id) => {
    try {
        const response = await axios.get(`${API_URL}/data`, {
            params: { folder_id }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching documents data:', error);
        throw error;
    }
};

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

export const getProjects = async () => {
    try {
        const response = await axios.get(`${API_URL}/projects`);
        return response.data;
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
};

export const getFolders = async (projectId) => {
    try {
        const response = await axios.get(`${API_URL}/folders/${projectId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching folders:', error);
        throw error;
    }
};

export const createFolder = async (folderData) => {
    try {
      const response = await axios.post(`${API_URL}/addfolder`, folderData);
      return response.data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  };
  
export const updateFolder = async (folderId, folderData) => {
try {
    const response = await axios.put(`${API_URL}/folders/${folderId}`, folderData);
    return response.data;
} catch (error) {
    console.error('Error updating folder:', error);
    throw error;
}
};

export const deleteFolder = async (folderId) => {
try {
    const response = await axios.delete(`${API_URL}/folders/${folderId}`);
    return response.data;
    } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
    }
};

export const getUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/users`)
        return response.data
    } catch (error) {
        console.error('Error fetching users:', error)
        throw error;
    }
}

export const getRoles = async () => {
    try {
        const response = await axios.get(`${API_URL}/roles`)
        return response.data
    } catch (error) {
        console.error('Error fetching roles:', error)
        throw error;
    }
}

export const updateUser = async (id, updatedData) => {
    try {
        const response = await axios.put(`${API_URL}/users/${id}`, updatedData);
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const getUserProjects = async (userid) => {
    try {
        const response = await axios.get(`${API_URL}/user_projects`, {
            params: {
                id: userid
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
};

export const addUsersProjectAccess = async (references) => {
    try {
      const response = await axios.post('http://localhost:8000/api/add_users_project_access', references);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const getUserProjectAccess = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/user_project_access/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const registerUser = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8000/register', userData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to register user');
    }
  };
  
  export const changePassword = async (data) => {
    try {
        const response = await axios.post('http://localhost:8000/change-password', data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw new Error('Failed to change password');
    }
  };

export const deactivateUser = async (userId) => {
  try {
    const response = await axios.put(`${API_URL}/user-deactivate/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to deactivate user:', error);
    throw error;
  }
};

export const getToken = async (username, password) => {
    const formDetails = new URLSearchParams();
    formDetails.append('username', username);
    formDetails.append('password', password);
  
    try {
      const response = await axios.post('http://localhost:8000/token', formDetails, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Authentication error');
      }
    } catch (error) {
      throw error;
    }
  };