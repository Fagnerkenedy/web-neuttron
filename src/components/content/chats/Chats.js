import { Card, Col, Layout, Row } from "antd";
import React, { useEffect, useState } from "react";
import Link from "antd/es/typography/Link";
import { Typography } from 'antd';
import { Can } from "../../../contexts/AbilityContext.js";
import { useAbility } from '../../../contexts/AbilityContext.js'
import { useOutletContext } from 'react-router-dom';

const { Text } = Typography;

function Chats() {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    const user = localStorage.getItem('user')
    const userName = JSON.parse(user)
    const { ability, loading } = useAbility();
    const { darkMode } = useOutletContext();

    useEffect(() => {
        
    }, [])

    return (
        <Layout style={{ padding: '15px 15px 0 15px' }}>
            <Row gutter={16}>
                
            </Row>
        </Layout>
    )
}

export default Chats