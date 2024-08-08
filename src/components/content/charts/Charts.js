import React, { useEffect, useState } from "react";
import { Col, Row, Layout, theme } from "antd";
import { Typography } from 'antd';
import { fetchCharts } from './fetchCharts'
import { Column } from '@ant-design/plots';
import Barra from './Barra'
import Linha from './Linha'
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
                    <Col span={12} key={index}>
                        <Layout
                            style={{
                                background: colorBgContainer,
                                margin: '10px'
                            }}
                        >
                            <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '15px' }}>
                                {chart.query.type === 'barra' && (
                                    <>
                                        <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                        <Barra xField={chart.query.xField} yField={chart.query.yField} data={chart.data} />
                                    </>
                                )}
                                {chart.query.type === 'linha' && (
                                    <>
                                        <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                        <Linha xField={chart.query.xField} yField={chart.query.yField} data={chart.data} />
                                    </>
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