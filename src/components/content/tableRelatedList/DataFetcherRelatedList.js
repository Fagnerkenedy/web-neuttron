import Link from "antd/es/typography/Link";
import axios from "axios";
const linkApi = process.env.REACT_APP_LINK_API;
let columns = []

export const fetchColumns = async (org, moduleName, related_id) => {
  try {
    const token = localStorage.getItem('token');
    console.log("local tokentoken:", token)
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
    console.log("ColumnsData:", columnsData);
    console.log("RelatedData:", relatedData);

    const columns = columnsData.map(column => ({
      title: column.name,
      dataIndex: column.api_name,
      width: 200,
      ellipsis: true,
      render: (text, record) => (
        <Link href={`/${org}/${moduleName}/${record.key}`}>{text}</Link>
      )
    }));

    console.log("Columns:", columns);
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

    // Busca os campos relacionados do módulo
    const relatedFieldResponse = await axios.get(`${linkApi}/crm/${org}/Clientes/relatedField`, config);
    const relatedFields = relatedFieldResponse.data;

    // Mapeia as chamadas axios para buscar os dados relacionados para cada campo
    const fetchRelatedDataPromises = relatedFields.map(async (field) => {
      const { related_id: fieldRelatedId, api_name } = field;
      const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/relatedData/${fieldRelatedId}/${api_name}`, config);
      return response.data;
    });

    // Aguarda todas as chamadas axios serem concluídas
    const relatedDataResponses = await Promise.all(fetchRelatedDataPromises);

    // Processa os dados recebidos, se necessário
    const processedData = relatedDataResponses.map((data) => {
      // Aqui você pode manipular os dados conforme necessário
      return data;
    });

    // Retorna os dados processados
    return processedData[0];
  } catch (err) {
    console.log("Erro de rede: ", err);
    throw err;
  }
};
