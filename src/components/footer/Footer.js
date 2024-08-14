import React from 'react';
import { Col, Layout, Row, theme } from 'antd';
const { Footer } = Layout

const AppFooter = ({ darkMode }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  return (
    <Footer style={{ color: '#838da1', backgroundColor: colorBgContainer, textAlign: 'center', padding: '5px', borderTop: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid' }}>
      <Row>
        <Col span={24}>Todos os direitos reservados | ©2024 Created by Fagner</Col>
      </Row>
    </Footer>
  );
};

export default AppFooter;
