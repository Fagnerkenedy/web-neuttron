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
        console.log(e);

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
            console.log("responseFields:", responseFields.data);
            const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/${record_id}`, config);
            console.log("response record API:", response.data);

            const combinedData = responseFields.data.map(field => {
                const matchingResponse = response.data.find(item => item[field.api_name]);
                return {
                    ...field,
                    field_value: matchingResponse ? matchingResponse[field.api_name] : ''
                };
            });
            console.log("combinedData:", combinedData);

            const relatedModulePromises = combinedData.map(async field => {
                if (field.related_module != null) {

                    console.log("field.related_module: ", field.related_module)
                    console.log("field.related_id: ", field.related_id)
                    console.log("field: ", field)
                    const response = await axios.get(`${linkApi}/crm/${org}/${field.related_module}`, config);
                    console.log("setRelatedModuleDatasetRelatedModuleData: ", response.data)
                    // const matchingResponse = response.data.map(item => {
                    //     return {
                    //         field_value: item[api_name],
                    //         related_id: item.id
                    //     };
                    // });
                    const matchingResponse = response.data.find(item => item[field.api_name]);
                    console.log("matchingResponse12:", matchingResponse);
                    return {
                        ...field,
                        field_value: matchingResponse ? matchingResponse[field.api_name] : ''
                    };
                }
            })

            const relatedModuleResponses = await Promise.all(relatedModulePromises);
            console.log("relatedModuleResponses:", relatedModuleResponses);
            // setRelatedModuleData(matchingResponse);

            if (Array.isArray(combinedData)) {
                setData(combinedData);
            } else {
                setData([combinedData]);
            }
        } catch (error) {
            console.error("Erro ao buscar os dados:", error);
        }
    };

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

    const handleSelectChange = (value, option) => {
        console.log("option", option.key)
        setSelectedValue({ value: value, id: option.key });
    };

    const relatedModuleList = async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        console.log("teasdasdhjasuiod")
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/');
        const org = pathParts[1];
        const moduleName = pathParts[2];
        const record_id = pathParts[3];
        const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/relatedField`, config);
        // const relatedModules = response.data.result;
        // // Para cada módulo relacionado, faça uma solicitação para obter mais detalhes
        // const detailedModules = await Promise.all(relatedModules.map(async (element) => {
        //     const moduleResponse = await axios.get(`${linkApi}/crm/${org}/${moduleName}/relatedField`, element.related_module, config);
        //     return moduleResponse.data;
        // }));

        // console.log("Detalhes dos módulos relacionados:", detailedModules);
        console.log("relatedListrelatedListrelatedList: ", response.data)
        setRelatedModuleList(response.data)
    }

    useEffect(() => {
        fetchData();
        relatedModuleList();
    }, [itemId]);

    if (!data) {
        return //<div>Carregando...</div>;
    }

    console.log("datssa:", data);

    const handleFieldChange = async (index, newValue, id) => {
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

            const fieldToUpdate3 = {};
            [fieldToUpdate].map(field => {
                const { api_name, field_value } = field;
                fieldToUpdate3[api_name] = field_value
            });
            console.log("fieldToUpdateMAP3", fieldToUpdate3);

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
    const teste = true

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
                                                                    if (fieldData.related_module != null) {
                                                                        return (
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
                                                                                            <a href={`/${org}/${fieldData.related_module}/${fieldData.related_id}`} rel="noopener noreferrer">
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
                                                                                style={{ width: "100%", border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                                                                                onMouseEnter={(e) => { e.target.style.borderColor = '#ccc'; }}
                                                                                onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
                                                                                onChange={(value) => handleFieldChange(index, value)}
                                                                                value={fieldData.field_value ? dayjs(fieldData.field_value) : null}
                                                                                format="DD/MM/YYYY"
                                                                            />
                                                                        );
                                                                    } else if (fieldData.field_type == "multi_line") {
                                                                        return (
                                                                            <TextArea
                                                                                style={{ border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                                                                                onFocus={(e) => { e.target.style.overflowY = 'auto'; }}
                                                                                onBlur={(e) => { e.target.style.overflowY = 'hidden'; e.target.scrollTop = 0; }}
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
                                                                                // indeterminate={!isChecked} // Define o estado intermediário quando o checkbox é clicado pela primeira vez
                                                                                // checked={fieldData.field_value === 'true' || fieldData.field_value === true}

                                                                                defaultChecked={teste}
                                                                                onChange={(e) => handleFieldChange(index, e.target.checked)}
                                                                            >
                                                                                Checkbox {fieldData.field_value}
                                                                            </Checkbox>
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
                        {relatedList != null && relatedList.map((item, index) => (
                            <RelatedList key={index} related_module={item.module_name} related_id={record_id} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

};

export default DetailView;
