import { Card, Col, Layout, Row } from "antd";
import React, { useEffect, useState } from "react";
import { fetchModules } from '../../../components/header/fetchModules'
import Link from "antd/es/typography/Link";
import { Typography } from 'antd';
import { AppstoreOutlined } from "@ant-design/icons";
import Charts from '../charts/Charts'
import { Can } from "../../../contexts/AbilityContext.js";
import { useAbility } from '../../../contexts/AbilityContext.js'
const { Text } = Typography;

function Home() {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    const [modules, setModules] = useState([])
    const user = localStorage.getItem('user')
    const userName = JSON.parse(user)
    const { ability, loading } = useAbility();

    useEffect(() => {
        async function fetchModulesData() {
            const fetchedModules = await fetchModules(org);
            setModules(fetchedModules.result);
        }
        if (!loading) {
            fetchModulesData();
        }
    }, [loading])

    return (
        <Layout style={{ padding: '15px 25px' }}>
            <Text style={{ fontSize: '20px', marginBottom: '15px' }} level={1} strong>Bem-vindo(a) {userName.name}</Text>
            <Row gutter={16}>
                {console.log("aaaa", ability)}
                {modules.map((module, index) => (
                    <Can I='read' a={(module.api_name ? module.api_name : module.name)} ability={ability} key={index}>
                        <Col key={index}>
                            <Link href={`/${org}/${(module.api_name ? module.api_name : module.name)}`}>
                                <Card
                                    key={index}
                                    style={{ marginBottom: '15px', width: '250px', height: '150px', cursor: 'pointer' }}
                                    cover={<AppstoreOutlined style={{ fontSize: '34px' }} />}
                                    title={module.name}
                                    hoverable
                                >
                                </Card>
                            </Link>
                        </Col>
                    </Can>
                ))}
            </Row>
            <Charts />
        </Layout>
    )
}

export default Home