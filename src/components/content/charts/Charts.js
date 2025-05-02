import React, { useEffect, useState } from "react";
import { Col, Row, Layout, theme } from "antd";
import { Typography } from 'antd';
import { fetchCharts } from './fetchCharts'
import { Column } from '@ant-design/plots';
import Barra from './Barra'
import Linha from './Linha'
import Funil from './Funil'
const { Text } = Typography;

function Charts() {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    const [charts, setCharts] = useState([])
    const [data, setData] = useState([])
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken()

    useEffect(() => {
        async function fetchChartsData() {
            const fetchedCharts = await fetchCharts(org)
            console.log("chartttt", fetchedCharts.result)
            setCharts(fetchedCharts.result)
            // setData(fetchedCharts.result.data)
        }
        fetchChartsData()
    }, [])

    return (
        <>
            <Row>
                {charts.map((chart, index) => (
                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={8} key={index}>
                        <Layout
                            style={{
                                background: colorBgContainer,
                                margin: '5px'
                            }}
                        >
                            <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px' }}>
                                {chart.query.type === 'barra' && (
                                    <Col style={{ height: 500 }}>
                                        <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                        <Barra xField={chart.query.xField} yField={chart.query.yField} data={chart.data} />
                                    </Col>
                                )}
                                {chart.query.type === 'linha' && (
                                    <Col style={{ height: 500 }}>
                                        <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                        <Linha xField={chart.query.xField} yField={chart.query.yField} data={chart.data} />
                                    </Col>
                                )}
                                {chart.query.type === 'funil' && (
                                    <Col style={{ height: 500 }}>
                                        <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                        <Funil xField={chart.query.xField} yField={chart.query.yField} data={chart.data} />
                                    </Col>
                                )}
                            </div>
                        </Layout>
                    </Col>
                ))}
            </Row>
        </>
    )
}

export default Charts