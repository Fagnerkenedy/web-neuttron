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
            const org = pathParts[0];
            const moduleName = pathParts[1];
            const record_id = pathParts[2];
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
            const response = await axios.get(`${linkApi}/crm/${relatedModuleName}/records`, config);
            console.log("setRelatedModuleData: ", response.data)
            setRelatedModuleData(response.data);
            setSelectedValue({ value: response.data.field_value, id: response.data.record_id });
        }
    }

    const handleSelectChange = (value, option) => {
        console.log("option", option.key)
        setSelectedValue({ value: value, id: option.key });
    };

    useEffect(() => {
        fetchData();
    }, [itemId]);

    if (!data) {
        return //<div>Carregando...</div>;
    }

    console.log("datssa:", data);

    const handleFieldChange = async (index, newValue) => {
        try {
            const updatedData = [...data];
            console.log("updatedData", updatedData)
            const fieldToUpdate = updatedData[index];
            console.log("fieldToUpdate", fieldToUpdate)
            fieldToUpdate.field_value = newValue;
            console.log("fieldToUpdatefieldToUpdate", fieldToUpdate)
            delete fieldToUpdate.field_name;
            delete fieldToUpdate.record_id;
            console.log("newdata", [fieldToUpdate])

            const fieldToUpdate3 = {};
            [fieldToUpdate].map(field => {
                const { api_name, field_value } = field;
                fieldToUpdate3[api_name] = field_value;
            });
            console.log("fieldToUpdateMAP", fieldToUpdate3);

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
                                                                    if (fieldData.field_type === "related_module") {
                                                                        return (
                                                                            <Select
                                                                                style={{ width: "100%", border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                                                                                onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
                                                                                // value={selectedValue ? selectedValue.value : null}
                                                                                defaultValue={fieldData.field_value}
                                                                                placeholder="Selecione"
                                                                                onChange={handleSelectChange}
                                                                                // loading={loading}
                                                                                onDropdownVisibleChange={(open) => fetchRelatedModule(open, fieldData.related_module)}
                                                                                onSelect={(value) => handleFieldChange(index, value)}
                                                                                dropdownRender={(menu) => (
                                                                                    <div>
                                                                                        {menu}
                                                                                        <div style={{ textAlign: "center", padding: "10px", cursor: "pointer" }}>
                                                                                            <a href={`/${fieldData.related_module}/${selectedValue}`} target="_blank" rel="noopener noreferrer">
                                                                                                {selectedValue && `Ir para ${selectedValue}`}
                                                                                            </a>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            >
                                                                                {relatedModuleData.map(item => (
                                                                                    <Option key={item.record_id} value={item.field_value}>
                                                                                        {item.field_value}
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
                    </div>
                </div>
            )}
        </div>
    );

};

export default DetailView;
