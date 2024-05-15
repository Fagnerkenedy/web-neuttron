import React, { useEffect, useState, useContext } from 'react';
import { Button, Col, Popover, Row } from 'antd';
import Link from 'antd/es/typography/Link';
import { fetchModules } from './fetchModules';
import AuthContext from '../../contexts/auth';
import { SettingOutlined, UserOutlined } from '@ant-design/icons';
import ButtonDarkMode from './ButtonDarkMode';
import './styles.css'
import Logo from '../utils/Logo';

const AppHeader = ({ darkMode, toggleDarkMode }) => {
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const org = pathParts[1]
  const module = pathParts[2]
  const { logout } = useContext(AuthContext);
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);

  const Content = (
    <div>
      <ButtonDarkMode darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Button onClick={logout}>Sair</Button>
    </div>
  );

  useEffect(() => {
    async function fetchModulesData() {
      const fetchedModules = await fetchModules(org);
      setModules(fetchedModules.result);
    }
    setActiveModule(module)
    fetchModulesData();
  }, []);

  return (
    <>
      <Col style={{ display: 'flex', alignItems: 'center', height: '49px', backgroundColor: '#1d1d1d', padding: "25px", position: 'fixed', width: '100%', zIndex: '1000' }}>

        <Logo color="white" />

        <Col style={{ margin: "20px" }}>
          <React.Fragment>
            <Link
              className={`modules ${activeModule === 'home' ? 'active' : ''}`}
              style={{ color: 'white' }}
              href={`/${org}/home`}
              onClick={() => setActiveModule('home')}
            >
              Página Inicial
            </Link>
            {/* {index < modules.length - 1 && <Divider type="vertical" />} */}
          </React.Fragment>
          {modules.map((module, index) => (
            <React.Fragment key={index}>
              <Link
                className={`modules ${activeModule === (module.api_name ? module.api_name : module.name) ? 'active' : ''}`}
                style={{ color: 'white' }}
                href={`/${org}/${(module.api_name ? module.api_name : module.name)}`}
                onClick={() => setActiveModule(module.name)}
              >
                {module.name.charAt(0).toUpperCase() + module.name.slice(1)}
              </Link>
              {/* {index < modules.length - 1 && <Divider type="vertical" />} */}
            </React.Fragment>
          ))}
        </Col>
        <div style={{ marginLeft: 'auto', minWidth: '150px' }}>
          <Row span={12}> 
            {/* <Col offset={11}>
              <Button href={`/${org}/settings`} icon={<SettingOutlined />} />
            </Col> 
            <Col offset={2}>*/}
            <Col style={{alignItems:'center', alignContent:'center'}} span={18} >
              <Link href={`/${org}/checkout`}>
              Fazer Upgrade
              </Link>
            </Col> 
            <Col>
              <Popover content={Content} trigger="click">
                <Button icon={<UserOutlined />} />
              </Popover>
            </Col>
          </Row>
        </div>
      </Col>
      <Row style={{ height: '50px' }}></Row>
    </>
  );
};

export default AppHeader;
