import { Button, Card, Col, Input, Layout, List, Row } from "antd";
import React, { useEffect, useState } from "react";
import Link from "antd/es/typography/Link";
import { Typography } from 'antd';
import { Can } from "../../../contexts/AbilityContext.js";
import { useAbility } from '../../../contexts/AbilityContext.js'
import { useOutletContext } from 'react-router-dom';
import Sider from "antd/es/layout/Sider.js";
import axios from "axios";

const { Text } = Typography;

function Chats() {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    const user = localStorage.getItem('user')
    const userName = JSON.parse(user)
    const { ability, loading } = useAbility();
    const { darkMode } = useOutletContext();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const sendMessage = async () => {
        if (input) {
            const newMessage = { from: 'Me', body: input };
            setMessages((prev) => [...prev, newMessage]);

            try {
                const response = await axios.post(`${process.env.REACT_APP_LINK_API}/chat/send-message`, {
                    numberId: '537389792787824',
                    // to: '5545999792202',
                    to: '5545988057396',
                    message: input,
                });
                console.log('Mensagem enviada:', response.data);
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
            }

            setInput('');
        }
    };

    return (
        <Layout style={{ padding: '15px 15px 0 15px' }}>
            <Row gutter={16}>
                <Sider>
                    Teste
                </Sider>
                <Layout>
                    <List
                        bordered
                        dataSource={messages}
                        renderItem={(item) => (
                            <List.Item>
                                <b>{item.from}:</b> {item.body}
                            </List.Item>
                        )}
                        style={{ marginBottom: '10px', maxHeight: '400px', overflowY: 'auto' }}
                    />
                    <Input
                        placeholder="Digite sua mensagem..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onPressEnter={sendMessage}
                        addonAfter={<Button type="primary" onClick={sendMessage}>Enviar</Button>}
                    />
                </Layout>
            </Row>
        </Layout>
    )
}

export default Chats