import axios from "axios"
const linkApi = process.env.REACT_APP_LINK_API
const userApiToken = process.env.REACT_APP_USER_API_TOKEN

const getModulesTour = async (org, userId) => {
    try {
        const config = {
            headers: {
                'Authorization': userApiToken
            }
        };
        const response = await axios.get(`${linkApi}/auth/${org}/modulesTour/${userId}`, config)
        return response.data
    } catch (err) {
        console.log("Network " + err)
        throw err
    }
}

const updateModulesTour = async (org, userId) => {
    try {
        const config = {
            headers: {
                'Authorization': userApiToken
            }
        };
        const response = await axios.put(`${linkApi}/auth/${org}/modulesTour/${userId}`, {}, config)
        return response.data
    } catch (err) {
        console.log("Network " + err)
        throw err
    }
}

export { getModulesTour, updateModulesTour }