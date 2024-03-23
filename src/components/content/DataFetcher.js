import axios from "axios";
const linkApi = process.env.REACT_APP_LINK_API;
let columns = []

export const fetchColumns = async (org, moduleName) => {
  try {
    const token = localStorage.getItem('token');
    console.log("local tokentoken:", token)
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/fields`, config);
    console.log("Columns:", response.data);
    const columnsData = response.data;
    columns = columnsData.map((column) => ({
      title: column.name,
      dataIndex: column.api_name,
      //sorter: (a, b) => a.name.localeCompare(b.name),
      width: 200,
      ellipsis: true,
    }));

    console.log("Columns columns:", columns);
    return columns;
  } catch (err) {
    console.log("Network " + err);
    throw err;
  }
};

export const fetchData = async (org, moduleName) => {
  try {
    const token = localStorage.getItem('token');
    console.log("local tokentokentokentoken:", token)
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}`, config);
    console.log("Data:", response.data);

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
    console.log("result laranja:", result);
    console.log("result laranja:", response);

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

    // console.log("Data Data:", data);
    return result;
  } catch (err) {
    console.log("Network " + err);
    throw err;
  }
};
