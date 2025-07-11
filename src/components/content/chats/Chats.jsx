import { Avatar, Badge, Button, Card, Col, Drawer, Grid, Input, Layout, List, Menu, Row, Skeleton, Space, Tabs, theme } from "antd";
import React, { useEffect, useState } from "react";
import Link from "antd/es/typography/Link";
import { Typography } from 'antd';
import { Can } from "../../../contexts/AbilityContext.jsx";
import { useAbility } from '../../../contexts/AbilityContext.jsx'
import { Outlet, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Sider from "antd/es/layout/Sider.js";
import axios from "axios";
import { MenuOutlined, MessageOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import './styles.css'
import InfiniteScroll from 'react-infinite-scroll-component';
import { formatTime } from "./formatNumbers.js";
import WhatsAppQRCode from "./QrCode.jsx";
import styled from "styled-components";
import NoConversations from "./NoConversations.jsx";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ItemList = styled.div`
  margin-bottom: 5px;
  transition: background-color 0.3s;
  border-radius: 5px;
  whiteSpace: 'nowrap';
  overflow: 'hidden';
  textOverflow: 'ellipsis';
  background-color: ${(props) => props.darkMode === true && props.selected === true ? "#0D0D0D" : props.darkMode === false && props.selected === true ? "#EDEDED" : ""};
  
  &:hover {
    background-color: ${(props) => props.darkMode === true && props.selected === true ? "#0A0A0A" : props.darkMode === true && props.selected === false ? "#101010" : props.darkMode === false && props.selected === true ? "#E0E0E0" : props.darkMode === false && props.selected === false ? "#f5f5f5" : ""}
  }
`;

function Chats({ socket }) {
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const apiConfig = {
        baseURL: import.meta.env.VITE_LINK_API,
        params: { page, limit: 10 },
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    };
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    // const org = pathParts[1]
    const localUser = localStorage.getItem("user");
    const user = JSON.parse(localUser);
    const { ability } = useAbility();
    const { darkMode } = useOutletContext();
    let navigate = useNavigate()

    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const { conversationId, org, module } = useParams();
    const [searchText, setSearchText] = useState("")
    const [selectedKey, setSelectedKey] = useState(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [usuario, setUsuario] = useState(false);
    const [conversationData, setConversationData] = useState([]);
    const { useBreakpoint } = Grid
    const screens = useBreakpoint();
    const isMobile = screens.xs
    const [open, setOpen] = useState(true);
    const showDrawer = () => setOpen(true);
    const closeDrawer = () => setOpen(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken()

    const fetchData = async () => {
        setLoading(true)
        const response = await axios.get(`/chat/${org}/conversations`, apiConfig);
        // const conversationsResponse = response.data.conversations[0]
        const { conversations, hasMore } = response.data;

        setConversations((prev) => [...prev, ...conversations]);
        setHasMore(hasMore);
        setPage((prevPage) => prevPage + 1);
        // setConversations(conversationsResponse)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
        if (isMobile) setOpen(true)
        socket.emit('identify', { orgId: org });
        socket.on('connection', () => {
            console.log("conectado!")
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
    }, [org]);

    useEffect(() => {
        setLoading(true)
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
                        last_message: message?.body,
                        updated_at: message?.updated_at
                    };

                    return [newConversation, ...updatedConversations]
                } else {
                    // Adiciona uma nova conversa
                    return [
                        {
                            id: message?.conversationId,
                            name: message?.senderName,
                            unread: 1,
                            last_message: message?.body,
                            updated_at: message?.updated_at
                        },
                        ...prevConversations,
                    ];
                }
            });
            setLoading(false)
        };
        const getConversationData = async () => {
            const conversationData = await axios.get(`/chat/${org}/conversation/${conversationId}`, {
                baseURL: import.meta.env.VITE_LINK_API,
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setConversationData(conversationData.data.data)
        }
        getConversationData()

        setSelectedKey(conversationId)
        setLoading(false)
        socket.on("newMessage", handleNewMessage);
    }, [conversationId, socket])

    const filteredConversations = conversations?.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );



    const handleSelect = (itemId) => {
        if (isMobile) closeDrawer()
        setSelectedKey(itemId)
        navigate(`/${org}/chats/${itemId}`)
    };

    const handleSetUsuario = () => {
        setUsuario(!usuario)
    }

    const ContentMessages = (
        <Col style={{ display: "flex", flexDirection: "column", alignItems: "center", }}>
            <div style={{ textAlign: "center", width: '100%' }}>
                <Tabs onChange={handleSetUsuario} defaultActiveKey="1" style={{ padding: '0 20px 0', marginBottom: "16px", width: '100%' }}>
                    <TabPane tab="Usuário" key="1">
                        <Avatar size={64} icon={<UserOutlined />} />
                        <Title level={4} style={{ marginTop: "8px" }}>
                            {user.name}
                        </Title>
                        <Text type="success">Disponível</Text>
                    </TabPane>
                    <TabPane tab="QR Code" key="2">
                        <WhatsAppQRCode />
                    </TabPane>
                </Tabs>
            </div>
            <div style={{ width: "90%" }}>
                <Input
                    prefix={<SearchOutlined />}
                    placeholder="Pesquisar..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ marginBottom: "16px", borderRadius: "8px", width: "100%" }}
                />
            </div>
            {filteredConversations?.length > 0 && (
                <div
                    id="scrollableDiv"
                    style={{
                        width: "100%",
                        maxHeight:
                            darkMode && usuario ? "calc(100vh - 484px)" : // É darkMode e está no usuário
                                darkMode && !usuario ? "calc(100vh - 305px)" : // É darkMode e está no qrCode
                                    !darkMode && usuario ? "calc(100vh - 484px)" :  // É claro e está no usuário
                                        !darkMode && !usuario ? "calc(100vh - 305px)" : // É claro e está no qrCode
                                            null,
                        overflow: 'auto',
                        padding: '0 16px',
                    }}
                    className='custom-scrollbar'
                >
                    <InfiniteScroll
                        dataLength={filteredConversations.length}
                        next={fetchData}
                        hasMore={hasMore}
                        loader={
                            <Skeleton
                                avatar
                                paragraph={{
                                    rows: 1,
                                }}
                                active
                            />
                        }
                        scrollableTarget="scrollableDiv"
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={filteredConversations}
                            renderItem={(item) => (
                                <ItemList className="itemList" darkMode={darkMode} selected={selectedKey === item.id}>

                                    <List.Item
                                        onClick={() => handleSelect(item.id)}
                                        actions={
                                            !loading ? [
                                                <Col>
                                                    {item.unread !== 0 && (
                                                        <Row>
                                                            <Space>
                                                                <MessageOutlined />
                                                                <Text>{item.unread}</Text>
                                                            </Space>
                                                        </Row>
                                                    )}
                                                    <Row>
                                                        <Text>{formatTime(item.updated_at)}</Text>
                                                    </Row>
                                                </Col>
                                            ] : undefined
                                        }
                                        style={{
                                            cursor: "pointer",
                                            padding: "10px 12px",
                                            borderRadius: 5,
                                            // backgroundColor: 
                                            //     selectedKey === item.id && darkMode ? "#101010" : 
                                            //     selectedKey === item.id && !darkMode ? "#f5f5f5" : 
                                            //     "transparent" 
                                        }}
                                    >
                                        <Skeleton avatar title={false} loading={loading} active>
                                            <List.Item.Meta
                                                avatar={<Avatar icon={<UserOutlined />} />}
                                                title={<Text ellipsis={{ tooltip: item.name }} strong>{item.name}</Text>}
                                                // title={<Text ellipsis={{ tooltip: conversationData.name }} strong>{conversationData.name}</Text>}
                                                description={<Text type="secondary" ellipsis={{ tooltip: item.last_message }}>{item.last_message || "Sem mensagens"}</Text>}
                                            />
                                        </Skeleton>
                                    </List.Item>
                                </ItemList>
                            )}
                        />
                    </InfiniteScroll>
                </div>
            )}
        </Col>
    )

    return (
        <Layout>
            {console.log("wseofhsuo", screens)}
            {screens.xs ?
                <Drawer
                    open={open}
                    title="Conversas"
                    onClose={closeDrawer}
                    placement="left"
                >
                    {ContentMessages}
                </Drawer>
                :
                <Sider width={"22%"} theme="light">
                    {ContentMessages}
                </Sider>
            }
            {conversationId ?
                <Outlet context={{ darkMode, showDrawer, isMobile }} />
                : (
                    <Layout
                        style={{
                            height: "calc(100vh - 79px)",
                            // backgroundImage: "url('/images/whats-dark-dark.PNG')",
                            backgroundColor: darkMode ? '#1A1A1A' : "#EDEDED",
                        }}
                    >
                        {isMobile ? (
                            <>
                                <Header style={{ maxHeight: '50px', backgroundColor: colorBgContainer, padding: "0 8px", alignContent: 'center' }}>
                                    <Button
                                        style={{ marginRight: 8 }}
                                        onClick={() => showDrawer()}
                                        type="text"
                                        icon={<MenuOutlined />}
                                    />
                                </Header>
                                <NoConversations />
                            </>
                        ) : (
                            <NoConversations />
                        )}
                    </Layout>
                )
            }
        </Layout>
    )
}

export default Chats