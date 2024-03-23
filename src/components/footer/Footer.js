import React from 'react';
import { Layout, theme } from 'antd';
const { Footer } = Layout

const AppFooter = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()
  return (
    <Footer style={{ color: '#838da1', backgroundColor: '#1d1d1d', textAlign: 'center', padding: '5px' }}>
      Todos os direitos reservados | ©2024 Created by Fagner
    </Footer>
  );
};

export default AppFooter;
