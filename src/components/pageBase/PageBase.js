import { Layout } from "antd";
import AppHeader from "../header/Header";
import AppFooter from "../footer/Footer";
import { Outlet } from "react-router-dom";
import { ConfigProvider, theme } from 'antd';
import { useEffect, useState } from "react";
import apiURI from "../../Utility/userApiURI.js"
const updateDarkMode = apiURI.updateDarkMode

const { defaultAlgorithm, darkAlgorithm } = theme;

function PageBase() {
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString)
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    const [darkMode, setDarkMode] = useState(user.dark_mode);

    useEffect(() => {
        user.dark_mode = darkMode
        localStorage.setItem('user', JSON.stringify(user));
        updateDarkMode(user, org)
    }, [darkMode]);

    return (
        <ConfigProvider
            theme={{
                algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,
            }}>
            <Layout style={{ minHeight: '100vh' }}>
                <AppHeader darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
                <Outlet />
                {/* <AppFooter /> */}
            </Layout>
        </ConfigProvider>
    )
}

export default PageBase