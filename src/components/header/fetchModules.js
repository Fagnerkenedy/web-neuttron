import axios from "axios"
const linkApi = import.meta.env.VITE_LINK_API

export const fetchModules = async (org) => {
    try {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        const response = await axios.get(`${linkApi}/crm/${org}/modules`, config)
        return response.data
    } catch (err) {
        console.log("Network " + err)
        throw err
    }
}