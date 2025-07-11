import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import axios from "axios"
import '../styles.css'
import { Input, InputNumber, Button, Layout, Col, Form, theme, Row, Typography, message, Popconfirm, Select, DatePicker, Checkbox, Tooltip, notification, Grid, Divider } from 'antd';
import EditableCell from './EditableCell.jsx';
import { Content } from 'antd/es/layout/layout';
import apiURI from '../../../Utility/recordApiURI.js';
import { BoxPlotOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import Paragraph from 'antd/es/typography/Paragraph.js';
import RelatedList from './RelatedList.jsx';
import PermissionsPage from './PermissionsPage.jsx';
import { Can } from "../../../contexts/AbilityContext.jsx";
import { useAbility } from '../../../contexts/AbilityContext.jsx'
import { fetchModules } from './fetchModules.js';
// import CodeEditor from '../functionEditor/index.js';
import locale from 'antd/es/date-picker/locale/pt_BR'
// import Link from 'antd/es/typography/Link.js';
import { Link } from 'react-router-dom'
import userApiURI from '../../../Utility/userApiURI.js';
const { TextArea } = Input;
import dayjs from 'dayjs';;
const { deleteRecord } = apiURI;
import pluralize from 'pluralize';

dayjs().format()

const { Option } = Select;
const { Title, Text } = Typography;


const DetailView = ({ itemId }) => {
    const [sections, setSections] = useState([])
    const { ability, loading } = useAbility();
    const [relatedModuleData, setRelatedModuleData] = useState([]);
    const [selectedValue, setSelectedValue] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const [relatedModule, setRelatedModule] = useState('');
    const [relatedList, setRelatedModuleList] = useState('');
    const [options, setOptions] = useState([]);
    const [relatedFieldData, setRelatedFieldData] = useState([]);
    const [openField, setOpenField] = useState(false)
    // const currentPath = window.location.pathname;
    // const pathParts = currentPath.split('/');
    // const org = pathParts[1];
    // const moduleName = pathParts[2];
    // const record_id = pathParts[3];
    const { org, module, recordId } = useParams();
    const moduleName = module
    const record_id = recordId
    const { darkMode } = useOutletContext();
    const [form] = Form.useForm();
    const [fieldToUpdate, setfieldToUpdate] = useState('');
    const [fieldToUpdate3, setFieldToUpdate3] = useState('');
    const [fieldToUpdate4, setFieldToUpdate4] = useState('');
    const [fieldToUpdate5, setFieldToUpdate5] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState('');
    const [activeModule, setActiveModule] = useState("");
    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();
    const isDesktop = screens.md

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
    const linkApi = import.meta.env.VITE_LINK_API;

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
                if (field.related_module != null && field.related_module != "fields") {
                    const response = await axios.get(`${linkApi}/crm/${org}/${field.related_module}/relatedDataById/${record_id}`, config);
                    
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
            // setSections(responseSections.data.sections);
            
            const responseSectionsFields = responseSections.data.sections
            // Atualizar os campos das seções com os valores dos campos em combinedData
            const updatedSections = responseSectionsFields.map(section => {
                // Atualizar campos à esquerda
                
                const updatedLeft = section.fields.left.map(item => {

                    const matchingField = updatedCombinedData.find(field => field.api_name === item.api_name);  
                    return {
                        ...item,
                        field_value: matchingField ? matchingField.field_value : item.field_value,
                        related_id: matchingField ? matchingField.related_id : null,
                    };
                });

                // Atualizar campos à direita
                const updatedRight = section.fields.right.map(item => {
                    const matchingField = updatedCombinedData.find(field => field.api_name === item.api_name);
                    return {
                        ...item,
                        field_value: matchingField ? matchingField.field_value : item.field_value,
                        related_id: matchingField ? matchingField.related_id : null,
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
                const matchingResponse = response.data.map(item => {
                    return {
                        field_value: item[search_field],
                        related_id: item.id
                    };
                });

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

    const hasRelatedModule = async () => {
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
        const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/relatedModuleList`, config);
        setRelatedModule(response.data)
    }

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
        hasRelatedModule()
        relatedModuleList();
        async function fetchModulesData() {
            const fetchedModules = await fetchModules(org);
            fetchedModules.result.forEach(module => {
                if (module.api_name == moduleName || module.name == moduleName) {
                    setActiveModule(module.name)
                }
            });
        }
        fetchModulesData();
    }, [itemId, record_id]);

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


            // const updatedData = [...sections];
            // updatedData[sectionIndex][column][index].field_value = value;

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

            const updatedData = [...sections];
            const fieldToUpdate = updatedData[sectionIndex][column][index]

            fieldToUpdate.field_value = value.value;
            fieldToUpdate.related_id = value.key;

            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/');
            const org = pathParts[1];
            const moduleName = pathParts[2];
            const record_id = pathParts[3];
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
        if (fieldData.related_module != null && fieldData.related_module != "modules" && fieldData.related_module != "fields") {
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
                        <Link style={{ color: '#1a73e8' }} to={`/${org}/${fieldData.related_module}/${fieldData.related_id}`}>{fieldData.field_value ? fieldData.field_value : "—"}</Link>
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
                    <Text>{fieldData.field_value ? fieldData.field_value : "—"}</Text>
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
            let dateTime
            if(fieldData.field_value) {
                const date = new Date(fieldData.field_value)
                dateTime = date.toLocaleString("pt-br").slice(0, 10)
            }
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
                    <Text>{dateTime ? dateTime : "—"}</Text>
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
            let dateTime
            if(fieldData.field_value) {
                const date = new Date(fieldData.field_value)
                dateTime = date.toLocaleString("pt-br").slice(0, 20).replace(',', '')
            }
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
                    <Text>{dateTime ? dateTime : "—"}</Text>
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
                    <Text>{fieldData.field_value ? fieldData.field_value : "—"}</Text>
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
                    <Text>{fieldData.field_value ? fieldData.field_value : "—"}</Text>
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
                    <Text>{fieldData.field_value ? fieldData.field_value : "—"}</Text>
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
                    <Text>{fieldData.field_value ? fieldData.field_value : "—"}</Text>
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
                    <Text>{fieldData.field_value ? `+55 ${fieldData.field_value}` : "—"}</Text>
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
                    defaultValue={fieldData.field_value ? fieldData.field_value : "—"}
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
                    <Text>{fieldData.field_value ? fieldData.field_value : "—"}</Text>
                </Form.Item>
            )
        }

        // } else {
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

    const showNotification = (message, description, placement, type, duration, width, pauseOnHover) => {
        if (!type) type = 'info';
        notification[type]({ // success, info, warning, error
            message: message,
            description: description,
            placement: placement, // topLeft, topRight, bottomLeft, bottomRight, top, bottom
            duration: duration, // 3 (segundos), null (caso não queira que suma sozinho)
            style: {
                width: width,
            },
            showProgress: true,
            pauseOnHover
        });
    };

    const handleAccess = async (e) => {
        if (!ability.can('access', moduleName)) {
            e.preventDefault(); // Evita a navegação
            showNotification(
                '',
                <>
                    {moduleName == "users" && (<Text>A criação de novos usuários não é suportada no seu plano. Faça o upgrade para o plano Profissional.{' '}</Text>)}
                    {moduleName == "profiles" && (<Text>A criação de novos perfis não é suportada no seu plano. Faça o upgrade para o plano Profissional.{' '}</Text>)}
                    {moduleName == "functions" && (<Text>A criação de novas funções não é suportada no seu plano. Faça o upgrade para o plano Profissional.{' '}</Text>)}
                    {moduleName == "charts" && (<Text>A criação de novos gráficos não é suportada no seu plano. Faça o upgrade para o plano Profissional.{' '}</Text>)}
                    {moduleName == "kanban" && (<Text>A criação de novos kanbans não é suportada no seu plano. Faça o upgrade para o plano Profissional.{' '}</Text>)}
                    <Link to={`/${org}/checkout`} rel="noopener noreferrer">Fazer Upgrade</Link>
                </>,
                'bottom',
                'warning',
                10,
                600,
                true
            )
        }
        if (moduleName == "users") {
            const usedUsersAPI = await userApiURI.checkUsedUsers(org)
            const usedUsers = usedUsersAPI.data.subscriptions[0] || {}
            if (usedUsers.users <= usedUsers.active_users) {
                e.preventDefault()
                showNotification(
                    '',
                    <>
                        {moduleName == "users" && (<Text>Você atingiu o limite de novos usuários para o plano contratado. Contrate novos usuários para continuar criando.{' '}</Text>)}
                        {/* <Link href={`/${org}/checkout`} rel="noopener noreferrer">Fazer Upgrade</Link> */}
                    </>,
                    'bottom',
                    'warning',
                    10,
                    600,
                    true
                )
            } else {
                navigate(`/${org}/${moduleName}/create`)
            }
        } else {
            navigate(`/${org}/${moduleName}/create`)
        }
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
                                width: '100%',
                                padding: '0 5px 0 5px',
                                borderBottom: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid'
                            }}
                        >
                            <Row style={{ alignItems: 'center', justifyContent: 'space-between', height: '40px', }}>
                                <Col xs={12} style={{ display: 'flex', alignItems: 'center', }}>
                                    <Link to={`/${org}/${moduleName}`}>
                                        <Tooltip placement="right" title="Fechar">
                                            <Button style={{ marginLeft: 5 }} type='text' icon={<CloseOutlined />}>
                                            </Button>
                                        </Tooltip>
                                    </Link>
                                    <Title
                                        style={{ fontSize: '22px', margin: '0', marginLeft: 5 }}
                                    >
                                        Detalhes
                                    </Title>
                                </Col>
                                <Col xs={12} style={{ textAlign: 'right' }}>
                                    <Can I='create' a={moduleName} ability={ability}>
                                        {/* <Tooltip title="Criar"> */}
                                        {isDesktop ? (
                                            <Button
                                                onClick={handleAccess}
                                                icon={<PlusOutlined />}
                                                type='primary'
                                            >
                                                {/* {moduleName == "users" ? ("Usuário") :
                                                moduleName == "profiles" ? ("Perfil") :
                                                    moduleName == "functions" ? ("Função") :
                                                        moduleName == "charts" ? ("Gráfico") :
                                                            (toSingular(activeModule))} */}
                                                Novo
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleAccess}
                                                icon={<PlusOutlined />}
                                                type='primary'
                                            ></Button>
                                        )}
                                        {/* </Tooltip> */}
                                    </Can>
                                    <Can I='update' a={moduleName} ability={ability}>
                                        {/* <Tooltip title="Editar"> */}
                                        {isDesktop ? (
                                            <Link to={`edit`}>
                                                <Button
                                                    style={{ marginLeft: '10px' }}
                                                    color="default"
                                                    icon={<EditOutlined />}
                                                // href={`/${org}/${moduleName}/${record_id}/edit`}
                                                >
                                                    Editar
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link to={`edit`}>
                                                <Button
                                                    style={{ marginLeft: '10px' }}
                                                    color="default"
                                                    icon={<EditOutlined />}
                                                >
                                                </Button>
                                            </Link>
                                        )}
                                        {/* </Tooltip> */}
                                    </Can>
                                    <Can I='delete' a={moduleName} ability={ability}>
                                        {/* <Tooltip title="Excluir"> */}
                                        <Popconfirm
                                            title="Excluir"
                                            description="Deseja excluir este(s) registro(s)?"
                                            onConfirm={() => confirm()}
                                            okText="Sim"
                                            cancelText="Cancelar"
                                        >
                                            {isDesktop ? (
                                                <Button style={{ margin: '0 10px' }} danger icon={<DeleteOutlined />}>
                                                    Excluir
                                                </Button>
                                            ) : (
                                                <Button style={{ margin: '0 10px' }} danger icon={<DeleteOutlined />}>
                                                </Button>
                                            )}
                                        </Popconfirm>
                                        {/* </Tooltip> */}
                                    </Can>
                                </Col>
                            </Row>
                        </Layout>
                        <Row style={{ height: '40px' }}></Row>
                    </div>
                    <div style={{ padding: '0px 0' }}>
                        <Content style={{ overflow: 'hidden' }}>
                            <Layout
                                style={{
                                    background: colorBgContainer,
                                    // borderRadius: borderRadiusLG,
                                    minHeight: (relatedList.length === 0 ? 'calc(100vh - 118px)' : 'calc(80vh - 205px)'),
                                    padding: '5px 20px 20px 20px',
                                    // border: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid'
                                }}
                            >
                                {/* <Text style={{ padding: '0px 25px 10px', fontSize: '18px' }}>{toSingular(moduleName)} Informações</Text> */}
                                <Row>
                                    <Col span={24}>
                                        <Row>
                                            <Col span={24} style={{ textAlign: 'right' }}>
                                                <Button icon={<EditOutlined />} type='text' onClick={() => navigate(`/${org}/settings/modules/${moduleName}`)}>Editar Layout</Button>
                                            </Col>
                                            {sections.map((section, sectionIndex) => (
                                                <Col key={sectionIndex} span={(moduleName == "functions" ? 24 : 24)}>
                                                    <Text style={{ padding: '0px 25px 10px', fontSize: '18px' }}>{section.name}</Text>
                                                    <Divider style={{ margin: '0px 0 10px 0' }} />
                                                    <Row gutter={16}>
                                                        <Col xs={12} sm={10} md={12} lg={12} xl={12} span={(moduleName == "functions" ? 24 : 12)}>
                                                            {section.left.map((field, fieldIndex) => (
                                                                <div key={field.id} style={{ padding: '5px 0', minHeight: '50px' }}>
                                                                    <Form
                                                                        form={form}
                                                                        name="Form"
                                                                        initialValues={(field.field_type == "date" || field.field_type == "date_time" ? { [field.api_name]: dayjs(field.field_value) } : { [field.api_name]: field.field_value })}
                                                                        labelCol={
                                                                            screens.xs
                                                                                ? undefined
                                                                                : { flex: '200px' }
                                                                        }
                                                                        labelWrap
                                                                        wrapperCol={
                                                                            screens.xs
                                                                                ? undefined
                                                                                : { flex: 1 }
                                                                        }
                                                                        colon={false}
                                                                        layout={screens.xs ? 'vertical' : 'horizontal'}
                                                                        onFinish={handleSave}
                                                                    >
                                                                        <Row>
                                                                            {/* <Col span={(moduleName == "functions" ? 3 : 10)} style={{ textAlign: 'right', paddingRight: '10px' }}>
                                                                              <Text style={{ fontSize: '16px', color: '#838da1' }}>{field.name}</Text>
                                                                            </Col> */}
                                                                            <Col span={(moduleName == "functions" ? 22 : 24)} offset={(moduleName == "functions" ? 1 : 0)}>
                                                                                {renderField(field, fieldIndex, (newValue) => handleFieldChange(sectionIndex, fieldIndex, newValue, field.api_name, 'left'), (newValue) => handleFieldChangeRelatedModule(sectionIndex, fieldIndex, newValue, field.api_name, 'left'))}
                                                                            </Col>
                                                                        </Row>
                                                                    </Form>
                                                                </div>
                                                            ))}
                                                        </Col>
                                                        <Col xs={12} sm={10} md={12} lg={12} xl={12} span={(moduleName == "functions" ? 24 : 12)}>
                                                            {section.right.map((field, fieldIndex) => (
                                                                <div key={field.id} style={{ padding: '5px 0', minHeight: '50px' }}>
                                                                    <Form
                                                                        form={form}
                                                                        name="Form"
                                                                        initialValues={(field.field_type == "date" || field.field_type == "date_time" ? { [field.api_name]: dayjs(field.field_value) } : { [field.api_name]: field.field_value })}
                                                                        labelCol={
                                                                            screens.xs
                                                                                ? undefined
                                                                                : { flex: '200px' }
                                                                        }
                                                                        labelWrap
                                                                        wrapperCol={
                                                                            screens.xs
                                                                                ? undefined
                                                                                : { flex: 1 }
                                                                        }
                                                                        colon={false}
                                                                        layout={screens.xs ? 'vertical' : 'horizontal'}
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
                        {relatedModule && (
                            <Col style={{ paddingBottom: '10px' }}>
                                {relatedModule.map((item, index) => (
                                    <RelatedList key={index} related_module={item.module_name} related_id={record_id} />
                                ))}
                            </Col>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailView;

{/* <Col span={24}>
    {Array.from({ length: Math.max(section.left.length, section.right.length) }).map((_, index) => {
        const leftField = section.left[index];
        const rightField = section.right[index];

        return (
            <Row key={index}>
                <Col xs={24} sm={10} md={12} lg={12} xl={12}>
                    {leftField && (
                        <Form
                            form={form}
                            name="LeftForm"
                            initialValues={
                                leftField.field_type === "date" || leftField.field_type === "date_time"
                                    ? { [leftField.api_name]: dayjs(leftField.field_value) }
                                    : { [leftField.api_name]: leftField.field_value }
                            }
                            // labelCol={{ flex: '100px' }}
                            // wrapperCol={{ flex: 1 }}
                            colon={false}
                            layout="horizontal"
                            onFinish={handleSave}
                        >
                            {renderField(
                                leftField,
                                index,
                                (newValue) =>
                                    handleFieldChange(sectionIndex, index, newValue, leftField.api_name, 'left'),
                                (newValue) =>
                                    handleFieldChangeRelatedModule(sectionIndex, index, newValue, leftField.api_name, 'left')
                            )}
                        </Form>
                    )}
                </Col>

                <Col xs={24} sm={10} md={12} lg={12} xl={12}>
                    {rightField && (
                        <Form
                            form={form}
                            name="RightForm"
                            initialValues={
                                rightField.field_type === "date" || rightField.field_type === "date_time"
                                    ? { [rightField.api_name]: dayjs(rightField.field_value) }
                                    : { [rightField.api_name]: rightField.field_value }
                            }
                            // labelCol={{ flex: '100px' }}
                            // wrapperCol={{ flex: 1 }}
                            colon={false}
                            layout="horizontal"
                            onFinish={handleSave}
                        >
                            {renderField(
                                rightField,
                                index,
                                (newValue) =>
                                    handleFieldChange(sectionIndex, index, newValue, rightField.api_name, 'right'),
                                (newValue) =>
                                    handleFieldChangeRelatedModule(sectionIndex, index, newValue, rightField.api_name, 'right')
                            )}
                        </Form>
                    )}
                </Col>
            </Row>
        );
    })}
</Col> */}

{/* <Col span={(moduleName == "functions" ? 24 : 12)}>
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
                    //<Col span={(moduleName == "functions" ? 3 : 10)} style={{ textAlign: 'right', paddingRight: '10px' }}>
                      //      <Text style={{ fontSize: '16px', color: '#838da1' }}>{field.name}</Text>
                        //</Col> 
                    <Col span={(moduleName == "functions" ? 22 : 22)} offset={(moduleName == "functions" ? 1 : 2)}>
                        {renderField(field, fieldIndex, (newValue) => handleFieldChange(sectionIndex, fieldIndex, newValue, field.api_name, 'left'), (newValue) => handleFieldChangeRelatedModule(sectionIndex, fieldIndex, newValue, field.api_name, 'left'))}
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
                    // <Col span={(moduleName == "functions" ? 0 : 10)} style={{ textAlign: 'right', paddingRight: '10px' }}>
                      //      <Text style={{ fontSize: '16px', color: '#838da1' }}>{field.name}</Text>
                        //</Col>
                    <Col span={(moduleName == "functions" ? 22 : 22)} offset={(moduleName == "functions" ? 1 : 2)}>
                        {renderField(field, fieldIndex, (newValue) => handleFieldChange(sectionIndex, fieldIndex, newValue, field.api_name, 'right'), (newValue) => handleFieldChangeRelatedModule(sectionIndex, fieldIndex, newValue, field.api_name, 'right'))}
                    </Col>
                </Row>
            </Form>
        </div>
    ))}
</Col> */}