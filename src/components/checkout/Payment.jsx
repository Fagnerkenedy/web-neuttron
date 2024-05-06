import React, { useEffect, useState } from "react";
// import './index.css';
import axios from 'axios';
import classnames from 'classnames'
import { initMercadoPago } from "@mercadopago/sdk-react";
import { Wallet } from "@mercadopago/sdk-react";
import { Context } from "./ContextProvider";
import { Button } from "antd";

// REPLACE WITH YOUR PUBLIC KEY AVAILABLE IN: https://developers.mercadopago.com/panel
initMercadoPago(process.env.REACT_APP_PUBLIC_KEY_MERCADO_PAGO);

const Payment = () => {
  // const { preferenceId, orderData } = React.useContext(Context);
  const token = process.env.REACT_APP_USER_API_TOKEN
  const [preferenceId, setPreferenceId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState({ quantity: "1", price: "718.80", amount: 10, description: "Plano Profissional" });
  const paymentClass = classnames('payment-form dark', {
    'payment-form--hidden': !isReady,
  });

  useEffect(() => {
    setIsLoading(true);
    axios.post(`${process.env.REACT_APP_LINK_API}/payment/create_preference`, orderData, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((response) => {
        console.log("response data",response.data)
        setPreferenceId(response.data.id);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [])

  const handleOnReady = () => {
    setIsReady(true);
  }

  const renderCheckoutButton = (preferenceId) => {
    if (!preferenceId || isLoading) return null;
    console.log("wallety",preferenceId)
    return (
      <Button type="primary" href={`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`}>Pagar</Button>
    )
  }

  return (
    <div className={paymentClass}>
      <div className="container_payment">
        <div className="block-heading">
          <h2>Checkout Payment</h2>
          <p>This is an example of a Mercado Pago integration</p>
        </div>
        <div className="form-payment">
          <div className="products">
            <h2 className="title">Summary</h2>
            <div className="item">
              <span className="price" id="summary-price">R$ 718,80</span>
              <p className="item-name">
                Plano Profissional <span id="summary-quantity">1</span>
              </p>
            </div>
            <div className="total">
              Total
              <span className="price" id="summary-total">R$ 718,80</span>
            </div>
          </div>
          <div className="payment-details">
            <div className="form-group col-sm-12">
              {renderCheckoutButton(preferenceId)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
