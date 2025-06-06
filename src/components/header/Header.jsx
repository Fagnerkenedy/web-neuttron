import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, Col, Drawer, Layout, Popover, Row, theme, Tooltip, ConfigProvider, Typography, Tour, Popconfirm, Space, Divider, Grid, Image } from 'antd';
import { fetchModules } from './fetchModules';
import { getOpenTour } from './openTour.js';
import { updateOpenTour } from './openTour.js';
import AuthContext from '../../contexts/auth';
import { CaretUpOutlined, DeleteOutlined, ExclamationOutlined, HomeFilled, LogoutOutlined, MessageOutlined, MoonFilled, QuestionCircleOutlined, SettingOutlined, StarFilled, SunFilled, UserOutlined, WhatsAppOutlined } from '@ant-design/icons';
import './styles.css'
import Logo from '../utils/Logo';
import { Can } from "../../contexts/AbilityContext.jsx";
import { useAbility } from '../../contexts/AbilityContext.jsx'
import { css } from '@emotion/css';
import userApiURI from '../../Utility/userApiURI.js';
import HeaderModules from './Modules.jsx';
import { ChartNoAxesColumn } from 'lucide-react';

const { Title, Text } = Typography;

const AppHeader = ({ darkMode, toggleDarkMode }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const currentPath = window.location.pathname;
  // const pathParts = currentPath.split('/');
  // const org = pathParts[1]
  // const module = pathParts[2]
  const { org, module } = useParams();
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
  const { useBreakpoint } = Grid
  const screens = useBreakpoint()
  const isDesktop = screens.md

  const updateTour = async () => {
    const updateTour = await updateOpenTour(org, user.id)

    setOpenTour(updateTour.openTour)
  }

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const steps = [
    {
      title: 'Seja muito bem vindo(a)',
      description: 'Vamos guiá-lo(a) pelos principais recursos do sistema.',
      target: () => ref1.current,
      nextButtonProps: {
        children: 'Próximo',
      },
    },
    {
      title: 'Módulos',
      description: 'Cadastre seus Leads, Empresas, Contatos, Negócios e muito mais.',
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
      description: 'Crie novos módulos e campos personalizados. Gerencie os usuários do sistema. Crie automações poderosas para automatizar processos repetitivos do dia a dia.',
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
        <Space direction="vertical" style={{ width: "100%" }} align="center">
          <Avatar size={80} icon={<UserOutlined />} />
          <Title level={5} style={{ margin: 0 }}>
            {user.email}
          </Title>
        </Space>
        <Divider style={{ marginTop: 24, marginBottom: 16 }} />
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Button
            title={darkMode ? "Modo Claro" : "Modo Noturno"}
            // style={{ width: '100%', border: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid' }}
            block
            style={{
              justifyContent: "start",
              paddingLeft: 16,
              height: 44,
              fontWeight: 500,
            }}
            onClick={() => {
              closeDrawer()
              toggleDarkMode()
            }}
            icon={darkMode ? <SunFilled /> : <MoonFilled />}
          >
            {darkMode ? "Modo Claro" : "Modo Noturno"}
          </Button>
          <Button
            icon={<WhatsAppOutlined />}
            target='_blank'
            href='https://api.whatsapp.com/send/?phone=5545999792202&text=Ol%C3%A1+tudo+bem%3F&app_absent=0'
            block
            style={{
              justifyContent: "start",
              paddingLeft: 16,
              height: 44,
              fontWeight: 500,
            }}
            title={'Fale conosco'}
          >
            Fale conosco
          </Button>
          <Button icon={<LogoutOutlined />} block
            color="primary" variant="outlined"
            style={{
              justifyContent: "start",
              paddingLeft: 16,
              height: 44,
              fontWeight: 500,
              // backgroundColor: "#e6f4ff",
              // color: "#1677ff",
              // borderColor: "#91caff",
            }}
            title={'Sair da conta'}
            onClick={logout}
          >
            Sair
          </Button>
        </Space>
        <Divider style={{ marginTop: 32, marginBottom: 16 }} />
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
          <Button icon={<DeleteOutlined />} danger
            block
            style={{
              // backgroundColor: "#fff1f0",
              // borderColor: "#ffa39e",
              fontWeight: 500,
              height: 44,
            }}
            title={'Excluir conta'}
          >
            Excluir conta
          </Button>
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
  }, [module, loading]);

  return (
    <>
      <Col style={{ display: 'flex', alignItems: 'center', background: colorBgContainer, height: '50px', padding: "10px", position: 'fixed', width: '100%', zIndex: '1000', borderBottom: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid' }}>

        <Row span={2}>
          {isDesktop ? (
            <>
              <Col align={"middle"}>
                <Logo fontSize={19} />
                {/* <Avatar size={25} src='/src/img/N_sem_fundo.png' /> */}
              </Col>
              <Link
                to={`home`}
              >
                <Button style={{ marginLeft: 10 }} icon={<ChartNoAxesColumn style={{ width: '20px' }} />}>Dashboard</Button>
              </Link>
            </>
          ) : (
            <Link
              to={`home`}
            >
              <Logo fontSize={19} />
              {/* <Avatar size={25} src='/src/img/N_sem_fundo.png' /> */}
            </Link>
          )}
        </Row>
        <HeaderModules
          ref2={ref2}
          modules={modules}
          org={org}
          darkMode={darkMode}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          ability={ability}
        />
        <Row style={{ marginLeft: 'auto' }}>
          {/* <Col>
            <ConfigProvider
              button={{
                className: linearGradientButton,
              }}
            >
              <Can I='read' a='checkout' ability={ability}>
              <Tooltip title="Fazer Upgrade">
                <Button type="primary" shape="circle" href={`checkout`} icon={<StarFilled />} />
              </Tooltip>
              </Can>
            </ConfigProvider>
          </Col> */}
          <Col style={{ marginLeft: '5px' }}>
            <Link
              to={`chats`}
            >
              <Tooltip title="Mensagens">
                <Button type="text" shape="circle" icon={<MessageOutlined />} />
              </Tooltip>
            </Link>
          </Col>
          <Col ref={ref3} style={{ marginLeft: '5px' }}>
            <Link
              to={`settings`}
            >
              <Tooltip title="Configurações">
                <Button type="text" shape="circle" icon={<SettingOutlined />} />
              </Tooltip>
            </Link>
          </Col>
          <Col ref={ref4} style={{ marginLeft: '5px' }}>
            {isDesktop ? (<Tooltip title="Perfil"> <Button type="text" shape="circle" onClick={showDrawer} icon={<UserOutlined />} /> </Tooltip>) : (
              <Button type="text" shape="circle" onClick={showDrawer} icon={<UserOutlined />} />
            )}

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
