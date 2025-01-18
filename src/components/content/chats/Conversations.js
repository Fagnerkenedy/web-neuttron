import { Button, Input, Layout, List } from "antd";
import axios from "axios";
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";

const Conversations = ({ socket }) => {
    const apiConfig = {
        baseURL: process.env.REACT_APP_LINK_API,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    };
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    // const conversationId = pathParts[3]
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('');
    const [currentConversation, setCurrentConversation] = useState(null);
    const { conversationId } = useParams();
    const localUser = localStorage.getItem('user')
    const user = JSON.parse(localUser)

    const fetchConversation = async () => {
        const response = await axios.get(`/chat/${org}/messages/${conversationId}`, apiConfig);
        const conversationResponse = response.data.conversation[0]
        setMessages(conversationResponse)
    }

    useEffect(() => {
        if (conversationId) {
            fetchConversation();
        }
    }, [conversationId]);

    useEffect(() => {
        const handleNewMessage = (message) => {
            console.log("nova mensagem: ", message);

            const newMessage = { 
                senderName: message?.senderName || "Desconhecido", 
                body: message?.body || "" 
            };

            // Atualiza as mensagens na conversa ativa
            if (message?.conversationId === conversationId) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
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
                const response = await axios.post(`${process.env.REACT_APP_LINK_API}/chat/${org}/send-message`, {
                    numberId: '537389792787824',
                    to: '5545999792202',
                    // to: '5545988057396',
                    message: input,
                    conversationId,
                    userName: user.name,
                    userId: user.id
                });
                console.log('Mensagem enviada:', response.data);
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
            }

            setInput('');
        }
    };

    return (
        <Layout>
            <List
                bordered
                dataSource={messages}
                renderItem={(item) => (
                    <List.Item>
                        <b>{item.senderName}:</b> {item.body}
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
    )
}

export default Conversations