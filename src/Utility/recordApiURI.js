import recordApiRequest from "./recordApiRequest";

const apiURI = {

  // register: (data) => {
  //   const config = {
  //     method: 'post',
  //     url: `${process.env.REACT_APP_LINK_API}/crm/register`,
  //     data: { ...data }
  //   }

  //   return recordApiRequest(config)

  // },

  // update: (data, batata) => {
  //   const config = {
  //     method: 'put',
  //     url: `${process.env.REACT_APP_LINK_API}/crm/update/${batata}`,
  //     data: { ...data }
  //   }

  //   return recordApiRequest(config)

  // },

  deleteRecord: async ( org, module, record_id ) => {
    const config = {
      method: 'delete',
      url: `${process.env.REACT_APP_LINK_API}/crm/${org}/${module}/${record_id}`
    }

    return recordApiRequest(config)

  },
  

}

export default apiURI;