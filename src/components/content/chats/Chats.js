import { Badge, Button, Card, Col, Input, Layout, List, Menu, Row } from "antd";
import React, { useEffect, useState } from "react";
import Link from "antd/es/typography/Link";
import { Typography } from 'antd';
import { Can } from "../../../contexts/AbilityContext.js";
import { useAbility } from '../../../contexts/AbilityContext.js'
import { Outlet, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Sider from "antd/es/layout/Sider.js";
import axios from "axios";

const { Text } = Typography;

function Chats({ socket }) {
    const apiConfig = {
        baseURL: process.env.REACT_APP_LINK_API,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    };
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    const user = localStorage.getItem('user')
    const userName = JSON.parse(user)
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
            <Row gutter={16}>
                <Menu>
                    {conversations?.length > 0 ? (
                        conversations.map((item, index) => {
                            return (
                                // <Badge count={item.unread}>
                                    <Menu.Item
                                        key={item.id || index}
                                        style={{ marginBottom: 8 }}
                                        onClick={() => navigate(`/${org}/chats/${item.id}`)}
                                    >
                                        <Text>{item.name}</Text>
                                    </Menu.Item>
                                // </Badge> 
                            );
                        })
                    ) : (
                        <Menu.Item disabled>
                            <Text>No conversations available</Text>
                        </Menu.Item>
                    )}
                </Menu>
                <Outlet />
            </Row>
        </Layout>
    )
}

export default Chats