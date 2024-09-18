import axios from 'axios';

const URL = 'http://localhost:5000/api/v1';
const token = localStorage.getItem('token');
const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
};

const user = JSON.parse(localStorage.getItem('user'));

const apiRequest = async (method, props) => {
    const {
        pathName, data, params,
    } = props;
    const config = {
        method,
        url: `${URL}${pathName}`,
        headers,
        params: { ...params, },
        data,
    };

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data || error.message);
    }
};
export const getAPI = async (pathName, params) => {
    return apiRequest('GET', { pathName, params });
};

export const postAPI = async (pathName, data) => {
    return apiRequest('POST', { pathName, data: { ...data, created_by: user?.user_uid } });
};

export const putAPI = async (pathName, data) => {
    return apiRequest('PUT', { pathName, data: { ...data, updated_by: user?.user_uid } });
};

export const patchAPI = async (pathName, data) => {
    return apiRequest('PATCH', { pathName, data: { ...data, updated_by: user?.user_uid } });
};

export const deleteAPI = async (pathName, data) => {
    return apiRequest('DELETE', { pathName, data });
};
