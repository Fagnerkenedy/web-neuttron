import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import '../styles.css'
import { Input, InputNumber, Button, Layout, Col, Form, theme, Row, Typography, message, Popconfirm, Select, DatePicker, Checkbox, Tooltip } from 'antd';
import EditableCell from './EditableCell.js';
import { Content } from 'antd/es/layout/layout';
import apiURI from '../../../Utility/recordApiURI.js';
import { BoxPlotOutlined, CheckOutlined, CloseOutlined, LeftOutlined } from '@ant-design/icons';
import Paragraph from 'antd/es/typography/Paragraph.js';
import RelatedList from './RelatedList.js';
import PermissionsPage from './PermissionsPage.js';
import { Can } from "../../../contexts/AbilityContext.js";
import { useAbility } from '../../../contexts/AbilityContext.js'
import CodeEditor from '../functionEditor/index.js';
import locale from 'antd/es/date-picker/locale/pt_BR'
import { useOutletContext } from 'react-router-dom';
import Link from 'antd/es/typography/Link.js';
const { TextArea } = Input;
const dayjs = require('dayjs');
const { deleteRecord } = apiURI;
const pluralize = require('pluralize')

dayjs().format()

const { Option } = Select;
const { Title, Text } = Typography;


const DetailView = ({ itemId }) => {
    const [sections, setSections] = useState([])
    const { ability, loading } = useAbility();
    const [relatedModuleData, setRelatedModuleData] = useState([]);
    const [selectedValue, setSelectedValue] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const [relatedList, setRelatedModuleList] = useState('');
    const [options, setOptions] = useState([]);
    const [relatedFieldData, setRelatedFieldData] = useState([]);
    const [openField, setOpenField] = useState(false)
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1];
    const moduleName = pathParts[2];
    const record_id = pathParts[3];
    const { darkMode } = useOutletContext();
    const [form] = Form.useForm();
    const [fieldToUpdate, setfieldToUpdate] = useState('');
    const [fieldToUpdate3, setFieldToUpdate3] = useState('');
    const [fieldToUpdate4, setFieldToUpdate4] = useState('');
    const [fieldToUpdate5, setFieldToUpdate5] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState('');

    let navigate = useNavigate()
    const toSingular = (plural) => {
        return pluralize.singular(plural)
    }
    const confirm = async (e) => {
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/');
        const record_id = pathParts[3];
        await deleteRecord(org, moduleName, record_id)
        message.success('Registro Excluido!');
        navigate(`/${org}/${moduleName}`)
    }
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken()
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
                    const response = await axios.get(`${linkApi}/crm/${org}/${field.related_module}/relatedDataById/${record_id}`, config);
                    console.log("response relatedDataById:",response)
                    if (response.data.row.length != 0) {
                        return {
                            name: field.field_value,
                            api_name: field.api_name,
                            related_id: response.data.row[0].related_id,
                            related_module: field.related_module,
                            module_id: null,
                            id: field.id
                        };

                    }
                } else {
                    return field;
                }
            })
            const relatedModuleResponses = await Promise.all(relatedModulePromises);
            setRelatedFieldData(relatedModuleResponses);

            const updatedCombinedData = combinedData.map(field => {
                if (field.related_module != null) {
                    const relatedData = relatedModuleResponses.find(data => data && data.api_name === field.api_name);
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

            const responseSections = await axios.get(`${linkApi}/sections/${org}/${moduleName}`, config);
            // console.log("responseSections.data.sections.fields: ",responseSections.data.sections[0].fields)
            // setSections(responseSections.data.sections);

            const responseSectionsFields = responseSections.data.sections
            // Atualizar os campos das seções com os valores dos campos em combinedData
            const updatedSections = responseSectionsFields.map(section => {
                // Atualizar campos à esquerda
                const updatedLeft = section.fields.left.map(item => {
                const matchingField = updatedCombinedData.find(field => field.api_name === item.api_name);
                return {
                    ...item,
                    field_value: matchingField ? matchingField.field_value : item.field_value
                };
                });

                // Atualizar campos à direita
                const updatedRight = section.fields.right.map(item => {
                const matchingField = updatedCombinedData.find(field => field.api_name === item.api_name);
                return {
                    ...item,
                    field_value: matchingField ? matchingField.field_value : item.field_value
                };
                });

                return {
                ...section,
                left: updatedLeft,
                right: updatedRight
                };
            });
            
            setSections(updatedSections)

            if (Array.isArray(updatedCombinedData)) {
                setData(updatedCombinedData);
            } else {
                setData([updatedCombinedData]);
            }
        } catch (error) {
            console.error("Erro ao buscar os dados:", error);
        }
    };

    const fetchRelatedModule = async (open, relatedModuleName, search_field) => {
        if (open) {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            if (relatedModuleName == "modules") {
                const response = await axios.get(`${linkApi}/crm/${org}/${relatedModuleName}`, config);
                const matchingResponse = response.data.result.map(item => {
                    return {
                        field_value: item[search_field],
                        related_id: item.api_name
                    };
                });
                setRelatedModuleData(matchingResponse);
            } else {
                const response = await axios.get(`${linkApi}/crm/${org}/${relatedModuleName}`, config);
                console.log("rataratata: ",response.data)
                const matchingResponse = response.data.map(item => {
                    return {
                        field_value: item[search_field],
                        related_id: item.id
                    };
                });
                console.log("rataratata matchingResponse: ",matchingResponse)

                setRelatedModuleData(matchingResponse);
            }

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
            setOptions(response.data);
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
        }; 
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/');
        const org = pathParts[1];
        const moduleName = pathParts[2];
        const record_id = pathParts[3];
        const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/relatedField/${record_id}`, config);
        setRelatedModuleList(response.data)
    }

    const separateOptions = async (stringOptions, field_id) => {
        if (!stringOptions.trim()) {
            return [];
        }
        const stringComAspas = stringOptions.replace(/([^;]+ )/g, '"$1"');
        const lista = stringComAspas.split(';');
        const listaFinal = lista.map(item => item.trim().replace(/^"|"$/g, ''));
        const fieldOptions = {
            field_id: field_id,
            list: listaFinal
        }
        setOptions([fieldOptions])
    }

    useEffect(() => {
        fetchData();
        relatedModuleList();
    }, [itemId]);

    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    if (!data) {
        return //<div>Carregando...</div>;
    }

    // const handleFieldChange = async (index, newValue, id, api_name) => {
    const handleFieldChange = async (sectionIndex, index, value, api_name, column, id) => {
        try {

            console.log("value sectionIndex?: ",sectionIndex)
            console.log("value index?: ",index)
            console.log("value value?: ",value)
            console.log("value api_name?: ",api_name)
            console.log("value column?: ",column)

            // const updatedData = [...sections];
            // updatedData[sectionIndex][column][index].field_value = value;
            // console.log("datas datas cadabra: ",updatedData)
            
            // setSections(updatedData)

            const updatedData = [...sections];
            const fieldToUpdate = updatedData[sectionIndex][column][index]
            fieldToUpdate.field_value = value;
            fieldToUpdate.related_id = id;
            const fieldToUpdate3 = {};
            fieldToUpdate3[api_name] = value

            setfieldToUpdate(fieldToUpdate3)

            // [fieldToUpdate].map(field => {
            //     const { api_name, field_value } = field;
            //     fieldToUpdate3[api_name] = field_value
            // });
            // const currentPath = window.location.pathname;
            // const pathParts = currentPath.split('/');
            // const org = pathParts[1];
            // const moduleName = pathParts[2];
            // const record_id = pathParts[3];
            // const token = localStorage.getItem('token');
            // const config = {
            //     headers: {
            //         'Authorization': `Bearer ${token}`
            //     }
            // };
            // await axios.put(`${linkApi}/crm/${org}/${moduleName}/${record_id}`, fieldToUpdate3, config);
            // message.success('Registro Atualizado!');
            // fetchData()
        } catch (error) {
            console.error("Erro ao atualizar os dados:", error);
        }
    };

    const handleSave = async () => {
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
        await axios.put(`${linkApi}/crm/${org}/${moduleName}/${record_id}`, fieldToUpdate, config);
        message.success('Registro Atualizado!');
        fetchData()
    }

    const handleSaveRelatedModule = async () => {
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
            await axios.put(`${linkApi}/crm/${org}/${moduleName}/${record_id}`, fieldToUpdate3, config);
            await axios.put(`${linkApi}/crm/${org}/${moduleName}/field`, fieldToUpdate4, config);
            await axios.put(`${linkApi}/crm/${org}/${moduleName}/relatedField`, fieldToUpdate5, config);
            message.success('Registro Atualizado!');
            fetchData()
        } catch (error) {
            
        }
    }

    // const handleFieldChange = async (index, newValue, id, api_name) => {
    //     try {
    //         const updatedData = [...data];
    //         const fieldToUpdate = updatedData[index];
    //         fieldToUpdate.field_value = newValue;
    //         fieldToUpdate.related_id = id;
    //         const fieldToUpdate3 = {};
    //         fieldToUpdate3[api_name] = newValue

    //         // [fieldToUpdate].map(field => {
    //         //     const { api_name, field_value } = field;
    //         //     fieldToUpdate3[api_name] = field_value
    //         // });
    //         const currentPath = window.location.pathname;
    //         const pathParts = currentPath.split('/');
    //         const org = pathParts[1];
    //         const moduleName = pathParts[2];
    //         const record_id = pathParts[3];
    //         const token = localStorage.getItem('token');
    //         const config = {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`
    //             }
    //         };
    //         await axios.put(`${linkApi}/crm/${org}/${moduleName}/${record_id}`, fieldToUpdate3, config);
    //         message.success('Registro Atualizado!');
    //         fetchData()
    //     } catch (error) {
    //         console.error("Erro ao atualizar os dados:", error);
    //     }
    // };

    // const handleFieldChangeRelatedModule = async (index, newValue, id) => {
    const handleFieldChangeRelatedModule = async (sectionIndex, index, value, api_name, column, id) => {

        try {
            console.log("sectionIndex", sectionIndex)
            console.log("index", index)
            console.log("value", value)
            console.log("api_name", api_name)
            console.log("column", column)
            console.log("id", id)
            console.log("databatata", data)

            const updatedData = [...sections];
            console.log("updatedDatabatata", data)
            const fieldToUpdate = updatedData[sectionIndex][column][index]

            fieldToUpdate.field_value = value.value;
            fieldToUpdate.related_id = value.key;

            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/');
            const org = pathParts[1];
            const moduleName = pathParts[2];
            const record_id = pathParts[3];
            console.log("fieldToUpdate", fieldToUpdate)
            const fieldToUpdate3 = {};
            fieldToUpdate3['related_record'] = [fieldToUpdate].reduce((acc, record) => {
                if (record != null) {
                    acc[record.api_name] = {
                        name: record.related_id.children,
                        id: record.related_id.key,
                        module: record.related_module
                    }
                }
                return acc;
            }, {});
            data.forEach(field => {
                fieldToUpdate3[field.api_name] = field.field_value ? field.field_value : "";
            });


            [fieldToUpdate].map(field => {
                const { name, api_name, field_value, related_id } = field;
                fieldToUpdate3[api_name] = value.value
                // fieldToUpdate3.related_id = related_id.key
            });
            const fieldToUpdate4 = {};
            [fieldToUpdate].map(field => {
                const { name, related_id, related_module, id, api_name } = field;
                fieldToUpdate4.id = id
                fieldToUpdate4.api_name = api_name
                fieldToUpdate4.name = name
                fieldToUpdate4.related_module = related_module
                fieldToUpdate4.related_id = related_id
                // fieldToUpdate4.related_value = value.value
            });
            const fieldToUpdate5 = {};
            [fieldToUpdate].map(field => {
                const { name, related_id, related_module, id, api_name } = field;
                fieldToUpdate5.id = id
                fieldToUpdate5.api_name = api_name
                fieldToUpdate5.name = name
                fieldToUpdate5.related_module = related_module
                fieldToUpdate5.related_id = related_id
                fieldToUpdate5.module_id = record_id
            });
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            console.log("fieldToUpdate3: ",fieldToUpdate3)
            console.log("fieldToUpdate4: ",fieldToUpdate4)
            console.log("fieldToUpdate5: ",fieldToUpdate5)

            setFieldToUpdate3(fieldToUpdate3)
            setFieldToUpdate4(fieldToUpdate4)
            setFieldToUpdate5(fieldToUpdate5)


            // await axios.put(`${linkApi}/crm/${org}/${moduleName}/${record_id}`, fieldToUpdate3, config);
            // await axios.put(`${linkApi}/crm/${org}/${moduleName}/field`, fieldToUpdate4, config);
            // await axios.put(`${linkApi}/crm/${org}/${moduleName}/relatedField`, fieldToUpdate5, config);
            // message.success('Registro Atualizado!');
            // fetchData()
        } catch (error) {
            console.error("Erro ao atualizar os dados:", error);
        }
    };
    const teste = true

    const extractNumbers = (inputString) => {
        const numbers = inputString.match(/\d+/g);
        return numbers ? numbers.join('') : '';
    }
    
    const renderField = (fieldData, index, onChange, onChangeRelatedModule) => {
        console.log("fieldData",fieldData)
        if (fieldData.related_module != null) {
            return (
                <Form.Item
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <Tooltip title={`Ir para ${fieldData.field_value}`}>
                        <Link href={`/${org}/${fieldData.related_module}/${fieldData.related_id}`}>{fieldData.field_value}</Link>
                    </Tooltip>
                    {/* <Select
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        style={{ width: "100%", border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                        defaultValue={fieldData.field_value}
                        placeholder="Selecione"
                        onDropdownVisibleChange={(open) => fetchRelatedModule(open, fieldData.related_module, fieldData.search_field)}
                        // onSelect={(key, value) => onChange(value)}
                        onSelect={(key, value) => onChangeRelatedModule(value)}
                        // onSelect={(key, value) => handleFieldChangeRelatedModule(index, key, value)}
                        dropdownRender={(menu) => (
                            <div>
                                {menu}
                                <div style={{ textAlign: "center", padding: "10px", cursor: "pointer" }}>
                                    <a href={`/${org}/${fieldData.related_module}/${fieldData.related_id}`} rel="noopener noreferrer">
                                        {fieldData.field_value ? `Ir para ${fieldData.field_value}` : ''}
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
                    </Select> */}
                </Form.Item>
            );
        } else if (fieldData.field_type === "select") {
            return (
                <Form.Item
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <Text>{fieldData.field_value}</Text>
                    {/* <Select
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        style={{ width: "100%", border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                        defaultValue={fieldData.field_value}
                        placeholder="Selecione"
                        onDropdownVisibleChange={(open) => fetchOptions(open, fieldData.module, fieldData.api_name)}
                        onSelect={(newValue) => onChange(newValue)}
                    >
                        <Option value=''>-Nenhum-</Option>
                        {options.map(item => (
                            <Option key={item.id} value={item.name}>
                                {item.name}
                            </Option>
                        ))}
                    </Select> */}
                </Form.Item>
            );
        } else if (fieldData.field_type === "date") {
            return (
                <Form.Item
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <Text>{fieldData.field_value}</Text>
                    {/* <DatePicker
                        locale={locale}
                        style={{height: '100%', width: "100%"}}
                        onChange={(value) => onChange(value)}
                        // value={fieldData.field_value ? dayjs(fieldData.field_value) : null}
                        placeholder="Selecione uma data"
                        format="DD/MM/YYYY"
                    /> */}
                </Form.Item>
            );
        } else if (fieldData.field_type === "date_time") {
            return (
                <Form.Item
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <Text>{fieldData.field_value}</Text>
                    {/* <DatePicker
                        disabled
                        showTime
                        locale={locale}
                        style={{height: '100%', width: "100%"}}
                        onChange={(value) => onChange(value)}
                        // value={fieldData.field_value ? dayjs(fieldData.field_value) : null}
                        placeholder="Selecione uma data"
                        format="DD/MM/YYYY HH:mm:ss"
                    /> */}
                </Form.Item>
            );
        } else if (fieldData.field_type === "multi_line") {
            return (
                <Form.Item
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <Text>{fieldData.field_value}</Text>
                    {/* <TextArea
                        // style={{ border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                        rows={1}
                        defaultValue={fieldData.field_value}
                        onChange={(e) => onChange(e.target.value)}
                        maxLength={extractNumbers(fieldData.type)}
                        // showCount
                    /> */}
                </Form.Item>
            );
        } else if (fieldData.field_type === "checkbox") {
            return (
                <Form.Item
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <Checkbox
                        disabled
                        defaultChecked={fieldData.field_value == 1}
                        onChange={(e) => onChange(e.target.checked ? 1 : 0)}
                    />
                </Form.Item>
            );
        } else if (fieldData.field_type === "number") {
            return (
                <Form.Item
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <Text>{fieldData.field_value}</Text>
                    {/* <InputNumber
                        style={{ width: "100%" }}
                        defaultValue={fieldData.field_value}
                        onChange={(value) => onChange(value)}
                        maxLength={extractNumbers(fieldData.type)}
                    /> */}
                </Form.Item>
            );
        } else if (fieldData.field_type === "currency") {
            return (
                <Form.Item
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <Text>{fieldData.field_value}</Text>
                    {/* <InputNumber
                        style={{ width: "100%" }}
                        prefix="R$"
                        formatter={value => value.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                        }
                        parser={value => value.replace(/\R$\s?|(,)/g, '').replace(/(.)/g, "").replace(/(,*)/g, ".")}
                        defaultValue={fieldData.field_value}
                        onChange={(value) => onChange(value)}
                        maxLength={extractNumbers(fieldData.type)}
                    /> */}
                </Form.Item>
            );
        } else if (fieldData.field_type == "email") {
            return (
                <Form.Item
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Por favor insira um e-mail',
                        },
                        {
                            type: 'email',
                            message: 'Por favor insira um e-mail válido',
                        },
                    ]}
                >
                    <Text>{fieldData.field_value}</Text>
                    {/* <Input
                        allowClear
                        placeholder="Insira um e-mail"
                        onChange={(e) => onChange(e.target.value)}
                        // defaultValue={fieldData.field_value}
                        maxLength={extractNumbers(fieldData.type)}
                    /> */}
                </Form.Item>
            )
        } else if (fieldData.field_type == "phone") {
            return (
                <Form.Item
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <Text>+55 {fieldData.field_value}</Text>
                    {/* <Input
                        allowClear
                        addonBefore="+55"
                        onChange={(e) => onChange(e.target.value)}
                        // defaultValue={fieldData.field_value}
                        maxLength={extractNumbers(fieldData.type)}
                    /> */}
                </Form.Item>
            )
        } else if (fieldData.field_type === "function") {
            return (
                // <CodeEditor
                //     height={'50vh'}
                //     language={'javascript'}
                //     value={fieldData.field_value}
                //     theme={'vs-dark'}
                //     readOnly
                // />
                <TextArea
                    // style={{ border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                    rows={18}
                    defaultValue={fieldData.field_value}
                    maxLength={extractNumbers(fieldData.type)}
                    showCount
                    readOnly
                />
            );
        } else {
            return (
                <Form.Item
                        label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                        name={fieldData.api_name}
                        rules={[
                            {
                                required: fieldData.required,
                                message: 'Este campo é obrigatório',
                            },
                        ]}
                >
                    <Text>{fieldData.field_value}</Text>
                </Form.Item>
            )
        }

        // } else {
            // console.log("openfield: ",openField)
            // if (openField == true) {
            //     return (
            //         <Input
            //             defaultValue={fieldData.field_value}
            //             // onChange={(e) => onChange(e.target.value)}
            //             maxLength={extractNumbers(fieldData.type)}
            //             onBlur={(e) => { 
            //                 setOpenField(false)
            //                 onChange(e.target.value)
            //             }}
            //             // showCount
            //         />
            //     )
            // } else {
        //     return (
        //         <Form.Item
        //             label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
        //             name={fieldData.api_name}
        //             rules={[
        //                 {
        //                     required: true,
        //                     message: 'Este campo é obrigatório',
        //                 },
        //             ]}
        //         >
        //             {isEditing ? (
        //                 <Input
        //                     value={inputValue}
        //                     onChange={(e) => setInputValue(e.target.value)}
        //                     addonAfter={
        //                         <>
        //                             <CheckOutlined
        //                                 onClick={() => {
        //                                     if (inputValue.trim() !== "") {
        //                                         form.submit();
        //                                         setIsEditing(false);
        //                                     }
        //                                 }}
        //                                 style={{ cursor: 'pointer', color: 'green', marginRight: 8 }}
        //                             />
        //                             <CloseOutlined
        //                                 onClick={() => {
        //                                     setInputValue(fieldData.field_value); // Restaura o valor original
        //                                     setIsEditing(false);
        //                                 }}
        //                                 style={{ cursor: 'pointer', color: 'red' }}
        //                             />
        //                         </>
        //                     }
        //                     onBlur={(e) => {
        //                         if (e.target.value.trim() === "") {
        //                             setInputValue(fieldData.field_value); // Restaura o valor original
        //                         }
        //                         setIsEditing(false);
        //                     }}
        //                     onPressEnter={() => {
        //                         if (inputValue.trim() !== "") {
        //                             form.submit();
        //                             setIsEditing(false);
        //                         }
        //                     }}
        //                 />
        //                 // <Input
        //                 //     ref={inputRef}
        //                 //     variant="filled"
        //                 //     value={inputValue ? inputValue : fieldData.field_value}
        //                 //     onChange={(e) => {
        //                 //         onChange(e.target.value)
        //                 //         // setInputValue(e.target.value)
        //                 //     }}
        //                 //     onBlur={(e) => {
        //                 //         if (e.target.value.trim() !== "" && e.target.value != fieldData.field_value) {
        //                 //             form.submit()
        //                 //         } else {
        //                 //             form.setFieldValue({ [fieldData.api_name]: fieldData.field_value })
        //                 //         }
        //                 //         setIsEditing(false)
        //                 //     }}
        //                 //     onPressEnter={(e) => {
        //                 //         if (e.target.value.trim() !== "" && e.target.value != fieldData.field_value) {
        //                 //             form.submit()
        //                 //         }
        //                 //         setIsEditing(false)
        //                 //     }}
        //                 //     addonAfter={
        //                 //         <>
        //                 //             <Button 
        //                 //                 type='text'
        //                 //                 onClick={(e) => {
        //                 //                     console.log("e: ",e)
        //                 //                     console.log("form.getFieldValue(fieldData.api_name): ",form.getFieldValue(fieldData.api_name))
        //                 //                     console.log("inputValue: ",inputValue)
        //                 //                     console.log("fieldData.field_value: ",fieldData.field_value)
        //                 //                     if (form.getFieldValue(fieldData.api_name) !== "" && form.getFieldValue(fieldData.api_name) != inputValue) {
        //                 //                         form.submit();
        //                 //                         setIsEditing(false);
        //                 //                     }
        //                 //                 }} 
        //                 //                 icon={<CheckOutlined style={{ color: 'green' }} />}
        //                 //             />
        //                 //             <Button
        //                 //                 type='text'
        //                 //                 onClick={() => {
        //                 //                     console.log("X fieldData.field_value", fieldData.field_value)
        //                 //                     setInputValue(fieldData.field_value); // Restaura o valor original
        //                 //                     setIsEditing(false);
        //                 //                 }}
        //                 //                 icon={<CloseOutlined style={{ color: 'red' }} />}
        //                 //             />
        //                 //         </>
        //                 //     }
        //                 // />
        //             ) : (
        //                 <Paragraph
        //                     editable={{
        //                         onStart: () => setIsEditing(true),
        //                         triggerType: 'text',
        //                     }}
        //                 >
        //                     {fieldData.field_value}
        //                 </Paragraph>
        //             )}
        //         </Form.Item>
        //     )
        //     // }
        // }
    };

    return (
        <div>
            {data && (
                <div style={{ overflowY: 'auto' }}>
                    <div>
                        <Layout
                            style={{
                                background: colorBgContainer,
                                position: 'fixed',
                                zIndex: '900',
                                width: '100%'
                            }}
                        >
                            <Row style={{ alignItems: 'center', justifyContent: 'space-between', height: '52px', borderBottom: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid' }}>
                                <Row style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Tooltip title="Voltar">
                                        <Button type='text' icon={<LeftOutlined />} style={{ margin: '0 15px' }} href={`/${org}/${moduleName}`}></Button>
                                    </Tooltip>
                                    <Title
                                        style={{ fontSize: '22px', margin: '0' }}
                                    >
                                        {/* {data[0].field_value} */}
                                        Detalhes
                                    </Title>
                                </Row>
                                <Col style={{ margin: '0 15px 0 0' }}>
                                    <Can I='update' a={moduleName} ability={ability}>
                                        <Button type='primary' href={`/${org}/${moduleName}/${record_id}/edit`}>Editar</Button>
                                    </Can>
                                    <Can I='delete' a={moduleName} ability={ability}>
                                        <Popconfirm
                                            title="Excluir"
                                            description="Deseja excluir este(s) registro(s)?"
                                            onConfirm={() => confirm()}
                                            okText="Sim"
                                            cancelText="Cancelar"
                                        >
                                            <Button style={{ margin: '0 15px' }} danger>Excluir</Button>
                                        </Popconfirm>
                                    </Can>
                                </Col>
                            </Row>
                        </Layout>
                        <Row style={{ height: '52px' }}></Row>
                    </div>
                    <div style={{ padding: '15px 0' }}>
                        <Content className='content'>
                            <Layout
                                style={{
                                    background: colorBgContainer,
                                    borderRadius: borderRadiusLG,
                                    minHeight: (relatedList.length === 0 ? 'calc(100vh - 161px)' : 'calc(80vh - 205px)'),
                                    padding: '20px',
                                    border: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid'
                                }}
                            >
                                {/* <Text style={{ padding: '0px 25px 10px', fontSize: '18px' }}>{toSingular(moduleName)} Informações</Text> */}
                                <Row>
                                    <Col span={24}>
                                        <Row gutter={16}>
                                            {sections.map((section, sectionIndex) => (
                                                <Col key={sectionIndex} span={(moduleName == "functions" ? 24 : 20)}>
                                                    <Text style={{ padding: '0px 25px 10px', fontSize: '18px' }}>{section.name}</Text>
                                                        <Row gutter={16}>
                                                            <Col span={(moduleName == "functions" ? 24 : 12)}>
                                                                {section.left.map((field, fieldIndex) => (
                                                                    <div key={field.id} style={{ padding: '5px 0', minHeight: '50px' }}>
                                                                        <Form
                                                                            form={form}
                                                                            name="Form"
                                                                            initialValues={(field.field_type == "date" || field.field_type == "date_time" ? { [field.api_name]: dayjs(field.field_value) } : { [field.api_name]: field.field_value })}
                                                                            labelCol={{
                                                                                flex: '200px',
                                                                            }}
                                                                            labelWrap
                                                                            wrapperCol={{
                                                                                flex: 1,
                                                                            }}
                                                                            colon={false}
                                                                            layout="horizontal"
                                                                            onFinish={handleSave}
                                                                        >
                                                                            <Row>
                                                                                {/* <Col span={(moduleName == "functions" ? 3 : 10)} style={{ textAlign: 'right', paddingRight: '10px' }}>
                                                                                    <Text style={{ fontSize: '16px', color: '#838da1' }}>{field.name}</Text>
                                                                                </Col> */}
                                                                                <Col span={(moduleName == "functions" ? 22 : 22)} offset={(moduleName == "functions" ? 1 : 2)}>
                                                                                        {renderField(field, fieldIndex, (newValue) => handleFieldChange(sectionIndex, fieldIndex, newValue, field.api_name, 'left'), (newValue) => handleFieldChangeRelatedModule(sectionIndex, fieldIndex, newValue, field.api_name, 'left'))}
                                                                                        {/* {renderField(field, fieldIndex, (newValue) => handleFieldChange(fieldIndex, newValue, '', field.api_name))} */}
                                                                                </Col>
                                                                            </Row>
                                                                        </Form>
                                                                    </div>
                                                                ))}
                                                            </Col>
                                                            <Col span={(moduleName == "functions" ? 24 : 12)}>
                                                                {section.right.map((field, fieldIndex) => (
                                                                    <div key={field.id} style={{ padding: '5px 0', minHeight: '50px' }}>
                                                                        <Form
                                                                            form={form}
                                                                            name="Form"
                                                                            initialValues={(field.field_type == "date" || field.field_type == "date_time" ? { [field.api_name]: dayjs(field.field_value) } : { [field.api_name]: field.field_value })}
                                                                            labelCol={{
                                                                                flex: '200px',
                                                                            }}
                                                                            labelWrap
                                                                            wrapperCol={{
                                                                                flex: 1,
                                                                            }}
                                                                            colon={false}
                                                                            layout="horizontal"
                                                                            onFinish={handleSave}
                                                                        >
                                                                            <Row>
                                                                                {/* <Col span={(moduleName == "functions" ? 0 : 10)} style={{ textAlign: 'right', paddingRight: '10px' }}>
                                                                                    <Text style={{ fontSize: '16px', color: '#838da1' }}>{field.name}</Text>
                                                                                </Col> */}
                                                                                <Col span={(moduleName == "functions" ? 22 : 22)} offset={(moduleName == "functions" ? 1 : 2)}>
                                                                                    {renderField(field, fieldIndex, (newValue) => handleFieldChange(sectionIndex, fieldIndex, newValue, field.api_name, 'right'), (newValue) => handleFieldChangeRelatedModule(sectionIndex, fieldIndex, newValue, field.api_name, 'right'))}
                                                                                </Col>
                                                                            </Row>
                                                                        </Form>
                                                                    </div>
                                                                ))}
                                                            </Col>
                                                        </Row>
                                                </Col>
                                            ))}
                                        </Row>
                                        {moduleName === 'profiles' && (
                                            <div style={{ marginTop: '20px' }}>
                                                <PermissionsPage />
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            </Layout>
                        </Content>
                        {relatedList && relatedList.map((item, index) => (
                            <RelatedList key={index} related_module={item.module_name} related_id={record_id} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};



export default DetailView;
        // return (
        //     <div>
        //         {data && (
        //             <div style={{ overflowY: 'auto' }}>
        //                 <div>
        //                     <Layout
        //                         style={{
        //                             background: colorBgContainer
        //                         }}
        //                     >
        //                         <Row style={{ alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
        //                             <Col>
        //                                 <Title
        //                                     style={{ paddingLeft: '30px', fontSize: '22px' }}
        //                                 >
        //                                     {data[0].field_value}
        //                                 </Title>
        //                             </Col>
        //                             <Col style={{ margin: '0 15px 0 0' }}>
        //                                 <Button icon={<LeftOutlined />} style={{ margin: '0 15px' }} href={`/${org}/${moduleName}`}>Voltar</Button>
        //                                 <Can I='update' a={moduleName} ability={ability}>
        //                                     <Button href={`/${org}/${moduleName}/${record_id}/edit`}>Editar</Button>
        //                                 </Can>
        //                                 <Can I='delete' a={moduleName} ability={ability}>
        //                                     <Popconfirm
        //                                         title="Excluir"
        //                                         description="Deseja excluir este(s) registro(s)?"
        //                                         onConfirm={() => confirm()}
        //                                         okText="Sim"
        //                                         cancelText="Cancelar"
        //                                     >
        //                                         <Button style={{ margin: '0 15px' }} danger>Excluir</Button>
        //                                     </Popconfirm>
        //                                 </Can>
        //                             </Col>
        //                         </Row>
        //                     </Layout>
        //                 </div>
        //                 <div style={{ padding: '15px 0' }}>
        //                     <Content className='content'>

        //                         <Layout
        //                             style={{
        //                                 background: colorBgContainer,
        //                                 borderRadius: borderRadiusLG,
        //                                 minHeight: (relatedList.length === 0 ? 'calc(100vh - 161px)' : ''),
        //                                 padding: '20px'
        //                             }}
        //                         >
        //                             {(() => {
        //                                 if (moduleName == 'users') {
        //                                     return (
        //                                         <Text style={{ padding: '0px 25px 10px', fontSize: '18px' }}>Usuário Informações</Text>
        //                                     )
        //                                 } else if (moduleName == 'profiles') {
        //                                     return (
        //                                         <Text style={{ padding: '0px 25px 10px', fontSize: '18px' }}>Perfil Informações</Text>
        //                                     )
        //                                 } else if (moduleName == 'charts') {
        //                                     return (
        //                                         <Text style={{ padding: '0px 25px 10px', fontSize: '18px' }}>Gráfico Informações</Text>
        //                                     )
        //                                 } else {
        //                                     return (
        //                                         <Text style={{ padding: '0px 25px 10px', fontSize: '18px' }}>{toSingular(moduleName)} Informações</Text>
        //                                     )
        //                                 }
        //                             })()}

        //                             <Row>
        //                                 <Col span={24}>
        //                                     <Row gutter={16}>
        //                                         {data.map((fieldData, index) => (
        //                                             <Col key={index} span={(moduleName == "functions" ? 24 : 10)}>
        //                                                 <div style={{ padding: '5px 0', minHeight: '66px' }}>
        //                                                     <Row>
        //                                                         <Col span={(moduleName == "functions" ? 3 : 10)} style={{ textAlign: 'right', paddingRight: '10px' }}>
        //                                                             <Text style={{ fontSize: '16px', color: '#838da1' }}>
        //                                                                 {/* {JSON.stringify(fieldData)} */}
        //                                                                 {fieldData.name}
        //                                                             </Text>
        //                                                         </Col>
        //                                                         <Col span={(moduleName == "functions" ? 19 : 14)}>
        //                                                             {(() => {
        //                                                                 if (fieldData.related_module != null) {
        //                                                                     return (
        //                                                                         <Select
        //                                                                             showSearch
        //                                                                             optionFilterProp="children"
        //                                                                             filterOption={(input, option) =>
        //                                                                                 option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        //                                                                             }
        //                                                                             style={{ width: "100%", border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
        //                                                                             onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
        //                                                                             // value={selectedValue ? selectedValue.value : null}
        //                                                                             defaultValue={fieldData.field_value}
        //                                                                             placeholder="Selecione"
        //                                                                             // onChange={(open, key) => handleFieldChangeRelatedModule(open, key)}
        //                                                                             // loading={loading}
        //                                                                             onDropdownVisibleChange={(open) => fetchRelatedModule(open, fieldData.related_module, fieldData.api_name)}
        //                                                                             onSelect={(key, value) => handleFieldChangeRelatedModule(index, key, value)}
        //                                                                             dropdownRender={(menu) => (
        //                                                                                 <div>
        //                                                                                     {menu}
        //                                                                                     <div style={{ textAlign: "center", padding: "10px", cursor: "pointer" }}>
        //                                                                                         <a href={`/${org}/${fieldData.related_module}/${fieldData.related_id}`} rel="noopener noreferrer">
        //                                                                                             {(fieldData.field_value ? `Ir para ${fieldData.field_value}` : '')}
        //                                                                                         </a>
        //                                                                                     </div>
        //                                                                                 </div>
        //                                                                             )}
        //                                                                         >
        //                                                                             <Option value=''>-Nenhum-</Option>
        //                                                                             {relatedModuleData.map(item => (
        //                                                                                 <Option key={item.related_id} value={item.field_value}>
        //                                                                                     {item.field_value}
        //                                                                                 </Option>
        //                                                                             ))}
        //                                                                         </Select>
        //                                                                     );
        //                                                                 } else if (fieldData.field_type == "select") {
        //                                                                     return (
        //                                                                         <Select
        //                                                                             showSearch
        //                                                                             optionFilterProp="children"
        //                                                                             filterOption={(input, option) =>
        //                                                                                 option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        //                                                                             }
        //                                                                             style={{ width: "100%", border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
        //                                                                             onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
        //                                                                             // value={selectedValue ? selectedValue.value : null}
        //                                                                             defaultValue={fieldData.field_value}
        //                                                                             placeholder="Selecione"
        //                                                                             // onChange={(open, key) => handleFieldChangeRelatedModule(open, key)}
        //                                                                             // loading={loading}
        //                                                                             onDropdownVisibleChange={(open) => fetchOptions(open, fieldData.module, fieldData.api_name)}
        //                                                                             onSelect={(newValue) => handleFieldChange(index, newValue)}
        //                                                                         >
        //                                                                             <Option value=''>-Nenhum-</Option>
        //                                                                             {options.map(item => (
        //                                                                                 <Option key={item.id} value={item.name}>
        //                                                                                     {item.name}
        //                                                                                 </Option>
        //                                                                             ))}
        //                                                                         </Select>
        //                                                                     );
        //                                                                 } else if (fieldData.field_type == "date") {
        //                                                                     return (
        //                                                                         <DatePicker
        //                                                                             style={{ height: '100%', width: "100%", border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
        //                                                                             onMouseEnter={(e) => { e.target.style.borderColor = '#ccc'; }}
        //                                                                             onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
        //                                                                             onChange={(value) => handleFieldChange(index, value)}
        //                                                                             value={fieldData.field_value ? dayjs(fieldData.field_value) : null}
        //                                                                             placeholder="Selecione uma data"
        //                                                                             format="DD/MM/YYYY"
        //                                                                         />
        //                                                                     );
        //                                                                 } else if (fieldData.field_type == "multi_line") {
        //                                                                     return (
        //                                                                         <TextArea
        //                                                                             style={{ border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
        //                                                                             onFocus={(e) => { e.target.style.overflowY = 'auto'; }}
        //                                                                             onBlur={(e) => handleFieldChange(index, e.target.value)}
        //                                                                             onMouseEnter={(e) => { e.target.style.borderColor = '#ccc'; }}
        //                                                                             onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
        //                                                                             rows={4}
        //                                                                             defaultValue={fieldData.field_value}
        //                                                                             onChange={(newValue) => handleFieldChange(index, newValue)}
        //                                                                             maxLength={16000}
        //                                                                         />

        //                                                                     )
        //                                                                 } else if (fieldData.field_type == "checkbox" && fieldData.module == "users" && fieldData.api_name == "notification") {
        //                                                                     return (
        //                                                                         <Checkbox
        //                                                                             defaultChecked={fieldData.field_value == 1 ? true : false}
        //                                                                             // onChange={(e) => handleFieldChange(index, e.target.checked)}
        //                                                                             disabled
        //                                                                         >teste
        //                                                                         </Checkbox>
        //                                                                     )
        //                                                                 } else if (fieldData.field_type == "checkbox") {
        //                                                                     return (
        //                                                                         <Checkbox
        //                                                                             defaultChecked={fieldData.field_value == 1 ? true : false}
        //                                                                             onChange={(e) => handleFieldChange(index, e.target.checked)}
        //                                                                         >
        //                                                                         </Checkbox>
        //                                                                     )
        //                                                                 } else if (fieldData.field_type == "number") {
        //                                                                     return (
        //                                                                         // <InputNumber
        //                                                                         //     style={{ width: "100%" }}
        //                                                                         //     changeOnWheel
        //                                                                         //     defaultValue={fieldData.field_value}
        //                                                                         //     onChange={(e) => handleFieldChange(index, e)}
        //                                                                         // />
        //                                                                         <EditableCell
        //                                                                             value={fieldData.field_value}
        //                                                                             onChange={(newValue) => handleFieldChange(index, newValue)}
        //                                                                             type={'number'}
        //                                                                         />
        //                                                                     )
        //                                                                 } else if (fieldData.field_type == "currency") {
        //                                                                     return (
        //                                                                         <InputNumber
        //                                                                             style={{ width: "100%" }}
        //                                                                             prefix="R$"
        //                                                                             formatter={(val) => {
        //                                                                                 if (!val) return;
        //                                                                                 return `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".").replace(/\.(?=\d{0,2}$)/g, ",")
        //                                                                             }}
        //                                                                             parser={(val) => {
        //                                                                                 if (!val) return;
        //                                                                                 return Number.parseFloat(val.replace(/\$\s?|(\.*)/g, "").replace(/(\,{1})/g, ".")).toFixed(2)
        //                                                                             }}
        //                                                                             changeOnWheel
        //                                                                             defaultValue={fieldData.field_value}
        //                                                                             onChange={(e) => handleFieldChange(index, e)}
        //                                                                         />
        //                                                                     )
        //                                                                 } else if (fieldData.field_type == "function") {
        //                                                                     return (
        //                                                                         <CodeEditor
        //                                                                             height={'45vh'} 
        //                                                                             language={'javascript'} 
        //                                                                             value={fieldData.field_value} 
        //                                                                             theme={'vs-dark'}
        //                                                                             readOnly={true}
        //                                                                         />
        //                                                                     )
        //                                                                 } else {
        //                                                                     return (
        //                                                                         <EditableCell
        //                                                                             value={fieldData.field_value}
        //                                                                             onChange={(newValue) => handleFieldChange(index, newValue)}
        //                                                                             type={typeof fieldData.field_value === 'number' ? 'number' : 'text'}
        //                                                                         />
        //                                                                     );
        //                                                                 }
        //                                                             })()}
        //                                                         </Col>
        //                                                     </Row>
        //                                                 </div>
        //                                             </Col>
        //                                         ))}
        //                                     </Row>
        //                                     {moduleName === 'profiles' && (
        //                                         <div style={{ marginTop: '20px' }}>
        //                                             <PermissionsPage />
        //                                         </div>
        //                                     )}
        //                                 </Col>
        //                             </Row>
        //                         </Layout>

        //                     </Content>
        //                     {(console.log("relatedList", relatedList))}
        //                     {Array.isArray(relatedList) && relatedList.map((item, index) => (
        //                         <RelatedList key={index} related_module={item.module_name} related_id={record_id} />
        //                     ))}
        //                 </div>
        //             </div>
        //         )}
        //     </div>
        // );

//     };

// export default DetailView;
