import React from "react";
// import "antd/dist/antd.css";
//import logo from "./logo.svg";
//import "./App.css";
import { Layout, Col, Row, Typography } from "antd";
import FieldRecord from "./fieldRecord";

const { Header, Content, Footer } = Layout;

function Fields() {
    const { Title } = Typography;
    
    return (
        <Layout className="layout">
            <Content style={{ background: "#fff", padding: "0 200px" }}>
                <div style={{ background: "#fff", minHeight: 280 }}>
                    {/* <img src={logo} className="App-logo" alt="logo" /> */}
                    <Row>
                        <Col span={24}>
                            <Title level={2} style={{ fontFamily: "'Montserrat', sans- serif", marginTop: "30px", textAlign: "center"}}>Adicionar Colunas</Title>
                        </Col>
                    </Row>
                    <FieldRecord />
                </div>
            </Content>
        </Layout>
    );
}

export default Fields;
