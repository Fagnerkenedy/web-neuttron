import React from "react";
import { Layout, Card, Row } from 'antd';
import Link from "antd/es/typography/Link";
import '../styles.css'
import { Content } from "antd/es/layout/layout";
import { Can } from "../../../contexts/AbilityContext.js";
import { useAbility } from '../../../contexts/AbilityContext.js'

function Settings() {
    const { ability, loading } = useAbility();
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    return (
        <Content className='content' style={{ paddingTop: '20px' }}>
            <Layout style={{ minHeight: 'calc(100vh - 160px)' }}>
                <Card title="Configurações">
                    <Can I='read' a={'modules'} ability={ability}>
                        <Row style={{ padding: '15px' }}>
                            <Link href={`/${org}/settings/modules`}>Módulos e campos</Link>
                        </Row>
                    </Can>
                    <Can I='read' a={'users'} ability={ability}>
                        <Row style={{ padding: '15px' }}>
                            <Link href={`/${org}/users`}>Usuários</Link>
                        </Row>
                    </Can>
                    <Can I='read' a={'profiles'} ability={ability}>
                        <Row style={{ padding: '15px' }}>
                            <Link href={`/${org}/profiles`}>Perfis</Link>
                        </Row>
                    </Can>
                    <Can I='read' a={'functions'} ability={ability}>
                        <Row style={{ padding: '15px' }}>
                            <Link href={`/${org}/functions`}>Funções</Link>
                        </Row>
                    </Can>
                    <Can I='read' a={'charts'} ability={ability}>
                        <Row style={{ padding: '15px' }}>
                            <Link href={`/${org}/charts`}>Gráficos</Link>
                        </Row>
                    </Can>
                    <Can I='read' a={'kanban'} ability={ability}>
                        <Row style={{ padding: '15px' }}>
                            <Link href={`/${org}/kanban`}>Kanban</Link>
                        </Row>
                    </Can>
                </Card>
            </Layout>
        </Content>
    )
}

export default Settings