import { Button } from 'antd';
import React, { useEffect } from 'react';
import './style.css';

const MercadoPagoButton = ({ plan, users, usersMounth }) => {
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

  const getPaymentLink = () => {
    if (plan === "anual") {
      switch (users) {
        case 1: return "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c938084915406ae01916af385bf08de";
        // case 2: return "https://link-anual-2usuarios";
        // case 3: return "https://link-anual-3usuarios";
        // case 4: return "https://link-anual-4usuarios";
        // case 5: return "https://link-anual-5usuarios";
        default: return "";
      }
    } else if (plan === "mensal") {
      switch (usersMounth) {
        case 1: return "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c938084930f5298019321e5066005a4";
        case 2: return "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380849323ec5801932db0dc910449";
        case 3: return "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380849319a00d01932db38ca2080c";
        case 4: return "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c938084930f529801932db464c10a68";
        case 5: return "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380849319a00d01932db54f0c080e";
        case 6: return "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380849319a00d01932db79b6e080f";
        case 7: return "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c938084930f529801932dbd99e20a6b";
        case 8: return "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380849319a00d01932dbe68ac0812";
        case 9: return "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380849319a00d01932dbf49e70813";
        case 10: return "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380849319a00d01932dc080ad0814";
        default: return "";
      }
    }
    return "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c938084915406ae01916af385bf08de";
  };

  return (
    <a href={getPaymentLink()} rel="noopener noreferrer">
      <Button
        className="payment-button"
        type="primary"
        name="MP-payButton"
      >
        Assinar
      </Button>
    </a>
  );
};

export default MercadoPagoButton;
