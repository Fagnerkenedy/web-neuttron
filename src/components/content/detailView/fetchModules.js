import axios from "axios"
const linkApi = import.meta.env.VITE_LINK_API
const token = localStorage.getItem('token');
const config = {
    headers: {
        'Authorization': `Bearer ${token}`
    }
}

export const fetchModules = async (org) => {
    try {
        const response = await axios.get(`${linkApi}/crm/${org}/modules`, config)
        return response.data
    } catch (err) {
        console.log("Network " + err)
        throw err
    }
}

export const fetchPermissions = async (org, profileId) => {
    try {
        const response = await axios.get(`${linkApi}/permissions/${org}/profile/${profileId}`, config)
        return response.data.permissions[0]
    } catch (err) {
        console.log("Network " + err)
        throw err
    }
}

export const createPermissions = async (org, permissions) => {
    try {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        const response = await axios.put(`${linkApi}/permissions/${org}`, permissions, config)
        return response.data
    } catch (err) {
        console.log("Network " + err)
        throw err
    }
}

export const createProfilesPermissions = async (org, profilesPermissions) => {
    try {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        const response = await axios.put(`${linkApi}/permissions/${org}/profile_permission`, profilesPermissions, config)
        return response.data
    } catch (err) {
        console.log("Network " + err)
        throw err
    }
}

export const deleteProfilesPermissions = async (org, id_profile, id_permission) => {
    try {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        const response = await axios.delete(`${linkApi}/permissions/${org}/${id_profile}/${id_permission}`, config)
        return response.data
    } catch (err) {
        console.log("Network " + err)
        throw err
    }
}