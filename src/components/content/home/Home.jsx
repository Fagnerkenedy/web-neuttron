import { Button, Card, Col, Layout, Row, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { fetchModules } from '../../../components/header/fetchModules'
import { Typography } from 'antd';
import { AppstoreOutlined, EditOutlined } from "@ant-design/icons";
import Charts from '../charts/Charts'
import { Can } from "../../../contexts/AbilityContext.jsx";
import { useAbility } from '../../../contexts/AbilityContext.jsx'
import { Link, useOutletContext, useParams } from 'react-router-dom';
import DrilldownChart from '../charts/DrilldownChart.jsx'

const { Text } = Typography;

function Home() {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    // const org = pathParts[1]
    const { org, module } = useParams();
    const [modules, setModules] = useState([])
    const user = localStorage.getItem('user')
    const userName = JSON.parse(user)
    const { ability, loading } = useAbility();
    const { darkMode } = useOutletContext();

    useEffect(() => {
        document.title = "Neuttron CRM"
        document.description = "Home"
        async function fetchModulesData() {
            const fetchedModules = await fetchModules(org);
            setModules(fetchedModules.result);
        }
        if (!loading) {
            fetchModulesData();
        }
    }, [org, loading])

    return (
        <Layout style={{ padding: '5px 5px 5px 5px' }}>
            <Row justify={"space-between"} align={"middle"}>
                <Text style={{ fontSize: '20px', marginLeft: '5px', marginBottom: '5px' }} level={1} strong>{userName.organization}</Text>
                <Link to={`/${org}/charts`}>
                    <Tooltip title={"Editar Gráficos"} placement={"left"}>
                        <Button type={"text"} shape={"circle"} style={{ marginLeft: 5 }}>
                            <EditOutlined style={{ fontSize: 14 }} />
                        </Button>
                    </Tooltip>
                </Link>
            </Row>
            <Charts />
            {/* <DrilldownChart /> */}
        </Layout>
    )
}

export default Home