import { Card, Col, Layout, Row } from "antd";
import React, { useEffect, useState } from "react";
import { fetchModules } from '../../../components/header/fetchModules'
import Link from "antd/es/typography/Link";
import { Typography } from 'antd';
import { AppstoreOutlined } from "@ant-design/icons";
import Charts from '../charts/Charts'
import { Can } from "../../../contexts/AbilityContext.js";
import { useAbility } from '../../../contexts/AbilityContext.js'
import { useOutletContext } from 'react-router-dom';
import DrilldownChart from '../charts/DrilldownChart.js'

const { Text } = Typography;

function Home() {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    const [modules, setModules] = useState([])
    const user = localStorage.getItem('user')
    const userName = JSON.parse(user)
    const { ability, loading } = useAbility();
    const { darkMode } = useOutletContext();

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
        <Layout style={{ padding: '5px 5px 5px 5px' }}>
            <Text style={{ fontSize: '20px', marginLeft: '5px', marginBottom: '5px' }} level={1} strong>Bem-vindo {userName.name}</Text>
            <Charts />
            {/* <DrilldownChart /> */}
            {/* <Row gutter={16}>
                {modules.map((module, index) => (
                    <Can I='read' a={(module.api_name ? module.api_name : module.name)} ability={ability} key={index}>
                        <Col key={index}>
                            <Link href={`/${org}/${(module.api_name ? module.api_name : module.name)}`}>
                                <Card
                                    key={index}
                                    style={{ marginBottom: '15px', width: '48vw', height: '200px', cursor: 'pointer', border: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid' }}
                                    cover={<AppstoreOutlined style={{ fontSize: '34px' }} />}
                                    title={module.name}
                                    hoverable
                                >
                                </Card>
                            </Link>
                        </Col>
                    </Can>
                ))}
            </Row> */}
        </Layout>
    )
}

export default Home