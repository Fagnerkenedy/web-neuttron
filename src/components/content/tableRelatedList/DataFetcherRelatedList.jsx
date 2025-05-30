import axios from "axios";
import Link from "../../utils/Link";
const linkApi = import.meta.env.VITE_LINK_API;

export const fetchColumns = async (org, moduleName, related_id) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const [fieldsResponse, relatedDataResponse] = await Promise.all([
      axios.get(`${linkApi}/crm/${org}/${moduleName}/fields`, config),
      axios.get(`${linkApi}/crm/${org}/${moduleName}/relatedData/${related_id}`, config)
    ]);

    const columnsData = fieldsResponse.data;
    const relatedData = relatedDataResponse.data;

    const columns = columnsData.map(column => ({
      title: column.name,
      dataIndex: column.api_name,
      width: 200,
      ellipsis: true,
      field_type: column.field_type,
      render: (text, record) => (
        <Link to={`/${org}/${moduleName}/${record.id}`}>{text}</Link>
      )
    }));

    return columns;
  } catch (err) {
    console.log("Network " + err);
    throw err;
  }
};

export const fetchData = async (org, moduleName, related_id) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    console.log("entrou aqui")
    const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/relatedData/${related_id}`, config);

    console.log("response data", response.data)
    return response.data;
  } catch (err) {
    console.log("Erro de rede: ", err);
    throw err;
  }
};
