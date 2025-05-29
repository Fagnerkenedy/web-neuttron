import React, { useEffect, useState } from "react";
import { Col, Row, Layout, theme, Button, Tooltip, Select } from "antd";
import { Typography } from 'antd';
import { fetchCharts } from './fetchCharts'
// import Barra from './Barra'
// import Linha from './Linha'
// import Funil from './Funil'
import Column from './Column.jsx'
import Line from "./Line.jsx";
import Funnel from "./Funnel.jsx"
import Area from "./Area.jsx"
import Bar from "./Bar.jsx"
import Pie from "./Pie.jsx"
import Donut from "./Donut.jsx"
import Rose from "./Rose.jsx"
import Gauge from "./Gauge.jsx"
import { EditOutlined } from "@ant-design/icons";
// import Demo from "./testere.js";
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
    const [selectedValues, setSelectedValues] = useState({});

    useEffect(() => {
        async function fetchChartsData() {
            const fetchedCharts = await fetchCharts(org)
            console.log("chartttt", fetchedCharts.result)
            setCharts(fetchedCharts.result)
            // setData(fetchedCharts.result.data)

            // Define 'Todos' como valor inicial de cada filtro
            const initialSelectedValues = {}
            fetchedCharts.result.forEach((_, index) => {
                initialSelectedValues[index] = 'Todos'
            })
            setSelectedValues(initialSelectedValues)
        }
        fetchChartsData()
    }, [])

    const handleSelectChange = (index, value) => {
        setSelectedValues(prev => ({ ...prev, [index]: value }));
    };

    return (
        <>
            <Row>
                {/* {charts.map((chart, index) => {
                    const filteredData = selectedValue === 'Todos'
                        ? chart.data
                        : chart.data.filter(d => d.name === selectedValue);
                    return (
                        <Select
                            value={selectedValue}
                            onChange={value => setSelectedValue(value)}
                            options={chart.data}
                            style={{ width: 200, marginBottom: 16 }}
                        />
                    )
                })} */}
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    {charts.map((chart, index) => (
                        <Col key={index}>
                            <Select
                                value={selectedValues[index] || 'Todos'}
                                onChange={(value) => handleSelectChange(index, value)}
                                options={[
                                    { label: 'Todos', value: 'Todos' },
                                    ...chart.data.map((d) => ({ label: d.name, value: d.name }))
                                ]}
                                style={{ width: 200 }}
                                placeholder={`Filtro: ${chart.query.name}`}
                            />
                        </Col>
                    ))}
                </Row>

                {charts.map((chart, index) => {
                    const filteredData = selectedValues[index] === 'Todos'
                        ? chart.data
                        : chart.data.filter(d => d.name === selectedValues[index]);

                    return (
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
                                            <Row justify={"space-between"} align={"middle"}>
                                                <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                                <Tooltip title={"Editar"}>
                                                    <Button href={`/${org}/charts/${chart.query.id}`} type={"text"} shape={"circle"}>
                                                        <EditOutlined style={{ fontSize: 14 }} />
                                                    </Button>
                                                </Tooltip>
                                            </Row>
                                            <Column xField={chart.query.xField} yField={chart.query.yField} data={filteredData} />
                                        </Col>
                                    )}
                                    {chart.query.type === 'Linha' && (
                                        <Col>
                                            <Row justify={"space-between"} align={"middle"}>
                                                <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                                <Tooltip title={"Editar"}>
                                                    <Button href={`/${org}/charts/${chart.query.id}`} type={"text"} shape={"circle"}>
                                                        <EditOutlined style={{ fontSize: 14 }} />
                                                    </Button>
                                                </Tooltip>
                                            </Row>
                                            <Line xField={chart.query.xField} yField={chart.query.yField} data={filteredData} />
                                        </Col>
                                    )}
                                    {chart.query.type === 'Funil' && (
                                        <Col>
                                            <Row justify={"space-between"} align={"middle"}>
                                                <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                                <Tooltip title={"Editar"}>
                                                    <Button href={`/${org}/charts/${chart.query.id}`} type={"text"} shape={"circle"}>
                                                        <EditOutlined style={{ fontSize: 14 }} />
                                                    </Button>
                                                </Tooltip>
                                            </Row>
                                            <Funnel xField={chart.query.xField} yField={chart.query.yField} data={filteredData} />
                                        </Col>
                                    )}
                                    {chart.query.type === 'Área' && (
                                        <Col>
                                            <Row justify={"space-between"} align={"middle"}>
                                                <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                                <Tooltip title={"Editar"}>
                                                    <Button href={`/${org}/charts/${chart.query.id}`} type={"text"} shape={"circle"}>
                                                        <EditOutlined style={{ fontSize: 14 }} />
                                                    </Button>
                                                </Tooltip>
                                            </Row>
                                            <Area xField={chart.query.xField} yField={chart.query.yField} data={filteredData} />
                                        </Col>
                                    )}
                                    {chart.query.type === 'Barra' && (
                                        <Col>
                                            <Row justify={"space-between"} align={"middle"}>
                                                <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                                <Tooltip title={"Editar"}>
                                                    <Button href={`/${org}/charts/${chart.query.id}`} type={"text"} shape={"circle"}>
                                                        <EditOutlined style={{ fontSize: 14 }} />
                                                    </Button>
                                                </Tooltip>
                                            </Row>
                                            <Bar xField={chart.query.xField} yField={chart.query.yField} data={filteredData} />
                                        </Col>
                                    )}
                                    {chart.query.type === 'Pizza' && (
                                        <Col>
                                            <Row justify={"space-between"} align={"middle"}>
                                                <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                                <Tooltip title={"Editar"}>
                                                    <Button href={`/${org}/charts/${chart.query.id}`} type={"text"} shape={"circle"}>
                                                        <EditOutlined style={{ fontSize: 14 }} />
                                                    </Button>
                                                </Tooltip>
                                            </Row>
                                            <Pie xField={chart.query.xField} yField={chart.query.yField} data={filteredData} />
                                        </Col>
                                    )}
                                    {chart.query.type === 'Rosca' && (
                                        <Col>
                                            <Row justify={"space-between"} align={"middle"}>
                                                <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                                <Tooltip title={"Editar"}>
                                                    <Button href={`/${org}/charts/${chart.query.id}`} type={"text"} shape={"circle"}>
                                                        <EditOutlined style={{ fontSize: 14 }} />
                                                    </Button>
                                                </Tooltip>
                                            </Row>
                                            <Donut xField={chart.query.xField} yField={chart.query.yField} data={filteredData} />
                                        </Col>
                                    )}
                                    {chart.query.type === 'Rosa' && (
                                        <Col>
                                            <Row justify={"space-between"} align={"middle"}>
                                                <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                                <Tooltip title={"Editar"}>
                                                    <Button href={`/${org}/charts/${chart.query.id}`} type={"text"} shape={"circle"}>
                                                        <EditOutlined style={{ fontSize: 14 }} />
                                                    </Button>
                                                </Tooltip>
                                            </Row>
                                            <Rose xField={chart.query.xField} yField={chart.query.yField} data={filteredData} />
                                        </Col>
                                    )}
                                    {chart.query.type === 'gauge' && (
                                        <Col>
                                            <Row justify={"space-between"} align={"middle"}>
                                                <Text level={4} style={{ margin: '10px' }}>{chart.query.name}</Text>
                                                <Tooltip title={"Editar"}>
                                                    <Button href={`/${org}/charts/${chart.query.id}`} type={"text"} shape={"circle"}>
                                                        <EditOutlined style={{ fontSize: 14 }} />
                                                    </Button>
                                                </Tooltip>
                                            </Row>
                                            <Gauge xField={chart.query.xField} yField={chart.query.yField} data={filteredData} />
                                        </Col>
                                    )}
                                </div>
                            </Layout>
                        </Col>
                    )
                })}
            </Row>
        </>
    )
}

export default Charts