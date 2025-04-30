import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Row, Col, Button, Form, Input, Typography, Divider, Image, theme, ConfigProvider } from 'antd';
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles.css'
// import logo from '../../img/logo.jpeg';
import FooterText from '../utils/FooterText';
import AuthContext from '../../contexts/auth';
import Loading from '../utils/Loading';
import Logo from './neuttron_preto_sem_fundo.png';

const { defaultAlgorithm, darkAlgorithm } = theme;
const { Content } = Layout;
const { Title, Text } = Typography;

const Login = () => {
    const { user, login, loading, alertMessage } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleSubmit = (e) => {
        const data = { email, password }
        login(data)
    }

    if (loading) {
        return (
            <Loading />
        )
    }

    if (user != null) {
        const recoveredOrg = localStorage.getItem('org');
        navigate(`/${recoveredOrg}/home`);
    }

    return (
        <ConfigProvider
            theme={{
                // algorithm: darkMode ? [theme.darkAlgorithm, theme.compactAlgorithm] : [theme.defaultAlgorithm, theme.compactAlgorithm], // compactAlgorithm
                // algorithm: darkAlgorithm, // compactAlgorithm
                algorithm: [theme.darkAlgorithm, theme.compactAlgorithm], // darkAlgorithm and compactAlgorithm
                token: {
                    colorPrimary: '#1a73e8', // #1a73e8 #004E99
                    // colorLink: '#ffffff' : '#000000',
                    colorLinkHover: '#004E99', // Cor legal: #277AF7
                    colorSuccess: '#6aaf35'
                },
            }}
        >
            <Layout className="layout">
                <Content>
                    <div className='user-row-cadastro'>
                        <Row>
                            <Col xs={{ span: 24, offset: 0 }}
                                sm={{ span: 15, offset: 5 }}
                                md={{ span: 10, offset: 7 }}
                                lg={{ span: 6, offset: 9 }}>
                                <div className='user-content-cadastro'>
                                    <Row>
                                        <Col span={20} offset={2}>
                                            {/* <Row>
                                            <Col span={22} offset={1}>
                                                <img alt='Logo' className='user-cadastro-logo' src={logo} />
                                            </Col>
                                        </Row> */}
                                            <Row span={12}>
                                                {/* <Logo color="black" text="" /> */}

                                                <Link to="http://neuttron.com.br">  {/* Colocar o link da página inicial do site, para quando o usuário quiser retornar para o site basta clicar na logo */}
                                                    <Image src={Logo} preview={false} style={{ width: '120px' }} />
                                                </Link>
                                            </Row>
                                            <Title level={4} className='user-cadastro-title'>Fazer login</Title>

                                            {/* MENSAGEM DE ALERTA CASO RETORNE ERRO NO CADASTRO */}
                                            {alertMessage}

                                            <Divider />
                                            <Form
                                                name="normal_login"
                                                className="login-form"
                                                initialValues={{
                                                    remember: true,
                                                }}
                                                onFinish={handleSubmit}


                                            >
                                                <Form.Item
                                                    name="email"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: 'Por favor insira o seu e-mail!',
                                                        },
                                                        {
                                                            type: 'email',
                                                            message: 'E-mail Inválido!',
                                                        }
                                                    ]}
                                                >
                                                    <Input
                                                        size='large'
                                                        prefix={<UserOutlined className="site-form-item-icon" />}
                                                        placeholder="E-mail"
                                                        autoFocus
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}

                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    name="password"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: 'Por favor insira a sua senha!',
                                                        },
                                                    ]}
                                                >
                                                    <Input
                                                        size='large'
                                                        prefix={<LockOutlined className="site-form-item-icon" />}
                                                        type="password"
                                                        placeholder="Senha"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                </Form.Item>
                                                {/*
                                            <Form.Item>
                                                <Form.Item name="remember" valuePropName="checked" noStyle>
                                                    <Checkbox>Lembrar de mim</Checkbox>
                                                </Form.Item>

                                                <a className="login-form-forgot" href="">
                                                    Esqueci a senha
                                                </a>
                                            </Form.Item>
                                            */}
                                                <Form.Item>
                                                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                                        Entrar
                                                    </Button>
                                                </Form.Item>
                                            </Form>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={15} offset={5}>
                                            <Text>
                                                Não possui conta? Faça o <Link to="/cadastro">Cadastro.</Link>
                                            </Text>
                                        </Col>
                                    </Row>
                                </div>
                                {/* <FooterText /> */}
                            </Col>
                        </Row>
                    </div>
                </Content>
            </Layout>
        </ConfigProvider>
    )
};

export default Login;