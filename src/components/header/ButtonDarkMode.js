import { MoonFilled, SunFilled } from "@ant-design/icons";
import { Button, Row, Tooltip } from "antd";

const ButtonDarkMode = ({ darkMode, toggleDarkMode }) => {

    return (
        <Row style={{ alignItems: "center", padding: "10px 0" }}>
            <Button type='text' title={darkMode ? "Ativar Modo Claro" : "Ativar Modo Noturno"} style={{ width: '100%' }} onClick={toggleDarkMode} icon={darkMode ? <SunFilled /> : <MoonFilled />}>{darkMode ? "Modo Claro" : "Modo Noturno"}</Button>
        </Row>
    )
}

export default ButtonDarkMode