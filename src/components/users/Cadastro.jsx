import { LockOutlined, UserOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Layout, Row, Col, Button, Form, Input, Typography, Divider, Alert, Result, InputNumber } from 'antd';
import { PasswordInput } from 'antd-password-input-strength';
import { React, useState } from 'react';
import { Link } from 'react-router-dom';
import InputMask from 'react-input-mask';

import userApiURI from '../../Utility/userApiURI';
// import logo from '../../img/logo.jpeg';
import Loading from '../utils/Loading';
import FooterText from '../utils/FooterText';
import './styles.css'
import Paragraph from 'antd/es/typography/Paragraph';

const { Content } = Layout;
const { Title, Text } = Typography;

function Cadastro() {

    const [form] = Form.useForm();
    const [alertMessage, setAlertMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [cadastrado, setCadastrado] = useState(false);

    const onFinish = async (values) => {
        setLoading(true)

        try {
            // Verifica se existe email cadastrado
            const emailCheck = await userApiURI.checkEmail(values.email);
            if (emailCheck.status === 200 && emailCheck.data.success === false) {

                setAlertMessage(<Alert message="OPS! Houve um erro ao cadastrar" description="O E-mail informado já está cadastrado no sistema." type="error" showIcon />)
                setLoading(false)
                return
            } else if (emailCheck.status === 400) {
                setAlertMessage(<Alert message="OPS! Houve um erro ao cadastrar" description="Entre em contato com o suporte." type="error" showIcon />)
                setLoading(false)
                return
            }

            const result = await userApiURI.register(values)

            if (result.status === 400) {
                setAlertMessage(<Alert message="OPS! Houve um erro ao cadastrar" description="Falha na comunicação com o Servidor! Por favor entre em contato com o Suporte." type="error" showIcon />)

            } else if (result.status === 200 && result.data.success === false) {
                setAlertMessage(<Alert message="OPS! Houve um erro ao cadastrar" description="O E-mail informado já está cadastrado no sistema." type="error" showIcon />)
                setLoading(false)
            } else {
                console.log("user aqui!: ", result.data)
                const uuid = result.data.uuid
                const email = result.data.email
                const resultEmailConfirmation = await userApiURI.sendEmailConfirmation({ email: email, uuid: uuid })
                setCadastrado(true)
            }
            setLoading(false)
        } catch (error) {
            setAlertMessage(<Alert message="OPS! Houve um erro ao cadastrar" description="Falha na comunicação com o Servidor! Por favor entre em contato com o Suporte." type="error" showIcon />)
            console.log('Erro ao tentar cadastrar', error)
            setLoading(false)
        }
    };

    const validateMessages = {
        required: 'Campo obrigatório!',
    };

    if (loading) {
        return (
            <Loading />
        )
    }

    if (cadastrado) {
        return (
            <Result
                // icon={<SmileOutlined />}
                title="Cadastro realizado com sucesso!"
                subTitle={
                    <>
                        {/* <Paragraph style={{ textAlign: 'center' }}>
                            <Text
                                strong
                                style={{
                                    fontSize: 16,

                                }}
                            >
                                Para concluir seu cadastro e começar a usar todos os recursos, por favor, confirme seu endereço de email.
                            </Text>
                        </Paragraph> */}
                        <Paragraph style={{ textAlign: 'center' }}>
                            <Text
                                strong
                                style={{
                                    fontSize: 16,
                                }}
                            >
                                Enviamos um link de confirmação para o email que você forneceu. Verifique sua caixa de entrada e clique no link para ativar sua conta.
                            </Text>
                        </Paragraph>
                        <Paragraph style={{ textAlign: 'center' }}>
                            <Text
                                strong
                                style={{
                                    fontSize: 16,
                                }}
                            >
                                Se você não encontrar o email na sua caixa de entrada, verifique a pasta de spam ou lixo eletrônico.
                            </Text>
                        </Paragraph>
                        <Paragraph style={{ textAlign: 'center' }}>
                            Já confirmou seu email? Faça o login abaixo.
                        </Paragraph>
                    </>
                }
                extra={<Link to='/login'><Button type="primary">Login</Button></Link>}
            />
        )
    }

    return (
        <Layout className="layout">
            <Content>
                <div className='user-row-cadastro'>
                    <Row>
                        <Col xs={{ span: 22, offset: 1 }}
                            sm={{ span: 16, offset: 4 }}
                            md={{ span: 12, offset: 6 }}
                            lg={{ span: 10, offset: 6 }}
                            xl={{ span: 6, offset: 9 }}>
                            <div className='user-content-cadastro'>
                                <Row>
                                    <Col span={20} offset={2}>
                                        {/* <Row>
                                            <Col span={22} offset={1}>
                                                <img alt='Logo' className='user-cadastro-logo' src={logo} />
                                            </Col>
                                        </Row> */}
                                        <Title level={4} className='user-cadastro-title'>Faça seu cadastro</Title>

                                        {/* MENSAGEM DE ALERTA CASO RETORNE ERRO NO CADASTRO */}
                                        {alertMessage}

                                        <Divider />
                                        <Form
                                            form={form}
                                            name="cadastro-usuario"
                                            className="login-form"
                                            initialValues={{
                                                remember: true,

                                            }}
                                            validateMessages={validateMessages}
                                            onFinish={onFinish}
                                        >

                                            <Form.Item
                                                name="name"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                ]}
                                            // style={{ display: 'inline-block', width: 'calc(50% - 10px)' }}
                                            >
                                                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Nome" autoFocus />
                                            </Form.Item>
                                            {/* <Form.Item
                                                name="lastname"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                ]}
                                                style={{ display: 'inline-block', width: 'calc(50% - 10px)', marginLeft: '20px' }}
                                            >
                                                <Input size='large' prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Sobrenome" />
                                            </Form.Item> */}
                                            <Form.Item
                                                name="email"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                    {
                                                        type: 'email',
                                                        message: 'E-mail Inválido!',
                                                    }
                                                ]}
                                            >
                                                <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="E-mail" />
                                            </Form.Item>

                                            <Form.Item
                                                name="CPF"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                ]}
                                            >
                                                <InputMask mask="999.999.999-99" placeholder="CPF">
                                                    {(inputProps) => <Input {...inputProps} />}
                                                </InputMask>
                                            </Form.Item>

                                            <Form.Item
                                                name="empresa"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                ]}
                                            >
                                                <Input placeholder="Nome da Empresa" />
                                            </Form.Item>

                                            <Form.Item
                                                name="phone"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                ]}
                                            >
                                                <Input addonBefore={'+55'} placeholder="Celular" />
                                            </Form.Item>

                                            <Form.Item
                                                name="password"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                    { min: 6, message: 'A senha deve ter pelo menos 6 caracteres.' }
                                                ]}
                                                hasFeedback
                                            >
                                                <PasswordInput
                                                    prefix={<LockOutlined className="site-form-item-icon" />}
                                                    type="password"
                                                    placeholder="Senha"
                                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                name="password-confirm"
                                                rules={[
                                                    {
                                                        required: true,
                                                    },
                                                    ({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            if (!value || getFieldValue('password') === value) {
                                                                return Promise.resolve();
                                                            }
                                                            return Promise.reject(new Error('As senhas não conferem!'));
                                                        },
                                                    }),
                                                ]}
                                                hasFeedback
                                            >
                                                <PasswordInput
                                                    prefix={<LockOutlined className="site-form-item-icon" />}
                                                    type="password"
                                                    placeholder="Confirme a Senha"
                                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                                />
                                            </Form.Item>

                                            <Form.Item>
                                                <Button type="primary" htmlType="submit" className="login-form-button cad-button">
                                                    Cadastrar
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={15} offset={6}>
                                        <Text className='text-center'>
                                            Já possui conta? Faça o <Link to="/login">Login.</Link>
                                        </Text>
                                    </Col>
                                </Row>
                            </div>
                            <FooterText />
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>
    )
};

export default Cadastro;