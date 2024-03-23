import axios from "axios"
const linkApi = process.env.REACT_APP_LINK_API

export const fetchModules = async (org) => {
    try {
        const token = localStorage.getItem('token');
        console.log("local token:",token)
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        const response = await axios.get(`${linkApi}/crm/${org}/modules`, config)
        console.log("response modules:", response.data)
        return response.data
    } catch (err) {
        console.log("Network " + err)
        throw err
    }
}