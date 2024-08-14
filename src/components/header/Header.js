import React, { useEffect, useState, useContext } from 'react';
import { Avatar, Button, Col, Drawer, Layout, Popover, Row, theme, Tooltip, ConfigProvider } from 'antd';
import Link from 'antd/es/typography/Link';
import { fetchModules } from './fetchModules';
import AuthContext from '../../contexts/auth';
import { SettingOutlined, UserOutlined } from '@ant-design/icons';
import ButtonDarkMode from './ButtonDarkMode';
import './styles.css'
import Logo from '../utils/Logo';
import { Can } from "../../contexts/AbilityContext.js";
import { useAbility } from '../../contexts/AbilityContext.js'
import { css } from '@emotion/css';

const AppHeader = ({ darkMode, toggleDarkMode }) => {
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const org = pathParts[1]
  const module = pathParts[2]
  const { logout } = useContext(AuthContext);
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const { ability, loading } = useAbility();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [open, setOpen] = useState(false);
  const showDrawer = () => {
    setOpen(true);
  };
  const closeDrawer = () => {
    setOpen(false);
  };

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
    <Col>
      <Row span={24} style={{ justifyContent: 'center', paddingBottom: '15px' }}>
        <Avatar size={64} icon={<UserOutlined />} />
      </Row>
      <ButtonDarkMode darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Button type='primary' style={{ width: '100%' }} title={'Sair da conta'} onClick={logout}>Sair</Button>
    </Col>
  );

  useEffect(() => {
    async function fetchModulesData() {
      const fetchedModules = await fetchModules(org);
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

        <Col style={{ margin: "20px" }}>
          <React.Fragment>
            <Link
              className={`modules ${activeModule === 'home' ? 'active' : ''}`}
              style={{ color: darkMode ? '#fff' : '#000' }}
              href={`/${org}/home`}
              onClick={() => setActiveModule('home')}
            >
              Página Inicial
            </Link>
            {/* {index < modules.length - 1 && <Divider type="vertical" />} */}
          </React.Fragment>
          {modules.map((module, index) => (
            <Can I='read' a={(module.api_name ? module.api_name : module.name)} ability={ability} key={index}>
              <React.Fragment key={index}>
                <Link
                  className={`modules ${activeModule === (module.api_name ? module.api_name : module.name) ? 'active' : ''}`}
                  style={{ color: darkMode ? '#fff' : '#000' }}
                  href={`/${org}/${(module.api_name ? module.api_name : module.name)}`}
                  onClick={() => setActiveModule(module.name)}
                >
                  {module.name.charAt(0).toUpperCase() + module.name.slice(1)}
                </Link>
                {/* {index < modules.length - 1 && <Divider type="vertical" />} */}
              </React.Fragment>
            </Can>
          ))}
        </Col>
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
            <Col>
              <Tooltip title="Configurações">
                <Button type="text" shape="circle" href={`/${org}/settings`} icon={<SettingOutlined />} />
              </Tooltip>
            </Col>
            <Col offset={1}>
              <Tooltip title="Perfil">
                <Link type="text" onClick={showDrawer}>
                  <Avatar icon={<UserOutlined />} />
                </Link>
                {/* <Button onClick={showDrawer} icon={<UserOutlined />} /> */}
              </Tooltip>
              <Drawer open={open} title="Perfil" onClose={closeDrawer}>
                {Content}
              </Drawer>
            </Col>
          </Row>
        </div>
      </Col>
      <Row style={{ height: '50px' }}></Row>
    </>
  );
};

export default AppHeader;
