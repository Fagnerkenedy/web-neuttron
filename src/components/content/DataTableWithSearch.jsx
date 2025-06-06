// DataTable.js
import React, { useEffect, useRef, useState } from 'react';
import { Table, ConfigProvider, Button, Input, Space, Spin, Layout, Empty, Typography, Checkbox, Select, Pagination } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, CloseCircleOutlined, CheckOutlined } from '@ant-design/icons';
// import Link from 'antd/es/typography/Link';
import { useNavigate, useParams } from 'react-router-dom'
import Link from '../utils/Link.jsx';
import Loading from '../utils/Loading'
import { fetchModules } from '../content/selection/fetchModules.js';
import pluralize from 'pluralize';

const { Title, Text } = Typography;

const DataTable = ({ columns, data, rowSelection, currentData, totalTableWidth, loading, totalItems, pageSize, onPageChange, currentPage }) => {
  // const currentPath = window.location.pathname;
  // const pathParts = currentPath.split('/');
  // const org = pathParts[1]
  // const moduleName = pathParts[2]
  const { org, module } = useParams();
  const moduleName = module
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [activeModule, setActiveModule] = useState("");
  const searchInput = useRef(null);
  const navigate = useNavigate()

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
  }, [moduleName]);

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
      style={{ height: 'calc(100vh - 210px)', alignContent: 'center' }}
    >
      <Button
        type="primary"
        onClick={() => navigate(`/${org}/${moduleName}/create`)}
      >Criar {moduleName == "users" ? ("Usuário") :
        moduleName == "profiles" ? ("Perfil") :
          moduleName == "functions" ? ("Função") :
            moduleName == "charts" ? ("Gráfico") :
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

  const getColumnSearchProps = (dataIndex, title, field_type) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {field_type == "checkbox" && (
          <>
            <Select
              ref={searchInput}
              placeholder={`Pesquisar ${title}`}
              checked={selectedKeys[0] === true}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              // onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
              options={[
                {
                  value: 1,
                  label: 'Selecionado'
                },
                {
                  value: 0,
                  label: 'Não Selecionado'
                }
              ]}
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
          </>
        )}
        {field_type != "checkbox" && (
          <>
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
          </>
        )}
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
      // const currentPath = window.location.pathname;
      // const pathParts = currentPath.split('/');
      // const moduleName = pathParts[2]
      const { org, module } = useParams();
      const moduleName = module
      const formatDate = (dateString) => {
        const date = new Date(dateString)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
      };
      const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
      };
      switch (field_type) {
        case 'checkbox':
          return searchedColumn === dataIndex ? (
            <Link to={`${productId}`}>
              <Highlighter
                highlightStyle={{
                  backgroundColor: '#ffc069',
                  padding: 0,
                }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text == 1 ? <CheckOutlined /> : ''}
              />
            </Link>
          ) : (
            <Link to={`${productId}`}>{text == 1 ? <CheckOutlined /> : ''}</Link>
          )
        case 'date':
          return searchedColumn === dataIndex ? (
            <Link to={`${productId}`}><Highlighter
              highlightStyle={{
                backgroundColor: '#ffc069',
                padding: 0,
              }}
              searchWords={[searchText]}
              autoEscape
              textToHighlight={text ? text.toString() : ''}
            /></Link>
          ) : (
            <Link to={`${productId}`}>{text ? formatDate(text) : null}</Link>
          )
        case 'date_time':
          return searchedColumn === dataIndex ? (
            <Link to={`${productId}`}><Highlighter
              highlightStyle={{
                backgroundColor: '#ffc069',
                padding: 0,
              }}
              searchWords={[searchText]}
              autoEscape
              textToHighlight={text ? text.toString() : ''}
            /></Link>
          ) : (
            <Link to={`${productId}`}>{text ? formatDateTime(text) : null}</Link>
          )
        default:
          return searchedColumn === dataIndex ? (
            <Link to={`${productId}`}>
              <Highlighter
                highlightStyle={{
                  backgroundColor: '#ffc069',
                  padding: 0,
                }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text ? text.toString() : ''}
              />
            </Link>
          ) : (
            <Link to={`${productId}`}>{text}</Link>
          )
      }
      // return searchedColumn === dataIndex ? (
      //   <Link to={`${productId}`}><Highlighter
      //     highlightStyle={{
      //       backgroundColor: '#ffc069',
      //       padding: 0,
      //     }}
      //     searchWords={[searchText]}
      //     autoEscape
      //     textToHighlight={text ? text.toString() : ''}
      //   /></Link>
      // ) : (
      //   <Link to={`${productId}`}>{text}</Link>
      // )
    },
  });

  const modifiedColumns = columns.map((col) => ({
    ...col,
    ...getColumnSearchProps(col.dataIndex, col.title, col.field_type),
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
        style={{
          // padding: '0 15px 0 15px'
        }}
        rowSelection={rowSelection}
        columns={modifiedColumns}
        dataSource={currentData}
        onChange={() => { }}
        pagination={false}
        scroll={{
          x: totalTableWidth,
          y: 'calc(100vh - 191px)',
        }}
        locale={{ emptyText: emptyText }}
        onRow={(record) => ({
          onClick: () => navigate(`${record.key}`)
        })}
        footer={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Total de registros: {totalItems}</span>
            {totalItems > pageSize && (
              <Pagination
                simple={{ readOnly: true }}
                responsive={true}
                size='small'
                current={currentPage}
                pageSize={pageSize}
                total={totalItems}
                onChange={onPageChange}
              />
            )}
          </div>
        )}
      />
    </ConfigProvider>
  );
};

export default DataTable;
