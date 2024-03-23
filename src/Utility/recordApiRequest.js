import axios from 'axios'

const token = localStorage.getItem('token');
function userApiRequest(config) {
  return new Promise((resolve, reject) => {
    axios({
      ...config,
      headers: {
        'Authorization': `Bearer ${token}`
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
