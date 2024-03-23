import axios from 'axios'
const token = process.env.REACT_APP_USER_API_TOKEN
function userApiRequest(config) {
  return new Promise((resolve, reject) => {
    axios({
      ...config,
      headers: {
        'Authorization': token
      }
    })
      .then(res => {
        return resolve(res);
      })
      .catch(error => {
        return reject(error)
      })
  })
}

export default userApiRequest;
