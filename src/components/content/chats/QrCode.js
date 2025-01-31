import React from "react";
import { QRCodeSVG } from "qrcode.react";

const WhatsAppQRCode = () => {
  const phoneNumber = "554599750447"; // Número no formato internacional, sem "+"
  const message = "Olá, quero mais informações!";
  const encodedMessage = encodeURIComponent(message); // Codifica a mensagem para URL
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Escaneie o QR Code para falar no WhatsApp</h2>
      <QRCodeSVG value={whatsappLink} size={200} />
      <p>
        Ou clique no link:{" "}
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
          Abrir WhatsApp
        </a>
      </p>
    </div>
  );
};

export default WhatsAppQRCode;
