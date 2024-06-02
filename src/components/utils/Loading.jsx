import { Layout, Row, Col, Spin, theme } from 'antd';
import React from 'react';
import './../users/styles.css'
import { LoadingOutlined } from '@ant-design/icons';

const { Content } = Layout;

const Loading = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken()
    return (
        <Layout
            className="layout"
            style={{
                background: colorBgContainer
            }}
        >
            <Content>
                <div 
                    className='user-row-cadastro' 
                    style={{
                        background: colorBgContainer
                    }}
                >
                    <Row>
                        <Col span={24} align="middle" style={{ paddingTop: "50vh", fontSize: '1.5em' }}>
                            <Spin indicator={
                                <LoadingOutlined
                                    style={{
                                        fontSize: 24,
                                    }}
                                    spin
                                />
                            } size="large" />
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>
    )
}

export default Loading