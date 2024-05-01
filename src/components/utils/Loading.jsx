import { Layout, Row, Col, Spin } from 'antd';
import React from 'react';
import './../users/styles.css'
import { LoadingOutlined } from '@ant-design/icons';

const { Content } = Layout;

const Loading = () => {
    return (
        <Layout className="layout">
            <Content>
                <div className='user-row-cadastro'>
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