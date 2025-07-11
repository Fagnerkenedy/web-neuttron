import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import axios from "axios"
import '../styles.css'
import { Input, InputNumber, Button, Layout, Col, Form, theme, Row, Typography, message, Popconfirm, Select, DatePicker, Checkbox, Upload, Modal, notification, Table, Grid, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Content } from 'antd/es/layout/layout';
import apiURI from '../../../Utility/recordApiURI.js';
import CodeEditor from '../functionEditor/index.jsx';
import locale from 'antd/es/date-picker/locale/pt_BR'
import { fetchModules } from '../selection/fetchModules.js';
import dayjs from 'dayjs';
import userApiURI from '../../../Utility/userApiURI.js';
const { useBreakpoint } = Grid;

const { TextArea } = Input;
const { deleteRecord } = apiURI;
import pluralize from 'pluralize';

const CreateView = ({ itemId }) => {
    const { Option } = Select;
    const { Title, Text } = Typography;
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1];
    const moduleName = pathParts[2];
    const record_id = pathParts[3];
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
    const [relatedFieldData, setRelatedFieldData] = useState([]);
    const [relatedFieldData1, setRelatedFieldData1] = useState([]);
    const [relatedFieldData2, setRelatedFieldData2] = useState([]);
    const [options, setOptions] = useState([]);
    const [sections, setSections] = useState([])
    const [activeModule, setActiveModule] = useState("");
    const { darkMode } = useOutletContext();
    const [form] = Form.useForm();
    const [relatedFields, setRelatedFields] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [quickCreate, setOpenQuickCreate] = useState(false);
    const [selectedRelatedModule, setSelectedRelatedModule] = useState('')
    const [dataSource, setDataSource] = useState([]);
    const localUser = localStorage.getItem('user')
    const user = JSON.parse(localUser)
    const screens = useBreakpoint();

    const linkApi = import.meta.env.VITE_LINK_API;
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
                if (field.related_module != null && field.field_value != "") {

                    const response = await axios.get(`${linkApi}/crm/${org}/${field.related_module}/relatedDataById/${record_id}`, config);
                    return {
                        api_name: field.api_name,
                        related_id: response.data.row[0].related_id
                    };
                }
            })

            const relatedModuleResponses = await Promise.all(relatedModulePromises)
            const updatedCombinedData = combinedData.map(field => {
                if (field.related_module != null) {
                    const relatedData = relatedModuleResponses.find(data => data && data.api_name === field.api_name)
                    if (relatedData) {
                        return {
                            ...field,
                            related_id: relatedData.related_id
                        };
                    } else {
                        return field
                    }
                } else {
                    return field
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
    //         setRelatedModuleData(response.data);
    //     }
    // }

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

    const fetchModulesData = async () => {
        const fetchedModules = await fetchModules(org);
        fetchedModules.result.forEach(module => {
            if (module.api_name == moduleName || module.name == moduleName) {
                setActiveModule(module.name)
            }
        });
    }

    useEffect(() => {
        fetchData();
        fetchModulesData();
    }, [itemId]);

    useEffect(() => {
        sections.forEach((section, sectionIndex) => {
            section.left.forEach((field, fieldIndex) => {
                if (
                    field.related_module != null &&
                    field.field_type === "loockup" &&
                    (field.api_name === "created_by" || field.api_name === "modified_by")
                ) {
                    handleRelatedModule1(sectionIndex, fieldIndex, user.name, field.api_name, 'left');
                }
            });
            section.right.forEach((field, fieldIndex) => {
                if (
                    field.related_module != null &&
                    field.field_type === "loockup" &&
                    (field.api_name === "created_by" || field.api_name === "modified_by")
                ) {
                    handleRelatedModule2(sectionIndex, fieldIndex, user.name, field.api_name, 'right');
                }
            });
        });
    }, [sections, user.name]);

    if (!data) {
        return //<div>Carregando...</div>;
    }

    const handleFieldChange = (sectionIndex, index, value, api_name, column) => {
        setDataSource((prevDataSource) =>
            prevDataSource.map((row, rowIndex) =>
                rowIndex === index
                    ? {
                        ...row,
                        [api_name]: value, // Atualiza apenas o campo necessário
                    }
                    : row
            )
        );

        const updatedData = [...sections];
        updatedData[sectionIndex][column][index].field_value = value;

        setSections(updatedData)
    };

    // const handleFieldChangeRelatedModule = async (index, id, newValue) => {
    const handleRelatedModule1 = (sectionIndex, index, value, api_name, column) => {
        try {
            let updatedData = [...sections];
            updatedData[sectionIndex][column][index].field_value = value.value
            const fieldToUpdate1 = updatedData[sectionIndex][column][index]

            const fieldToUpdate5 = {
                index: index,
                related_module: fieldToUpdate1.related_module,
                related_id: value.key || user.id,
                module_id: null,
                id: fieldToUpdate1.id,
                api_name: fieldToUpdate1.api_name,
                name: fieldToUpdate1.field_value,
                field_value: value.value || user.name
            };

            const updatedRelatedFieldData = relatedFieldData ? [...relatedFieldData] : [];
            updatedRelatedFieldData.push(fieldToUpdate5);

            setRelatedFieldData1(updatedRelatedFieldData);
        } catch (error) {
            console.error("Erro ao atualizar os dados:", error);
        }
    };
    const handleRelatedModule2 = (sectionIndex, index, value, api_name, column) => {
        try {
            let updatedData = [...sections];
            updatedData[sectionIndex][column][index].field_value = value.value
            const fieldToUpdate1 = updatedData[sectionIndex][column][index]

            const fieldToUpdate5 = {
                index: index,
                related_module: fieldToUpdate1.related_module,
                related_id: value.key || user.id,
                module_id: null,
                id: fieldToUpdate1.id,
                api_name: fieldToUpdate1.api_name,
                name: fieldToUpdate1.field_value,
                field_value: value.value || user.name
            };

            const updatedRelatedFieldData = relatedFieldData1 ? [...relatedFieldData1] : [];
            updatedRelatedFieldData.push(fieldToUpdate5);

            setRelatedFieldData2(updatedRelatedFieldData);
        } catch (error) {
            console.error("Erro ao atualizar os dados:", error);
        }
    };

    const handleFieldChangeRelatedModule = (sectionIndex, index, value, api_name, column) => {
        try {
            let updatedData = [...sections];
            updatedData[sectionIndex][column][index].field_value = value.value
            const fieldToUpdate1 = updatedData[sectionIndex][column][index]

            const fieldToUpdate5 = {
                index: index,
                related_module: fieldToUpdate1.related_module,
                related_id: value.key || user.id,
                module_id: null,
                id: fieldToUpdate1.id,
                api_name: fieldToUpdate1.api_name,
                name: fieldToUpdate1.field_value,
                field_value: value.value || user.name
            };

            const updatedRelatedFieldData = relatedFieldData ? [...relatedFieldData] : [];
            updatedRelatedFieldData.push(fieldToUpdate5);


            setRelatedFieldData(updatedRelatedFieldData);

            //await axios.put(`${linkApi}/crm/${org}/${moduleName}/relatedField`, fieldToUpdate5, config);
        } catch (error) {
            console.error("Erro ao atualizar os dados:", error);
        }
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

    const handleSave = async () => {
        try {
            let fieldToUpdate3 = {}
            if (sections) {
                const records = relatedFieldData.filter(record => !!record);


                fieldToUpdate3['related_record'] = records.reduce((acc, record) => {
                    if (record != null) {
                        acc[record.api_name] = {
                            name: record.name,
                            id: record.related_id,
                            module: record.related_module
                        }
                    }
                    return acc;
                }, {});


                let toUpdate = []
                sections.forEach(section => {
                    toUpdate = [
                        ...toUpdate,
                        ...section.left,
                        ...section.right
                    ]
                });

                toUpdate.map(field => {
                    const { api_name, field_value } = field
                    fieldToUpdate3[api_name] = field_value
                });

                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }

                if (fieldToUpdate3.hasOwnProperty("created_by")) {
                    fieldToUpdate3['related_record'].created_by = {
                        name: user.name,
                        id: user.id,
                        module: 'users'
                    };
                    fieldToUpdate3['related_record'].modified_by = {
                        name: user.name,
                        id: user.id,
                        module: 'users'
                    };
                    fieldToUpdate3['created_by'] = user.name
                    fieldToUpdate3['modified_by'] = user.name
                    fieldToUpdate3['created_time'] = dayjs()
                    fieldToUpdate3['modified_time'] = dayjs()
                }

                if (moduleName == "users" && fieldToUpdate3.hasOwnProperty("email")) {
                    const emailCheck = await userApiURI.checkEmail(fieldToUpdate3.email);
                    if (emailCheck.status === 200 && emailCheck.data.success === false) {
                        showNotification(
                            '',
                            <>
                                {moduleName == "users" && (<Text>O E-mail informado já está cadastrado no sistema.{' '}</Text>)}
                            </>,
                            'bottom',
                            'warning',
                            10,
                            600,
                            true
                        )
                        return
                    } else if (emailCheck.status === 400) {
                        showNotification(
                            '',
                            <>
                                {moduleName == "users" && (<Text>OPS! Houve um erro ao cadastrar. Entre em contato com o suporte.{' '}</Text>)}
                            </>,
                            'bottom',
                            'error',
                            10,
                            600,
                            true
                        )
                        return
                    }
                    const usedUsersAPI = await userApiURI.checkUsedUsers(org)
                    const usedUsers = usedUsersAPI.data.subscriptions[0] || {}
                    if (usedUsers.users <= usedUsers.active_users) {
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
                        return
                    }
                }

                const create = await axios.post(`${linkApi}/crm/${org}/${moduleName}/record`, fieldToUpdate3, config);
                const record_id = create.data.record_id

                const updatedRelatedFieldData = [...records, ...relatedFieldData1, ...relatedFieldData2].map((item) => {
                    return {
                        ...item,
                        module_id: record_id,
                    };
                });

                // const newRelatedFieldDataa = relatedFieldData1.map((item) => {
                //     return {
                //         ...item,
                //         module_id: record_id,
                //     };
                // })
                // const newRelatedFieldDatab = newRelatedFieldDataa.map((item) => {
                //     return {
                //         ...item,
                //         module_id: record_id,
                //     };
                // })
                // const newRelatedFieldData = newRelatedFieldDatab.map((item) => {
                //     return {
                //         ...item,
                //         module_id: record_id,
                //     };
                // })

                const promises = updatedRelatedFieldData.map(async item => {
                    await axios.put(`${linkApi}/crm/${org}/${moduleName}/field`, { related_id: item.related_id, id: item.id, api_name: item.api_name }, config);
                    return axios.put(`${linkApi}/crm/${org}/${moduleName}/relatedField`, item, config);
                });
                const results = await Promise.all(promises);

                message.success('Registro Criado!');
                navigate(`/${org}/${moduleName}/${record_id}`)
            }

        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    const extractNumbers = (inputString) => {
        const numbers = inputString.match(/\d+/g);
        return numbers ? numbers.join('') : '';
    }

    const fetchRelatedFields = async (open, relatedModuleName, api_name) => {
        if (open) {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const response = await axios.get(`${linkApi}/crm/${org}/${relatedModuleName}/fields`, config);
            const matchingResponse = response.data
                .filter(item => {
                    if (moduleName == "kanban") {
                        return item.field_type === "select"
                    } else {
                        return true
                    }
                })
                .map(item => {
                    return {
                        field_value: item.name,
                        api_name: item.api_name
                    };
                });
            setRelatedFields(matchingResponse);
        }
    }

    const handleQuickCreate = (related_module) => {
        setSelectedRelatedModule(related_module)
        setOpenQuickCreate(true)
    }




    const renderField = (fieldData, index, onChange, onChangeRelatedModule, source) => {
        if (fieldData.related_module != null && fieldData.field_type == "loockup") {
            return (
                <div>
                    <Modal
                        title={`Criar ${toSingular(selectedRelatedModule)}`}
                        visible={quickCreate}
                        // onOk={handleOk}
                        onCancel={() => setOpenQuickCreate(false)}
                    />
                    <Form.Item
                        label={source == "subform" ? '' : <span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                        name={source == "subform" ? `${fieldData.api_name}_${index}` : fieldData.api_name}
                        rules={[
                            {
                                required: fieldData.required,
                                message: 'Este campo é obrigatório',
                            },
                        ]}
                    >
                        <Select
                            disabled={fieldData.disabled}
                            allowClear
                            showSearch
                            variant="filled"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            placeholder="Selecione"
                            style={{ width: "100%", border: '1px solid transparent', transition: 'border-color 0.3s' }}
                            // onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
                            // value={selectedValue ? selectedValue.value : null}
                            defaultValue={fieldData.field_value}
                            // placeholder="Selecione"
                            // onChange={(open, key) => handleFieldChangeRelatedModule(open, key)}
                            onChange={(key, value) => {
                                onChangeRelatedModule(value)
                                setSelectedModule(value.value)
                                if (moduleName == "kanban") {
                                    form.setFieldsValue({ field: "" })
                                } else if (moduleName == "charts") {
                                    form.setFieldsValue({ xField_layout: "", yField: "" })
                                }
                            }}
                            // loading={loading}
                            onDropdownVisibleChange={(open) => fetchRelatedModule(open, fieldData.related_module, fieldData.search_field)}
                            // onSelect={(key, value) => handleFieldChangeRelatedModule(index, key, value)}
                            dropdownRender={(menu) => (
                                <div>
                                    {menu}
                                    <div style={{ textAlign: "center", padding: "10px", cursor: "pointer" }}>
                                        <Button type='link' onClick={() => handleQuickCreate(fieldData.related_module)}>
                                            {`Criar ${toSingular(fieldData.related_module)}`}
                                        </Button>
                                    </div>

                                </div>
                            )}
                        >
                            {relatedModuleData.map(item => (
                                <Option key={item.related_id} value={item.field_value}>
                                    {item.field_value}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>
            );
        } else if (fieldData.field_type == "loockup_field") {
            return (
                <Form.Item
                    label={source == "subform" ? '' : <span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={source == "subform" ? `${fieldData.api_name}_${index}` : fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <Select
                        disabled={fieldData.disabled}
                        allowClear
                        showSearch
                        variant="filled"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        placeholder="Selecione"
                        style={{ width: "100%", border: '1px solid transparent', transition: 'border-color 0.3s' }}
                        // onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
                        // value={selectedValue ? selectedValue.value : null}
                        defaultValue={fieldData.field_value}
                        // placeholder="Selecione"
                        // onChange={(open, key) => handleFieldChangeRelatedModule(open, key)}
                        onChange={(key, value) => onChangeRelatedModule(value)}
                        // loading={loading}
                        onDropdownVisibleChange={(open) => {
                            if (selectedModule) {
                                fetchRelatedFields(open, selectedModule, fieldData.search_field)
                            }
                            // if (form.getFieldValue(`${fieldData.field_base}`) != null) {
                            //     fetchRelatedFields(open, form.getFieldValue(`${fieldData.field_base}`), fieldData.search_field)
                            // }
                        }}
                        // onSelect={(key, value) => handleFieldChangeRelatedModule(index, key, value)}
                        dropdownRender={(menu) => (
                            <div>
                                {menu}
                                {/* <div style={{ textAlign: "center", padding: "10px", cursor: "pointer" }}>
                                <a href={`/${org}/${fieldData.related_module}/${fieldData.field_value}`} rel="noopener noreferrer">
                                    {`Ir para ${fieldData.field_value}`}
                                </a>
                            </div> */}
                            </div>
                        )}
                    >
                        {relatedFields.map(item => (
                            <Option key={item.api_name} value={item.api_name}>
                                {item.field_value}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            );
        } else if (fieldData.field_type == "select") {
            return (
                <Form.Item
                    label={source == "subform" ? '' : <span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={source == "subform" ? `${fieldData.api_name}_${index}` : fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <Select
                        disabled={fieldData.disabled}
                        allowClear
                        showSearch
                        variant="filled"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        style={{ width: "100%", border: '1px solid transparent', transition: 'border-color 0.3s' }}
                        onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
                        // value={selectedValue ? selectedValue.value : null}
                        defaultValue={fieldData.field_value}
                        placeholder="Selecione"
                        onChange={(value) => onChange(value)}
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
                </Form.Item>
            );
        } else if (fieldData.field_type == "date") {
            return (
                <Form.Item
                    label={source == "subform" ? '' : <span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={source == "subform" ? `${fieldData.api_name}_${index}` : fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <DatePicker
                        disabled={fieldData.disabled}
                        locale={locale}
                        variant="filled"
                        onChange={(value) => onChange(value)}
                        format="DD/MM/YYYY"
                        placeholder="Selecione uma data"
                        style={{ width: "100%" }}
                    />
                </Form.Item>
            );
        } else if (fieldData.field_type === "date_time") {
            return (
                <Form.Item
                    label={source == "subform" ? '' : <span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={source == "subform" ? `${fieldData.api_name}_${index}` : fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <DatePicker
                        disabled={fieldData.disabled}
                        showTime
                        locale={locale}
                        variant="filled"
                        onChange={(value) => onChange(value)}
                        format="DD/MM/YYYY HH:mm:ss"
                        placeholder="Selecione uma data"
                        style={{ height: '100%', width: "100%" }}
                    />
                </Form.Item>
            );
        } else if (fieldData.field_type == "multi_line") {
            return (
                <Form.Item
                    label={source == "subform" ? '' : <span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={source == "subform" ? `${fieldData.api_name}_${index}` : fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <TextArea
                        disabled={fieldData.disabled}
                        allowClear
                        variant="filled"
                        onFocus={(e) => { e.target.style.overflowY = 'auto'; }}
                        onBlur={(e) => { e.target.style.overflowY = 'hidden'; e.target.scrollTop = 0; }}
                        rows={fieldData.visible_rows || 3}
                        defaultValue={fieldData.field_value}
                        onChange={(e) => onChange(e.target.value)}
                        maxLength={extractNumbers(fieldData.type)}
                    />
                </Form.Item>
            )
        } else if (fieldData.field_type == "checkbox") {
            return (
                <Form.Item
                    label={source == "subform" ? '' : <span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={source == "subform" ? `${fieldData.api_name}_${index}` : fieldData.api_name}
                    valuePropName="checked"
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <Checkbox
                        disabled={fieldData.disabled}
                        defaultChecked={fieldData.field_value == 1 ? true : false}
                        onChange={(e) => onChange(e.target.checked)}
                    />
                </Form.Item>
            )
        } else if (fieldData.field_type == "number") {
            return (
                <Form.Item
                    label={source == "subform" ? '' : <span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={source == "subform" ? `${fieldData.api_name}_${index}` : fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <InputNumber
                        disabled={fieldData.disabled}
                        variant="filled"
                        style={{ width: "100%" }}
                        changeOnWheel
                        defaultValue={fieldData.field_value}
                        onChange={(e) => onChange(e)}
                        maxLength={extractNumbers(fieldData.type)}
                    />
                </Form.Item>
            )
        } else if (fieldData.field_type == "currency") {
            return (
                <Form.Item
                    label={source == "subform" ? '' : <span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={source == "subform" ? `${fieldData.api_name}_${index}` : fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <InputNumber
                        disabled={fieldData.disabled}
                        variant="filled"
                        style={{ width: "100%" }}
                        prefix="R$"
                        formatter={(val) => {
                            if (!val) return;
                            return val.replace(/\B(?=(\d{3})+(?!\d))/g, ".").replace(/\.(?=\d{0,2}$)/g, ",");
                        }}
                        parser={(val) => {
                            if (!val) return;
                            return Number.parseFloat(val.replace(/\$\s?|(\.*)/g, "").replace(/(\,{1})/g, ".")).toFixed(2)
                        }}
                        changeOnWheel
                        defaultValue={fieldData.field_value}
                        onChange={(e) => onChange(e)}
                        maxLength={extractNumbers(fieldData.type)}
                    />
                </Form.Item>
            )
        } else if (fieldData.field_type == "email") {
            return (
                <Form.Item
                    label={source == "subform" ? '' : <span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={source == "subform" ? `${fieldData.api_name}_${index}` : fieldData.api_name}
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
                    <Input
                        disabled={fieldData.disabled}
                        allowClear
                        variant="filled"
                        placeholder="Insira um e-mail"
                        onChange={(e) => onChange(e.target.value)}
                        defaultValue={fieldData.field_value}
                        maxLength={extractNumbers(fieldData.type)}
                    />
                </Form.Item>
            )
        } else if (fieldData.field_type == "phone") {
            return (
                <Form.Item
                    label={source == "subform" ? '' : <span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={source == "subform" ? `${fieldData.api_name}_${index}` : fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <Input
                        disabled={fieldData.disabled}
                        allowClear
                        variant="filled"
                        addonBefore="+55"
                        onChange={(e) => onChange(e.target.value)}
                        defaultValue={fieldData.field_value}
                        maxLength={extractNumbers(fieldData.type)}
                    />
                </Form.Item>
            )
        } else if (fieldData.field_type == "file") {
            const props = {
                name: 'file',
                action: `${linkApi}/crm/${org}/${moduleName}/relatedField`,
                headers: {
                    authorization: 'authorization-text',
                },
                onChange(info) {
                    if (info.file.status !== 'uploading') {
                    }
                    if (info.file.status === 'done') {
                        message.success(`${info.file.name} file uploaded successfully`);
                    } else if (info.file.status === 'error') {
                        message.error(`${info.file.name} file upload failed.`);
                    }
                },
            };
            return (
                <Upload {...props}>
                    <Button style={{ width: "100%" }} icon={<UploadOutlined />}>Selecione o Arquivo</Button>
                </Upload>
            )
        } else if (fieldData.field_type === "function") {
            return (
                <CodeEditor
                    height={'50vh'}
                    language={'javascript'}
                    darkMode={darkMode}
                    handleFieldChange={(value) => onChange(value)}
                />
            );
        } else {
            return (
                <Form.Item
                    label={source == "subform" ? '' : <span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={source == "subform" ? `${fieldData.api_name}_${index}` : fieldData.api_name}
                    rules={[
                        {
                            required: fieldData.required,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <Input
                        disabled={fieldData.disabled}
                        allowClear
                        variant="filled"
                        value={editedFields[fieldData.field_name] || fieldData.field_value}
                        onChange={e => onChange(e.target.value)}
                        maxLength={extractNumbers(fieldData.type)}
                    />
                </Form.Item>
            );
        }
    }

    // Adicionar nova linha Subformulário
    const addRow = (section) => {
        const newRow = section.left.reduce(
            (acc, field) => ({
                ...acc,
                [field.api_name]: "",
            }),
            { key: dataSource.length + 1 } // Adicione um identificador único
        );
        setDataSource((prevDataSource) => [...prevDataSource, newRow]);
    };

    // Remover linha
    const removeRow = (index) => {
        const newData = [...dataSource];
        newData.splice(index, 1);
        setDataSource(newData);
        calculateTotals(newData);
    };

    // Atualizar valores
    const handleValueChange = (value, index, key) => {
        const newData = [...dataSource];
        newData[index][key] = value;
        setDataSource(newData);
        calculateTotals(newData);
    };

    // Calcular totais
    const calculateTotals = (data) => {
        const totalQty = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const subTotal = data.reduce(
            (sum, item) => sum + (item.quantity * item.price || 0),
            0
        );

        // setTotalValues({ totalQty, subTotal });
    };

    return (
        <div>
            <Form
                // name="Form"
                form={form}
                labelCol={
                    screens.xs
                        ? undefined
                        : { flex: '150px' }
                }
                labelAlign="right"
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
                {data && (
                    <div>
                        <div>
                            <Layout
                                style={{
                                    background: colorBgContainer,
                                    borderBottom: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid',
                                    position: 'fixed',
                                    zIndex: '900',
                                    width: '100%',
                                    padding: '0 0 0 10px',
                                }}
                            >
                                <Row style={{ alignItems: 'center', justifyContent: 'space-between', height: '40px' }}>
                                    <Col>
                                        <Title
                                            style={{ fontSize: '22px', margin: 0 }}
                                        >
                                            Criar {moduleName == "users" ? ("Usuário") :
                                                moduleName == "profiles" ? ("Perfil") :
                                                    moduleName == "functions" ? ("Função") :
                                                        moduleName == "charts" ? ("Gráfico") :
                                                            (toSingular(activeModule))}
                                        </Title>
                                    </Col>
                                    <Col>
                                    <Link to={`/${org}/${moduleName}`}>
                                        <Button>Cancelar</Button>
                                    </Link>
                                        <Button style={{ margin: '0 15px' }} type='primary' htmlType="submit">Salvar</Button>
                                    </Col>
                                </Row>
                            </Layout>
                            <Row style={{ height: '40px' }}></Row>
                        </div>
                        <div>
                            <Content style={{ overflow: 'hidden' }}>
                                <Layout
                                    style={{
                                        background: colorBgContainer,
                                        borderRadius: borderRadiusLG,
                                        minHeight: 'calc(100vh - 118px)',
                                        // border: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid'
                                    }}
                                >
                                    {/* <Text style={{ padding: '15px 25px', fontSize: '18px' }}>{toSingular(moduleName)} Informações</Text> */}
                                    <Row>
                                        <Col span={24}>
                                            <Row gutter={16} style={{ paddingTop: '15px', paddingLeft: '15px', paddingRight: '15px' }}>
                                                {sections.map((section, sectionIndex) => (
                                                    <Col key={sectionIndex} span={(moduleName == "functions" ? 24 : 24)}>
                                                        <Text style={{ padding: '0px 25px 10px', fontSize: '18px' }}>{section.name}</Text>
                                                        <Divider style={{ margin: '0px 0 10px 0' }} />
                                                        {section.field_type == "subform" && (
                                                            <Row gutter={16} style={{ paddingTop: '15px', paddingBottom: '25px' }}>
                                                                <Col span={(moduleName == "functions" ? 22 : 24)} offset={(moduleName == "functions" ? 1 : 1)}>
                                                                    <Table
                                                                        dataSource={dataSource}
                                                                        columns={[
                                                                            {
                                                                                title: "N.º",
                                                                                dataIndex: "key",
                                                                                width: 80,
                                                                                render: (_, __, index) => index + 1,
                                                                            },
                                                                            ...section.left.map((field, fieldIndex) => ({
                                                                                title: field.name,
                                                                                dataIndex: field.api_name,
                                                                                render: (text, record, rowIndex) => (
                                                                                    renderField(
                                                                                        field,
                                                                                        rowIndex,
                                                                                        (newValue) => handleFieldChange(sectionIndex, rowIndex, newValue, field.api_name, 'left'),
                                                                                        (newValue) => handleFieldChangeRelatedModule(sectionIndex, fieldIndex, newValue, field.api_name, 'left'),
                                                                                        "subform"
                                                                                    )
                                                                                ),
                                                                            })),
                                                                            {
                                                                                title: "Total (R$)",
                                                                                dataIndex: "total",
                                                                                width: 150,
                                                                                render: (_, record) => <span>{(record.quantidade * record.valor_unit_rio - record.desconto__r__ || 0).toFixed(2)}</span>,
                                                                            },
                                                                            {
                                                                                title: "Ações",
                                                                                dataIndex: "actions",
                                                                                width: 100,
                                                                                render: (_, __, index) => (
                                                                                    <Button danger onClick={() => removeRow(index)}>
                                                                                        Remover
                                                                                    </Button>
                                                                                ),
                                                                            },]}
                                                                        pagination={false}
                                                                        rowKey={(record, index) => index}
                                                                        summary={() => (
                                                                            <>
                                                                                <Table.Summary.Row>
                                                                                    <Table.Summary.Cell index={0} colSpan={2}>
                                                                                        Soma das Qtdes
                                                                                    </Table.Summary.Cell>
                                                                                    <Table.Summary.Cell index={1}>{10}</Table.Summary.Cell>
                                                                                </Table.Summary.Row>
                                                                                <Table.Summary.Row>
                                                                                    <Table.Summary.Cell index={2} colSpan={2}>
                                                                                        Sub-total (R$)
                                                                                    </Table.Summary.Cell>
                                                                                    <Table.Summary.Cell index={3}>{10}</Table.Summary.Cell>
                                                                                </Table.Summary.Row>
                                                                            </>
                                                                        )}
                                                                    />
                                                                    <Button type="dashed" onClick={() => addRow(section)} style={{ marginTop: 16 }}>
                                                                        + Adicionar linha
                                                                    </Button>
                                                                </Col>
                                                            </Row>
                                                        )}
                                                        {section.field_type != "subform" && (
                                                            <Row gutter={16} style={{ paddingTop: '15px' }}>
                                                                <Col span={(moduleName == "functions" ? 24 : 12)}>
                                                                    {section.left.map((field, fieldIndex) => (
                                                                        <div key={field.id} style={{ padding: '5px 0', minHeight: '66px' }}>
                                                                            <Row>
                                                                                {/* <Col span={(moduleName == "functions" ? 3 : 10)} style={{ textAlign: 'right', paddingRight: '10px' }}>
                                                                                <Text style={{ fontSize: '16px', color: '#838da1' }}>{field.name}</Text>
                                                                            </Col> */}
                                                                                <Col span={(moduleName == "functions" ? 22 : 24)} offset={(moduleName == "functions" ? 1 : 0)}>
                                                                                    {renderField(field, fieldIndex, (newValue) => handleFieldChange(sectionIndex, fieldIndex, newValue, field.api_name, 'left'), (newValue) => handleFieldChangeRelatedModule(sectionIndex, fieldIndex, newValue, field.api_name, 'left'))}
                                                                                </Col>
                                                                            </Row>
                                                                        </div>
                                                                    ))}
                                                                </Col>
                                                                <Col span={(moduleName == "functions" ? 24 : 12)}>
                                                                    {section.right.map((field, fieldIndex) => (
                                                                        <div key={field.id} style={{ padding: '5px 0', minHeight: '66px' }}>
                                                                            <Row>
                                                                                {/* <Col span={(moduleName == "functions" ? 0 : 10)} style={{ textAlign: 'right', paddingRight: '10px' }}>
                                                                                <Text style={{ fontSize: '16px', color: '#838da1' }}>{field.name}</Text>
                                                                            </Col> */}
                                                                                <Col span={(moduleName == "functions" ? 22 : 24)} offset={(moduleName == "functions" ? 1 : 0)}>
                                                                                    {renderField(field, fieldIndex, (newValue) => handleFieldChange(sectionIndex, fieldIndex, newValue, field.api_name, 'right'), (newValue) => handleFieldChangeRelatedModule(sectionIndex, fieldIndex, newValue, field.api_name, 'right'))}
                                                                                </Col>
                                                                            </Row>
                                                                        </div>
                                                                    ))}
                                                                </Col>

                                                            </Row>
                                                        )}
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
            </Form>

        </div>
    );

};

export default CreateView;