import React from 'react';
import { Col, Typography } from "antd";
const { Title } = Typography;

const Logo = ({fontSize, color, text}) => {
    return (
        <Col>
            <span>
                <Title style={{ margin: 0, fontWeight: 'bold', color: "#0267C1", fontFamily: "Poppins", fontSize: fontSize }}>N</Title>
            </span>
            {/* <span>
                <Title style={{ fontWeight: 'bold', color: color, fontFamily: "Poppins", fontSize: fontSize }}>{text}</Title>
            </span> */}
        </Col>
    )
}

export default Logo