import { Layout } from "antd";
import AppHeader from "../header/Header";
import AppFooter from "../footer/Footer";
import { Outlet } from "react-router-dom";
import { ConfigProvider, theme } from 'antd';
import { useContext, useEffect, useState } from "react";
import apiURI from "../../Utility/userApiURI.js"
import axios from "axios";
import AuthContext from '../../contexts/auth';
import { motion } from "framer-motion";
const updateDarkMode = apiURI.updateDarkMode
const { defaultAlgorithm, darkAlgorithm, compactAlgorithm, } = theme;
const linkApi = import.meta.env.VITE_LINK_API

function PageBase() {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString)
    const [darkMode, setDarkMode] = useState(user.dark_mode);

    useEffect(() => {
        document.title = "Neuttron CRM"
        // document.description = "Home"
        const updatedUser = { ...user, dark_mode: darkMode };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        updateDarkMode(updatedUser, org)
    }, [darkMode]);

    return (
        <ConfigProvider
            theme={{
                algorithm: darkMode ? [theme.darkAlgorithm, theme.compactAlgorithm] : [theme.defaultAlgorithm, theme.compactAlgorithm], // compactAlgorithm
                // algorithm: darkMode ? darkAlgorithm : compactAlgorithm, // compactAlgorithm defaultAlgorithm
                token: {
                    colorBgBase: darkMode ? '#1b1b1b' : '#f5f5f5',
                    colorPrimary: '#1a73e8', // #1a73e8 #004E99
                    colorLink: darkMode ? '#ffffff' : '#000000',
                    colorLinkHover: '#004E99', // Cor legal: 277AF7
                    colorSuccess: '#6aaf35'
                },
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                <AppHeader darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
                <Outlet context={{ darkMode }} />
                <AppFooter darkMode={darkMode} />
            </Layout>
        </ConfigProvider>
    )
}

export default PageBase