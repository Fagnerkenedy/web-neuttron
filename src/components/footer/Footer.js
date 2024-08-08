import React from 'react';
import { Col, Layout, Row, Switch } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
const { Footer } = Layout

const AppFooter = ({ darkMode, toggleDarkMode }) => {
  // const {
  //   token: { colorBgContainer, borderRadiusLG },
  // } = theme.useToken()
  return (
    <Footer style={{ color: '#838da1', backgroundColor: '#1d1d1d', textAlign: 'center', padding: '5px' }}>
      <Row>
        <Col span={23}>Todos os direitos reservados | ©2024 Created by Fagner</Col>
      </Row>
    </Footer>
  );
};

export default AppFooter;
