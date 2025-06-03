import { Typography } from "antd";

const { Text } = Typography
const noData = () => {
    return (
        <div
            style={{
                textAlign: "center",
                padding: "20px",
            }}
        >
            <Text>Não há dados para exibir.</Text><br/>
            <Text>Adicione novos registros para renderizar o gráfico.</Text>
        </div>
    )
}

export default noData;