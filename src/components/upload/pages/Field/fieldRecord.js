import React from "react";
import { Form, Input, Button, Table, Row, Select, AutoComplete, message, Col, Space, Divider, Popconfirm } from "antd";
import { Link } from 'react-router-dom';
import { Component } from "react";
import axios from "axios";

const linkApi = process.env.REACT_APP_LINK_API
console.log("process env:", `${linkApi}/fields/create`)
const FormItem = Form.Item;
const { Option } = Select;
const currentPath = window.location.pathname;
const pathParts = currentPath.split('/');
const org = pathParts[1];
const moduleName = pathParts[2];

class UserRecord extends Component {
    constructor() {
        super();
        const showHeader = true;
        this.state = {
            formLayout: "vertical",
            currentId: null,
            editing: false,
            newUser: {
                name: "",
                api: "",
                type: "",
                module: "",
                lookup_field: ""
            },
            userRecords: [],
            tableConfiguration: {
                bordered: true,
                loading: false,
                pagination: true,
                size: "small",
                showHeader,
                scroll: undefined
            }
        };
        this.updateUser = this.updateUser.bind(this);
        this.saveNewUser = this.saveNewUser.bind(this);
        this.changeName = this.changeName.bind(this);
        this.changeApi = this.changeApi.bind(this);
        this.handleFormLayoutChange = this.handleFormLayoutChange.bind(this);
        this.handleUpdateUser = this.handleUpdateUser.bind(this);
        this.handleDeleteUser = this.handleDeleteUser.bind(this);
        this.formRef = React.createRef();
    }

    handleFormLayoutChange = e => {
        this.setState({
            formLayout: e.target.value
        });
    };

    fetchUser() {
        axios
            .get(`${linkApi}/fields/read`)
            .then(response => {
                console.log(response.data);
                const sortedUserRecords = response.data.reverse();
                this.setState({
                    userRecords: sortedUserRecords,
                    tableConfiguration: { loading: false }
                });
            })
            .catch(err => {
                console.log("Network " + err);
            });
    }

    componentWillMount() {
        this.fetchUser();
    }

    createUserRecord(userRecord) {
        axios
            .post(`${linkApi}/fields/create`, userRecord)
            .then(response => {
                userRecord.id = response.data.id;
                this.setState({
                    editing: false,
                    newUser: { name: "", api: "", type: "", module: "", lookup_field: "" },
                    tableConfiguration: { loading: false }
                });
                this.fetchUser();
            })
            .catch(err => {
                debugger;
                console.log(err);
            });
    }

    updateUserRecord(userRecord) {
        const { name, api, type, module, lookup_field } = userRecord.data;
        fetch(`${linkApi}/fields/update/` + userRecord.id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                api: api,
                type: type,
                module: module,
                lookup_field: lookup_field
            })
        }).then(response => {
            this.setState({
                editing: false,
                newUser: { name: "", api: "", type: "", module: "", lookup_field: "" },
                tableConfiguration: { loading: false }
            });
            this.fetchUser();
            console.log("Update success!", response); //returns 200 ok
        }).catch(error => {
            console.error('Error updating user record:', error);
        });
    }

    deleteUser(id) {
        console.log(id);
        axios
            .delete(`${linkApi}/fields/delete/` + id)
            .then(response => {
                console.log(response);
                this.fetchUser();
            })
            .catch(err => {
                console.log(err);
            });
    }

    saveNewUser = e => {
        this.formRef.current
            .validateFields()
            .then(values => {
                // Validou com sucesso, continue com a lógica de salvar
                this.setState({ tableConfiguration: { loading: true } });
                const { name, api, type, module, lookup_field } = this.state.newUser;

                const userRecord = { name, api, type, module, lookup_field };

                this.setState({ tableConfiguration: { loading: true } });

                // Se o módulo for obrigatório, verifica se ele foi preenchido
                if (!name) {
                    message.error('Nome da Coluna é obrigatório.');
                    this.setState({ tableConfiguration: { loading: false } });
                    throw new Error('Campo "Nome da Coluna" não preenchido.');
                }
                if (!api) {
                    message.error('Nome do Campo é obrigatório.');
                    this.setState({ tableConfiguration: { loading: false } });
                    throw new Error('Campo "Nome do Campo" não preenchido.');
                }
                if (!type) {
                    message.error('O Tipo é obrigatório.');
                    this.setState({ tableConfiguration: { loading: false } });
                    throw new Error('Campo Tipo não preenchido.');
                }
                if (this.state.newUser.type === 'lookup' && !module) {
                    message.error('O Módulo é obrigatório.');
                    this.setState({ tableConfiguration: { loading: false } });
                    throw new Error('Campo Módulo não preenchido.');
                }
                if (this.state.newUser.type === 'lookup' && !lookup_field) {
                    message.error('Campo de Pesquisa é obrigatório.');
                    this.setState({ tableConfiguration: { loading: false } });
                    throw new Error('Campo de Pesquisa não preenchido.');
                }

                this.createUserRecord(userRecord)
                this.setState({ tableConfiguration: { loading: false } });
            })
            .catch(error => {
                console.error('Validation error:', error);
            });
    };

    updateUser = e => {
        this.formRef.current
            .validateFields()
            .then(values => {
                this.setState({ tableConfiguration: { loading: true } });
                const { name, api, type, module, lookup_field } = this.state.newUser;

                const userRecord = {};
                userRecord.id = this.state.currentId;
                userRecord.data = this.state.newUser;

                this.setState({ tableConfiguration: { loading: true } });

                // Se o módulo for obrigatório, verifica se ele foi preenchido
                if (!name) {
                    message.error('Nome da Coluna é obrigatório.');
                    this.setState({ tableConfiguration: { loading: false } });
                    throw new Error('Campo "Nome da Coluna" não preenchido.');
                }
                if (!api) {
                    message.error('Nome do Campo é obrigatório.');
                    this.setState({ tableConfiguration: { loading: false } });
                    throw new Error('Campo "Nome do Campo" não preenchido.');
                }
                if (!type) {
                    message.error('O Tipo é obrigatório.');
                    this.setState({ tableConfiguration: { loading: false } });
                    throw new Error('Campo Tipo não preenchido.');
                }
                if (this.state.newUser.type === 'lookup' && !module) {
                    message.error('O Módulo é obrigatório.');
                    this.setState({ tableConfiguration: { loading: false } });
                    throw new Error('Campo Módulo não preenchido.');
                }
                if (this.state.newUser.type === 'lookup' && !lookup_field) {
                    message.error('Campo de Pesquisa é obrigatório.');
                    this.setState({ tableConfiguration: { loading: false } });
                    throw new Error('Campo de Pesquisa não preenchido.');
                }

                this.updateUserRecord(userRecord)
                this.setState({ tableConfiguration: { loading: false } });
            })
            .catch(error => {
                console.error('Validation error:', error);
            });
    };

    cancelEdit = () => {
        this.setState({
            editing: false,
            newUser: { name: "", api: "", type: "", module: "", lookup_field: "" },
            currentId: null,
        });
    };

    changeName = e => {
        this.setState({
            newUser: { ...this.state.newUser, name: e.target.value }
        });
    };

    changeApi = e => {
        this.setState({
            newUser: { ...this.state.newUser, api: e.target.value }
        });
    };

    changeType = e => {
        const value = e.target ? e.target.value : e;
        this.setState(prevState => {
            let updatedUser = { ...prevState.newUser, type: value };

            // Se o tipo de campo não for 'lookup', desativa os campos relacionados
            if (value !== 'lookup') {
                updatedUser.module = '';
                updatedUser.lookup_field = '';
            }

            return { newUser: updatedUser };
        });
    };

    changeModule = e => {
        this.setState({
            newUser: { ...this.state.newUser, module: e.target.value }
        });
    };

    changeLookupField = e => {
        this.setState({
            newUser: { ...this.state.newUser, lookup_field: e.target.value }
        });
    };

    handleDeleteUser = e => {
        console.log(e)
        this.deleteUser(e._id);
    };

    handleUpdateUser = e => {
        console.log(e)
        this.setState({
            currentId: e._id,
            editing: true,
            newUser: {
                name: e.name,
                api: e.api,
                type: e.type,
                module: e.module,
                lookup_field: e.lookup_field
            }
        });
    };

    render() {
        const { formLayout } = this.state;
        const formItemLayout =
            formLayout === "vertical"
                ? {
                    labelCol: { span: 4 },
                    wrapperCol: { span: 24 }
                }
                : null;
        const buttonItemLayout =
            formLayout === "vertical"
                ? {
                    wrapperCol: { span: 0 }
                }
                : null;
        const layoutProps = { [formLayout]: "true" };

        const data = this.state.userRecords;
        let button = null;
        if (this.state.editing) {
            button = (
                <Row>
                    <Col span={1}>
                        <Button style={{ width: "100px" }} className="buttonConfirm" type="primary" size="default" onClick={this.updateUser}>
                            Salvar
                        </Button>
                    </Col>
                    <Col offset={12}>
                        <Button style={{ width: "100px" }} className="buttonCancel" type="default" size="default" onClick={this.cancelEdit}>
                            Cancelar
                        </Button>
                    </Col>
                </Row>
            );
        } else {
            button = (
                <Button className="buttonConfirm" type="primary" onClick={this.saveNewUser}>
                    Adicionar Coluna
                </Button>
            );
        }

        const columns = [
            {
                title: "Coluna",
                dataIndex: "name",
                key: "name",
                render: text => text
            },
            {
                title: "Campo",
                dataIndex: "api",
                key: "api"
            },
            {
                title: "Tipo",
                dataIndex: "type",
                key: "type"
            },
            {
                title: "Módulo",
                dataIndex: "module",
                key: "module"
            },
            {
                title: "Campo de pesquisa",
                dataIndex: "lookup_field",
                key: "lookup_field"
            },
            {
                title: "Ação",
                key: "action",
                render: (text, record) => (
                    <span>
                        <Button
                            type="primary"
                            className="buttonEdit"
                            onClick={() => this.handleUpdateUser(record)}
                        >
                            Editar
                        </Button>
                        <Divider type="vertical" />
                        <Popconfirm
                            title="Deletar Coluna?"
                            description="Tem certeza que deseja deletar essa coluna?"
                            okText="Sim"
                            cancelText="Não"
                            onConfirm={() => this.handleDeleteUser(record)}
                        >
                            <Button danger>
                                Deletar
                            </Button>
                        </Popconfirm>
                    </span>
                )
            }
        ];
        const autoCompleteOptions = [
            'id',
            'text',
            'number',
            'select',
            'lookup',
        ].map((value) => ({ value }));
        return (
            <div>
                <Form {...layoutProps} ref={this.formRef} style={{ marginTop: "15px" }}>
                    <FormItem label="Nome da Coluna" required tooltip="Título da coluna que está na planilha." {...formItemLayout}>
                        <Input
                            type="text"
                            value={this.state.newUser.name}
                            placeholder="Coluna"
                            onChange={this.changeName}
                            onPressEnter={() => (this.state.editing ? this.updateUser() : this.saveNewUser())}
                        />
                    </FormItem>
                    <FormItem label="Nome do Campo" required tooltip="Nome lógico do campo do CRM, que é encontrado na aba APIs." {...formItemLayout}>
                        <Input
                            type="text"
                            value={this.state.newUser.api}
                            placeholder="Campo"
                            onChange={this.changeApi}
                            onPressEnter={() => (this.state.editing ? this.updateUser() : this.saveNewUser())}
                        />
                    </FormItem>
                    <FormItem label="Tipo de Dados" required tooltip="Tipo de Dados do campo do CRM, que é encontrado na aba APIs." {...formItemLayout}>
                        <Select
                            placeholder="Selecione o tipo do campo"
                            value={this.state.newUser.type}
                            onChange={value => this.changeType({ target: { value } })}
                        >
                            <Option value="id">Id</Option>
                            <Option value="text">Texto</Option>
                            <Option value="number">Número</Option>
                            <Option value="date">Data</Option>
                            <Option value="select">Seleção</Option>
                            <Option value="lookup">Pesquisa</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="Módulo" required={this.state.newUser.type === 'lookup'} tooltip="Módulo do CRM que será realizado a pesquisa." {...formItemLayout}>
                        <Input
                            type="text"
                            value={this.state.newUser.module}
                            placeholder="Módulo"
                            onChange={this.changeModule}
                            onPressEnter={() => (this.state.editing ? this.updateUser() : this.saveNewUser())}
                            disabled={this.state.newUser.type !== 'lookup'}
                        />
                    </FormItem>
                    <FormItem label="Campo de Pesquisa" required={this.state.newUser.type === 'lookup'} tooltip="Nome lógico do campo do CRM no módulo que será realizado a pesquisa." {...formItemLayout}>
                        <Input
                            type="text"
                            value={this.state.newUser.lookup_field}
                            placeholder="Campo de Pesquisa"
                            onChange={this.changeLookupField}
                            onPressEnter={() => (this.state.editing ? this.updateUser() : this.saveNewUser())}
                            disabled={this.state.newUser.type !== 'lookup'}
                        />
                    </FormItem>
                    <Row>
                        <Col span={4} offset={0}>
                            <FormItem {...buttonItemLayout}>{button}</FormItem>
                        </Col>
                        <Col span={2} offset={18} >
                            <FormItem><Button className="buttonConfirm" type="primary" size="default" style={{ width: "100%" }}><Link to={`/${org}/${moduleName}/upload/home`}>Pronto</Link></Button></FormItem>
                        </Col>
                    </Row>
                </Form>
                <Table
                    bordered
                    rowKey={record => record.id}
                    {...this.state.tableConfiguration}
                    columns={columns}
                    dataSource={data}
                />
            </div>
        );
    }
}

export default UserRecord;
