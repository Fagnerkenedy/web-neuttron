import { Card, Col, Layout, Row } from "antd";
import React, { useEffect, useState } from "react";
import { fetchModules } from '../../../components/header/fetchModules'
import Link from "antd/es/typography/Link";
import { Typography } from 'antd';
import { AppstoreOutlined } from "@ant-design/icons";
import Charts from '../charts/Charts'
// import Meta from "antd/es/card/Meta";
const { Text } = Typography;

function Home() {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    const [modules, setModules] = useState([])
    const user = localStorage.getItem('user')
    const userName = JSON.parse(user)

    useEffect(() => {
        async function fetchModulesData() {
            const fetchedModules = await fetchModules(org);
            setModules(fetchedModules.result);
        }
        fetchModulesData();
    }, []);

    return (
        <Layout style={{ padding: '15px 25px' }}>
            <Text style={{ fontSize: '20px',  paddingBottom: '15px' }} level={1} strong>Bem-vindo(a) {userName.name}</Text>
            <Row  style={{ paddingBottom: '15px' }} gutter={16}>
                {modules.map((module, index) => (
                    <Col key={index}>
                        <Link href={`/${org}/${(module.api_name ? module.api_name : module.name)}`}>
                            <Card
                                key={index}
                                style={{ marginTop: '25px', width: '250px', height: '150px', cursor: 'pointer' }}
                                cover={<AppstoreOutlined style={{ fontSize: '34px', padding: 25 }} />}
                                title={module.name}
                                hoverable
                            >
                            </Card>
                        </Link>
                    </Col>
                ))}
            </Row>
            <Charts />
        </Layout>
    )
}

export default Home