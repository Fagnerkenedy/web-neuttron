import React, { useEffect, useState, useContext } from 'react';
import { Button, Col, Divider, Layout, Popover, Row } from 'antd';
import Link from 'antd/es/typography/Link';
import { fetchModules } from './fetchModules';
import AuthContext from '../../contexts/auth';
import { SettingOutlined, UserOutlined } from '@ant-design/icons';
import ButtonDarkMode from './ButtonDarkMode';
import Title from 'antd/es/typography/Title';
import Logo from '../utils/Logo';

const { Header } = Layout;

const AppHeader = ({ darkMode, toggleDarkMode }) => {
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const org = pathParts[1]
  const { logout } = useContext(AuthContext);
  const [modules, setModules] = useState([]);

  const Content = (
    <div>
      <ButtonDarkMode darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Button onClick={logout}>Sair</Button>
    </div>
  );

  useEffect(() => {
    async function fetchModulesData() {
      const fetchedModules = await fetchModules(org);
      console.log("fetchedModules:", fetchedModules.result)
      setModules(fetchedModules.result);
    }
    fetchModulesData();
  }, []);

  return (
    <Col style={{ display: 'flex', alignItems: 'center', height: '49px', backgroundColor: '#1d1d1d', padding: "25px" }}>

      <Logo color="white" />

      <Col style={{ margin: "20px" }}>
        {modules.map((module, index) => (
          <React.Fragment key={index}>
            <Link style={{ color: 'white' }} href={`/${org}/${module.name}`}>
              {module.name.charAt(0).toUpperCase() + module.name.slice(1)}
            </Link>
            {index < modules.length - 1 && <Divider type="vertical" />}
          </React.Fragment>
        ))}
      </Col>
      <div style={{ marginLeft: 'auto', minWidth: '150px' }}>
        <Row>
          <Col offset={11}>
            <Button href={`/${org}/settings`} icon={<SettingOutlined />} />
          </Col>
          <Col offset={2}>
            <Popover content={Content} trigger="click">
              <Button icon={<UserOutlined />} />
            </Popover>
          </Col>
        </Row>
      </div>
    </Col>
  );
};

export default AppHeader;
