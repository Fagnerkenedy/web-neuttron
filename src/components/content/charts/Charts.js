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
            console.log("chartttt", fetchedCharts)
            setCharts(fetchedCharts.result.query)
            setData(fetchedCharts.result.data)
        }
        fetchChartsData()
    }, [])

    return (
        <Layout
            style={{
                background: colorBgContainer
            }}
        >
            <Col>
                {charts.map((chart) => {
                    switch (chart.type) {
                        case 'barra':
                            return <Barra xField={chart.xField} yField={chart.yField} data={data}  />
                        case 'teste2':
                            console.log('testd2')
                            return ''
                        default:
                            console.log('abestado')
                            return ''
                    }
                })}
            </Col>
        </Layout>
    )
}

export default Charts