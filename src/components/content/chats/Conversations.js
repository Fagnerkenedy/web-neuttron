import { Button, Input, Layout, List, Typography, Card, Avatar, Space, Tabs, Col } from "antd";
import { UserOutlined, SendOutlined, SearchOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
// import "./Chat.css"; // Adicione estilos personalizados aqui

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Conversations = ({ socket }) => {
    const apiConfig = {
        baseURL: process.env.REACT_APP_LINK_API,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    };
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split("/");
    const org = pathParts[1];
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [chatList, setChatList] = useState([]);
    const { conversationId } = useParams();
    const localUser = localStorage.getItem("user");
    const user = JSON.parse(localUser);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); // Rola suavemente para o final
        }
    };

    const fetchConversation = async () => {
        const response = await axios.get(`/chat/${org}/messages/${conversationId}`, apiConfig);
        const conversationResponse = response.data.conversation[0];
        scrollToBottom();
        setMessages(conversationResponse);
        console.log("messagensss:", messages)
    };

    useEffect(() => {
        if (conversationId) {
            fetchConversation();
            scrollToBottom()
        }
    }, [conversationId]);

    useEffect(() => {
        const handleNewMessage = (message) => {
            const newMessage = {
                senderName: message?.senderName || "Unknown",
                body: message?.body || "",
            };

            if (message?.conversationId === conversationId) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                scrollToBottom()
            }
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [conversationId, socket]);

    const sendMessage = async () => {
        if (input) {
            const newMessage = { senderName: user.name, body: input };
            setMessages((prev) => [...prev, newMessage]);

            console.log("para: ", messages[0]?.contactNumber)
            try {
                await axios.post(`${process.env.REACT_APP_LINK_API}/chat/${org}/send-message`, {
                    numberId: "537389792787824",
                    to: messages[0]?.contactNumber,
                    message: input,
                    conversationId,
                    userName: user.name,
                    userId: user.id,
                });
            } catch (error) {
                console.error("Erro ao enviar mensagem:", error);
            }

            setInput("");
            scrollToBottom()
        }
    };

    return (
        <Layout style={{ height: "calc(100vh - 92px)" }}>
            {/* Main Chat Area */}
            <Header style={{ backgroundColor: "#fff", padding: "0 16px", borderBottom: "1px solid #f0f0f0", alignContent: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>
                    {messages[0]?.senderName}
                </Title>
            </Header>
            <Content style={{ width: '100%', padding: "16px", display: "flex", flexDirection: "column" }}>
                <Tabs defaultActiveKey="1" style={{ marginBottom: "16px" }}>
                    <TabPane tab="Messages" key="1" />
                    <TabPane tab="Participants" key="2" />
                </Tabs>

                <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px", paddingRight: 16 }}>
                    <List
                        dataSource={messages}
                        renderItem={(item) => {
                            const isMyMessage = item.senderName === user.name
                            return (
                                <List.Item
                                    style={{
                                        display: "flex",
                                        justifyContent: isMyMessage ? "flex-end" : "flex-start", // Define o alinhamento
                                    }}
                                >
                                    <Card
                                        style={{
                                            borderRadius: "8px",
                                            backgroundColor: isMyMessage ? "#e6f7ff" : "#ffffff", // Cor diferente para suas mensagens
                                            maxWidth: "70%", // Limita o tamanho da mensagem
                                        }}
                                    >
                                        <Space direction="vertical" size={0}>
                                            {!isMyMessage && <Text strong>{item.senderName}</Text>}
                                            <Text>{item.body}</Text>
                                        </Space>
                                    </Card>
                                </List.Item>
                            )
                        }}
                    />
                    <div ref={messagesEndRef} />
                </div>

                <Col style={{ width: '100%', display: "flex", alignItems: "center" }}>
                    <Input
                        placeholder="Escreva sua mensagem..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onPressEnter={sendMessage}
                        style={{ borderRadius: "20px", flex: 1, width: '100%' }}
                    />
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<SendOutlined />}
                        onClick={sendMessage}
                    />
                </Col>
            </Content>
        </Layout>
    );
};

export default Conversations;
