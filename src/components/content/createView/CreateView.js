import React, { useState, useEffect } from 'react';
import axios from "axios"
import '../styles.css'
import { Input, InputNumber, Button, Layout, Col, Form, theme, Row, Typography, message, Popconfirm } from 'antd';
import InputCell from './InputCellOld.js';
import { Content } from 'antd/es/layout/layout';
import apiURI from '../../../Utility/recordApiURI.js';
//import MyComponent from './teste.js';
import { useNavigate } from 'react-router-dom'
const { deleteRecord } = apiURI;
const pluralize = require('pluralize')

const { Title, Text } = Typography;
const currentPath = window.location.pathname;
const pathParts = currentPath.split('/');
const moduleName = pathParts[1];
const record_id = pathParts[2];

const CreateView = () => {
    const toSingular = (plural) => {
        return pluralize.singular(plural)
    }
    const navigate = useNavigate()
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const confirm = async (e) => {
        console.log(e);
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/');
        const moduleName = pathParts[1];
        const record_id = pathParts[2];
        await deleteRecord(moduleName, record_id)
        message.success('Registro Excluido!');
    }
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const [data, setData] = useState(null);
    const linkApi = process.env.REACT_APP_LINK_API;

    const fetchData = async () => {
        try {

            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get(`${linkApi}/crm/${moduleName}/fields`, config);
            console.log("response record:", response.data);
            // Verifica se os dados retornados pela API estão em um formato de matriz
            if (Array.isArray(response.data)) {
                setData(response.data);
            } else {
                setData([response.data]); // Se não estiver, converte para uma matriz de um único elemento
            }
        } catch (error) {
            console.error("Erro ao buscar os dados:", error);
        }
    };
    const fetchDataById = async () => {
        try {

            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get(`${linkApi}/crm/${moduleName}/${record_id}`, config);
            console.log("Response Record By Id:", response.data);
            // Verifica se os dados retornados pela API estão em um formato de matriz
            if (Array.isArray(response.data)) {
                setData(response.data);
            } else {
                setData([response.data]); // Se não estiver, converte para uma matriz de um único elemento
            }
        } catch (error) {
            console.error("Erro ao buscar os dados:", error);
        }
    };

    useEffect(() => {
        fetchDataById();

        // fetchData();
    }, [record_id]);

    if (!data) {
        return <div>Carregando...</div>;
    }

    console.log("datssa:", data);

    const onFinish = async (values) => {
        setLoading(true)

        try {
            console.log("newdata", values)

            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/');
            const moduleName = pathParts[1];
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            await axios.post(`${linkApi}/crm/${moduleName}/record`, values, config);
            fetchData()
            console.log("Registro criado com sucesso!");
            setLoading(false)
            navigate(`/${moduleName}`)
        } catch (error) {
            console.error("Erro ao criar registro:", error);
            setLoading(false)
        }
    };

    return (
        <div>
            {data && (
                <div>
                    <Form
                        form={form}
                        name="cadastro-registro"
                        onFinish={onFinish}
                    >
                        <div>
                            <Layout
                                style={{
                                    background: colorBgContainer,
                                }}
                            >
                                <Row style={{ alignItems: 'center', minHeight: '50px' }}>
                                    <Col span={12}>
                                        <Title
                                            style={{ color: '#838da1', paddingLeft: '30px', fontSize: '22px' }}
                                        >
                                            Criar {toSingular(moduleName)}
                                        </Title>
                                    </Col>
                                    <Col span={2} offset={10}>
                                        <Button href={`/${moduleName}`}>Cancelar</Button>
                                        <Button type="primary" htmlType="submit">Salvar</Button>
                                    </Col>
                                </Row>
                            </Layout>
                        </div>
                        <div style={{ padding: '15px 0' }}>
                            <Content className='content'>

                                <Layout
                                    style={{
                                        background: colorBgContainer,
                                        borderRadius: borderRadiusLG,
                                        minHeight: 'calc(100vh - 160px)'
                                    }}
                                >
                                    <Text style={{ padding: '15px 25px', fontSize: '18px', color: '#838da1' }}>{toSingular(moduleName)} Informações</Text>
                                    <Row>
                                        <Col span={24}>
                                            <Row gutter={16}>
                                                {data.map((fieldData, index) => (
                                                    <Col key={index} span={10}>
                                                        <div style={{ padding: '5px 0' }}>
                                                            <Row>
                                                                <Col span={10} style={{ textAlign: 'right', paddingRight: '10px' }}>
                                                                    <Text style={{ fontSize: '16px', color: '#838da1' }}>
                                                                        {fieldData.field_name}:
                                                                    </Text>
                                                                </Col>
                                                                <Col span={14}>
                                                                    <InputCell
                                                                        value={fieldData.field_value}
                                                                        type={typeof fieldData.field_value === 'number' ? 'number' : 'text'}
                                                                        api_name={fieldData.field_api_name}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Col>

                                        {/* <Col span={10} >
                                            {data.map((fieldData, index) => (
                                                index % 2 !== 0 && (
                                                    <div key={index}>
                                                        <Row style={{ padding: '15px 0' }}>
                                                            <Col span={10} style={{ textAlign: 'right', paddingRight: '10px' }}>
                                                                <Text style={{ fontSize: '16px', color: '#838da1' }}>
                                                                    {fieldData.field_name}:
                                                                </Text>
                                                            </Col>
                                                            <Col span={14}>
                                                                <InputCell
                                                                    value={fieldData.field_value}
                                                                    type={typeof fieldData.field_value === 'number' ? 'number' : 'text'}
                                                                    api_name={fieldData.field_api_name}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                )
                                            ))}
                                            {/* <MyComponent /> 
                                        </Col> */}
                                    </Row>
                                </Layout>
                            </Content>
                        </div>
                    </Form>
                </div>
            )
            }
        </div >
    );

};

export default CreateView;
