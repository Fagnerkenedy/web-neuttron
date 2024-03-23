import { LockOutlined, UserOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone, SmileOutlined } from '@ant-design/icons';
import { PasswordInput } from 'antd-password-input-strength';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import userApiURI from '../../Utility/userApiURI';
import logo from '../../img/logo.jpeg';
import Loading from '../utils/Loading';
import FooterText from '../utils/FooterText';

import {
    AutoComplete,
    Button,
    Cascader,
    Checkbox,
    Col,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Alert,
    Result,
} from 'antd';

const { Option } = Select;

const residences = [
    {
        value: 'zhejiang',
        label: 'Zhejiang',
        children: [
            {
                value: 'hangzhou',
                label: 'Hangzhou',
                children: [
                    {
                        value: 'xihu',
                        label: 'West Lake',
                    },
                ],
            },
        ],
    },
    {
        value: 'jiangsu',
        label: 'Jiangsu',
        children: [
            {
                value: 'nanjing',
                label: 'Nanjing',
                children: [
                    {
                        value: 'zhonghuamen',
                        label: 'Zhong Hua Men',
                    },
                ],
            },
        ],
    },
];
const formItemLayout = {
    labelCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 5,
        },
    },
    wrapperCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 16,
        },
    },
};
const tailFormItemLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 16,
            offset: 8,
        },
    },
};

const MyAccount = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    const [userForm, setUserForm] = useState(user)
    const [autoCompleteResult, setAutoCompleteResult] = useState([]);
    const [form] = Form.useForm();
    const [alertMessage, setAlertMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [cadastrado, setCadastrado] = useState(false);

    {/* useEffect(() => {
        async function getUser(){
            var response = await userApiURI.myAccount('/minhaconta');
            console.log(response)
        }
        getUser();
    },[]) */}

    const onFinish = async (values) => {

        // setLoading(true)

        try {
            const userId = user._id;
            console.log(user._id)
            const result = await userApiURI.updateUser(values, userId)

            // if (result.status === 400) {
            //     setAlertMessage(<Alert message="OPS! Houve um erro ao cadastrar" description="Falha na comunicação com o Servidor! Por favor entre em contato com o Suporte." type="error" showIcon />)

            // } else if (result.status === 200 && result.data.success === false) {
            //     setAlertMessage(<Alert message="OPS! Houve um erro ao cadastrar" description="O E-mail informado já está cadastrado em nosso sistema. Por favor revise os dados informados  " type="error" showIcon />)
            //     setLoading(false)

            // } else {
            //     const user = result.data.user
            //     const updateUser = await userApiURI.updateUser(user)
            //     console.log(updateUser)
            //     setCadastrado(true)
            //     console.log('Received values of form: ', values)
            // }
            setLoading(false)
        } catch (error) {
            setAlertMessage(<Alert message="OPS! Houve um erro ao cadastrar" description="Falha na comunicação com o Servidor! Por favor entre em contato com o Suporte." type="error" showIcon />)
            console.log('Erro ao tentar cadastrar', error)
            setLoading(false)
        }

        ;

    };
    const validateMessages = {
        required: 'Campo obrigatório!',
    };

     {/*if (loading) {
        return (
            <Loading />
        )
    } */}

    if (cadastrado) {
        return (
            <Result
                icon={<SmileOutlined />}
                title="Cadastro efetuado com sucesso!"
                subTitle="Enviamos um e-mail para sua caixa de entrada, é só entrar lá e confirmar"
                extra={<Link to='/login'><Button type="primary">Login</Button></Link>}
            />

        )
    }

    const prefixSelector = (
        <Form.Item name="prefix" noStyle>
            <Select
                style={{
                    width: 70,
                }}
            >
                <Option value="86">+86</Option>
                <Option value="87">+87</Option>
            </Select>
        </Form.Item>
    );
    const suffixSelector = (
        <Form.Item name="suffix" noStyle>
            <Select
                style={{
                    width: 70,
                }}
            >
                <Option value="USD">$</Option>
                <Option value="CNY">¥</Option>
            </Select>
        </Form.Item>
    );
    

    const onWebsiteChange = (value) => {
        if (!value) {
            setAutoCompleteResult([]);
        } else {
            setAutoCompleteResult(['.com', '.org', '.net'].map((domain) => `${value}${domain}`));
        }
    };

    const websiteOptions = autoCompleteResult.map((website) => ({
        label: website,
        value: website,
    }));
    return (

        <Form
            {...formItemLayout}
            form={form}
            name="register"
            onFinish={onFinish}
            initialValues={{
                residence: ['zhejiang', 'hangzhou', 'xihu'],
                prefix: '55',
            }}
            scrollToFirstError
        >
            <h1 style={{ textAlign: 'center', fontSize: '24px', paddingBottom: '15px' }}>Minha conta</h1>
            <Form.Item
                name="name"
                label="Nome"
                tooltip="What do you want others to call you?"
                rules={[
                    {
                        
                        message: 'Please input your nickname!',
                    },
                ]}
            >
                {/* <Input value={user.name} /> */}
                <Input defaultValue={userForm.name || ''} onChange={e => setUserForm(e.target.value)}></Input>
            </Form.Item>

            <Form.Item
                name="lastname"
                label="Sobrenome"
                tooltip="What do you want others to call you?"
                rules={[
                    {
                        
                        message: 'Please input your nickname!',
                        whitespace: true,
                    },
                ]}
            >
                <Input defaultValue={user.lastname} />
            </Form.Item>
            <Form.Item
                name="email"
                label="E-mail"
                rules={[
                    {
                        type: 'email',
                        message: 'The input is not valid E-mail!',
                    },
                    {
                        required: true,
                        message: 'Please input your E-mail!',
                    },
                ]}
            >
                <Input />
            </Form.Item>

            {/* <Form.Item
                name="password"
                label="Password"
                rules={[
                    {
                        required: true,
                        message: 'Please input your password!',
                    },
                ]}
                hasFeedback
            >
                <Input.Password defaultValue={user.password} />
            </Form.Item>

             <Form.Item
                name="password-confirm"
                label="Confirm Password"
                dependencies={['password']}
                hasFeedback
                rules={[
                    {
                        required: true,
                        message: 'Please confirm your password!',
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }

                            return Promise.reject(new Error('The two passwords that you entered do not match!'));
                        },
                    }),
                ]}
            >
                <Input.Password />
            </Form.Item> */}

            <Form.Item
                name="sitename"
                label="Subdominio"
                tooltip="Qual será o nome do seu sub-domínio?"
                rules={[
                    {
                        
                        message: 'Por favor inclua o nome do seu sub-domínio',
                        whitespace: true,
                    },
                ]}
            >
                <Input defaultValue={user.sitename} />
            </Form.Item>

            <Form.Item
                name="phone"
                label="Número de telefone"
                rules={[
                    {
                        
                        message: 'Por favor insira o seu número de telefone!',
                    },
                ]}
            >
                <Input
                    addonBefore={prefixSelector}
                    style={{
                        width: '100%',
                    }}
                    defaultValue={user.phone}
                />
            </Form.Item>

            <Form.Item
                name="site"
                label="Website"
                rules={[
                    {
                        
                        message: 'Por favor insira o seu Site!',
                    },
                ]}
            >
                {/*<AutoComplete options={websiteOptions} onChange={onWebsiteChange} placeholder="website">
                </AutoComplete>*/}
                    <Input defaultValue={user.site} />
            </Form.Item>

            <Form.Item
                name="instagram"
                label="Instagram"
                rules={[
                    {
                        
                        message: 'Por favor insira o seu Instagram!',
                    },
                ]}
            >
                <Input defaultValue={user.instagram} />
            </Form.Item>

            <Form.Item
                name="facebook"
                label="Facebook"
                rules={[
                    {
                        
                        message: 'Por favor insira o seu Facebook!',
                    },
                ]}
            >
                <Input defaultValue={user.facebook} />
            </Form.Item>

            <Form.Item
                name="endereco"
                label="Endereço"
                tooltip="What do you want others to call you?"
                rules={[
                    {
                        
                        message: 'Please input your nickname!',
                        whitespace: true,
                    },
                ]}
            >
                <Input defaultValue={user.endereco} />
            </Form.Item>

            <Form.Item
                name="numero"
                label="Número"
                tooltip="Número residencial"
                rules={[
                    {
                        
                        message: 'Por favor insira o seu número residencial',
                        whitespace: true,
                    },
                ]}
            >
                <Input defaultValue={user.numero} />
            </Form.Item>

            <Form.Item
                name="bairro"
                label="Bairro"
                rules={[
                    {
                        
                        message: 'Por favor insira o seu bairro',
                        whitespace: true,
                    },
                ]}
            >
                <Input defaultValue={user.bairro} />
            </Form.Item>

            <Form.Item
                name="cidade"
                label="Cidade"
                rules={[
                    {
                        
                        message: 'Por favor insira a sua cidade',
                        whitespace: true,
                    },
                ]}
            >
                <Input defaultValue={user.cidade} />
            </Form.Item>

            <Form.Item
                name="estado"
                label="Estado"
                rules={[
                    {
                        
                        message: 'Por favor insira o seu estado',
                        whitespace: true,
                    },
                ]}
            >
                <Input defaultValue={user.estado} />
            </Form.Item>

            <Form.Item
                name="pais"
                label="País"
                tooltip="Número residencial"
                rules={[
                    {
                        
                        message: 'Por favor insira o seu número residencial',
                        whitespace: true,
                    },
                ]}
            >
                <Input defaultValue={user.pais} />
            </Form.Item>

            <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">
                    Register
                </Button>
            </Form.Item>
        </Form>
    );
};

export default MyAccount;