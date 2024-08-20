import { Button } from 'antd';
import React, { useEffect } from 'react';
import './style.css';

const MercadoPagoButton = () => {
  useEffect(() => {
    const loadMercadoPagoScript = () => {
      if (window.$MPC_loaded !== true) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = document.location.protocol + "//secure.mlstatic.com/mptools/render.js";
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);
        window.$MPC_loaded = true;
      }
    };

    if (window.$MPC_loaded !== true) {
      if (window.attachEvent) {
        window.attachEvent('onload', loadMercadoPagoScript);
      } else {
        window.addEventListener('load', loadMercadoPagoScript, false);
      }
    }
  }, []);

  return (
    <Button 
        className="payment-button" 
        type="primary" 
        href={"https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c938084915406ae01916af385bf08de"}
        name="MP-payButton"
    >
      Assinar
    </Button>
  );
};

export default MercadoPagoButton;
