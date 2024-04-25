import Link from "antd/es/typography/Link";
import axios from "axios";
const linkApi = process.env.REACT_APP_LINK_API;

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
      render: (text, record) => (
        <Link href={`/${org}/${moduleName}/${record.id}`}>{text}</Link>
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

    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const module_name = pathParts[2]

    // Busca os campos relacionados do módulo
    const relatedFieldResponse = await axios.get(`${linkApi}/crm/${org}/${module_name}/relatedField`, config);
    const relatedFields = relatedFieldResponse.data;

    // Mapeia as chamadas axios para buscar os dados relacionados para cada campo
    const fetchRelatedDataPromises = relatedFields.map(async (field) => {
      const { related_id: fieldRelatedId, api_name } = field;
      const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/relatedData/${related_id}/${api_name}`, config);
      return response.data;
    });

    // Aguarda todas as chamadas axios serem concluídas
    const relatedDataResponses = await Promise.all(fetchRelatedDataPromises);

    // Processa os dados recebidos, se necessário
    const processedData = relatedDataResponses.map((data) => {
      console.log("data processed: ", data)
      // Aqui você pode manipular os dados conforme necessário
      return data;
    });

    console.log("retorno data", processedData[0])
    // Retorna os dados processados
    return processedData[0];
  } catch (err) {
    console.log("Erro de rede: ", err);
    throw err;
  }
};
