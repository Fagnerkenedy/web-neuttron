import React, { useEffect, useState } from "react";
import { Layout, Card, Table } from 'antd';
import Link from "antd/es/typography/Link";
import '../styles.css'
import { Content } from "antd/es/layout/layout";
import { useDataTable } from '../tableRelatedList/DataTableHooksRelatedList';
import axios from "axios";
const linkApi = process.env.REACT_APP_LINK_API;

function RelatedList({ related_module, related_id }) {
    console.log("entrou aqui",related_id)
    const [data, setData] = useState('')
    const { columns, tableData } = useDataTable({related_module, related_id});
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    useEffect(() => {
        // const fetchData = async () => {
        //     try {
        //         const token = localStorage.getItem('token');
        //         const config = {
        //             headers: {
        //                 'Authorization': `Bearer ${token}`
        //             }
        //         };
        //         const response = await axios.get(`${linkApi}/crm/${org}/modules`, config);
        //         console.log("Columns:", response.data.result);
        //         setData(response.data.result);
        //     } catch (err) {
        //         console.error("Erro:", err);
        //     }
        // };

        // fetchData();
    }, []);

    // const columns = [
    //     {
    //         title: 'Nome do módulo',
    //         dataIndex: 'name',
    //         key: 'name',
    //         render: (text) => (
    //             <Link href={`/${org}/settings/modules/${text}`}>{text}</Link>
    //         )
    //     }
    // ]

    return (
        <Content className='content' style={{ paddingTop: '20px' }}>
            <Layout>
                <Card title={`${related_module} Relacionados`}>
                    <Table columns={columns} dataSource={tableData} locale={{ emptyText: 'Nenhum registro encontrado' }} pagination={{ pageSize: 10 }} />
                </Card>
            </Layout>
        </Content>
    )
}

export default RelatedList