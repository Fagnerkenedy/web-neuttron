import React from "react";
import { Layout, Card, Row } from 'antd';
import Link from "antd/es/typography/Link";
import '../styles.css'
import { Content } from "antd/es/layout/layout";

function Settings() {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    return (
        <Content className='content' style={{ paddingTop: '20px' }}>
            <Layout style={{ minHeight: 'calc(100vh - 160px)' }}>
                <Card style={{paddingLeft: '15px'}} title="Configurações">
                    <Row style={{ marginBottom: '20px'}}>
                        <Link href={`/${org}/settings/modules`}>Módulos e campos</Link>
                    </Row>
                    <Row style={{ marginBottom: '20px'}}>
                        <Link href={`/${org}/users`}>Usuários</Link>
                    </Row>
                    <Row style={{ marginBottom: '20px'}}>
                        <Link href={`/${org}/profiles`}>Perfis</Link>
                    </Row>
                    <Row style={{ marginBottom: '20px'}}>
                        <Link href={`/${org}/functions`}>Funções</Link>
                    </Row>
                    <Row>
                        <Link href={`/${org}/charts`}>Painéis</Link>
                    </Row>
                </Card>
            </Layout>
        </Content>
    )
}

export default Settings