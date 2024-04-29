import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import '../styles.css'
import { Input, InputNumber, Button, Layout, Col, Form, theme, Row, Typography, message, Popconfirm, Select, DatePicker, Checkbox } from 'antd';
import EditableCell from './EditableCell.js';
import { Content } from 'antd/es/layout/layout';
import apiURI from '../../../Utility/recordApiURI.js';
import { LeftOutlined } from '@ant-design/icons';
import Paragraph from 'antd/es/typography/Paragraph.js';
import RelatedList from './RelatedList.js';
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

const DetailView = ({ itemId }) => {
    const [relatedModuleData, setRelatedModuleData] = useState([]);
    const [selectedValue, setSelectedValue] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const [relatedList, setRelatedModuleList] = useState('');

    let navigate = useNavigate()
    const toSingular = (plural) => {
        return pluralize.singular(plural)
    }
    const confirm = async (e) => {
        await deleteRecord(org, moduleName, record_id)
        message.success('Registro Excluido!');
        navigate(`/${org}/${moduleName}`)
    }
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const [data, setData] = useState(null);
    const linkApi = process.env.REACT_APP_LINK_API;

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
            console.log("responseFields", responseFields)
            const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/${record_id}`, config);
            const combinedData = responseFields.data.map(field => {
                const matchingResponse = response.data.find(item => item[field.api_name]);
                return {
                    ...field,
                    field_value: matchingResponse ? matchingResponse[field.api_name] : ''
                };
            });

            console.log("combinedData", combinedData)

            const relatedModulePromises = combinedData.map(async field => {
                if (field.related_module != null) {
                    console.log("field.related_module", field)

                    const response = await axios.get(`${linkApi}/crm/${org}/${field.related_module}/relatedDataById/${record_id}`, config);
                    console.log("response", response)
                    return {
                        api_name: field.api_name,
                        related_id: response.data[0].related_id
                    };
                }
            })

            const relatedModuleResponses = await Promise.all(relatedModulePromises);
            console.log("relatedModuleResponses", relatedModuleResponses)
            const updatedCombinedData = combinedData.map(field => {
                if (field.related_module != null) {
                    console.log("field", field);
                    const relatedData = relatedModuleResponses.find(data => data && data.api_name === field.api_name);
                    console.log("relatedData", relatedData);
                    if (relatedData) {
                        return {
                            ...field,
                            related_id: relatedData.related_id
                        };
                    } else {
                        return field;
                    }
                } else {
                    return field;
                }
            });
            console.log("updatedCombinedData", updatedCombinedData);
            


            if (Array.isArray(updatedCombinedData)) {
                setData(updatedCombinedData);
            } else {
                setData([updatedCombinedData]);
            }
        } catch (error) {
            console.error("Erro ao buscar os dados:", error);
        }
    };

    const fetchRelatedModule = async (open, relatedModuleName, api_name) => {
        if (open) {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get(`${linkApi}/crm/${org}/${relatedModuleName}`, config);
            const matchingResponse = response.data.map(item => {
                return {
                    field_value: item[api_name],
                    related_id: item.id
                };
            });
            setRelatedModuleData(matchingResponse);
            // setSelectedValue({ value: matchingResponse[0].field_value, id: matchingResponse[0].related_id });
        }
    }

    const handleSelectChange = (value, option) => {
        setSelectedValue({ value: value, id: option.key });
    };

    const relatedModuleList = async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }; const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/');
        const org = pathParts[1];
        const moduleName = pathParts[2];
        const record_id = pathParts[3];
        const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/relatedField/${record_id}`, config);
        setRelatedModuleList(response.data)
    }

    useEffect(() => {
        fetchData();
        relatedModuleList();
    }, [itemId]);

    if (!data) {
        return //<div>Carregando...</div>;
    }

    const handleFieldChange = async (index, newValue, id) => {
        try {
            const updatedData = [...data];
            const fieldToUpdate = updatedData[index];
            fieldToUpdate.field_value = newValue;
            fieldToUpdate.related_id = id;
            const fieldToUpdate3 = {};
            [fieldToUpdate].map(field => {
                const { api_name, field_value } = field;
                fieldToUpdate3[api_name] = field_value
            });
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
            await axios.put(`${linkApi}/crm/${org}/${moduleName}/${record_id}`, fieldToUpdate3, config);
            message.success('Registro Atualizado!');
            fetchData()
        } catch (error) {
            console.error("Erro ao atualizar os dados:", error);
        }
    };
    const handleFieldChangeRelatedModule = async (index, newValue, id) => {
        try {
            console.log("index", index)
            console.log("newValue", newValue)
            console.log("id", id)

            const updatedData = [...data];
            const fieldToUpdate = updatedData[index];

            fieldToUpdate.field_value = newValue;
            fieldToUpdate.related_id = id;

            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/');
            const org = pathParts[1];
            const moduleName = pathParts[2];
            const record_id = pathParts[3];

            const fieldToUpdate3 = {};
            [fieldToUpdate].map(field => {
                const { name, api_name, field_value, related_id } = field;
                fieldToUpdate3[api_name] = id.value
                // fieldToUpdate3.related_id = related_id.key
            });
            const fieldToUpdate4 = {};
            [fieldToUpdate].map(field => {
                const { name, related_id, related_module, id, api_name } = field;
                fieldToUpdate4.id = id
                fieldToUpdate4.api_name = api_name
                fieldToUpdate4.name = name
                fieldToUpdate4.related_module = related_module
                fieldToUpdate4.related_id = related_id.key
                fieldToUpdate4.related_value = id.value
            });
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
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            // console.log("4",fieldToUpdate4)
            await axios.put(`${linkApi}/crm/${org}/${moduleName}/${record_id}`, fieldToUpdate3, config);
            await axios.put(`${linkApi}/crm/${org}/${moduleName}/field`, fieldToUpdate4, config);
            await axios.put(`${linkApi}/crm/${org}/${moduleName}/relatedField`, fieldToUpdate5, config);
            message.success('Registro Atualizado!');
            fetchData()
        } catch (error) {
            console.error("Erro ao atualizar os dados:", error);
        }
    };
    const teste = true

    return (
        <div>
            {data && (
                <div>
                    <div>
                        <Layout
                            style={{
                                background: colorBgContainer
                            }}
                        >
                            <Row style={{ alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
                                <Col>
                                    <Title
                                        style={{ paddingLeft: '30px', fontSize: '22px' }}
                                    >
                                        {data[0].field_value}
                                    </Title>
                                </Col>
                                <Col style={{ margin: '0 15px 0 0' }}>
                                    <Button icon={<LeftOutlined />} style={{ margin: '0 15px' }} href={`/${org}/${moduleName}`}>Voltar</Button>
                                    <Button href={`/${org}/${moduleName}/${record_id}/edit`}>Editar</Button>
                                    <Popconfirm
                                        title="Excluir"
                                        description="Deseja excluir este(s) registro(s)?"
                                        onConfirm={() => confirm()}
                                        okText="Sim"
                                        cancelText="Cancelar"
                                    >
                                        <Button style={{ margin: '0 15px' }} danger>Excluir</Button>
                                    </Popconfirm>
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
                                    minHeight: (relatedList.length === 0 ? 'calc(100vh - 161px)' : ''),
                                    padding: '20px'
                                }}
                            >
                                <Text style={{ padding: '0px 25px 10px', fontSize: '18px', color: '#ffff' }}>{toSingular(moduleName)} Informações</Text>
                                <Row>
                                    <Col span={24}>
                                        <Row gutter={16}>
                                            {data.map((fieldData, index) => (
                                                <Col key={index} span={10}>
                                                    <div style={{ padding: '5px 0', minHeight: '66px' }}>
                                                        <Row>
                                                            <Col span={10} style={{ textAlign: 'right', paddingRight: '10px' }}>
                                                                <Text style={{ fontSize: '16px', color: '#838da1' }}>
                                                                    {/* {JSON.stringify(fieldData)} */}
                                                                    {fieldData.name}
                                                                </Text>
                                                            </Col>
                                                            <Col span={14}>
                                                                {(() => {
                                                                    if (fieldData.related_module != null) {
                                                                        return (
                                                                            <Select
                                                                                showSearch
                                                                                optionFilterProp="children"
                                                                                filterOption={(input, option) =>
                                                                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                                                }
                                                                                style={{ width: "100%", border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                                                                                onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
                                                                                // value={selectedValue ? selectedValue.value : null}
                                                                                defaultValue={fieldData.field_value}
                                                                                placeholder="Selecione"
                                                                                // onChange={(open, key) => handleFieldChangeRelatedModule(open, key)}
                                                                                // loading={loading}
                                                                                onDropdownVisibleChange={(open) => fetchRelatedModule(open, fieldData.related_module, fieldData.api_name)}
                                                                                onSelect={(key, value) => handleFieldChangeRelatedModule(index, key, value)}
                                                                                dropdownRender={(menu) => (
                                                                                    <div>
                                                                                        {menu}
                                                                                        <div style={{ textAlign: "center", padding: "10px", cursor: "pointer" }}>
                                                                                            <a href={`/${org}/${fieldData.related_module}/${fieldData.related_id}`} rel="noopener noreferrer">
                                                                                                {(fieldData.field_value ? `Ir para ${fieldData.field_value}` : '')}
                                                                                            </a>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            >
                                                                                <Option value=''>-Nenhum-</Option>
                                                                                {relatedModuleData.map(item => (
                                                                                    <Option key={item.related_id} value={item.field_value}>
                                                                                        {item.field_value}
                                                                                    </Option>
                                                                                ))}
                                                                            </Select>
                                                                        );
                                                                    } else if (fieldData.field_type == "date") {
                                                                        return (
                                                                            <DatePicker
                                                                                style={{ height: '100%', width: "100%", border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                                                                                onMouseEnter={(e) => { e.target.style.borderColor = '#ccc'; }}
                                                                                onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
                                                                                onChange={(value) => handleFieldChange(index, value)}
                                                                                value={fieldData.field_value ? dayjs(fieldData.field_value) : null}
                                                                                placeholder="Selecione uma data"
                                                                                format="DD/MM/YYYY"
                                                                            />
                                                                        );
                                                                    } else if (fieldData.field_type == "multi_line") {
                                                                        return (
                                                                            <TextArea
                                                                                style={{ border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                                                                                onFocus={(e) => { e.target.style.overflowY = 'auto'; }}
                                                                                onBlur={(e) => handleFieldChange(index, e.target.value)}
                                                                                onMouseEnter={(e) => { e.target.style.borderColor = '#ccc'; }}
                                                                                onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
                                                                                rows={4}
                                                                                defaultValue={fieldData.field_value}
                                                                                onChange={(newValue) => handleFieldChange(index, newValue)}
                                                                                maxLength={16000}
                                                                            />

                                                                        )
                                                                    } else if (fieldData.field_type == "checkbox") {
                                                                        return (
                                                                            <Checkbox
                                                                                defaultChecked={fieldData.field_value == 1 ? true : false}
                                                                                onChange={(e) => handleFieldChange(index, e.target.checked)}
                                                                            >
                                                                            </Checkbox>
                                                                        )
                                                                    } else if (fieldData.field_type == "number") {
                                                                        return (
                                                                            // <InputNumber
                                                                            //     style={{ width: "100%" }}
                                                                            //     changeOnWheel
                                                                            //     defaultValue={fieldData.field_value}
                                                                            //     onChange={(e) => handleFieldChange(index, e)}
                                                                            // />
                                                                            <EditableCell
                                                                                value={fieldData.field_value}
                                                                                onChange={(newValue) => handleFieldChange(index, newValue)}
                                                                                type={'number'}
                                                                            />
                                                                        )
                                                                    } else if (fieldData.field_type == "currency") {
                                                                        return (
                                                                            <InputNumber
                                                                                style={{ width: "100%" }}
                                                                                prefix="R$"
                                                                                formatter={(val) => {
                                                                                    if (!val) return 0;
                                                                                    return `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".").replace(/\.(?=\d{0,2}$)/g, ",")
                                                                                }}
                                                                                parser={(val) => {
                                                                                    if (!val) return 0;
                                                                                    return Number.parseFloat(val.replace(/\$\s?|(\.*)/g, "").replace(/(\,{1})/g, ".")).toFixed(2)
                                                                                }}
                                                                                changeOnWheel
                                                                                defaultValue={fieldData.field_value}
                                                                                onChange={(e) => handleFieldChange(index, e)}
                                                                            />
                                                                        )
                                                                    } else {
                                                                        return (
                                                                            <EditableCell
                                                                                value={fieldData.field_value}
                                                                                onChange={(newValue) => handleFieldChange(index, newValue)}
                                                                                type={typeof fieldData.field_value === 'number' ? 'number' : 'text'}
                                                                            />
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
                                </Row>
                            </Layout>

                        </Content>
                        {(console.log("relatedList", relatedList))}
                        {Array.isArray(relatedList) && relatedList.map((item, index) => (
                            <RelatedList key={index} related_module={item.module_name} related_id={record_id} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

};

export default DetailView;
