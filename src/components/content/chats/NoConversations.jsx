import { Layout, Space, Typography } from "antd";
import { useOutletContext } from "react-router-dom";

const { Content } = Layout;
const { Title, Text } = Typography;

const NoConversations = () => {
    const { darkMode } = useOutletContext()
    return (
        <Content
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "calc(100vh - 79px)",
                padding: 10,
                backgroundImage: "url('/images/whats-dark-dark.PNG')",
                backgroundColor: darkMode ? '#1A1A1A' : "#EDEDED",
            }}
        >
            <Space direction="vertical" align="center">
                <Title level={4}>
                    Nenhuma conversa selecionada
                </Title>
                <Text>
                    Por favor, selecione uma conversa para visualizar os
                    detalhes.
                </Text>
            </Space>
        </Content>
    )
}

export default NoConversations;