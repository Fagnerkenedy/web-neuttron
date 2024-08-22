// DataTable.js
import React, { useEffect, useRef, useState } from 'react';
import { Table, ConfigProvider, Button, Input, Space, Spin, Layout, Empty, Typography } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Link from 'antd/es/typography/Link';
import Loading from '../utils/Loading'
import { fetchModules } from '../content/selection/fetchModules.js';
const pluralize = require('pluralize')

const { Title, Text } = Typography;

const DataTable = ({ columns, data, rowSelection, currentData, totalTableWidth, loading }) => {
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const org = pathParts[1]
  const moduleName = pathParts[2]
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [activeModule, setActiveModule] = useState("");
  const searchInput = useRef(null);

  useEffect(() => {
    async function fetchModulesData() {
      const fetchedModules = await fetchModules(org);
      fetchedModules.result.forEach(module => {
        if (module.api_name == moduleName || module.name == moduleName) {
          setActiveModule(module.name)
        }
      });
    }
    fetchModulesData();
  }, []);

  const toSingular = (plural) => {
    return pluralize.singular(plural)
  }

  const emptyText = (
    <Empty
      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
      imageStyle={{ height: 60 }}
      description={
        <Text>
          Nenhum registro encontrado
        </Text>
      }
      style={{ height: 'calc(100vh - 210px)', alignContent: 'center'}}
    >
      <Button
        type="primary"
        href={`/${org}/${moduleName}/create`}
      >Criar {moduleName == "users" ? ("Usuário") :
        moduleName == "profiles" ? ("Perfil") :
          moduleName == "functions" ? ("Função") :
            moduleName == "charts" ? ("Painel") :
              (toSingular(activeModule))}
      </Button>
    </Empty>
  )

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
          y: 'calc(100vh - 177px)',
        }}
        locale={{ emptyText: emptyText }}
        onRow={(record) => ({
          onClick: () => window.location.href = `/${org}/${moduleName}/${record.key}`
        })}
      />
    </ConfigProvider>
  );
};

export default DataTable;
