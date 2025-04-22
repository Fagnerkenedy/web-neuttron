import React, { useEffect, useState } from 'react';
import { Breadcrumb, Flex, Select, Pagination, Button, Popconfirm, message, Typography, Dropdown, Checkbox, Table, Menu, notification, Col, Row, Space, Divider, Tooltip, Grid } from 'antd';
import Link from 'antd/es/typography/Link';
import { Option } from 'antd/es/mentions';
import apiURI from '../../../Utility/recordApiURI.js';
import { fetchModules } from './fetchModules.js';
import { Can } from "../../../contexts/AbilityContext.js";
import { useAbility } from '../../../contexts/AbilityContext.js'
import { EllipsisOutlined, PlusCircleFilled, PlusCircleOutlined, PlusOutlined, SwapOutlined, UnorderedListOutlined } from '@ant-design/icons';
import axios from 'axios';
import userApiURI from '../../../Utility/userApiURI.js';
import { useNavigate } from 'react-router-dom';
import { Columns2, Kanban, SquareKanban } from 'lucide-react';
const { deleteRecord } = apiURI;
const pluralize = require('pluralize')
const { Title, Text } = Typography;

const TableControls = ({ hasSelected, selectedRowKeys, start, pageSize, onPageSizeChange, setLayoutVisualization }) => {
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
  let navigate = useNavigate()
  const { useBreakpoint } = Grid
  const screens = useBreakpoint()

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

  const showNotification = (message, description, placement, type, duration, width, pauseOnHover) => {
    if (!type) type = 'info';
    notification[type]({ // success, info, warning, error
      message: message,
      description: description,
      placement: placement, // topLeft, topRight, bottomLeft, bottomRight, top, bottom
      duration: duration, // 3 (segundos), null (caso não queira que suma sozinho)
      style: {
        width: width,
      },
      showProgress: true,
      pauseOnHover
    });
  };

  const handleAccess = async (e) => {
    if (!ability.can('access', moduleName)) {
      e.preventDefault()
      showNotification(
        '',
        <>
          {moduleName == "users" && (<Text>A criação de novos usuários não é suportada no seu plano. Faça o upgrade para o plano Profissional.{' '}</Text>)}
          {moduleName == "profiles" && (<Text>A criação de novos perfis não é suportada no seu plano. Faça o upgrade para o plano Profissional.{' '}</Text>)}
          {moduleName == "functions" && (<Text>A criação de novas funções não é suportada no seu plano. Faça o upgrade para o plano Profissional.{' '}</Text>)}
          {moduleName == "charts" && (<Text>A criação de novos painéis não é suportada no seu plano. Faça o upgrade para o plano Profissional.{' '}</Text>)}
          {moduleName == "kanban" && (<Text>A criação de novos kanbans não é suportada no seu plano. Faça o upgrade para o plano Profissional.{' '}</Text>)}
          <Link href={`/${org}/checkout`} rel="noopener noreferrer">Fazer Upgrade</Link>
        </>,
        'bottom',
        'warning',
        10,
        600,
        true
      )
    }
    if (moduleName == "users") {
      const usedUsersAPI = await userApiURI.checkUsedUsers(org)
      const usedUsers = usedUsersAPI.data.subscriptions[0] || {}
      if (usedUsers.users <= usedUsers.active_users) {
        e.preventDefault()
        showNotification(
          '',
          <>
            {moduleName == "users" && (<Text>Você atingiu o limite de novos usuários para o plano contratado. Contrate novos usuários para continuar criando.{' '}</Text>)}
            {/* <Link href={`/${org}/checkout`} rel="noopener noreferrer">Fazer Upgrade</Link> */}
          </>,
          'bottom',
          'warning',
          10,
          600,
          true
        )
      } else {
        navigate(`/${org}/${moduleName}/create`)
      }
    } else {
      navigate(`/${org}/${moduleName}/create`)
    }
  };

  return (
    <Row justify={'space-between'} style={{ height: '40px', display: 'flex', alignItems: 'center', paddingLeft: 10, paddingRight: 10 }}>
      <Col justify={'flex-start'} align={'center'}>
        <Row align="middle" wrap={false}>
          {(!screens.xs || !hasSelected) && (
            <Text strong style={{ fontSize: '15px', fontFamily: 'poppins', marginRight: '15px' }}>
              {moduleName === "users" && "Usuários"}
              {moduleName === "profiles" && "Perfis"}
              {moduleName === "functions" && "Funções"}
              {moduleName === "charts" && "Painéis"}
              {moduleName === "kanban" && "Kanbans"}
            </Text>
          )}
          <Breadcrumb>
            {hasSelected ? (
              <Breadcrumb.Item>
                {`Selecionados: ${selectedRowKeys.length}`}
                <Divider type="vertical" style={{ marginLeft: '15px' }} />
                <Button type='text' onClick={start} disabled={!hasSelected}>
                  Limpar
                </Button>
                <Can I='delete' a={moduleName} ability={ability}>
                  <Popconfirm
                    title="Excluir"
                    description="Tem certeza de que deseja excluir o(s) registro(s) selecionado(s)?"
                    onConfirm={() => confirm()}
                    okText="Sim"
                    cancelText="Cancelar"
                  >
                    <Button type="text" danger style={{ marginLeft: '5px' }}>Excluir</Button>
                  </Popconfirm>
                </Can>
              </Breadcrumb.Item>
            ) : null}
            {/* {!hasSelected && <Breadcrumb.Item>{`Registros: ${totalItems}`}</Breadcrumb.Item>} */}
          </Breadcrumb>
        </Row>
      </Col>
      <Row justify={'flex-end'} align={'center'}>

        <Col style={{ display: 'flex', alignItems: 'center' }}>
          {!(screens.xs && hasSelected) && layoutType != 'kanban' && (
            <Select defaultValue={pageSize} onChange={onPageSizeChange} style={{ width: '120px', marginRight: '8px' }}>
              {[5, 10, 20, 50, 100, 200, 500, 1000].map((option) => (
                <Option key={option} value={option}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Columns2 style={{ width: 15, marginRight: 6 }} />
                    {option}/página
                  </div>
                </Option>
              ))}
            </Select>
          )}
          {!(screens.xs && hasSelected) && !(moduleName == "users" || moduleName == "profiles" || moduleName == "functions" || moduleName == "charts" || moduleName == "kanban") &&
            <Select
              value={layoutType}
              style={{ width: '90px', marginRight: '8px' }}
              options={
                [
                  {
                    value: 'tabela',
                    label: <div style={{ display: 'flex', alignItems: 'center' }}><UnorderedListOutlined style={{ width: '15px', marginRight: 3 }} />Lista</div>,
                  },
                  {
                    value: 'kanban',
                    label: <div style={{ display: 'flex', alignItems: 'center' }}><SquareKanban style={{ width: '15px', marginRight: 3 }} />Kanban</div>,
                  }
                ]
              }
              onChange={(value) => handleChange(value)}
            />
          }
          {/* {totalItems > pageSize && (
            <Pagination simple={{ readOnly: true }} responsive={true} size='small' current={currentPage} pageSize={pageSize} total={totalItems} onChange={onPageChange} />
          )} */}
        </Col>

        <Col>
          <Can I='create' a={moduleName} ability={ability}>
            {/* <Flex style={{ paddingRight: '15px' }}> */}
            <Tooltip
              placement="left"
              title={
                `Novo ${moduleName == "users" ? ("Usuário") :
                  moduleName == "profiles" ? ("Perfil") :
                    moduleName == "functions" ? ("Função") :
                      moduleName == "charts" ? ("Painel") :
                        moduleName == "kanban" ? ("Kanban") :
                          (toSingular(activeModule))}`}
            >
              <Button
                onClick={handleAccess}
                type='primary'
                // shape='circle'
                // href={`/${org}/${moduleName}/create`}
                icon={<PlusOutlined />}
              >
                {/* {
                  moduleName == "users" ? ("Usuário") :
                    moduleName == "profiles" ? ("Perfil") :
                      moduleName == "functions" ? ("Função") :
                        moduleName == "charts" ? ("Painel") :
                          moduleName == "kanban" ? ("Kanban") :
                            (toSingular(activeModule))} */}
              </Button>
            </Tooltip>
            {/* </Flex> */}
          </Can>
        </Col>

      </Row>
    </Row>
  );
};

export default TableControls;
