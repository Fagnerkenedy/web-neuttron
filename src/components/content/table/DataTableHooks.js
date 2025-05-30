// DataTableHooks.js
import { useEffect, useState } from 'react';
import { fetchColumns, fetchData } from '../DataFetcher';
import { useParams } from 'react-router-dom';

export const useDataTable = () => {
  const [columns, setColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true)
  // const currentPath = window.location.pathname;
  // const pathParts = currentPath.split('/');
  // const org = pathParts[1]
  // const moduleName = pathParts[2]
  const { org, module } = useParams();
   const moduleName = module

  useEffect(() => {
    const fetchDataAndColumns = async () => {
      try {
        setColumns([]);
        setTableData([]);

        const [columnsResult, dataResult] = await Promise.all([
          fetchColumns(org, moduleName),
          fetchData(org, moduleName),
        ]);

        setColumns(columnsResult);
        setTableData(dataResult);
        setLoading(false)
      } catch (err) {
        console.error("Erro:", err);
      }
    };

    fetchDataAndColumns();
  }, [moduleName]);

  return { columns, tableData, loading };
};
