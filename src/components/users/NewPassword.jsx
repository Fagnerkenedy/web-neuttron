import { Alert, Button, Col, ConfigProvider, Divider, Form, Input, Layout, Result, Row, theme, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import userApiURI from '../../Utility/userApiURI'
import Loading from '../utils/Loading';
import { Content } from 'antd/es/layout/layout';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { PasswordInput } from 'antd-password-input-strength';
import Paragraph from 'antd/es/typography/Paragraph';
const { Title, Text } = Typography;

function ConfirmedEmail() {
  const { uuid } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [msgRetorno, setMsgRetorno] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [cadastrado, setCadastrado] = useState(false);
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const org = pathParts[1];
  const record_id = pathParts[4];

  useEffect(() => {
    const data = { uuid: uuid };
    setLoading(true);
    userApiURI.userConfirmation(data).then((response) => {
      if (response.status === 200 && response.data.success === true) {
        setMsgRetorno(<Result status="success" title="E-mail confirmado com sucesso!" subTitle="A plataforma te espera! Seja bem vindo(a)!" extra={<Link to='/login'><Button type="primary">Login</Button></Link>} />)
        setLoading(false)
      } else if (response.status === 200 && response.data.success === false && response.data.message === 'user_already_confirmed') {
        setMsgRetorno(<Result status="error" title="Erro ao confirmar o Cadastro!" subTitle="Seu cadastro já foi confirmado anteriormente!" extra={<Link to='/login'><Button type="primary">Login</Button></Link>} />)
        setLoading(false)
      } else if (response.status === 200 && response.data.success === false && response.data.message === 'user_not_found') {
        setMsgRetorno(<Result status="error" title="Houve um erro ao confirmar o cadastro!" subTitle="O usuário não foi encontrado no sistema!" extra={<Link to='/cadastro'><Button type="primary">Cadastre-se</Button></Link>} />)
        setLoading(false)
      } else {
        setMsgRetorno(<Result status="error" title="Houve um erro ao confirmar o cadastro!" subTitle="Entre em contato com o Suporte!" extra={<Link to='/login'><Button type="primary">Login</Button></Link>} />)
        setLoading(false)
      }
    })

  }, [uuid])

  const onFinish = async (values) => {
    setLoading(true)

    try {
      const result = await userApiURI.registerPassword(values, record_id, org)
      if (result.status === 400) {
        setAlertMessage(<Alert message="OPS! Houve um erro ao cadastrar a senha" description="Falha na comunicação com o Servidor! Por favor entre em contato com o Suporte." type="error" showIcon />)

      } else if (result.status === 200 && result.data.success === false) {
        setAlertMessage(<Alert message="OPS! Houve um erro ao cadastrar a senha" description="O E-mail informado já está cadastrado no sistema." type="error" showIcon />)
        setLoading(false)
      } else {
        setCadastrado(true)
      }
      setLoading(false)
    } catch (error) {
      setAlertMessage(<Alert message="OPS! Houve um erro ao cadastrar" description="Falha na comunicação com o Servidor! Por favor entre em contato com o Suporte." type="error" showIcon />)
      console.log('Erro ao tentar cadastrar', error)
      setLoading(false)
    }
  };

  if (loading) {
    return (<Loading />)
  }

  const validateMessages = {
    required: 'Campo obrigatório!',
  };

  if (cadastrado) {
    return (
      <Result
        // icon={<SmileOutlined />}
        title="Senha cadastrada com sucesso!"
        subTitle={
          <>
            <Paragraph style={{ textAlign: 'center' }}>
              Realize o login abaixo com o seu email e senha cadastrada.
            </Paragraph>
          </>
        }
        extra={<Link to='/login'><Button type="primary">Login</Button></Link>}
      />
    )
  }

  {/* {msgRetorno} */ }
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
                sm={{ span: 16, offset: 4 }}
                md={{ span: 12, offset: 6 }}
                lg={{ span: 10, offset: 7 }}
                xl={{ span: 6, offset: 9 }}
                xxl={{ span: 4, offset: 10 }}>
                <div className='user-content-cadastro'>
                  <Row>
                    <Col span={20} offset={2}>
                      <Title level={4} className='user-cadastro-title'>Cadastre sua nova senha</Title>
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
                                return Promise.reject(new Error('As senhas não são iguais!'));
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
                          <Button type="text" htmlType="submit" className="login-form-button cad-button">
                            Salvar
                          </Button>
                        </Form.Item>
                      </Form>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  )
};

export default ConfirmedEmail;