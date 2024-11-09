import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Col, Drawer, Layout, Popover, Row, theme, Tooltip, ConfigProvider, Typography, Tour, Popconfirm } from 'antd';
import Link from 'antd/es/typography/Link';
import { fetchModules } from './fetchModules';
import { getOpenTour } from './openTour.js';
import { updateOpenTour } from './openTour.js';
import AuthContext from '../../contexts/auth';
import { DeleteOutlined, ExclamationOutlined, LogoutOutlined, QuestionCircleOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import ButtonDarkMode from './ButtonDarkMode';
import './styles.css'
import Logo from '../utils/Logo';
import { Can } from "../../contexts/AbilityContext.js";
import { useAbility } from '../../contexts/AbilityContext.js'
import { css } from '@emotion/css';
import userApiURI from '../../Utility/userApiURI.js';
import HeaderModules from './Modules.js';

const { Title, Text } = Typography;

const AppHeader = ({ darkMode, toggleDarkMode }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const org = pathParts[1]
  const module = pathParts[2]
  const { logout } = useContext(AuthContext);
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const { ability, loading } = useAbility();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const [open, setOpen] = useState(false);
  const showDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);
  const [openTour, setOpenTour] = useState(false);
  let navigate = useNavigate()

  const updateTour = async () => {
    const updateTour = await updateOpenTour(org, user.id)
    console.log("updateTour: ", updateTour)

    setOpenTour(updateTour.openTour)
  }

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const steps = [
    {
      title: 'Seja muito bem vindo(a)',
      description: 'Este é o primeiro passo do tour. Vamos guiá-lo(a) pelos principais recursos do sistema.',
      target: () => ref1.current,
      nextButtonProps: {
        children: 'Próximo',
      },
    },
    {
      title: 'Módulos',
      description: 'Cadastre seus Leads, Empresas, Contatos, Negócios e muito mais. Gerencie de forma eficaz todo o processo de relacionamento com o seu cliente.',
      target: () => ref2.current,
      prevButtonProps: {
        children: 'Voltar',
      },
      nextButtonProps: {
        children: 'Avançar',
      },
    },
    {
      title: 'Configurações',
      description: 'Crie módulos personalizados para armazenar qualquer tipo de informação usando campos customizáveis. Gerencie os usuários do sistema e envie convites para adicionar novos membros. Controle o perfil de cada usuário e defina suas permissões de acesso no sistema e crie automações poderosas para automatizar processos repetitivos do dia a dia.',
      target: () => ref3.current,
      prevButtonProps: {
        children: 'Voltar',
      },
      nextButtonProps: {
        children: 'Avançar',
      },
    },
    {
      title: 'Perfil',
      description: 'Visualize suas principais informações, como e-mail e foto de perfil, alterne entre o modo Claro e Noturno, e acesse a opção de logout do sistema.',
      target: () => ref4.current,
      prevButtonProps: {
        children: 'Voltar',
      },
      nextButtonProps: {
        children: 'Concluir',
      },
    },
  ];

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const rootPrefixCls = getPrefixCls();
  const linearGradientButton = css`
    &.${rootPrefixCls}-btn-primary:not([disabled]):not(.${rootPrefixCls}-btn-dangerous) {
      border-width: 0;

      > span {
        position: relative;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, #004E99, #04befe);
        position: absolute;
        inset: 0;
        opacity: 1;
        transition: all 1s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `;

  const Content = (
    <Col style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <Col>
        <Row span={24} style={{ justifyContent: 'center', paddingBottom: '15px' }}>
          <Avatar size={64} icon={<UserOutlined />} />
        </Row>
        <Row style={{ justifyContent: 'center', paddingBottom: '15px' }}>
          <Text>{user.email}</Text>
        </Row>
        <ButtonDarkMode darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Button icon={<LogoutOutlined />} type='primary' style={{ width: '100%' }} title={'Sair da conta'} onClick={logout}>Sair</Button>
      </Col>
      <Col style={{ bottom: 0 }}>
        <Popconfirm
          title="Tem certeza que deseja excluir esta conta? Essa ação excluirá todos os dados e é irreversível!"
          okText="Sim"
          cancelText="Não"
          icon={
            <ExclamationOutlined
              style={{
                color: 'red',
              }}
            />
          }
          onConfirm={async () => {
            await userApiURI.deleteAccount({ email: user.email, orgId: org })
            logout()
            navigate('/login')
          }}
        >
          <Button icon={<DeleteOutlined />} type="text" danger style={{ width: '100%' }} title={'Excluir conta'}>Excluir conta</Button>
        </Popconfirm>
      </Col>
    </Col>
  );

  useEffect(() => {
    async function fetchModulesData() {
      const fetchedModules = await fetchModules(org);
      const getTour = await getOpenTour(org, user.id)
      let openTour = ''
      if (getTour.data.length > 0) openTour = getTour.data[0].open_tour
      setOpenTour(openTour)
      setModules(fetchedModules.result);
    }
    if (!loading) {
      setActiveModule(module)
      fetchModulesData();
    }
  }, [loading]);

  return (
    <>
      <Col style={{ display: 'flex', alignItems: 'center', background: colorBgContainer, height: '49px', padding: "25px", position: 'fixed', width: '100%', zIndex: '1000', borderBottom: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid' }}>

        <Link
          href={`/${org}/home`}
        >
          <Row>
            <Logo fontSize={19} />
          </Row>
        </Link>
        <HeaderModules 
          modules={modules}
          org={org}
          darkMode={darkMode}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          ability={ability} 
        />
        <div style={{ marginLeft: 'auto', minWidth: '215px' }}>
          <Row span={24}>
            <Col style={{ alignItems: 'center', alignContent: 'center', marginRight: 5 }} span={14} >
              <ConfigProvider
                button={{
                  className: linearGradientButton,
                }}
              >
                <Button type="primary" href={`/${org}/checkout`}>
                  Fazer Upgrade
                </Button>
              </ConfigProvider>
            </Col>
            <Col ref={ref3}>
              <Tooltip title="Configurações">
                <Button type="text" shape="circle" href={`/${org}/settings`} icon={<SettingOutlined />} />
                {/* <Button style={{ border: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid' }} type="text" shape="circle" href={`/${org}/settings`} icon={<SettingOutlined />} /> */}
              </Tooltip>
            </Col>
            <Col ref={ref4} offset={1}>
              <Tooltip title="Perfil">
                <Link type="text" onClick={showDrawer}>
                  <Avatar icon={<UserOutlined />} />
                </Link>
                {/* <Button onClick={showDrawer} icon={<UserOutlined />} /> */}
              </Tooltip>
              <Drawer
                open={open}
                title="Perfil"
                onClose={closeDrawer}
                extra={
                  <Tooltip title="Visualizar tour">
                    <Button
                      type="text"
                      shape="circle"
                      onClick={() => {
                        closeDrawer()
                        setOpenTour(true)
                      }}
                      icon={<QuestionCircleOutlined />}
                    />
                  </Tooltip>
                }
              >
                {Content}
              </Drawer>
            </Col>
          </Row>
        </div>
      </Col>
      <Row style={{ height: '50px' }}></Row>
      <Tour
        open={openTour}
        onClose={() => updateTour()}
        steps={steps}
      />
    </>
  );
};

export default AppHeader;
