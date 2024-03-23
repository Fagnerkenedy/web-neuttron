import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import '../styles.css'
import { Input, InputNumber, Button, Layout, Col, Form, theme, Row, Typography, message, Popconfirm, Select, DatePicker } from 'antd';
import { Content } from 'antd/es/layout/layout';
import apiURI from '../../../Utility/recordApiURI.js';
const { TextArea } = Input;
const dayjs = require('dayjs');
const { deleteRecord } = apiURI;
const pluralize = require('pluralize')

dayjs().format()

const { Option } = Select;
const { Title, Text } = Typography;
const currentPath = window.location.pathname;
const pathParts = currentPath.split('/');
const org = pathParts[1];
const moduleName = pathParts[2];
const record_id = pathParts[3];

const EditView = ({ itemId }) => {
    const [relatedModuleData, setRelatedModuleData] = useState([]);
    let navigate = useNavigate()
    const [inputValue, setInputValue] = useState("")
    const [editedFields, setEditedFields] = useState({})
    const toSingular = (plural) => {
        return pluralize.singular(plural)
    }
    const confirm = async (e) => {
        await deleteRecord(moduleName, record_id)
        message.success('Registro Excluido!');
    }
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const [data, setData] = useState(null);
    const [fieldToUpdate, setFieldsToUpdate] = useState(null);
    const [fieldsToUpdate, setAllFieldsToUpdate] = useState(null);
    const linkApi = process.env.REACT_APP_LINK_API;
    const handleInputChange = (newValue) => {
        setInputValue(newValue);
    };

    const fetchData = async () => {
        try {
            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/');
            const org = pathParts[1];
            const moduleName = pathParts[2];
            const record_id = pathParts[3];
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const responseFields = await axios.get(`${linkApi}/crm/${org}/${moduleName}/fields`, config);
            const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/${record_id}`, config);
            const combinedData = responseFields.data.map(field => {
                const matchingResponse = response.data.find(item => item[field.api_name]);
                return {
                    ...field,
                    field_value: matchingResponse ? matchingResponse[field.api_name] : ''
                };
            });
            if (Array.isArray(combinedData)) {
                setData(combinedData);
            } else {
                setData([combinedData]);
            }
        } catch (error) {
            console.error("Erro ao buscar os dados:", error);
        }
    };

    const fetchRelatedModule = async (open, relatedModuleName) => {
        if (open) {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get(`${linkApi}/crm/${org}/${relatedModuleName}/records`, config);
            console.log("setRelatedModuleData: ", response.data)
            setRelatedModuleData(response.data);
        }
    }

    useEffect(() => {
        fetchData();
    }, [itemId]);

    if (!data) {
        return //<div>Carregando...</div>;
    }

    const handleFieldChange = (index, field_api_name, value) => {
        console.log("index", index)
        console.log("field_api_name", field_api_name)
        console.log("value", value)

        const updatedData = [...data];


        updatedData[index].field_value = value;
        console.log("updatedData[index]", updatedData[index])

        setFieldsToUpdate(updatedData);



        // const updatedData = [...data];
        // const fieldToUpdate = updatedData[index];
        // fieldToUpdate.field_value = value;
        // delete fieldToUpdate.field_name;
        // delete fieldToUpdate.record_id;
        // setFieldsToUpdate(prevState => {
        //     const editedField = {
        //         [fieldToUpdate.field_api_name]: fieldToUpdate.field_value
        //     };
        //     Object.keys(editedField).forEach(fieldName => {
        //         console.log("hahaha", fieldName)
        //         if (fieldName !== field_api_name) {
        //             delete editedField[fieldName];
        //         }
        //     });
        //     const prevFields = Array.isArray(prevState) ? prevState : [];
        //     return [...prevFields, editedField];
        // });
        // setAllFieldsToUpdate(prevState => {
        //     const prevFields = Array.isArray(prevState) ? prevState : [];
        //     return [...prevFields, fieldToUpdate];
        // });
        console.log("fieldToUpdate3", JSON.stringify(fieldToUpdate))
        // console.log("fieldToUpdate3", fieldsToUpdate)
    };

    const handleSave = async () => {
        try {
            console.log("fieldToUpdate2", fieldToUpdate)

            const fieldToUpdate3 = {};
            if (fieldToUpdate) {
                fieldToUpdate.map(field => {
                    const { api_name, field_value } = field;
                    fieldToUpdate3[api_name] = field_value;
                });
                console.log("fieldToUpdateMAP", fieldToUpdate3);


                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
                await axios.put(`${linkApi}/crm/${org}/${moduleName}/${record_id}`, fieldToUpdate3, config);

                message.success('Registro Atualizado!');
                navigate(`/${org}/${moduleName}`)
            }
            navigate(`/${org}/${moduleName}`)

        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    return (
        <div>
            {data && (
                <div>
                    <div>
                        <Layout
                            style={{
                                background: colorBgContainer,
                            }}
                        >
                            <Row style={{ alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
                                <Col>
                                    <Title
                                        style={{ paddingLeft: '30px', fontSize: '22px' }}
                                    >
                                        Editar {toSingular(moduleName)}
                                    </Title>
                                </Col>
                                <Col>
                                    <Row>
                                        <Col style={{ margin: '0 15px 0 0' }}>
                                            <Button href={`/${org}/${moduleName}/${record_id}`}>Cancelar</Button>
                                            <Button style={{ margin: '0 15px' }} type='primary' onClick={handleSave}>Salvar</Button>
                                        </Col>
                                    </Row>
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
                                                                    {fieldData.name}:
                                                                </Text>
                                                            </Col>
                                                            <Col span={14}>
                                                                {(() => {
                                                                    if (fieldData.field_type === "related_module") {
                                                                        return (
                                                                            <Form.Item>
                                                                                <Select
                                                                                    defaultValue={fieldData.field_value}
                                                                                    placeholder="Selecione"
                                                                                    // loading={loading}
                                                                                    onDropdownVisibleChange={(open) => fetchRelatedModule(open, fieldData.related_module)}
                                                                                    onSelect={(value) => handleFieldChange(index, fieldData.field_api_name, value)}
                                                                                    style={{ width: "100%" }}
                                                                                    
                                                                                >
                                                                                    {relatedModuleData.map(item => (
                                                                                        <Option key={item.record_id} value={item.field_value}>
                                                                                            <a href='google.com'>{item.field_value}</a>
                                                                                        </Option>
                                                                                    ))}
                                                                                </Select>
                                                                            </Form.Item>
                                                                        );
                                                                    } else if (fieldData.field_type == "date") {
                                                                        return (
                                                                            <Form.Item>
                                                                                <DatePicker
                                                                                    onChange={(value) => handleFieldChange(index, fieldData.field_api_name, value)}
                                                                                    value={fieldData.field_value ? dayjs(fieldData.field_value) : null}
                                                                                    format="DD/MM/YYYY"
                                                                                    style={{ width: "100%" }}
                                                                                />
                                                                            </Form.Item>
                                                                        );
                                                                    } else if (fieldData.field_type == "multi_line") {
                                                                        return (
                                                                            <TextArea
                                                                                rows={4}
                                                                                defaultValue={fieldData.field_value}
                                                                                onChange={(newValue) => handleFieldChange(index, newValue)}
                                                                                maxLength={16000}
                                                                            />

                                                                        )
                                                                    } else {
                                                                        return (
                                                                            <Form.Item>
                                                                                <Input
                                                                                    value={editedFields[fieldData.field_name] || fieldData.field_value}
                                                                                    onChange={e => handleFieldChange(index, fieldData.field_api_name, e.target.value)}
                                                                                />
                                                                            </Form.Item>
                                                                        );
                                                                    }
                                                                })()}
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
                                                            <EditableCell
                                                                value={fieldData.field_value}
                                                                onChange={(newValue) => handleFieldChange(index, newValue)}
                                                                type={typeof fieldData.field_value === 'number' ? 'number' : 'text'}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </div>
                                            )
                                        ))}
                                    </Col> */}
                                </Row>
                            </Layout>
                        </Content>
                    </div>
                </div>
            )}
        </div>
    );

};

export default EditView;
