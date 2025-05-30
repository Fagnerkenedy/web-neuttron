import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios"
import '../styles.css'
import { Input, InputNumber, Button, Layout, Col, Form, theme, Row, Typography, message, Popconfirm, Select, DatePicker, Checkbox, Tag, Table, Grid, Divider } from 'antd';
import { Content } from 'antd/es/layout/layout';
import apiURI from '../../../Utility/recordApiURI.js';
import CodeEditor from '../functionEditor/index.jsx';
import locale from 'antd/es/date-picker/locale/pt_BR'
import { useOutletContext } from 'react-router-dom';
import { fetchModules } from '../selection/fetchModules.js';
import { CloseCircleFilled } from '@ant-design/icons';
const { TextArea } = Input;
import dayjs from 'dayjs';;
const { deleteRecord } = apiURI;
import pluralize from 'pluralize';
dayjs().format()
const { Option } = Select;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const EditView = ({ itemId }) => {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1];
    const moduleName = pathParts[2];
    const record_id = pathParts[3];
    const [relatedModuleData, setRelatedModuleData] = useState([]);
    let navigate = useNavigate()
    const [inputValue, setInputValue] = useState("")
    const [editedFields, setEditedFields] = useState({})
    const [relatedFieldData, setRelatedFieldData] = useState([]);
    const [combinedData, setCombinedData] = useState([]);
    const [options, setOptions] = useState([]);
    const [sections, setSections] = useState([])
    const [activeModule, setActiveModule] = useState("");
    const { darkMode } = useOutletContext();
    const [form] = Form.useForm();
    const [relatedFields, setRelatedFields] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [secondSelectValue, setSecondSelectValue] = useState('')
    const [dataSource, setDataSource] = useState([]);
    const screens = useBreakpoint();

    const localUser = localStorage.getItem('user')
    const user = JSON.parse(localUser)

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
    const [fieldToUpdate, setFieldsToUpdate] = useState([]);
    const [fieldsToUpdate, setAllFieldsToUpdate] = useState(null);
    const linkApi = import.meta.env.VITE_LINK_API;
    const handleInputChange = (newValue) => {
        setInputValue(newValue);
    };

    useEffect(() => {
        setSecondSelectValue('')
    }, [selectedModule]);

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
            console.log("combinedDatacombinedData: ", combinedData)
            setCombinedData(combinedData)
            const relatedModulePromises = combinedData.map(async field => {
                console.log("fields", field)
                if (field.related_module != null && field.field_value != "" && field.related_module != "fields") {
                    console.log("field.related_module", field)
                    setSelectedModule(field.field_value)
                    const response = await axios.get(`${linkApi}/crm/${org}/${field.related_module}/relatedDataById/${record_id}`, config);
                    console.log("response Batatinha", response.data)
                    if (response.data.row.length != 0) {
                        console.log("entrou?")
                        const fieldToUpdate5 = {
                            related_module: field.related_module,
                            related_id: field.related_id,
                            module_id: null,
                            id: field.id,
                            api_name: field.api_name,
                            name: field.field_value
                        };

                        const index = combinedData.findIndex(combinedDataField => combinedDataField.id === field.id);
                        console.log("Batatinha quando index", index)
                        console.log("Batatinha quando nasce", fieldToUpdate5)
                        console.log("Batatinha quando relatedFieldData", relatedFieldData)
                        let updatedRelatedFieldData = [...relatedFieldData];
                        updatedRelatedFieldData[index] = fieldToUpdate5
                        console.log("Batatinha quando updatedRelatedFieldData", updatedRelatedFieldData)
                        // setRelatedFieldData(updatedRelatedFieldData);
                        return {
                            name: field.field_value,
                            api_name: field.api_name,
                            related_id: response.data.row[0].related_id,
                            related_module: field.related_module,
                            module_id: null,
                            id: field.id
                        };

                    }

                }
            })
            const relatedModuleResponses = await Promise.all(relatedModulePromises)
            console.log("relatedModuleResponses", relatedModuleResponses)
            console.log("Batatinha quando relatedFieldData", relatedFieldData)
            setRelatedFieldData(relatedModuleResponses);

            const updatedCombinedData = combinedData.map(field => {
                if (field.related_module != null) {
                    console.log("field", field)
                    const relatedData = relatedModuleResponses.find(data => data && data.api_name === field.api_name)
                    console.log("relatedData", relatedData)
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
            console.log("updatedCombinedData", updatedCombinedData);

            // const formValues = combinedData.reduce((acc, field) => {
            //     acc[field.api_name] = field.field_value;
            //     return acc;
            // }, {});

            // console.log("values: ", formValues);  // Agora você verá os valores corretamente formatados

            // form.setFieldsValue(formValues);
            // console.log("form values: ", form.getFieldsValue())


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

            console.log("updatedCombinedData", updatedCombinedData)
            console.log("updatedSections", updatedSections)

            setSections(updatedSections)

            if (Array.isArray(updatedCombinedData)) {
                setData(updatedCombinedData);
            } else {
                setData([updatedCombinedData]);
            }
        } catch (error) {
            console.error("Erro ao buscar os dados:", error)
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
                console.log("ai ai api_name: ", search_field)
                console.log("ai ai response: ", response)
                const matchingResponse = response.data.map(item => {
                    return {
                        field_value: item[search_field],
                        related_id: item.id
                    };
                });
                console.log("ai ai: ", matchingResponse)
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
            console.log("etstetes", response)
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
        fetchModulesData()
    }, [itemId]);

    useEffect(() => {
        sections.forEach((section, sectionIndex) => {
            section.left.forEach((field, fieldIndex) => {
                if (
                    field.related_module != null &&
                    field.field_type === "loockup" &&
                    field.api_name === "modified_by"
                ) {
                    handleFieldChangeRelatedModule(sectionIndex, fieldIndex, user.name, field.api_name, 'left');
                }
            });
            section.right.forEach((field, fieldIndex) => {
                if (
                    field.related_module != null &&
                    field.field_type === "loockup" &&
                    field.api_name === "modified_by"
                ) {
                    handleFieldChangeRelatedModule(sectionIndex, fieldIndex, user.name, field.api_name, 'right');
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
        console.log("value checked?: ", value)
        const updatedData = [...sections];
        updatedData[sectionIndex][column][index].field_value = value;
        console.log("datas datas cadabra: ", updatedData)

        setSections(updatedData)

        // console.log("datas fieldToUpdate cadabra: ",fieldToUpdate)
        // setFieldsToUpdate(prevFields => {
        //     const updatedFields = [...prevFields];
        //     updatedFields[index] = updatedData[sectionIndex][column][index]
        //     return updatedFields
        // })

        // const updatedData = [...data];
        // updatedData[index].field_value = value;
        // console.log("tetertere", updatedData)
        // setFieldsToUpdate(updatedData);

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

    // const handleFieldChangeRelatedModule = async (index, id, newValue) => {
    const handleFieldChangeRelatedModule = (sectionIndex, index, value, api_name, column) => {
        try {
            // console.log("newValue:", newValue.key)
            let updatedData = [...sections];
            updatedData[sectionIndex][column][index].field_value = value.value
            const fieldToUpdate1 = updatedData[sectionIndex][column][index]
            console.log("related field update", fieldToUpdate1)

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

            const index2 = combinedData.findIndex(combinedDataField => combinedDataField.id === fieldToUpdate1.id);

            console.log("Batatinha quando nasce", fieldToUpdate5)
            console.log("Batatinha quando handleFieldChangeRelatedModule", relatedFieldData)
            const updatedRelatedFieldData = [...relatedFieldData];
            updatedRelatedFieldData[index2] = fieldToUpdate5
            console.log("Batatinha quando updatedRelatedFieldData updatedRelatedFieldData", updatedRelatedFieldData)
            setRelatedFieldData(updatedRelatedFieldData);

        } catch (error) {
            console.error("Erro ao atualizar os dados:", error);
        }
    };

    const handleSave = async () => {
        try {
            const fieldToUpdate3 = {};
            if (fieldToUpdate) {

                console.log("sections", sections)
                console.log("fieldToUpdatefieldToUpdate", fieldToUpdate)
                console.log("relatedFieldDatarelatedFieldData", relatedFieldData)
                const records = relatedFieldData.filter(record => !!record);
                console.log("records", records)

                fieldToUpdate3['related_record'] = records.reduce((acc, record) => {
                    console.log("record record: ", record)
                    if (record != null) {
                        acc[record.api_name] = {
                            name: record.name,
                            id: record.related_id,
                            module: record.related_module
                        }
                    }
                    return acc;
                }, {});
                console.log("fieldToUpdate array", fieldToUpdate3)

                let toUpdate = []
                sections.forEach(section => {
                    toUpdate = [
                        ...toUpdate,
                        ...section.left,
                        ...section.right
                    ]
                });
                console.log("toUpdate: ", toUpdate)

                toUpdate.map(field => {
                    const { api_name, field_value } = field;
                    fieldToUpdate3[api_name] = field_value;
                });
                console.log("hahahah", fieldToUpdate3)

                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }

                if (fieldToUpdate3.hasOwnProperty("modified_by")) {
                    fieldToUpdate3['related_record'].modified_by = {
                        name: user.name,
                        id: user.id,
                        module: 'users'
                    };
                    fieldToUpdate3['modified_by'] = user.name
                    fieldToUpdate3['modified_time'] = dayjs()
                }

                await axios.put(`${linkApi}/crm/${org}/${moduleName}/${record_id}`, fieldToUpdate3, config);
                console.log("RECORD ID:", record_id)
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
            navigate(`/${org}/${moduleName}/${record_id}`)

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
            console.log("o que retornou fields? ", response)
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
            console.log("bablasbk", matchingResponse)
            setRelatedFields(matchingResponse);
        }
    }

    const renderField = (fieldData, index, onChange, onChangeRelatedModule, source) => {
        console.log("abracadabra: ", fieldData)
        console.log("sections: ", sections)


        if (fieldData.related_module != null && fieldData.field_type == "loockup") {
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
                        // onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
                        // value={selectedValue ? selectedValue.value : null}
                        // defaultValue={fieldData.field_value}
                        placeholder="Selecione"
                        // onChange={(open, key) => handleFieldChangeRelatedModule(open, key)}
                        // onChange={(value) => onChange(value)}
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
                        disabled={(selectedModule == null && fieldData.field_value == "" ? true : fieldData.disabled)}
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
                        // defaultValue={fieldData.field_value}
                        // value={secondSelectValue}
                        // placeholder="Selecione"
                        // onChange={(open, key) => handleFieldChangeRelatedModule(open, key)}
                        onChange={(key, value) => onChangeRelatedModule(value)}
                        // loading={loading}
                        onDropdownVisibleChange={(open) => {
                            console.log("fieldData.field_base: ", selectedModule)
                            if (selectedModule) {
                                fetchRelatedFields(open, selectedModule, fieldData.search_field)
                            }
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
                        style={{ width: "100%" }}
                        // onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
                        // value={selectedValue ? selectedValue.value : null}
                        // defaultValue={fieldData.field_value}
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
                        // defaultValue={fieldData.field_value ? dayjs(fieldData.field_value) : null}
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                    />
                </Form.Item>
            );
        } else if (fieldData.field_type == "date_time") {
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
                        variant="filled"
                        locale={locale}
                        onChange={(value) => onChange(value)}
                        // defaultValue={fieldData.field_value ? dayjs(fieldData.field_value) : null}
                        format="DD/MM/YYYY HH:mm:ss"
                        style={{ width: "100%" }}
                    />
                </Form.Item>
            );
        } else if (fieldData.field_type == "multi_line") {
            console.log("entrou multiline: ", fieldData)
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
                        // defaultValue={fieldData.field_value}
                        onChange={(e) => onChange(e.target.value)}
                        // maxLength={16000}
                        maxLength={extractNumbers(fieldData.type)}
                    />
                </Form.Item>
            )
        } else if (fieldData.field_type == "checkbox" && moduleName == "users" && fieldData.field_value == true) {
            return (
                <Form.Item
                    label={source == "subform" ? '' : <span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={source == "subform" ? `${fieldData.api_name}_${index}` : fieldData.api_name}
                    valuePropName="checked"
                    rules={[
                        {
                            required: false,
                            message: 'Este campo é obrigatório',
                        },
                    ]}
                >
                    <Checkbox
                        disabled={true}
                        // defaultChecked={fieldData.field_value == 1 ? true : false}
                        onChange={(e) => onChange(e.target.checked)}
                    >
                    </Checkbox>
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
                        // defaultChecked={fieldData.field_value == 1 ? true : false}
                        onChange={(e) => onChange(e.target.checked)}
                    >
                    </Checkbox>
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
                        // defaultValue={fieldData.field_value}
                        onChange={(value) => onChange(value)}
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
                        // defaultValue={fieldData.field_value}
                        onChange={(value) => onChange(value)}
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
                        disabled={moduleName == "users" ? true : fieldData.disabled}
                        allowClear
                        variant="filled"
                        placeholder="Insira um e-mail"
                        onChange={(e) => onChange(e.target.value)}
                        // defaultValue={fieldData.field_value}
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
                        // defaultValue={fieldData.field_value}
                        maxLength={extractNumbers(fieldData.type)}
                    />
                </Form.Item>
            )
        } else if (fieldData.field_type == "function") {
            return (
                <CodeEditor
                    height={'50vh'}
                    language={'javascript'}
                    value={fieldData.field_value}
                    theme={darkMode ? 'vs-dark' : 'softContrast'}
                    handleFieldChange={(value) => onChange(value)}
                />
            )
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
                        // defaultValue={editedFields[fieldData.field_name] || fieldData.field_value}
                        onChange={e => onChange(e.target.value)}
                        maxLength={extractNumbers(fieldData.type)}
                    />
                </Form.Item>
            );
        }
    }

    // const customizeRequiredMark = (label, { required }) => (
    //     <>
    //       {required ? <Tag color="error">Required</Tag> : null}
    //       {label}
    //     </>
    // );

    // Adicionar nova linha Subformulário
    const addRow = (section) => {
        const newRow = section.left.reduce(
            (acc, field) => ({
                ...acc,
                [field.api_name]: "",
            }),
            { key: dataSource.length + 1 } // Adicione um identificador único
        );
        console.log("New Row: ", newRow)
        setDataSource((prevDataSource) => [...prevDataSource, newRow]);
        console.log("New Row dataSource: ", dataSource)
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
                initialValues={combinedData.reduce((acc, field) => {
                    if (field.field_type == 'date' || field.field_type == 'date_time') {
                        acc[field.api_name] = (field.field_value != "" ? dayjs(field.field_value) : "")
                    } else if (field.field_type == 'checkbox') {
                        acc[field.api_name] = field.field_value == 1 ? true : false
                    } else {
                        acc[field.api_name] = field.field_value
                    }
                    return acc;
                }, {})}
                labelCol={
                    screens.xs ? undefined
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
                // requiredMark={customizeRequiredMark}
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
                                            Editar {moduleName == "users" ? ("Usuário") :
                                                moduleName == "profiles" ? ("Perfil") :
                                                    moduleName == "functions" ? ("Função") :
                                                        moduleName == "charts" ? ("Gráfico") :
                                                            (toSingular(activeModule))}
                                        </Title>
                                    </Col>
                                    <Col>
                                        <Row>
                                            <Col>
                                                <Link to={`/${org}/${moduleName}/${record_id}`}>
                                                    <Button>Cancelar</Button>
                                                </Link>
                                                <Button style={{ margin: '0 15px' }} type='primary' htmlType="submit">Salvar</Button>
                                            </Col>
                                        </Row>
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
                                        // borderRadius: borderRadiusLG,
                                        minHeight: 'calc(100vh - 118px)',
                                        // border: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid'
                                    }}
                                >
                                    <Row>
                                        <Col span={24}>
                                            <Row gutter={16} style={{ paddingTop: '15px', paddingLeft: '15px', paddingRight: '15px' }}>
                                                {sections.map((section, sectionIndex) => (
                                                    <Col key={sectionIndex} span={(moduleName == "functions" ? 24 : 24)}>
                                                        <Text style={{ padding: '0px 25px 10px', fontSize: '18px' }}>{section.name}</Text>
                                                        <Divider style={{ margin: '0px 0 10px 0' }} />
                                                        {section.field_type == "subform" && (
                                                            <Row gutter={16} style={{ paddingTop: '15px', paddingBottom: '25px' }}>
                                                                <Col span={(moduleName == "functions" ? 22 : 22)} offset={(moduleName == "functions" ? 1 : 2)}>
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
                                                                        <div key={field.id} style={{ padding: '5px 0', minHeight: '50px' }}>
                                                                            <Row>
                                                                                {/* <Col span={(moduleName == "functions" ? 3 : 10)} style={{ textAlign: 'right', paddingRight: '10px' }}> */}
                                                                                {/* <Text style={{ fontSize: '16px', color: '#838da1' }}>{field.name}</Text> */}
                                                                                {/* </Col> */}
                                                                                <Col span={(moduleName == "functions" ? 22 : 24)} offset={(moduleName == "functions" ? 1 : 0)}>
                                                                                    {renderField(field, fieldIndex, (newValue) => handleFieldChange(sectionIndex, fieldIndex, newValue, field.api_name, 'left'), (newValue) => handleFieldChangeRelatedModule(sectionIndex, fieldIndex, newValue, field.api_name, 'left'))}
                                                                                </Col>
                                                                            </Row>
                                                                        </div>
                                                                    ))}
                                                                </Col>
                                                                <Col span={(moduleName == "functions" ? 24 : 12)}>
                                                                    {section.right.map((field, fieldIndex) => (
                                                                        <div key={field.id} style={{ padding: '5px 0', minHeight: '50px' }}>
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

export default EditView;