import axios from 'axios'
const linkApi = process.env.REACT_APP_LINK_API

export const fetchPermissions = async () => {
    // const org = localStorage.getItem('org')
    // const user = JSON.parse(localStorage.getItem('user'))
    const org = localStorage.getItem('org');
    const user = localStorage.getItem('user');
    if (!org || !user) {
        console.error("Missing org or user in localStorage");
        return null;
    }
    const parsedUser = JSON.parse(user);
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("No token found");
        return null;
    }
    try {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        const response = await axios.get(`${linkApi}/permissions/${org}/${parsedUser.id}`, config)
        if (response.status === 401) {
            return "Unauthorized";
        }
        return response.data;
    } catch (err) {
        console.log("Network " + err)
        throw err
    }
};
