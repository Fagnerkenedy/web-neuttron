import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import '../styles.css'
import { Input, InputNumber, Button, Layout, Col, Form, theme, Row, Typography, message, Popconfirm, Select, DatePicker, Checkbox } from 'antd';
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
    const [relatedFieldData, setRelatedFieldData] = useState([]);
    const [options, setOptions] = useState([]);

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

    const fetchOptions = async (open, moduleName, api_name) => {
        if (open) {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/field/${api_name}`, config);
            console.log("etstetes", response)
            setOptions(response.data);
        }
    }

    useEffect(() => {
        fetchData();
    }, [itemId]);

    if (!data) {
        return //<div>Carregando...</div>;
    }

    const handleFieldChange = (index, field_api_name, value) => {
        const updatedData = [...data];
        updatedData[index].field_value = value;
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
    };

    const handleSave = async () => {
        try {
            const fieldToUpdate3 = {};
            if (fieldToUpdate) {
                fieldToUpdate.map(field => {
                    const { api_name, field_value } = field;
                    fieldToUpdate3[api_name] = field_value;
                });

                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
                await axios.put(`${linkApi}/crm/${org}/${moduleName}/${record_id}`, fieldToUpdate3, config);
                console.log("RECORD ID:", record_id)
                const records = relatedFieldData.filter(record => !!record);
                const newRelatedFieldData = records.map((item) => {
                    return {
                        ...item,
                        module_id: record_id
                    };
                })
                console.log("newRelatedFieldData: ", newRelatedFieldData)
                const promises = newRelatedFieldData.map(async item => {
                    await axios.put(`${linkApi}/crm/${org}/${moduleName}/field`, { related_id: item.related_id, id: item.id, api_name: item.api_name }, config);
                    return axios.put(`${linkApi}/crm/${org}/${moduleName}/relatedField`, item, config);
                });
                const results = await Promise.all(promises);

                console.log("results", results);
                message.success('Registro Atualizado!');
                navigate(`/${org}/${moduleName}`)
            }
            navigate(`/${org}/${moduleName}`)

        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    const handleFieldChangeRelatedModule = async (index, id, newValue) => {
        try {
            console.log("newValue:", newValue.key)
            const updatedData = [...data];
            const fieldToUpdate1 = updatedData[index];
            console.log("related field update", fieldToUpdate1)

            const fieldToUpdate5 = {
                index: index,
                related_module: fieldToUpdate1.related_module,
                related_id: newValue.key,
                module_id: null,
                id: fieldToUpdate1.id,
                api_name: fieldToUpdate1.api_name
            };

            console.log("Batatinha quando nasce", fieldToUpdate5)
            console.log("Batatinha quando relatedFieldData", relatedFieldData)
            const updatedRelatedFieldData = [...relatedFieldData];
            updatedRelatedFieldData[index] = fieldToUpdate5;
            setRelatedFieldData(updatedRelatedFieldData);

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
                                background: colorBgContainer
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
                                <Text style={{ padding: '15px 25px', fontSize: '18px', color: '#ffff' }}>{toSingular(moduleName)} Informações</Text>
                                <Row>
                                    <Col span={24}>
                                        <Row gutter={16}>
                                            {data.map((fieldData, index) => (
                                                <Col key={index} span={10}>
                                                    <div style={{ padding: '5px 0', minHeight: '66px' }}>
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
                                                                            <Form.Item>
                                                                                <Select
                                                                                    showSearch
                                                                                    optionFilterProp="children"
                                                                                    filterOption={(input, option) =>
                                                                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                                                    }
                                                                                    style={{ width: "100%", border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                                                                                    // onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
                                                                                    // value={selectedValue ? selectedValue.value : null}
                                                                                    defaultValue={fieldData.field_value}
                                                                                    placeholder="Selecione"
                                                                                    // onChange={(open, key) => handleFieldChangeRelatedModule(open, key)}
                                                                                    onChange={(value) => handleFieldChange(index, fieldData.field_api_name, value)}
                                                                                    // loading={loading}
                                                                                    onDropdownVisibleChange={(open) => fetchRelatedModule(open, fieldData.related_module, fieldData.api_name)}
                                                                                    onSelect={(key, value) => handleFieldChangeRelatedModule(index, key, value)}
                                                                                    dropdownRender={(menu) => (
                                                                                        <div>
                                                                                            {menu}
                                                                                            {/* <div style={{ textAlign: "center", padding: "10px", cursor: "pointer" }}>
                                                                                                <a href={`/${org}/${fieldData.related_module}/${fieldData.related_id}`} target="_blank" rel="noopener noreferrer">
                                                                                                    {(fieldData.field_value ? `Ir para ${fieldData.field_value}` : '')}
                                                                                                </a>
                                                                                            </div> */}
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
                                                                            </Form.Item>
                                                                        );
                                                                    } else if (fieldData.field_type == "select") {
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
                                                                                onChange={(value) => handleFieldChange(index, fieldData.field_api_name, value)}
                                                                                // loading={loading}
                                                                                onDropdownVisibleChange={(open) => fetchOptions(open, fieldData.module, fieldData.api_name)}
                                                                            >
                                                                                <Option value=''>-Nenhum-</Option>
                                                                                {options.map(item => (
                                                                                    <Option key={item.id} value={item.name}>
                                                                                        {item.name}
                                                                                    </Option>
                                                                                ))}
                                                                            </Select>
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
                                                                                onFocus={(e) => { e.target.style.overflowY = 'auto'; }}
                                                                                onBlur={(e) => { e.target.style.overflowY = 'hidden'; e.target.scrollTop = 0; }}
                                                                                rows={4}
                                                                                defaultValue={fieldData.field_value}
                                                                                onChange={(e) => handleFieldChange(index, fieldData.field_api_name, e.target.value)}
                                                                                maxLength={16000}
                                                                            />

                                                                        )
                                                                    } else if (fieldData.field_type == "checkbox") {
                                                                        return (
                                                                            <Checkbox
                                                                                defaultChecked={fieldData.field_value == 1 ? true : false}
                                                                                onChange={(e) => handleFieldChange(index, fieldData.field_api_name, e.target.checked)}
                                                                            >
                                                                            </Checkbox>
                                                                        )
                                                                    } else if (fieldData.field_type == "number") {
                                                                        return (
                                                                            <InputNumber
                                                                                style={{ width: "100%" }}
                                                                                changeOnWheel
                                                                                defaultValue={fieldData.field_value}
                                                                                onChange={(e) => handleFieldChange(index, e)}
                                                                            />
                                                                        )
                                                                    } else if (fieldData.field_type == "currency") {
                                                                        return (
                                                                            <InputNumber
                                                                                style={{ width: "100%" }}
                                                                                prefix="R$"
                                                                                formatter={(val) => {
                                                                                    if (!val) return 0;
                                                                                    return `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".").replace(/\.(?=\d{0,2}$)/g, ",");
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
