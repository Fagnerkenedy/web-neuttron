import React, { useEffect } from "react";

const PayPalButton = () => {
  useEffect(() => {
    // Dynamically load the PayPal SDK script
    const script = document.createElement("script");
    script.src = "https://www.paypal.com/sdk/js?client-id=AZn3z9X_oCrE3eGT48Vw9ibAyQUu8GPUjd6oXNVxo9BQxIr8e6hr3famiqSHPDmmHNuL8gR5RVfKtaUe&vault=true&intent=subscription";
    script.type = "text/javascript";
    script.async = true;
    script.setAttribute("data-sdk-integration-source", "button-factory");

    script.onload = () => {
      // Initialize PayPal Buttons after script loads
      if (window.paypal) {
        window.paypal.Buttons({
          style: {
            shape: "rect",
            color: "silver",
            layout: "vertical",
            label: "subscribe",
          },
          createSubscription: (data, actions) => {
            return actions.subscription.create({
              plan_id: "P-1J907496HP682884RM47DQGY",
              quantity: 1,
            });
          },
          onApprove: (data) => {
            alert(`Subscription ID: ${data.subscriptionID}`);
          },
        }).render("#paypal-button-container");
      }
    };

    document.body.appendChild(script);

    // Cleanup script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="paypal-button-container"></div>;
};

export default PayPalButton;
