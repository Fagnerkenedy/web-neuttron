import React from "react";
import { Layout, Card, Table } from 'antd';
import '../styles.css'
import { Content } from "antd/es/layout/layout";
import { useDataTable } from '../tableRelatedList/DataTableHooksRelatedList';

function RelatedList({ related_module, related_id }) {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]

    const { columns, tableData } = useDataTable({ related_module, related_id });
    const totalTableWidth = columns.reduce((acc, col) => acc + col.width, 0);

    return (
        <Content className='content' style={{ paddingTop: '20px' }}>
            <Layout>
                <Card size="small" title={related_module}>
                    <Table
                        size="small"
                        columns={(tableData.length > 0 ? columns : '')}
                        dataSource={tableData}
                        locale={{ emptyText: 'Nenhum registro encontrado' }}
                        pagination={tableData.length > 10 ? { pageSize: 10 } : false}
                        scroll={{
                            x: (tableData.length > 0 ? totalTableWidth : '')
                        }}
                        onRow={(record) => ({
                            onClick: () => window.location.href = `/${org}/${related_module}/${record.id}`
                        })}
                    />
                </Card>
            </Layout>
        </Content>
    )
}

export default RelatedList