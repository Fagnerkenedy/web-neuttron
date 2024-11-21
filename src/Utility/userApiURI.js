import userApiRequest from "./userApiRequest";

const apiURI = {
  checkEmail: (email) => {
    const config = {
      method: 'post',
      url: `${process.env.REACT_APP_USER_API_BASE_URL}/checkemail`,
      data: { email } ,
    }
    return userApiRequest(config);
  },

  checkUsedUsers: (org) => {
    const config = {
      method: 'get',
      url: `${process.env.REACT_APP_USER_API_BASE_URL}/${org}/checkUsedUsers`,
    }
    return userApiRequest(config);
  },

  register: (data) => {
    const config = {
      method: 'post',
      url: `${process.env.REACT_APP_USER_API_BASE_URL}/register`,
      data: { ...data }
    }

    return userApiRequest(config)

  },

  login: (data) => {
    const config = {
      method: 'post',
      url: `${process.env.REACT_APP_USER_API_BASE_URL}/login`,
      data: { ...data }
    }
    return userApiRequest(config)
  },

  sendEmailConfirmation: (data) => {
    const config = {
      method: 'post',
      url: `${process.env.REACT_APP_USER_API_BASE_URL}/mailconfirmation`,
      data: { ...data }
    }
    return userApiRequest(config)
  },

  userConfirmation: (data) => {
    const config = {
      method: 'post',
      url: `${process.env.REACT_APP_USER_API_BASE_URL}/confirmation`,
      data: { ...data }
    }
    return userApiRequest(config)
  },

  updateDarkMode: (data, org) => {
    const config = {
      method: 'put',
      url: `${process.env.REACT_APP_USER_API_BASE_URL}/${org}/updateDarkMode`,
      data: { ...data }
    }

    return userApiRequest(config)

  },

  deleteAccount: (data, org) => {
    const config = {
      method: 'post',
      url: `${process.env.REACT_APP_USER_API_BASE_URL}/deleteaccount`,
      data: { ...data }
    }

    return userApiRequest(config)

  },

  registerPassword: (data, id, org) => {
    const config = {
      method: 'put',
      url: `${process.env.REACT_APP_USER_API_BASE_URL}/${org}/registerPassword/${id}`,
      data: { ...data }
    }

    return userApiRequest(config)

  },

}

export default apiURI;