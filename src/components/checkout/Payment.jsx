import React, { useEffect, useState } from "react";
import axios from 'axios';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { Button, Col, Divider, Layout, Menu, Row, Select, Typography, theme } from "antd";
import './style.css';
import MercadoPagoButton from "./MercadoPagoButton";
import PayPalButton from "./PayPalButton.js";
const { Title, Text } = Typography;


const Payment = () => {
  const token = process.env.REACT_APP_USER_API_TOKEN;
  const [preferenceId, setPreferenceId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState({ quantity: "1", price: 479.04, amount: 479.04, description: "Plano Profissional Teste 1 Usuário" });
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [numberOfUsers, setNumberOfUsers] = useState(1);
  const [numberOfUsersMounth, setNumberOfUsersMounth] = useState(1);
  const [current, setCurrent] = useState('anual');

  useEffect(() => {
    axios.post(`${process.env.REACT_APP_LINK_API}/payment/create_preference`, orderData, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((response) => {
        console.log("response data", response.data)
        setPreferenceId(response.data.id);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
    initMercadoPago(process.env.REACT_APP_PUBLIC_KEY_MERCADO_PAGO, { locale: 'pt-BR' });
  }, []);

  // const renderCheckoutButton = (preferenceId) => {
  //   if (!preferenceId || isLoading) return null;
  //   return (
  //     <Button className="payment-button" type="primary" href={`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`}>Pagar</Button>
  //   );
  // };

  const valorAnual = 598.80
  const valorMensal = 49.90

  const valorTotal = numberOfUsers * valorAnual;
  const valorTotalMounth = numberOfUsersMounth * valorMensal;

  const formatValue = (value) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  const valorFormatado = formatValue(valorTotal)

  const valorDesconto = (valorTotal * 0.2).toFixed(2)

  const valorFormatadoDesconto = formatValue(valorTotal * 0.2)

  const valorTotalEDesconto = parseFloat((valorTotal - valorDesconto).toFixed(2))

  const valorTotalFormatado = formatValue(valorTotalEDesconto)

  const valorFormatadoMounth = formatValue(valorTotalMounth)

  const handleMenu = (e) => {
    setCurrent(e.key)
  }

  return (
    <Layout className="payment-container">
      <Col
        style={{
          background: colorBgContainer
        }}
        className="payment-content"
      >
        <Col className="payment-heading">
          <Title className="titleH2" level={2}>Checkout de Pagamento</Title>
        </Col>
        <Row justify="center">
          <Text>Obtenha um desconto de 20% na assinatura anual</Text>
        </Row>
        <Menu onClick={handleMenu} mode="horizontal" selectedKeys={[current]}
          items={
            [
              {
                label: 'Anual',
                key: 'anual',
                // icon: <MailOutlined />,
                style: { width: '50%', textAlign: 'center' },
              },
              {
                label: 'Mensal',
                key: 'mensal',
                // icon: <AppstoreOutlined />,
                style: { width: '50%', textAlign: 'center' },
                disabled: false,
              },
            ]
          }
        >
        </Menu>
        {current == "anual" && (

          <Col className="payment-form">
            <Col className="payment-summary">
              <Title level={3} className="summary-title">Plano Anual</Title>
              <Text>Quantidade de usuários:</Text>
              <Select
                className="select"
                style={{ marginLeft: 15 }}
                value={numberOfUsers}
                onChange={(value) => setNumberOfUsers(value)}
                options={
                  [
                    {
                      value: 1,
                      label: 1,
                    },
                    {
                      value: 2,
                      label: 2,
                    },
                    // {
                    //   value: 3,
                    //   label: 3,
                    // },
                    // {
                    //   value: 4,
                    //   label: 4,
                    // },
                    // {
                    //   value: 5,
                    //   label: 5,
                    // }
                  ]
                }
              >
              </Select>

              <Divider />

              <Col className="item">
                <Text className="price1"><span className="quantity">{numberOfUsers} Usuário(s) x </span>{formatValue(valorAnual)}</Text>
                <Text className="item-name">
                  Plano Profissional
                </Text>
              </Col>

              <Divider />

              <Col className="valor">
                <Text>Subtotal</Text>
                <Text className="price">{valorFormatado}</Text>
              </Col>

              <Col className="desconto">
                <Text style={{ color: 'green' }}>Desconto (20%)</Text>
                <Text className="item-discount">{valorFormatadoDesconto}</Text>
              </Col>

              <Col className="total">
                <Text className="textTotal">Total</Text>
                <Text className="priceTotal">{valorTotalFormatado} / Ano</Text>
              </Col>

            </Col>
            <div className="payment-details">
              {/* <div>
              {renderCheckoutButton(preferenceId)}
            </div> */}
              <MercadoPagoButton plan={current} users={numberOfUsers} usersMounth={numberOfUsersMounth} preferenceId={preferenceId} />
              <Wallet initialization={{preferenceId: preferenceId}} />
              <PayPalButton />
            </div>
          </Col>
        )}
        {current == "mensal" && (

          <Col className="payment-form">
            <Col className="payment-summary">
              <Title level={3} className="summary-title">Plano Mensal</Title>
              <Text>Quantidade de usuários: </Text>
              <Select
                className="select"
                style={{ marginLeft: 15 }}
                value={numberOfUsersMounth}
                onChange={(value) => setNumberOfUsersMounth(value)}
                options={
                  [
                    {
                      value: 1,
                      label: 1,
                    },
                    {
                      value: 2,
                      label: 2,
                    },
                    {
                      value: 3,
                      label: 3,
                    },
                    {
                      value: 4,
                      label: 4,
                    },
                    {
                      value: 5,
                      label: 5,
                    },
                    {
                      value: 6,
                      label: 6,
                    },
                    {
                      value: 7,
                      label: 7,
                    },
                    {
                      value: 8,
                      label: 8,
                    },
                    {
                      value: 9,
                      label: 9,
                    },
                    {
                      value: 10,
                      label: 10,
                    }
                  ]
                }
              >
              </Select>
              <Divider />
              <Col className="item">
                <Text className="price1"><span className="quantity">{numberOfUsersMounth} Usuário(s) X </span>{formatValue(valorMensal)}</Text>
                <Text className="item-name">
                  Plano Profissional
                </Text>
              </Col>
              <Divider />
              <Col className="total">
                <Text className="textTotal">Total</Text>
                <Text className="priceTotal">{valorFormatadoMounth} / Mês</Text>
              </Col>
            </Col>
            <div className="payment-details">
              {/* <div>
              {renderCheckoutButton(preferenceId)}
            </div> */}
              <MercadoPagoButton plan={current} users={numberOfUsers} usersMounth={numberOfUsersMounth} preferenceId={preferenceId} />
            </div>
          </Col>
        )}
      </Col>
    </Layout>
  );
};

export default Payment;
