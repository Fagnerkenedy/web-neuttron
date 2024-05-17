import React, { useEffect, useState } from "react";
import { Col, Row, Layout, theme } from "antd";
import { Typography } from 'antd';
import { fetchCharts } from './fetchCharts'
import { Column } from '@ant-design/plots';
import Barra from './Barra'

const { Text } = Typography;

const currentPath = window.location.pathname;
const pathParts = currentPath.split('/');
const org = pathParts[1]

function Charts() {
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
            {charts.map((chart, index) => (
                <Layout
                    style={{
                        background: colorBgContainer,
                        marginBottom: '15px'
                    }}
                >
                    <Row gutter={[16, 16]} key={index}>
                        <Col span={24}>
                            {/* <div style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '15px' }}> */}
                                {chart.query.type === 'barra' && (
                                    <Barra xField={chart.query.xField} yField={chart.query.yField} data={chart.data} />
                                )}
                            {/* </div> */}
                        </Col>
                    </Row>
                </Layout>
            ))}
        </>
    )
}

export default Charts