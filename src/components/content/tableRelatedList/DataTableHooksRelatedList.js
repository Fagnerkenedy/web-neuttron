// DataTableHooks.js
import { useEffect, useState } from 'react';
import { fetchColumns, fetchData } from './DataFetcherRelatedList';

export const useDataTable = ({ related_module, related_id }) => {
  const [columns, setColumns] = useState([]);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchDataAndColumns = async () => {
      try {
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/');
        const org = pathParts[1]
        const moduleName = pathParts[2]
        setColumns([]);
        setTableData([]);

        const [columnsResult, dataResult] = await Promise.all([
          fetchColumns(org, related_module, related_id),
          fetchData(org, related_module, related_id),
        ]);

        setColumns(columnsResult);
        setTableData(dataResult);
      } catch (err) {
        console.error("Erro:", err);
      }
    };

    fetchDataAndColumns();
    console.log("askdn",tableData)
  }, []);

  return { columns, tableData };
};
