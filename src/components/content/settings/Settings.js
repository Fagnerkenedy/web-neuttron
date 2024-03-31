import React from "react";
import { Layout, Card } from 'antd';
import Link from "antd/es/typography/Link";
import '../styles.css'
import { Content } from "antd/es/layout/layout";

function Settings() {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    return (
        <Content className='content' style={{ paddingTop: '20px', marginTop: '50px' }}>
            <Layout style={{ minHeight: 'calc(100vh - 160px)' }}>
                <Card title="Configurações">
                    <Link href={`/${org}/settings/modules`}>Módulos e campos</Link>
                </Card>
            </Layout>
        </Content>
    )
}

export default Settings