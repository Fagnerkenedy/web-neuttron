import { useState } from 'react';

export const useSelection = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    //columnWidth: 10,
    fixed: 'left',
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;

  const start = () => {
    setSelectedRowKeys([]);
  };

  return { rowSelection, hasSelected, start, selectedRowKeys };
};
