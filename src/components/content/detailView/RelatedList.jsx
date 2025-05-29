import React from "react";
import { Layout, Card, Table, Typography, Button, Empty } from 'antd';
import '../styles.css'
import { Content } from "antd/es/layout/layout";
import { useDataTable } from '../tableRelatedList/DataTableHooksRelatedList';
import { PlusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Can } from "../../../contexts/AbilityContext.jsx";
import { useAbility } from '../../../contexts/AbilityContext.jsx'
import pluralize from 'pluralize';
const { Text } = Typography;

function RelatedList({ related_module, related_id }) {
    const { ability, loading } = useAbility();
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]

    const { columns, tableData } = useDataTable({ related_module, related_id });
    const totalTableWidth = columns.reduce((acc, col) => acc + col.width, 0);

    const toSingular = (plural) => {
        return pluralize.singular(plural)
    }

    const emptyText = (
        <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{ height: 60 }}
            description={
                <Text>
                    Nenhum registro encontrado
                </Text>
            }
        >
            <Button
                type="primary"
                href={`/${org}/${related_module}/create`}
            >Criar {related_module == "users" ? ("Usuário") :
                related_module == "profiles" ? ("Perfil") :
                    related_module == "functions" ? ("Função") :
                        related_module == "charts" ? ("Gráfico") :
                            (toSingular(related_module))}
            </Button>
        </Empty>
    )

    return (
        <Content className='content' style={{ paddingTop: '10px' }}>
            <Layout>
                <Card size="small" title={related_module == 'users' ? "Usuários" : related_module} extra={<Can I='create' a={related_module} ability={ability}><Button style={{ margin: '10px' }} icon={<PlusOutlined />} href={`/${org}/${related_module}/create`}>Novo</Button></Can>}>
                    <Table
                        size="small"
                        columns={(tableData.length > 0 ? columns : '')}
                        dataSource={tableData}
                        locale={{ emptyText: emptyText }}
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