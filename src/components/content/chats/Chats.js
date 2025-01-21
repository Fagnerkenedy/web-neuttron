import { Avatar, Badge, Button, Card, Col, Input, Layout, List, Menu, Row, Space } from "antd";
import React, { useEffect, useState } from "react";
import Link from "antd/es/typography/Link";
import { Typography } from 'antd';
import { Can } from "../../../contexts/AbilityContext.js";
import { useAbility } from '../../../contexts/AbilityContext.js'
import { Outlet, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Sider from "antd/es/layout/Sider.js";
import axios from "axios";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function Chats({ socket }) {
    const apiConfig = {
        baseURL: process.env.REACT_APP_LINK_API,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    };
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    const localUser = localStorage.getItem("user");
    const user = JSON.parse(localUser);
    const { ability, loading } = useAbility();
    const { darkMode } = useOutletContext();
    let navigate = useNavigate()

    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const { conversationId } = useParams();

    const fetchData = async () => {
        const response = await axios.get(`/chat/${org}/conversations`, apiConfig);
        const conversationsResponse = response.data.conversations[0]

        setConversations(conversationsResponse)
        console.log("conversarioin:", conversations)
    }

    useEffect(() => {
        fetchData()
        socket.emit('identify', { orgId: org });
        socket.on('connection', () => {
            console.log("conectadsdfsdo!")
        });
        socket.on('disconnect', () => {
            console.log("desconectado!")
        });
        socket.on('message', data => {
            console.log("mensagem!")
        });
        socket.on('error', (error) => {
            console.error("Erro na conexão:", error);
        });
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('message');
            socket.off('error');
        };
    }, []);

    useEffect(() => {
        const handleNewMessage = (message) => {
            setConversations((prevConversations) => {
                const existingConversation = prevConversations.find(
                    (conversation) => conversation.id === message?.conversationId
                );
                const updatedConversations = prevConversations.filter(
                    (conversation) => conversation.id !== message?.conversationId
                );

                if (existingConversation) {
                    // Atualiza a conversa existente
                    const newConversation = {
                        id: message.conversationId,
                        name: message?.senderName,
                        unread: 1,
                    };

                    return [newConversation, ...updatedConversations]
                } else {
                    // Adiciona uma nova conversa
                    return [
                        {
                            id: message?.conversationId,
                            name: message?.senderName,
                            unread: 1,
                        },
                        ...prevConversations,
                    ];
                }
            });
        };


        socket.on("newMessage", handleNewMessage);
    }, [conversationId, socket])

    return (
        <Layout style={{ padding: '15px 15px 0 15px' }}>
            <Col span={5}>
                <Sider width={'100%'} theme="light" style={{ height:'100%', borderRight: "1px solid #f0f0f0" }}>
                    <div style={{ padding: "16px", textAlign: "center" }}>
                        <Avatar size={64} icon={<UserOutlined />} />
                        <Title level={4} style={{ marginTop: "8px" }}>
                            {user.name}
                        </Title>
                        <Text type="success">Available</Text>
                    </div>
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="Search..."
                        style={{ marginBottom: "16px", borderRadius: "8px", marginLeft: 15, marginRight: 15, width: "90%" }}
                    />
                    <Menu>
                        {conversations?.length > 0 ? (
                            conversations.map((item) => (

                                <Menu.Item
                                    key={item.id}
                                    onClick={() => navigate(`/${org}/chats/${item.id}`)}
                                >
                                    {/* <Badge count={item.unread}> */}
                                    <Avatar icon={<UserOutlined />} style={{ marginRight: "8px" }} />
                                    <span>{item.name}</span>
                                    {/* </Badge> */}
                                </Menu.Item>
                            ))
                        ) : (
                            <Text>Nenhuma conversa disponível</Text>
                        )}
                    </Menu>
                </Sider>
            </Col>
            <Col span={19}>
                {conversationId ? <Outlet /> : (
                    <Content
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                        }}
                    >
                        <Space direction="vertical" align="center">
                            <Typography.Title level={4}>
                                Nenhuma conversa selecionada
                            </Typography.Title>
                            <Typography.Text>
                                Por favor, selecione uma conversa à esquerda para visualizar os
                                detalhes.
                            </Typography.Text>
                        </Space>
                    </Content>
                )}
            </Col>
        </Layout>
    )
}

export default Chats