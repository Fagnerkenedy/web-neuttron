import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import '../styles.css'
import { Input, InputNumber, Button, Layout, Col, Form, theme, Row, Typography, message, Popconfirm, Select, DatePicker } from 'antd';
import { Content } from 'antd/es/layout/layout';
import apiURI from '../../../Utility/recordApiURI.js';
const { TextArea } = Input;
const { deleteRecord } = apiURI;
const pluralize = require('pluralize')

const { Option } = Select;
const { Title, Text } = Typography;
const currentPath = window.location.pathname;
const pathParts = currentPath.split('/');
const org = pathParts[1];
const moduleName = pathParts[2];
const record_id = pathParts[3];

const EditView = ({ itemId }) => {
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
    const [relatedModuleData, setRelatedModuleData] = useState([]);

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
            console.log("dasdasdatatatata", combinedData)
            if (Array.isArray(combinedData)) {
                setData(combinedData);
            } else {
                setData([combinedData]);
            }
        } catch (error) {
            console.error("Erro ao buscar os dados:", error);
        }
    };

    // const fetchRelatedModule = async (open, relatedModuleName) => {
    //     if (open) {
    //         const token = localStorage.getItem('token');
    //         const config = {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`
    //             }
    //         };
    //         const response = await axios.get(`${linkApi}/crm/${org}/${relatedModuleName}/records`, config);
    //         console.log("setRelatedModuleData: ", response.data)
    //         setRelatedModuleData(response.data);
    //     }
    // }

    const fetchRelatedModule = async (open, relatedModuleName, api_name) => {
        console.log("api_name", api_name)
        if (open) {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get(`${linkApi}/crm/${org}/${relatedModuleName}`, config);
            console.log("setRelatedModuleData: ", response.data)
            const matchingResponse = response.data.map(item => {
                return {
                    field_value: item[api_name],
                    related_id: item.id
                };
            });

            console.log("matchingResponse12:", matchingResponse);
            setRelatedModuleData(matchingResponse);
            // setSelectedValue({ value: matchingResponse[0].field_value, id: matchingResponse[0].related_id });
        }
    }

    useEffect(() => {
        fetchData();
    }, [itemId]);

    if (!data) {
        return //<div>Carregando...</div>;
    }

    const handleFieldChange = (index, value) => {
        const updatedData = [...data];
        updatedData[index].field_value = value;
        setFieldsToUpdate(updatedData);
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
                const create = await axios.post(`${linkApi}/crm/${org}/${moduleName}/record`, fieldToUpdate3, config);
                console.log("create", create.data.record_id)
                const record_id = create.data.record_id
                message.success('Registro Criado!');
                navigate(`/${org}/${moduleName}/${record_id}`)
            }

        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    const handleFieldChangeRelatedModule = async (index, newValue, id) => {
        try {
            console.log("iiiddd", id)
            const updatedData = [...data];
            console.log("updatedData", updatedData)
            const fieldToUpdate = updatedData[index];
            console.log("fieldToUpdate", fieldToUpdate)
            fieldToUpdate.field_value = newValue;
            fieldToUpdate.related_id = id;
            console.log("fieldToUpdatefieldToUpdate", fieldToUpdate)
            console.log("newdata", [fieldToUpdate])
            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/');
            const org = pathParts[1];
            const moduleName = pathParts[2];
            const record_id = pathParts[3];

            const fieldToUpdate3 = {};
            [fieldToUpdate].map(field => {
                const { name, api_name, field_value, related_id } = field;
                fieldToUpdate3[api_name] = related_id.key
                // fieldToUpdate3.related_id = related_id.key
            });
            console.log("fieldToUpdateMAP3", fieldToUpdate3);
            const fieldToUpdate4 = {};
            [fieldToUpdate].map(field => {
                const { name, related_id, related_module, id, api_name } = field;
                fieldToUpdate4.id = id
                fieldToUpdate4.api_name = api_name
                fieldToUpdate4.name = name
                fieldToUpdate4.related_module = related_module
                fieldToUpdate4.related_id = related_id.key
            });
            console.log("fieldToUpdateMAP4", fieldToUpdate4);

            const fieldToUpdate5 = {};
            [fieldToUpdate].map(field => {
                const { name, related_id, related_module, id, api_name } = field;
                fieldToUpdate5.id = id
                fieldToUpdate5.api_name = api_name
                fieldToUpdate5.name = name
                fieldToUpdate5.related_module = related_module
                fieldToUpdate5.related_id = related_id.key
                fieldToUpdate5.module_id = record_id
            });
            console.log("fieldToUpdateMAP4", fieldToUpdate5);

            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            await axios.put(`${linkApi}/crm/${org}/${moduleName}/${record_id}`, fieldToUpdate3, config);
            await axios.put(`${linkApi}/crm/${org}/${moduleName}/field`, fieldToUpdate4, config);
            await axios.put(`${linkApi}/crm/${org}/${moduleName}/relatedField`, fieldToUpdate5, config);
            message.success('Registro Atualizado!');
            fetchData()
        } catch (error) {
            console.error("Erro ao atualizar os dados:", error);
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
                                marginTop: '50px'
                            }}
                        >
                            <Row style={{ alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
                                <Col>
                                    <Title
                                        style={{ paddingLeft: '30px', fontSize: '22px' }}
                                    >
                                        Criar {toSingular(moduleName)}
                                    </Title>
                                </Col>
                                <Col style={{ margin: '0 15px 0 0' }}>
                                    <Button href={`/${org}/${moduleName}`}>Cancelar</Button>
                                    <Button style={{ margin: '0 15px' }} type='primary' onClick={handleSave}>Salvar</Button>
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
                                <Text style={{ padding: '15px 25px', fontSize: '18px', color: '#ffff' }}>{toSingular(moduleName)} Informações</Text>
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
                                                                {
                                                                    <Form.Item>
                                                                        {(() => {
                                                                            if (fieldData.related_module != null) {
                                                                                return (
                                                                                    // <Select
                                                                                    //     placeholder="Selecione"
                                                                                    //     // loading={loading}
                                                                                    //     onDropdownVisibleChange={(open) => fetchRelatedModule(open, fieldData.related_module)}
                                                                                    //     onSelect={(value) => handleFieldChange(index, value)}
                                                                                    //     style={{ width: "100%" }}
                                                                                    // >
                                                                                    //     {relatedModuleData.map(item => (
                                                                                    //         <Option key={item.record_id} value={item.field_value}>
                                                                                    //             {item.field_value}
                                                                                    //         </Option>
                                                                                    //     ))}
                                                                                    // </Select>
                                                                                    <Select
                                                                                        style={{ width: "100%", border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                                                                                        onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
                                                                                        // value={selectedValue ? selectedValue.value : null}
                                                                                        defaultValue={fieldData.field_value}
                                                                                        placeholder="Selecione"
                                                                                        onChange={(open, key) => handleFieldChangeRelatedModule(open, key)}
                                                                                        // loading={loading}
                                                                                        onDropdownVisibleChange={(open) => fetchRelatedModule(open, fieldData.related_module, fieldData.api_name)}
                                                                                        onSelect={(key, value) => handleFieldChangeRelatedModule(index, key, value)}
                                                                                        dropdownRender={(menu) => (
                                                                                            <div>
                                                                                                {menu}
                                                                                                <div style={{ textAlign: "center", padding: "10px", cursor: "pointer" }}>
                                                                                                    <a href={`/${org}/${fieldData.related_module}/${fieldData.field_value}`} rel="noopener noreferrer">
                                                                                                        {`Ir para ${fieldData.field_value}`}
                                                                                                    </a>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                    >
                                                                                        {relatedModuleData.map(item => (
                                                                                            <Option key={item.related_id} value={item.field_value}>
                                                                                            </Option>
                                                                                        ))}
                                                                                    </Select>
                                                                                );
                                                                            } else if (fieldData.field_type == "date") {
                                                                                return (
                                                                                    <DatePicker
                                                                                        onChange={(value) => handleFieldChange(index, value)}
                                                                                        format="DD/MM/YYYY"
                                                                                        style={{ width: "100%" }}
                                                                                    />
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
                                                                                    <Input
                                                                                        value={editedFields[fieldData.field_name] || fieldData.field_value}
                                                                                        onChange={e => handleFieldChange(index, e.target.value)}
                                                                                    />
                                                                                );
                                                                            }
                                                                        })()}
                                                                    </Form.Item>
                                                                }
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Col>
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
