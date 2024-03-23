// DataTableHooks.js
import { useEffect, useState } from 'react';
import { fetchColumns, fetchData } from '../DataFetcher';

export const useDataTable = () => {
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
          fetchColumns(org, moduleName),
          fetchData(org, moduleName),
        ]);
        console.log("columnsResult",columnsResult)
        console.log("dataResult",dataResult)

        setColumns(columnsResult);
        setTableData(dataResult);
      } catch (err) {
        console.error("Erro:", err);
      }
    };

    fetchDataAndColumns();
  }, []);

  return { columns, tableData };
};
