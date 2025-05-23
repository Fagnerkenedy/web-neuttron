import React, { useEffect, useState } from "react";
import { Col, Row, Layout, theme } from "antd";
import { Typography } from 'antd';
import { fetchCharts } from './fetchCharts'
import Barra from './Barra'
import Linha from './Linha'
import Funil from './Funil'
import Column from './Column.js'
import Line from "./Line.js";
import Funnel from "./Funnel.js"
import Area from "./Area.js"
import Bar from "./Bar.js"
import Pie from "./Pie.js"
import Donut from "./Donut.js"
import Rose from "./Rose.js"
import Gauge from "./Gauge.js"
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
                            <div style={{ borderRadius: '5px', padding: '10px' }}>
                                {chart.query.type === 'Coluna' && (
                                    <Col>
                                        <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                        <Column xField={chart.query.xField} yField={chart.query.yField} data={chart.data} />
                                    </Col>
                                )}
                                {chart.query.type === 'Linha' && (
                                    <Col>
                                        <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                        <Line xField={chart.query.xField} yField={chart.query.yField} data={chart.data} />
                                    </Col>
                                )}
                                {chart.query.type === 'Funil' && (
                                    <Col>
                                        <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                        <Funnel xField={chart.query.xField} yField={chart.query.yField} data={chart.data} />
                                    </Col>
                                )}
                                {chart.query.type === 'Área' && (
                                    <Col>
                                        <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                        <Area xField={chart.query.xField} yField={chart.query.yField} data={chart.data} />
                                    </Col>
                                )}
                                {chart.query.type === 'Barra' && (
                                    <Col>
                                        <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                        <Bar xField={chart.query.xField} yField={chart.query.yField} data={chart.data} />
                                    </Col>
                                )}
                                {chart.query.type === 'Pizza' && (
                                    <Col>
                                        <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                        <Pie xField={chart.query.xField} yField={chart.query.yField} data={chart.data} />
                                    </Col>
                                )}
                                {chart.query.type === 'Rosca' && (
                                    <Col>
                                        <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                        <Donut xField={chart.query.xField} yField={chart.query.yField} data={chart.data} />
                                    </Col>
                                )}
                                {chart.query.type === 'Rosa' && (
                                    <Col>
                                        <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                        <Rose xField={chart.query.xField} yField={chart.query.yField} data={chart.data} />
                                    </Col>
                                )}
                                {chart.query.type === 'gauge' && (
                                    <Col>
                                        <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                        <Gauge xField={chart.query.xField} yField={chart.query.yField} data={chart.data} />
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