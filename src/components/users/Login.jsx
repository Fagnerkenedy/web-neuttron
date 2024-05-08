import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Row, Col, Button, Form, Input, Typography, Divider, Image } from 'antd';
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import './styles.css'
// import logo from '../../img/logo.jpeg';
import FooterText from '../utils/FooterText';
import AuthContext from '../../contexts/auth';
import Loading from '../utils/Loading';
import Logo from './logo-neuttron-jpg.jpg';

const { Content } = Layout;
const { Title, Text } = Typography;

const Login = () => {
    const { login, loading, alertMessage } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleSubmit = (e) => {
        const data = { email, password }

        login(data); // Integração com o Context / API
    }

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <Layout className="layout">
            <Content>
                <div className='user-row-cadastro'>
                    <Row>
                        <Col xs={{ span: 20, offset: 2 }}
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
                                                <Image src={Logo} preview={false} style={{ width: '120px', paddingTop: '8px' }} />
                                            </Link>
                                        </Row>
                                        <Title level={4} className='user-cadastro-title'>Informe os dados de acesso</Title>

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
                                                    },
                                                    {
                                                        type: 'email',
                                                        message: 'E-mail Inválido!',
                                                    }
                                                ]}
                                            >
                                                <Input
                                                    // size='large'
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
                                                        message: 'Please input your Password!',
                                                    },
                                                ]}
                                            >
                                                <Input
                                                    // size='large'
                                                    prefix={<LockOutlined className="site-form-item-icon" />}
                                                    type="password"
                                                    placeholder="Password"
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
                                                <Button type="primary" htmlType="submit" className="login-form-button cad-button">
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
                            <FooterText />
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>
    )
};

export default Login;