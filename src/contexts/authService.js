import axios from 'axios'
const linkApi = process.env.REACT_APP_LINK_API

export const fetchPermissions = async () => {
    const org = localStorage.getItem('org')
    const user = JSON.parse(localStorage.getItem('user'))
    try {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        const response = await axios.get(`${linkApi}/permissions/${org}/${user.id}`, config)
        return response.data;
    } catch (err) {
        console.log("Network " + err)
        throw err
    }
};
