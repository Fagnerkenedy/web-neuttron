import axios from "axios";
const linkApi = import.meta.env.VITE_LINK_API;
let columns = []

export const fetchColumns = async (org, moduleName) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/fields`, config); const columnsData = response.data;
    columns = columnsData.map((column) => ({
      title: column.name,
      dataIndex: column.api_name,
      field_type: column.field_type,
      sorter: (a, b) => {
        const aValue = a[column.api_name] || '';
        const bValue = b[column.api_name] || '';
        return String(aValue).localeCompare(String(bValue));
      },
      width: 150,
      ellipsis: true,
    }));
    return columns;
  } catch (err) {
    console.log("Network " + err);
    throw err;
  }
};

export const fetchData = async (org, moduleName) => {
  try {
    const token = localStorage.getItem('token'); const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}`, config);
    const groupRecords = (records) => {
      const groupedData = {};

      records.forEach((record) => {
        const { field_api_name, field_value, id } = record;

        if (!groupedData[id]) {
          groupedData[id] = { key: id };
        }

        Object.entries(record).forEach(([key, value]) => {
          if (key !== 'id') {
            groupedData[id][key] = value;
          }
        });
      });

      return Object.values(groupedData);
    };

    const result = groupRecords(response.data);
    console.log("avião: ", result)
    // const recordsData = response.data;
    // const data = recordsData.map((record) => {
    //   const recordObject = { key: record.field_api_name, name: record.field_value };

    //   // Add dynamically new fields to each record
    //   columns.forEach((column) => {
    //     if (!recordObject.hasOwnProperty(column.dataIndex)) {
    //       recordObject[column.dataIndex] = record[column.dataIndex];
    //     }
    //   });

    //   return recordObject;
    // });
    return result;
  } catch (err) {
    console.log("Network " + err);
    throw err;
  }
};
