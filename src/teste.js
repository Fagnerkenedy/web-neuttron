

// let id = '42931815-db1b-41e7-95b9-365a82d7c1e5'

const dayjs = require("dayjs");

// let idString = id.toString()

// console.log("idString: ",idString)

// let item_preco_unitario = "214,7"

// let precoArray = item_preco_unitario.split(",", 2)
// let casaDecimal = precoArray[1]
// if(casaDecimal.length == 1) {
//     item_preco_unitario = item_preco_unitario + "0"
// }

// console.log("item_preco_unitario final: ", item_preco_unitario)

console.log("valor vazio",dayjs(""))

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


import { Button, Input, Layout, List, Typography, Card, Avatar, Space, Tabs, Col, Skeleton, Divider } from "antd";
import { UserOutlined, SendOutlined, SearchOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
// import "./Chat.css"; // Adicione estilos personalizados aqui

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Conversations = ({ socket }) => {
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
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
    // const [messagesByConversation, setMessagesByConversation] = useState({});
    // const currentMessages = messagesByConversation[conversationId] || [];
    // const [paginationByConversation, setPaginationByConversation] = useState({});
    // const [hasMoreByConversation, setHasMoreByConversation] = useState({});

    const scrollToBottom = () => {
        // if (messagesEndRef.current) {
        //     messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); // Rola suavemente para o final
        // }
        const scrollableDiv = document.getElementById("scrollableDivMessages");
        if (scrollableDiv) {
            scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
        }
    };

    const requestApi = async () => {
        const response = await axios.get(`/chat/${org}/messages/${conversationId}`, {
            baseURL: process.env.REACT_APP_LINK_API,
            params: { page: page, limit: 10 },
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const conversation = response.data.conversation
        const hasMore = response.data.hasMore
        console.log("conversaton: ",conversation)
        console.log("hasMore: ",hasMore)
        return conversation, hasMore
    }
    
    const fetchConversation = async () => {
        // if (!hasMoreByConversation[conversationId]) return;
        
        const scrollableDiv = document.getElementById("scrollableDivMessages");
        const previousScrollHeight = scrollableDiv.scrollHeight;
        // const currentPage = paginationByConversation[conversationId] || 1
        
        // const conversationResponse = response.data.conversation;
        
        const { conversation, hasMore } = await requestApi()
        
        console.log("conversaton 2: ",conversation)
        setMessages((prev) => [...prev, ...conversation]);
        setHasMore(hasMore)
        
        // setMessagesByConversation((prev) => ({
        //     ...prev,
        //     [conversationId]: [...(prev[conversationId] || []), ...conversation],
        // }));
        // setHasMoreByConversation((prev) => ({
        //     ...prev,
        //     [conversationId]: hasMore,
        // }));
        // console.log("hasMore? ", hasMore)
        // console.log("hasMoreByConversation[conversationId]: ", hasMoreByConversation)
        // console.log("hasMoreByConversation[conversationId]: ", hasMoreByConversation[conversationId])

        // setPaginationByConversation((prev) => ({
        //     ...prev,
        //     [conversationId]: currentPage + 1,
        // }));

        scrollToBottom();

        // setTimeout(() => {
        //     const newScrollHeight = scrollableDiv.scrollHeight;
        //     scrollableDiv.scrollTop += newScrollHeight - previousScrollHeight;
        // }, 0);
        // setMessages(conversationResponse);
        // console.log("messagensss:", messages)
    };

    useEffect( async () => {
        // setPaginationByConversation((prev) => ({
        //     ...prev,
        //     [conversationId]: 1,
        // }));
        // setHasMoreByConversation((prev) => ({
        //     ...prev,
        //     [conversationId]: true, // Reinicia hasMore para a nova conversa
        // }));
        if (messages.length == 0) {
            const { conversation, hasMore } = await requestApi()
            console.log("convrsetion 3:",conversation)
            setMessages(conversation);
            setHasMore(hasMore);
            scrollToBottom()
        }
        // fetchConversation();
        // if (currentMessages.length > 0) {
        //     scrollToBottom();
        // }
    }, [conversationId]);

    useEffect(() => {
        const handleNewMessage = (message) => {
            // if (message?.conversationId) {
            //     setMessagesByConversation((prev) => ({
            //         ...prev,
            //         [message.conversationId]: [
            //             ...(prev[message.conversationId] || []),
            //             { senderName: message.senderName || "Unknown", body: message.body || "" },
            //         ],
            //     }));
            //     if (message.conversationId === conversationId) {
            //         scrollToBottom();
            //     }
            // }
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

            // console.log("para: ", messages[0]?.contactNumber)
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
                    {/* {messages[0]?.senderName} */}
                </Title>
            </Header>
            <Content style={{ width: '100%', padding: "16px", display: "flex", flexDirection: "column" }}>
                <Tabs defaultActiveKey="1" style={{ marginBottom: "16px" }}>
                    <TabPane tab="Messages" key="1" />
                    <TabPane tab="Participants" key="2" />
                </Tabs>

                <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px", paddingRight: 16 }}>
                    <div
                        id="scrollableDivMessages"
                        style={{
                            width: "100%",
                            maxHeight: "calc(100vh - 292px)",
                            overflow: 'auto',
                            padding: '0 16px',
                            flexDirection: "column",
                        }}
                    >
                        <InfiniteScroll
                            dataLength={messages.length}
                            next={fetchConversation}
                            hasMore={hasMore}
                            loader={
                                <Skeleton
                                    paragraph={{
                                        rows: 1,
                                    }}
                                    active
                                />
                            }
                            endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
                            scrollableTarget="scrollableDivMessages"
                            inverse={true}
                        >
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
                        </InfiniteScroll>
                    </div>
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
