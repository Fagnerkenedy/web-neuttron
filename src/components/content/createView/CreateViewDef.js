import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import '../styles.css'
import { Input, InputNumber, Button, Layout, Col, Form, theme, Row, Typography, message, Popconfirm, Select, DatePicker, Checkbox, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Content } from 'antd/es/layout/layout';
import apiURI from '../../../Utility/recordApiURI.js';
import CodeEditor from '../functionEditor/index.js';
import locale from 'antd/es/date-picker/locale/pt_BR'
import { useOutletContext } from 'react-router-dom';
import { fetchModules } from '../selection/fetchModules.js';

const { TextArea } = Input;
const { deleteRecord } = apiURI;
const pluralize = require('pluralize')

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
    const [options, setOptions] = useState([]);
    const [sections, setSections] = useState([])
    const [activeModule, setActiveModule] = useState("");
    const { darkMode } = useOutletContext();
    const [form] = Form.useForm();

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
                console.log("fields", field)
                if (field.related_module != null && field.field_value != "") {
                    console.log("field.related_module", field)

                    const response = await axios.get(`${linkApi}/crm/${org}/${field.related_module}/relatedDataById/${record_id}`, config);
                    console.log("response", response)
                    return {
                        api_name: field.api_name,
                        related_id: response.data.row[0].related_id
                    };
                }
            })

            const relatedModuleResponses = await Promise.all(relatedModulePromises)
            console.log("relatedModuleResponses", relatedModuleResponses)
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
                console.log("response", response)
                const matchingResponse = response.data.result.map(item => {
                    return {
                        field_value: item[search_field],
                        related_id: item.api_name
                    };
                });
                setRelatedModuleData(matchingResponse);
            } else {
                const response = await axios.get(`${linkApi}/crm/${org}/${relatedModuleName}`, config);
                console.log("response", response)
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
        fetchModulesData();
    }, [itemId]);

    if (!data) {
        return //<div>Carregando...</div>;
    }

    const handleFieldChange = (sectionIndex, index, value, api_name, column) => {

        console.log("value checked?: ", value)
        const updatedData = [...sections];
        updatedData[sectionIndex][column][index].field_value = value;
        console.log("datas datas cadabra: ", updatedData)

        setSections(updatedData)
    };

    // const handleFieldChangeRelatedModule = async (index, id, newValue) => {
    const handleFieldChangeRelatedModule = (sectionIndex, index, value, api_name, column) => {
        try {
            console.log("datadatadatadatadatadata:sectionIndex", sectionIndex)
            console.log("datadatadatadatadatadata:index", index)
            console.log("datadatadatadatadatadata:value", value)
            console.log("datadatadatadatadatadata:api_name", api_name)
            console.log("datadatadatadatadatadata:column", column)
            // console.log("datadatadatadatadatadata:id:", id)
            // console.log("datadatadatadatadatadata:newValue", newValue)
            let updatedData = [...sections];
            updatedData[sectionIndex][column][index].field_value = value.value
            const fieldToUpdate1 = updatedData[sectionIndex][column][index]
            console.log("related field update", fieldToUpdate1)

            const fieldToUpdate5 = {
                index: index,
                related_module: fieldToUpdate1.related_module,
                related_id: value.key,
                module_id: null,
                id: fieldToUpdate1.id,
                api_name: fieldToUpdate1.api_name,
                name: fieldToUpdate1.field_value,
                field_value: value.value
            };

            console.log("Batatinha quando nasce", fieldToUpdate5)
            console.log("Batatinha quando relatedFieldData", relatedFieldData)
            const updatedRelatedFieldData = relatedFieldData ? [...relatedFieldData] : [];
            updatedRelatedFieldData.push(fieldToUpdate5);

            console.log("Batatinha quando updatedRelatedFieldData", updatedRelatedFieldData)

            setRelatedFieldData(updatedRelatedFieldData);

            //await axios.put(`${linkApi}/crm/${org}/${moduleName}/relatedField`, fieldToUpdate5, config);
        } catch (error) {
            console.error("Erro ao atualizar os dados:", error);
        }
    };

    const handleSave = async () => {
        console.log("teresafwerasdfc")
        try {
            let fieldToUpdate3 = {}
            if (sections) {
                const records = relatedFieldData.filter(record => !!record);


                console.log("relatedFieldDatabatata", records)

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

                console.log("fieldToUpdate3: ", fieldToUpdate3)

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
                    const { api_name, field_value } = field
                    fieldToUpdate3[api_name] = field_value
                });

                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
                console.log("create: ", fieldToUpdate3)
                const create = await axios.post(`${linkApi}/crm/${org}/${moduleName}/record`, fieldToUpdate3, config);
                const record_id = create.data.record_id

                const newRelatedFieldData = records.map((item) => {
                    return {
                        ...item,
                        module_id: record_id
                    };
                })
                console.log("newRelatedFieldData: ", newRelatedFieldData)

                const promises = newRelatedFieldData.map(async item => {
                    console.log("item", item)
                    await axios.put(`${linkApi}/crm/${org}/${moduleName}/field`, { related_id: item.related_id, id: item.id, api_name: item.api_name }, config);
                    return axios.put(`${linkApi}/crm/${org}/${moduleName}/relatedField`, item, config);
                });
                const results = await Promise.all(promises);

                console.log("results Registro Criado", results);
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

    const renderField = (fieldData, index, onChange, onChangeRelatedModule) => {
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
                    <Select
                        disabled={fieldData.disabled}
                        allowClear
                        showSearch
                        variant="filled"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        placeholder="SelecioneSelecione"
                        style={{ width: "100%", border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
                        // onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
                        // value={selectedValue ? selectedValue.value : null}
                        defaultValue={fieldData.field_value}
                        // placeholder="Selecione"
                        // onChange={(open, key) => handleFieldChangeRelatedModule(open, key)}
                        onChange={(key, value) => onChangeRelatedModule(value)}
                        // loading={loading}
                        onDropdownVisibleChange={(open) => fetchRelatedModule(open, fieldData.related_module, fieldData.search_field)}
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
                    <Select
                        disabled={fieldData.disabled}
                        allowClear
                        showSearch
                        variant="filled"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        style={{ width: "100%", border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
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
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
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
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
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
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
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
                        rows={1}
                        defaultValue={fieldData.field_value}
                        onChange={(e) => onChange(e.target.value)}
                        maxLength={extractNumbers(fieldData.type)}
                    />
                </Form.Item>
            )
        } else if (fieldData.field_type == "checkbox") {
            return (
                <Form.Item
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
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
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
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
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
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
                    label={<span style={{ fontSize: '16px' }}>{fieldData.name}</span>}
                    name={fieldData.api_name}
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
                        console.log(info.file, info.fileList);
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
                    theme={'vs-dark'}
                    handleFieldChange={(value) => onChange(value)}
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

    return (
        <div>
            <Form
                name="Form"
                labelCol={{
                    flex: '200px',
                }}
                labelAlign="right"
                labelWrap
                wrapperCol={{
                    flex: 1,
                }}
                colon={false}
                layout="horizontal"
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
                                    width: '100%'
                                }}
                            >
                                <Row style={{ alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
                                    <Col>
                                        <Title
                                            style={{ paddingLeft: '30px', fontSize: '22px', margin: 0 }}
                                        >
                                            Criar {moduleName == "users" ? ("Usuário") :
                                                moduleName == "profiles" ? ("Perfil") :
                                                    moduleName == "functions" ? ("Função") :
                                                        moduleName == "charts" ? ("Painel") :
                                                            (toSingular(activeModule))}
                                        </Title>
                                    </Col>
                                    <Col style={{ margin: '0 15px 0 0' }}>
                                        <Button href={`/${org}/${moduleName}`}>Cancelar</Button>
                                        <Button style={{ margin: '0 15px' }} type='primary' htmlType="submit">Salvar</Button>
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
                                        minHeight: 'calc(100vh - 161px)',
                                        border: darkMode ? '#303030 1px solid' : '#d7e2ed 1px solid'
                                    }}
                                >
                                    {/* <Text style={{ padding: '15px 25px', fontSize: '18px' }}>{toSingular(moduleName)} Informações</Text> */}
                                    <Row>
                                        <Col span={24}>
                                            <Row gutter={16} style={{ paddingTop: '15px' }}>
                                                {sections.map((section, sectionIndex) => (
                                                    <Col key={sectionIndex} span={(moduleName == "functions" ? 24 : 20)}>
                                                        <Text style={{ padding: '0px 25px 10px', fontSize: '18px' }}>{section.name}</Text>

                                                        <Row gutter={16} style={{ paddingTop: '15px' }}>
                                                            <Col span={(moduleName == "functions" ? 24 : 12)}>
                                                                {section.left.map((field, fieldIndex) => (
                                                                    <div key={field.id} style={{ padding: '5px 0', minHeight: '66px' }}>
                                                                        <Row>
                                                                            {/* <Col span={(moduleName == "functions" ? 3 : 10)} style={{ textAlign: 'right', paddingRight: '10px' }}>
                                                                                <Text style={{ fontSize: '16px', color: '#838da1' }}>{field.name}</Text>
                                                                            </Col> */}
                                                                            <Col span={(moduleName == "functions" ? 22 : 22)} offset={(moduleName == "functions" ? 1 : 2)}>
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
                                                                            <Col span={(moduleName == "functions" ? 22 : 22)} offset={(moduleName == "functions" ? 1 : 2)}>
                                                                                {renderField(field, fieldIndex, (newValue) => handleFieldChange(sectionIndex, fieldIndex, newValue, field.api_name, 'right'), (newValue) => handleFieldChangeRelatedModule(sectionIndex, fieldIndex, newValue, field.api_name, 'right'))}
                                                                            </Col>
                                                                        </Row>
                                                                    </div>
                                                                ))}
                                                            </Col>
                                                        </Row>
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

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from "axios"
// import '../styles.css'
// import { Input, InputNumber, Button, Layout, Col, Form, theme, Row, Typography, message, Popconfirm, Select, DatePicker, Checkbox, Upload } from 'antd';
// import { UploadOutlined } from '@ant-design/icons';
// import { Content } from 'antd/es/layout/layout';
// import apiURI from '../../../Utility/recordApiURI.js';
// const { TextArea } = Input;
// const { deleteRecord } = apiURI;
// const pluralize = require('pluralize')

// const { Option } = Select;
// const { Title, Text } = Typography;
// const currentPath = window.location.pathname;
// const pathParts = currentPath.split('/');
// const org = pathParts[1];
// const moduleName = pathParts[2];
// const record_id = pathParts[3];

// const EditView = ({ itemId }) => {
//     let navigate = useNavigate()
//     const [inputValue, setInputValue] = useState("")
//     const [editedFields, setEditedFields] = useState({})
//     const toSingular = (plural) => {
//         return pluralize.singular(plural)
//     }
//     const confirm = async (e) => {
//         await deleteRecord(moduleName, record_id)
//         message.success('Registro Excluido!');
//     }
//     const {
//         token: { colorBgContainer, borderRadiusLG },
//     } = theme.useToken();
//     const [data, setData] = useState(null);
//     const [fieldToUpdate, setFieldsToUpdate] = useState(null);
//     const [fieldsToUpdate, setAllFieldsToUpdate] = useState(null);
//     const [relatedModuleData, setRelatedModuleData] = useState([]);
//     const [relatedFieldData, setRelatedFieldData] = useState([]);
//     const [options, setOptions] = useState([]);

//     const linkApi = process.env.REACT_APP_LINK_API;
//     const handleInputChange = (newValue) => {
//         setInputValue(newValue);
//     };

//     const fetchData = async () => {
//         try {
//             const currentPath = window.location.pathname;
//             const pathParts = currentPath.split('/');
//             const org = pathParts[1];
//             const moduleName = pathParts[2];
//             const record_id = pathParts[3];
//             const token = localStorage.getItem('token');
//             const config = {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             };
//             const responseFields = await axios.get(`${linkApi}/crm/${org}/${moduleName}/fields`, config);
//             const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/${record_id}`, config);
//             const combinedData = responseFields.data.map(field => {
//                 const matchingResponse = response.data.find(item => item[field.api_name]);
//                 return {
//                     ...field,
//                     field_value: matchingResponse ? matchingResponse[field.api_name] : ''
//                 };
//             }); if (Array.isArray(combinedData)) {
//                 setData(combinedData);
//             } else {
//                 setData([combinedData]);
//             }
//         } catch (error) {
//             console.error("Erro ao buscar os dados:", error);
//         }
//     };

//     // const fetchRelatedModule = async (open, relatedModuleName) => {
//     //     if (open) {
//     //         const token = localStorage.getItem('token');
//     //         const config = {
//     //             headers: {
//     //                 'Authorization': `Bearer ${token}`
//     //             }
//     //         };
//     //         const response = await axios.get(`${linkApi}/crm/${org}/${relatedModuleName}/records`, config);
//     //         setRelatedModuleData(response.data);
//     //     }
//     // }

//     const fetchRelatedModule = async (open, relatedModuleName, api_name) => {
//         if (open) {
//             const token = localStorage.getItem('token');
//             const config = {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             };
//             if (relatedModuleName == "modules") {
//                 const response = await axios.get(`${linkApi}/crm/${org}/${relatedModuleName}`, config);
//                 console.log("response", response)
//                 const matchingResponse = response.data.result.map(item => {
//                     return {
//                         field_value: item[api_name],
//                         related_id: item.api_name
//                     };
//                 });
//                 setRelatedModuleData(matchingResponse);
//             } else {
//                 const response = await axios.get(`${linkApi}/crm/${org}/${relatedModuleName}`, config);
//                 console.log("response", response)
//                 const matchingResponse = response.data.map(item => {
//                     return {
//                         field_value: item[api_name],
//                         related_id: item.id
//                     };
//                 });
//                 setRelatedModuleData(matchingResponse);
//             }

//             // setSelectedValue({ value: matchingResponse[0].field_value, id: matchingResponse[0].related_id });
//         }
//     }

//     const fetchOptions = async (open, moduleName, api_name) => {
//         if (open) {
//             const token = localStorage.getItem('token');
//             const config = {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             };
//             const response = await axios.get(`${linkApi}/crm/${org}/${moduleName}/field/${api_name}`, config);
//             console.log("etstetes", response)
//             setOptions(response.data);
//         }
//     }

//     useEffect(() => {
//         fetchData();
//     }, [itemId]);

//     if (!data) {
//         return //<div>Carregando...</div>;
//     }

//     const handleFieldChange = (index, value) => {
//         const updatedData = [...data];
//         updatedData[index].field_value = value;
//         console.log("tesrere", updatedData)
//         setFieldsToUpdate(updatedData);
//     };

//     const handleSave = async () => {
//         try {
//             let fieldToUpdate3 = {}
//             if (fieldToUpdate) {
//                 const records = relatedFieldData.filter(record => !!record);


//                 console.log("relatedFieldDatabatata", records)

//                 fieldToUpdate3['related_record'] = records.reduce((acc, record) => {
//                     if (record != null) {
//                         acc[record.api_name] = {
//                             name: record.name,
//                             id: record.related_id,
//                             module: record.related_module
//                         }
//                     }
//                     return acc;
//                 }, {});
//                 fieldToUpdate.map(field => {
//                     const { api_name, field_value } = field
//                     fieldToUpdate3[api_name] = field_value
//                 });

//                 const token = localStorage.getItem('token');
//                 const config = {
//                     headers: {
//                         'Authorization': `Bearer ${token}`
//                     }
//                 }
//                 console.log("create: ", fieldToUpdate3)
//                 const create = await axios.post(`${linkApi}/crm/${org}/${moduleName}/record`, fieldToUpdate3, config);
//                 const record_id = create.data.record_id

//                 const newRelatedFieldData = records.map((item) => {
//                     return {
//                         ...item,
//                         module_id: record_id
//                     };
//                 })
//                 console.log("newRelatedFieldData: ", newRelatedFieldData)

//                 const promises = newRelatedFieldData.map(async item => {
//                     console.log("item", item)
//                     await axios.put(`${linkApi}/crm/${org}/${moduleName}/field`, { related_id: item.related_id, id: item.id, api_name: item.api_name }, config);
//                     return axios.put(`${linkApi}/crm/${org}/${moduleName}/relatedField`, item, config);
//                 });
//                 const results = await Promise.all(promises);

//                 console.log("results Registro Criado", results);
//                 message.success('Registro Criado!');
//                 navigate(`/${org}/${moduleName}/${record_id}`)
//             }

//         } catch (error) {
//             console.error('Error saving data:', error);
//         }
//     };

//     const handleFieldChangeRelatedModule = async (index, id, newValue) => {
//         try {
//             console.log("datadatadatadatadatadata:index", index)
//             console.log("datadatadatadatadatadata:id:", id)
//             console.log("datadatadatadatadatadata:newValue", newValue)
//             const updatedData = [...data];
//             const fieldToUpdate1 = updatedData[index];
//             console.log("related field update", fieldToUpdate1)

//             const fieldToUpdate5 = {
//                 index: index,
//                 related_module: fieldToUpdate1.related_module,
//                 related_id: newValue.key,
//                 module_id: null,
//                 id: fieldToUpdate1.id,
//                 api_name: fieldToUpdate1.api_name,
//                 name: fieldToUpdate1.field_value
//             };

//             console.log("Batatinha quando nasce", fieldToUpdate5)
//             console.log("Batatinha quando relatedFieldData", relatedFieldData)
//             const updatedRelatedFieldData = relatedFieldData ? [...relatedFieldData] : [];
//             updatedRelatedFieldData[index] = fieldToUpdate5;

//             setRelatedFieldData(updatedRelatedFieldData);

//             //await axios.put(`${linkApi}/crm/${org}/${moduleName}/relatedField`, fieldToUpdate5, config);
//         } catch (error) {
//             console.error("Erro ao atualizar os dados:", error);
//         }
//     };

//     return (
//         <div>
//             {data && (
//                 <div>
//                     <div>
//                         <Layout
//                             style={{
//                                 background: colorBgContainer
//                             }}
//                         >
//                             <Row style={{ alignItems: 'center', justifyContent: 'space-between', height: '52px' }}>
//                                 <Col>
//                                     <Title
//                                         style={{ paddingLeft: '30px', fontSize: '22px' }}
//                                     >
//                                         Criar {toSingular(moduleName)}
//                                     </Title>
//                                 </Col>
//                                 <Col style={{ margin: '0 15px 0 0' }}>
//                                     <Button href={`/${org}/${moduleName}`}>Cancelar</Button>
//                                     <Button style={{ margin: '0 15px' }} type='primary' onClick={handleSave}>Salvar</Button>
//                                 </Col>
//                             </Row>
//                         </Layout>
//                     </div>
//                     <div style={{ padding: '15px 0' }}>
//                         <Content className='content'>

//                             <Layout
//                                 style={{
//                                     background: colorBgContainer,
//                                     borderRadius: borderRadiusLG,
//                                     minHeight: 'calc(100vh - 160px)'
//                                 }}
//                             >
//                                 <Text style={{ padding: '15px 25px', fontSize: '18px' }}>{toSingular(moduleName)} Informações</Text>
//                                 <Row>
//                                     <Col span={24}>
//                                         <Row gutter={16}>
//                                             {data.map((fieldData, index) => (
//                                                 <Col key={index} span={10}>
//                                                     <div style={{ padding: '5px 0', minHeight: '66px' }}>
//                                                         <Row>
//                                                             <Col span={10} style={{ textAlign: 'right', paddingRight: '10px' }}>
//                                                                 <Text style={{ fontSize: '16px', color: '#838da1' }}>
//                                                                     {fieldData.name}
//                                                                 </Text>
//                                                             </Col>
//                                                             <Col span={14}>
//                                                                 {
//                                                                     <Form.Item>
//                                                                         {(() => {
//                                                                             if (fieldData.related_module != null) {
//                                                                                 return (
//                                                                                     <Select
//                                                                                         showSearch
//                                                                                         optionFilterProp="children"
//                                                                                         filterOption={(input, option) =>
//                                                                                             option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//                                                                                         }
//                                                                                         placeholder="SelecioneSelecione"
//                                                                                         style={{ width: "100%", border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
//                                                                                         // onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
//                                                                                         // value={selectedValue ? selectedValue.value : null}
//                                                                                         defaultValue={fieldData.field_value}
//                                                                                         // placeholder="Selecione"
//                                                                                         // onChange={(open, key) => handleFieldChangeRelatedModule(open, key)}
//                                                                                         onChange={(value) => handleFieldChange(index, value)}
//                                                                                         // loading={loading}
//                                                                                         onDropdownVisibleChange={(open) => fetchRelatedModule(open, fieldData.related_module, fieldData.api_name)}
//                                                                                         onSelect={(key, value) => handleFieldChangeRelatedModule(index, key, value)}
//                                                                                         dropdownRender={(menu) => (
//                                                                                             <div>
//                                                                                                 {menu}
//                                                                                                 {/* <div style={{ textAlign: "center", padding: "10px", cursor: "pointer" }}>
//                                                                                                     <a href={`/${org}/${fieldData.related_module}/${fieldData.field_value}`} rel="noopener noreferrer">
//                                                                                                         {`Ir para ${fieldData.field_value}`}
//                                                                                                     </a>
//                                                                                                 </div> */}
//                                                                                             </div>
//                                                                                         )}
//                                                                                     >
//                                                                                         {relatedModuleData.map(item => (
//                                                                                             <Option key={item.related_id} value={item.field_value}>
//                                                                                                 {item.field_value}
//                                                                                             </Option>
//                                                                                         ))}
//                                                                                     </Select>

//                                                                                 );
//                                                                             } else if (fieldData.field_type == "select") {
//                                                                                 return (
//                                                                                     <Select
//                                                                                         showSearch
//                                                                                         optionFilterProp="children"
//                                                                                         filterOption={(input, option) =>
//                                                                                             option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//                                                                                         }
//                                                                                         style={{ width: "100%", border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
//                                                                                         onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }}
//                                                                                         // value={selectedValue ? selectedValue.value : null}
//                                                                                         defaultValue={fieldData.field_value}
//                                                                                         placeholder="Selecione"
//                                                                                         onChange={(value) => handleFieldChange(index, value)}
//                                                                                         // loading={loading}
//                                                                                         onDropdownVisibleChange={(open) => fetchOptions(open, fieldData.module, fieldData.api_name)}
//                                                                                     >
//                                                                                         <Option value=''>-Nenhum-</Option>
//                                                                                         {options.map(item => (
//                                                                                             <Option key={item.id} value={item.name}>
//                                                                                                 {item.name}
//                                                                                             </Option>
//                                                                                         ))}
//                                                                                     </Select>
//                                                                                 );
//                                                                             } else if (fieldData.field_type == "date") {
//                                                                                 return (
//                                                                                     <DatePicker
//                                                                                         onChange={(value) => handleFieldChange(index, value)}
//                                                                                         format="DD/MM/YYYY"
//                                                                                         placeholder="Selecione uma data"
//                                                                                         style={{ width: "100%" }}
//                                                                                     />
//                                                                                 );
//                                                                             } else if (fieldData.field_type == "multi_line") {
//                                                                                 return (
//                                                                                     // <TextArea
//                                                                                     //     rows={4}
//                                                                                     //     defaultValue={fieldData.field_value}
//                                                                                     //     onChange={(newValue) => handleFieldChange(index, newValue)}
//                                                                                     //     maxLength={16000}
//                                                                                     // />
//                                                                                     <TextArea
//                                                                                         onFocus={(e) => { e.target.style.overflowY = 'auto'; }}
//                                                                                         onBlur={(e) => { e.target.style.overflowY = 'hidden'; e.target.scrollTop = 0; }}
//                                                                                         rows={4}
//                                                                                         defaultValue={fieldData.field_value}
//                                                                                         onChange={(e) => handleFieldChange(index, e.target.value)}
//                                                                                         maxLength={16000}
//                                                                                     />

//                                                                                 )
//                                                                             } else if (fieldData.field_type == "checkbox") {
//                                                                                 return (
//                                                                                     <Checkbox
//                                                                                         defaultChecked={fieldData.field_value == 1 ? true : false}
//                                                                                         onChange={(e) => handleFieldChange(index, e.target.checked)}
//                                                                                     />
//                                                                                 )
//                                                                             } else if (fieldData.field_type == "number") {
//                                                                                 return (
//                                                                                     <InputNumber
//                                                                                         style={{ width: "100%" }}
//                                                                                         changeOnWheel
//                                                                                         defaultValue={fieldData.field_value}
//                                                                                         onChange={(e) => handleFieldChange(index, e)}
//                                                                                     />
//                                                                                 )
//                                                                             } else if (fieldData.field_type == "currency") {
//                                                                                 return (
//                                                                                     <InputNumber
//                                                                                         style={{ width: "100%" }}
//                                                                                         prefix="R$"
//                                                                                         formatter={(val) => {
//                                                                                             if (!val) return;
//                                                                                             return `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".").replace(/\.(?=\d{0,2}$)/g, ",");
//                                                                                         }}
//                                                                                         parser={(val) => {
//                                                                                             if (!val) return;
//                                                                                             return Number.parseFloat(val.replace(/\$\s?|(\.*)/g, "").replace(/(\,{1})/g, ".")).toFixed(2)
//                                                                                         }}
//                                                                                         changeOnWheel
//                                                                                         defaultValue={fieldData.field_value}
//                                                                                         onChange={(e) => handleFieldChange(index, e)}
//                                                                                     />
//                                                                                 )
//                                                                             } else if (fieldData.field_type == "file") {
//                                                                                 const props = {
//                                                                                     name: 'file',
//                                                                                     action: `${linkApi}/crm/${org}/${moduleName}/relatedField`,
//                                                                                     headers: {
//                                                                                         authorization: 'authorization-text',
//                                                                                     },
//                                                                                     onChange(info) {
//                                                                                         if (info.file.status !== 'uploading') {
//                                                                                             console.log(info.file, info.fileList);
//                                                                                         }
//                                                                                         if (info.file.status === 'done') {
//                                                                                             message.success(`${info.file.name} file uploaded successfully`);
//                                                                                         } else if (info.file.status === 'error') {
//                                                                                             message.error(`${info.file.name} file upload failed.`);
//                                                                                         }
//                                                                                     },
//                                                                                 };
//                                                                                 return (
//                                                                                     <Upload {...props}>
//                                                                                         <Button style={{ width: "100%" }} icon={<UploadOutlined />}>Selecione o Arquivo</Button>
//                                                                                     </Upload>
//                                                                                 )
//                                                                             } else {
//                                                                                 return (
//                                                                                     <Input
//                                                                                         value={editedFields[fieldData.field_name] || fieldData.field_value}
//                                                                                         onChange={e => handleFieldChange(index, e.target.value)}
//                                                                                     />
//                                                                                 );
//                                                                             }
//                                                                         })()}
//                                                                     </Form.Item>
//                                                                 }
//                                                             </Col>
//                                                             {/* // Enviar e-mail de notificação */}
//                                                         </Row>
//                                                     </div>
//                                                 </Col>
//                                             ))}
//                                         </Row>
//                                     </Col>
//                                 </Row>
//                             </Layout>
//                         </Content>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );

// };

// export default EditView;
