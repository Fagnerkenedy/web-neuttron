import React, { useEffect, useState } from "react";
import { Layout, Card, Table } from 'antd';
import Link from "antd/es/typography/Link";
import '../../styles.css'
import { Content } from "antd/es/layout/layout";
import axios from "axios";
const linkApi = process.env.REACT_APP_LINK_API;

function Modules() {
    const [data, setData] = useState('')
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                const response = await axios.get(`${linkApi}/crm/${org}/modules`, config);
                setData(response.data.result);
            } catch (err) {
                console.error("Erro:", err);
            }
        };

        fetchData();
    }, []);

    const columns = [
        {
            title: 'Nome do módulo',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <Link href={`/${org}/settings/modules/${text}`}>{text}</Link>
            )
        }
    ]

    return (
        <Content className='content' style={{ paddingTop: '20px' }}>
            <Layout style={{ minHeight: 'calc(100vh - 160px)' }}>
                <Card title="Módulos">
                    <Table 
                        columns={columns} 
                        dataSource={data}  
                        onRow={(record) => {
                            return {
                                onClick: () => {
                                    window.location.href = `/${org}/settings/modules/${record.name}`;
                                },
                            };
                        }}
                    />
                </Card>
            </Layout>
        </Content>
    )
}

export default Modules