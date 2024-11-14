import React, { useEffect, useState } from 'react';
import { Breadcrumb, Flex, Select, Pagination, Button, Popconfirm, message, Typography, Dropdown, Checkbox, Table, Menu } from 'antd';
import Link from 'antd/es/typography/Link';
import { Option } from 'antd/es/mentions';
import apiURI from '../../../Utility/recordApiURI.js';
import { fetchModules } from './fetchModules.js';
import { Can } from "../../../contexts/AbilityContext.js";
import { useAbility } from '../../../contexts/AbilityContext.js'
import { EllipsisOutlined, SwapOutlined, UnorderedListOutlined } from '@ant-design/icons';
import ColumnsOrder from './ColumnsOrder.js';
import axios from 'axios';
const { deleteRecord } = apiURI;
const pluralize = require('pluralize')
const { Title, Text } = Typography;

const TableControls = ({ hasSelected, selectedRowKeys, start, totalItems, pageSize, onPageChange, onPageSizeChange, currentPage, setLayoutVisualization }) => {
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const org = pathParts[1]
  const moduleName = pathParts[2]
  const apiConfig = {
    baseURL: process.env.REACT_APP_LINK_API,
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  };
  const { ability, loading } = useAbility();
  const [activeModule, setActiveModule] = useState("");
  const [layoutType, setLayoutType] = useState("");

  const confirm = async (e) => {
    await deleteRecord(org, moduleName, selectedRowKeys)
    window.location.reload()
  }

  const toSingular = (plural) => {
    return pluralize.singular(plural)
  }

  const fetchModulesData = async () => {
    const fetchedModules = await fetchModules(org);
    fetchedModules.result.forEach(module => {
      if (module.api_name == moduleName || module.name == moduleName) {
        setActiveModule(module.name)
      }
    });
  }

  const fetchLayoutType = async () => {
    const response = await axios.get(`/crm/${org}/${moduleName}/readLayoutContent`, apiConfig);
    if (response && response.data && response.data.result[0] && response.data.result[0].hasOwnProperty("layout_type")) {
      console.log("response response:> ", response.data.result[0].layout_type)
      setLayoutType(response.data.result[0].layout_type)
      setLayoutVisualization(response.data.result[0].layout_type)
    }
  }

  useEffect(() => {
    fetchModulesData();
    fetchLayoutType()
  }, []);

  const handleChange = async (value) => {
    const response = await axios.put(`/crm/${org}/${moduleName}/updateLayoutContent`, { layout_type: value }, apiConfig);
    console.log("response:> ", response)
    setLayoutType(value)
    setLayoutVisualization(value)
  }

  return (
    <Flex justify={'space-between'} style={{ height: '50px' }}>
      <Flex justify={'flex-start'} align={'center'}>
        {moduleName == "users" ? (<Text strong style={{ fontSize: '30px', fontFamily: 'poppins', marginRight: '15px', marginLeft: '15px' }}>Usuários</Text>) :
          moduleName == "profiles" ? (<Text strong style={{ fontSize: '30px', fontFamily: 'poppins', marginRight: '15px', marginLeft: '15px' }}>Perfis</Text>) :
            moduleName == "functions" ? (<Text strong style={{ fontSize: '30px', fontFamily: 'poppins', marginRight: '15px', marginLeft: '15px' }}>Funções</Text>) :
              moduleName == "charts" ? (<Text strong style={{ fontSize: '30px', fontFamily: 'poppins', marginRight: '15px', marginLeft: '15px' }}>Painéis</Text>) :
                (<Text></Text>)}
        <Breadcrumb>
          {hasSelected ? (
            <Breadcrumb.Item>
              {`${selectedRowKeys.length} Registro(s) selecionado(s) `}
              <Link onClick={start} disabled={!hasSelected} style={{ margin: '15px' }}>
                Limpar
              </Link>
              <Can I='delete' a={moduleName} ability={ability}>
                <Popconfirm
                  title="Excluir"
                  description="Tem certeza de que deseja excluir o(s) registro(s) selecionado(s)?"
                  onConfirm={() => confirm()}
                  okText="Sim"
                  cancelText="Cancelar"
                >
                  <Button type="text" danger>Excluir</Button>
                </Popconfirm>
              </Can>
            </Breadcrumb.Item>
          ) : null}
          {!hasSelected && <Breadcrumb.Item>{`Total de registros ${totalItems}`}</Breadcrumb.Item>}
        </Breadcrumb>
      </Flex>
      <Flex justify={'flex-end'} align={'center'}>
        <Can I='create' a={moduleName} ability={ability}>
          <Flex style={{ paddingRight: '15px' }}>
            <Button
              type='primary'
              href={`/${org}/${moduleName}/create`}>Criar {
                moduleName == "users" ? ("Usuário") :
                  moduleName == "profiles" ? ("Perfil") :
                    moduleName == "functions" ? ("Função") :
                      moduleName == "charts" ? ("Painel") :
                        (toSingular(activeModule))}
            </Button>
          </Flex>
        </Can>
        <Flex align={'center'}>
          <Select defaultValue={pageSize} onChange={onPageSizeChange} style={{ marginRight: '8px' }}>
            {[5, 10, 20, 50, 100, 200, 500, 1000].map((option) => (
              <Option key={option} value={option}>
                {option} Registros por página
              </Option>
            ))}
          </Select>
          <Select
            value={layoutType}
            options={
              [
                {
                  value: 'tabela',
                  label: <div><UnorderedListOutlined /> Tabela</div>,
                },
                {
                  value: 'kanban',
                  label: <div><SwapOutlined /> Kanban</div>,
                }
              ]
            }
            onChange={(value) => handleChange(value)}
          />
          <ColumnsOrder />
          {totalItems > pageSize && (
            <Pagination simple={{ readOnly: true }} responsive={true} size='small' current={currentPage} pageSize={pageSize} total={totalItems} onChange={onPageChange} />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default TableControls;
