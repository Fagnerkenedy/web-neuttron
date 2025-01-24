import { Button, Input, Layout, List, Typography, Card, Space, Tabs, Col, Skeleton } from "antd";
import { UserOutlined, SendOutlined, SearchOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

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

    const scrollToBottom = () => {
        const scrollableDiv = document.getElementById("scrollableDivMessages");
        if (scrollableDiv) {
            scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
        }
    }

    const fetchConversation = async () => {
        const scrollableDiv = document.getElementById("scrollableDivMessages");
        const previousScrollHeight = scrollableDiv.scrollHeight;
        const response = await axios.get(`/chat/${org}/messages/${conversationId}`, {
            baseURL: process.env.REACT_APP_LINK_API,
            params: { page: page, limit: 10 },
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const conversation = response.data.conversation
        const hasMore = response.data.hasMore
        const pageServer = response.data.page

        console.log("conversaton 2: ", ...conversation)
        conversation.reverse();
        console.log("reverseArray: ", ...conversation)

        setMessages((prev) => [...conversation, ...prev]);
        setHasMore(hasMore)
        setPage(parseInt(pageServer) + 1)
        // scrollToBottom();
        setTimeout(() => {
            const newScrollHeight = scrollableDiv.scrollHeight;
            scrollableDiv.scrollTop += newScrollHeight - previousScrollHeight;
        }, 0);
    }

    useEffect(() => {
        console.log("messagessss:", messages)
        const getMessages = async () => {
            const response = await axios.get(`/chat/${org}/messages/${conversationId}`, {
                baseURL: process.env.REACT_APP_LINK_API,
                params: { page: 1, limit: 10 },
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const conversation = response.data.conversation
            const hasMore = response.data.hasMore
            const pageServer = response.data.page
            console.log("convrsetion 3:", conversation)
            conversation.reverse();
            setMessages(conversation);
            setHasMore(hasMore);
            setPage(parseInt(pageServer) + 1)
            // scrollToBottom()
        }

        getMessages()
    }, [conversationId]);

    // useEffect(() => {
    //     scrollToBottom();
    // }, [messages]);

    useEffect(() => {
        const handleNewMessage = (message) => {
            const newMessage = {
                senderName: message?.senderName || "Unknown",
                body: message?.body || "",
            };

            if (message?.conversationId === conversationId) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                // scrollToBottom()
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
                {/* <Tabs defaultActiveKey="1" style={{ marginBottom: "16px" }}>
                    <TabPane tab="Messages" key="1" />
                    <TabPane tab="Participants" key="2" />
                </Tabs> */}

                <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px", paddingRight: 16 }}>
                    <div
                        id="scrollableDivMessages"
                        style={{
                            width: "100%",
                            maxHeight: "calc(100vh - 224px)",
                            overflow: 'auto',
                            padding: '0 16px',
                            display: "flex",
                            flexDirection: "column-reverse",
                        }}
                    >
                        <InfiniteScroll
                            dataLength={messages.length}
                            next={fetchConversation}
                            hasMore={hasMore}
                            loader={null}
                            scrollableTarget="scrollableDivMessages"
                            inverse={true}
                        >
                            {hasMore && (
                                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                                    <Skeleton
                                        paragraph={{
                                            rows: 1,
                                        }}
                                        active
                                    />
                                </div>
                            )}

                            <List
                                dataSource={messages}
                                renderItem={(item) => {
                                    const isMyMessage = item.senderName === user.name
                                    return (
                                        <List.Item
                                            style={{
                                                display: "flex",
                                                justifyContent: isMyMessage ? "flex-end" : "flex-start",
                                            }}
                                        >
                                            <Card
                                                style={{
                                                    borderRadius: "8px",
                                                    backgroundColor: isMyMessage ? "#e6f7ff" : "#ffffff",
                                                    maxWidth: "70%",
                                                }}
                                                size="small"
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                                                    <Text>{item.body}</Text>
                                                    <div
                                                        style={{
                                                            width: 20,
                                                            fontSize: "11px",
                                                            color: "#999",
                                                            marginLeft: "10px", // Espaçamento entre mensagem e horário
                                                            whiteSpace: "nowrap", // Previne quebra de linha
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                
                                                            }}
                                                        >
                                                            18:16 {/* Exemplo: '18:16' */}
                                                        </span>
                                                    </div>
                                                </div>
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
