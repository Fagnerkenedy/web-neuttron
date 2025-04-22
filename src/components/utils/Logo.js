import React from 'react';
import { Typography } from "antd";
const { Title } = Typography;

const Logo = ({fontSize, color, text}) => {
    return (
        <>
            <span>
                <Title style={{ fontWeight: 'bold', color: "#0267C1", fontFamily: "Poppins", fontSize: fontSize }}></Title>
            </span>
            <span>
                <Title style={{ fontWeight: 'bold', color: color, fontFamily: "Poppins", fontSize: fontSize }}>CRM {text}</Title>
            </span>
        </>
    )
}

export default Logo