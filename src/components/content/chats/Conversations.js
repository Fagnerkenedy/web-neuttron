import { Button, Input, Layout, List, Typography, Card, Space, Tabs, Col, Skeleton, theme } from "antd";
import { UserOutlined, SendOutlined, SearchOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { formatTime, formatDateToISO } from "./formatNumbers"
import './styles.css'
import PdfDownload from "./PdfButton";
import PdfMessage from "./PdfMessage";
import TextoFormatado from "./TextoFormatado";

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
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken()
    const { darkMode } = useOutletContext();

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
                params: { page: 1, limit: 30 },
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
                senderName: message?.senderName || "Desconhecido",
                contactNumber: message?.contactNumber,
                body: message?.body || "",
                created_at: message?.updated_at,
                pathFront: message?.pathFront
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
            // const created_at = formatDateToISO(new Date())
            // console.log("toLocaleString:  ", created_at.toLocaleString())
            // const toDateTime = date.toLocaleString("pt-br").slice(0, 20).replace(',', '')
            const date = new Date()
            date.setHours(date.getHours() - 3)
            const formattedDate = date.toISOString().replace("T", " ").replace("Z", "")
            const newMessage = { senderName: user.name, body: input, created_at: formattedDate, contactNumber: "554599750447", };
            setMessages((prev) => [...prev, newMessage]);
            try {
                await axios.post(`${process.env.REACT_APP_LINK_API}/chat/${org}/send-message`, {
                    numberId: "537389792787824",
                    contactNumber: "554599750447",
                    to: messages[0]?.contactNumber,
                    message: input,
                    conversationId,
                    userName: user.name,
                    userId: user.id,
                    created_at: formattedDate
                });
            } catch (error) {
                console.error("Erro ao enviar mensagem:", error);
            }

            setInput("");
            scrollToBottom()
        }
    };

    const updateUnread = async () => {
        console.log("Executou!")
        try {
            await axios.post(`${process.env.REACT_APP_LINK_API}/chat/${org}/conversation/${conversationId}`);
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        }
    }

    return (
        <Layout 
            style={{ 
                height: "calc(100vh - 79px)", 
                // backgroundImage: "url('/images/whats-dark-dark.PNG')",
                backgroundColor: darkMode ? '#1A1A1A' : "#EDEDED",
            }}
        >
            {/* Main Chat Area */}
            <Header style={{ height: '50px', backgroundColor: colorBgContainer, padding: "0 16px", alignContent: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>
                    {messages[0]?.senderName}
                </Title>
            </Header>
            <Content style={{ width: '100%', display: "flex", flexDirection: "column" }}>
                <div style={{ flex: 1, overflowY: "auto" }}>
                    <div
                        id="scrollableDivMessages"
                        style={{
                            width: "100%",
                            maxHeight: "calc(100vh - 190px)",
                            overflow: 'auto',
                            padding: '0 16px',
                            display: "flex",
                            flexDirection: "column-reverse",
                            flexDirection: "column-reverse",
                        }}
                        className='custom-scrollbar'
                    >
                        <InfiniteScroll
                            dataLength={messages.length}
                            next={fetchConversation}
                            hasMore={hasMore}
                            loader={null}
                            scrollableTarget="scrollableDivMessages"
                            inverse={true}
                        >
                            <List
                                dataSource={messages}
                                renderItem={(item) => {
                                    const isMyMessage = item.contactNumber === user.wa_id
                                    return (
                                        <List.Item
                                            style={{
                                                paddingBottom: 0,
                                                display: "flex",
                                                justifyContent: isMyMessage ? "flex-end" : "flex-start",
                                                border: 'none'
                                            }}
                                        >
                                            <Card
                                                style={{
                                                    padding: 5,
                                                    paddingRight: 15,
                                                    paddingLeft: 10,
                                                    margin: darkMode ? '0' : '3px 0',
                                                    borderRadius: "8px",
                                                    border: 0,
                                                    backgroundColor: 
                                                        isMyMessage && darkMode ? "#01294c" : 
                                                        isMyMessage && !darkMode ? "#b3dbfe" : 
                                                        !isMyMessage && darkMode ? "#2A2A2A" : 
                                                        !isMyMessage && !darkMode ? "" : null,
                                                    maxWidth: "70%",
                                                }}
                                                size="small"
                                                bodyStyle={{ padding: 0 }}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                                                    
                                                    {console.log("item: ", item)}
                                                    { item.pathFront ? (
                                                        // <PdfMessage pdfUrl={item.pathFront} fileName={item.body}/>
                                                        <PdfDownload pdfUrl={item.pathFront} fileName={item.body}/>
                                                    ) : 
                                                    // <Text>{item.body}</Text>
                                                    <TextoFormatado fileName={item.body} />


                                                    }
                                                    {/* <PdfDownload pdfUrl="file:///C:/Users/fagne/Downloads/2%20-%20Gest%C3%A3o%20Agricola%20(1).pdf" fileName="2 - Gestão Agricola.pdf"/> */}
                                                    <div
                                                        style={{
                                                            width: 20,
                                                            fontSize: "11px",
                                                            color: "#6d6d6d",
                                                            marginLeft: "10px",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        <span
                                                            style={{

                                                            }}
                                                        >
                                                            {formatTime(item.created_at)}
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

                <Col style={{ padding: '0 15px 15px 15px', width: '100%', display: "flex", alignItems: "center" }}>
                    <Input
                        placeholder="Escreva sua mensagem..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onPressEnter={sendMessage}
                        style={{  flex: 1, width: '100%' }}
                        onClick={() => updateUnread()}
                    />
                </Col>
            </Content>
        </Layout>
    );
};

export default Conversations;
