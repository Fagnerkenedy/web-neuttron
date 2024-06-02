// DataTable.js
import React, { useRef, useState } from 'react';
import { Table, ConfigProvider, Button, Input, Space, Spin } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Link from 'antd/es/typography/Link';
import Loading from '../utils/Loading'

const DataTable = ({ columns, data, rowSelection, currentData, totalTableWidth, loading }) => {
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const org = pathParts[1]
  const moduleName = pathParts[2]
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Pesquisar ${title}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 75,
            }}
          >
            Filtrar
          </Button>
          <Button
            onClick={
              () => {
                clearFilters && handleReset(clearFilters) && setSearchText(selectedKeys[0]) && setSearchedColumn(dataIndex);
                confirm({
                  closeDropdown: true,
                })
              }
            }
            icon={<CloseCircleOutlined />}
            size="small"
            style={{
              width: 75,
            }}
          >
            Limpar
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text, data) => {
      const productId = data && data.key ? data.key : '';
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split('/');
      const moduleName = pathParts[2]
      return searchedColumn === dataIndex ? (
        <Link href={`${moduleName}/${productId}`}><Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        /></Link>
      ) : (
        <Link href={`${moduleName}/${productId}`}>{text}</Link>
      )
    },
  });

  const modifiedColumns = columns.map((col) => ({
    ...col,
    ...getColumnSearchProps(col.dataIndex, col.title),
  }));

  if (loading) {
    return (
      <Loading />
    )
  }

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
        columns={modifiedColumns}
        dataSource={currentData}
        onChange={() => { }}
        pagination={false}
        size="middle"
        scroll={{
          x: totalTableWidth,
          y: 'calc(100vh - 192px)',
        }}
        locale={{ emptyText: 'Nenhum registro encontrado' }}
        onRow={(record) => ({
          onClick: () => window.location.href = `/${org}/${moduleName}/${record.key}`
        })}
      />
    </ConfigProvider>
  );
};

export default DataTable;
