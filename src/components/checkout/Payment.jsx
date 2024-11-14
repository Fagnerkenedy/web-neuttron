import React, { useEffect, useState } from "react";
import axios from 'axios';
import { initMercadoPago } from "@mercadopago/sdk-react";
import { Button, Col, Divider, Layout, Select, Typography, theme } from "antd";
import './style.css';
import MercadoPagoButton from "./MercadoPagoButton";
const { Title, Text } = Typography;

initMercadoPago(process.env.REACT_APP_PUBLIC_KEY_MERCADO_PAGO);

const Payment = () => {
  const token = process.env.REACT_APP_USER_API_TOKEN;
  const [preferenceId, setPreferenceId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState({ quantity: "1", price: "718.80", amount: 10, description: "Plano Profissional" });
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [numberOfUsers, setNumberOfUsers] = useState(1);
  
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
  }, []);

  // const renderCheckoutButton = (preferenceId) => {
  //   if (!preferenceId || isLoading) return null;
  //   return (
  //     <Button className="payment-button" type="primary" href={`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`}>Pagar</Button>
  //   );
  // };

  const valorTotal = numberOfUsers * 478.80;

  const valorFormatado = valorTotal.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return (
    <Layout className="payment-container">
      <Col style={{
        background: colorBgContainer
      }} 
      className="payment-content">
        <Col className="payment-heading">
          <Title className="titleH2" level={2}>Checkout de Pagamento</Title>
          {/* <Title className="titleH3" level={3}>Este é um exemplo de integração do Mercado Pago</Title> */}
        </Col>
        <Col className="payment-form">
          <Col className="payment-summary">
            <Title level={3} className="summary-title">Resumo</Title>
            <Text>Quantidade de usuários: </Text>
            <Select
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
                  },
                  {
                    value: 11,
                    label: 11,
                  },
                  {
                    value: 12,
                    label: 12,
                  },
                  {
                    value: 13,
                    label: 13,
                  },
                  {
                    value: 14,
                    label: 14,
                  },
                  {
                    value: 15,
                    label: 15,
                  },
                  {
                    value: 16,
                    label: 16,
                  },
                  {
                    value: 17,
                    label: 17,
                  },
                  {
                    value: 18,
                    label: 18,
                  },
                  {
                    value: 19,
                    label: 19,
                  },
                  {
                    value: 20,
                    label: 20,
                  },
                  {
                    value: 21,
                    label: 21,
                  },
                  {
                    value: 22,
                    label: 22,
                  },
                  {
                    value: 23,
                    label: 23,
                  },
                  {
                    value: 24,
                    label: 24,
                  },
                  {
                    value: 25,
                    label: 25,
                  },
                  {
                    value: 26,
                    label: 26,
                  },
                  {
                    value: 27,
                    label: 27,
                  },
                  {
                    value: 28,
                    label: 28,
                  },
                  {
                    value: 29,
                    label: 29,
                  },
                  {
                    value: 30,
                    label: 30,
                  },
                  {
                    value: 31,
                    label: 31,
                  },
                  {
                    value: 32,
                    label: 32,
                  },
                  {
                    value: 33,
                    label: 33,
                  },
                  {
                    value: 34,
                    label: 34,
                  },
                  {
                    value: 35,
                    label: 35,
                  },
                  {
                    value: 36,
                    label: 36,
                  },
                  {
                    value: 37,
                    label: 37,
                  },
                  {
                    value: 38,
                    label: 38,
                  },
                  {
                    value: 39,
                    label: 39,
                  },
                  {
                    value: 40,
                    label: 40,
                  },
                  {
                    value: 41,
                    label: 41,
                  },
                  {
                    value: 42,
                    label: 42,
                  },
                  {
                    value: 43,
                    label: 43,
                  },
                  {
                    value: 44,
                    label: 44,
                  },
                  {
                    value: 45,
                    label: 45,
                  },
                  {
                    value: 46,
                    label: 46,
                  },
                  {
                    value: 47,
                    label: 47,
                  },
                  {
                    value: 48,
                    label: 48,
                  },
                  {
                    value: 49,
                    label: 49,
                  },
                  {
                    value: 50,
                    label: 50,
                  }
                ]
              }
            >
            </Select>
            <Divider />
            <Col className="item">
              <Text className="price1">{valorFormatado}</Text>
              <Text className="item-name">
                Plano Profissional <span className="quantity">x {numberOfUsers} Usuário(s) cobrado anualmente</span>
              </Text>
            </Col>
            <Divider />
            <Col className="total">
              <Text>Total</Text>
              <Text className="price">{valorFormatado}</Text>
            </Col>
          </Col>
          <div className="payment-details">
            {/* <div>
              {renderCheckoutButton(preferenceId)}
            </div> */}
            <MercadoPagoButton />
          </div>
        </Col>
      </Col>
    </Layout>
  );
};

export default Payment;
