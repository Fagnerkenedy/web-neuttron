import React from 'react';
import { Table, ConfigProvider } from 'antd';

const DataTable = ({ columns, data, rowSelection, currentData, totalTableWidth }) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBorderRadius: 0,
          },
        },
      }}
    >
      <Table
        className='antd-table'
        rowSelection={rowSelection}
        columns={columns}
        dataSource={currentData}
        onChange={() => {}}
        pagination={false}
        size="middle"
        scroll={{
          x: totalTableWidth,
          y: 'calc(100vh - 182px)',
        }}
      />
    </ConfigProvider>
  );
};

export default DataTable;
