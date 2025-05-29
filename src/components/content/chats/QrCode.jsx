import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Typography } from "antd";

const { Title, Text } = Typography;

const WhatsAppQRCode = () => {
  const phoneNumber = "554599750447"; // Número no formato internacional, sem "+"
  const message = "Olá, quero mais informações!";
  const encodedMessage = encodeURIComponent(message); // Codifica a mensagem para URL
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <div style={{ textAlign: "center", padding: "0 15px 15px" }}>
      <div>
        <Title style={{ margin: 0, paddingBottom: 15 }} level={4}>Escaneie o QR Code para falar no WhatsApp</Title>
        <QRCodeSVG value={whatsappLink} size={200} />
      </div>
      <div>
        <Text>
          Ou clique no link:{" "}
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            Abrir WhatsApp
          </a>
        </Text>
      </div>
    </div>
  );
};

export default WhatsAppQRCode;
