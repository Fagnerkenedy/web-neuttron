import { MoonFilled, SunFilled } from "@ant-design/icons";
import { Button, Row } from "antd";

const ButtonDarkMode = ({ darkMode, toggleDarkMode }) => {

    return (
        <Row style={{ alignItems: "center", padding: "10px 0" }}>
            <Button title={darkMode ? "Ativar Modo Claro" : "Ativar Modo Noturno"} onClick={toggleDarkMode} icon={darkMode ? <SunFilled /> : <MoonFilled />}>{darkMode ? "Modo Claro" : "Modo Noturno"}</Button>
        </Row>
    )
}

export default ButtonDarkMode