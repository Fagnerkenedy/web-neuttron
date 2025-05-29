import axios from "axios"
const linkApi = import.meta.env.VITE_LINK_API
const userApiToken = import.meta.env.VITE_USER_API_TOKEN

const getOpenTour = async (org, userId) => {
    try {
        const config = {
            headers: {
                'Authorization': userApiToken
            }
        };
        const response = await axios.get(`${linkApi}/auth/${org}/tour/${userId}`, config)
        return response.data
    } catch (err) {
        console.log("Network " + err)
        throw err
    }
}

const updateOpenTour = async (org, userId) => {
    try {
        const config = {
            headers: {
                'Authorization': userApiToken
            }
        };
        const response = await axios.put(`${linkApi}/auth/${org}/tour/${userId}`, {}, config)
        return response.data
    } catch (err) {
        console.log("Network " + err)
        throw err
    }
}

export { getOpenTour, updateOpenTour }