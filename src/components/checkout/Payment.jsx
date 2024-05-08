import React, { useEffect, useState } from "react";
import axios from 'axios';
import { initMercadoPago } from "@mercadopago/sdk-react";
import { Button, Col, Divider, Layout, Typography, theme } from "antd";
import './style.css';
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

  const renderCheckoutButton = (preferenceId) => {
    if (!preferenceId || isLoading) return null;
    return (
      <Button className="payment-button" type="primary" href={`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`}>Pagar</Button>
    );
  };

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
            <Divider />
            <Col className="item">
              <Text className="price1">R$ 718,80</Text>
              <Text className="item-name">
                Plano Profissional <span className="quantity">x 1 Usuário</span>
              </Text>
            </Col>
            <Divider />
            <Col className="total">
              <Text>Total</Text>
              <Text className="price">R$ 718,80</Text>
            </Col>
          </Col>
          <div className="payment-details">
            <div>
              {renderCheckoutButton(preferenceId)}
            </div>
          </div>
        </Col>
      </Col>
    </Layout>
  );
};

export default Payment;
