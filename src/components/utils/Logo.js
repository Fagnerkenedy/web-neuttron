import React from 'react';
import { Typography } from "antd";
const { Title, Text } = Typography;

const Logo = ({fontSize, color, text}) => {
    return (
        <>
            <span>
                <Title style={{ fontWeight: 'bold', color: "#0267C1", fontFamily: "Poppins", fontSize: fontSize }}>N</Title>
            </span>
            <span>
                <Title style={{ fontWeight: 'bold', color: color, fontFamily: "Poppins", fontSize: fontSize }}>euttron {text}</Title>
            </span>
        </>
    )
}

export default Logo