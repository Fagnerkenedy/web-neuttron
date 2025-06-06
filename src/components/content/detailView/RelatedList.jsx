import React from "react";
import { Layout, Card, Table, Typography, Button, Empty } from 'antd';
import '../styles.css'
import { Content } from "antd/es/layout/layout";
import { useDataTable } from '../tableRelatedList/DataTableHooksRelatedList';
import { PlusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Can } from "../../../contexts/AbilityContext.jsx";
import { useAbility } from '../../../contexts/AbilityContext.jsx'
import pluralize from 'pluralize';
import { useNavigate } from "react-router-dom";
import Link from "../../utils/Link.jsx";
const { Text } = Typography;

function RelatedList({ related_module, related_id }) {
    const { ability, loading } = useAbility();
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]
    const navigate = useNavigate()

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
            <Link to={`/${org}/${related_module}/create`}>
                <Button
                    type="primary"
                >Criar {related_module == "users" ? ("Usuário") :
                    related_module == "profiles" ? ("Perfil") :
                        related_module == "functions" ? ("Função") :
                            related_module == "charts" ? ("Gráfico") :
                                (toSingular(related_module))}
                </Button>
            </Link>
        </Empty>
    )

    const columnsProps = (dataIndex, title, field_type) => ({
        render: (text, data) => {
            const productId = data && data.key ? data.key : '';
            const formatDate = (dateString) => {
                const date = new Date(dateString)
                const day = String(date.getDate()).padStart(2, '0')
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const year = date.getFullYear()
                return `${day}/${month}/${year}`
            };
            const formatDateTime = (dateString) => {
                const date = new Date(dateString);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');

                return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
            };
            switch (field_type) {
                case 'date':
                    return <Link to={`${productId}`}>{text ? formatDate(text) : null}</Link>
                case 'date_time':
                    return <Link to={`${productId}`}>{text ? formatDateTime(text) : null}</Link>
                default:
                    return <Link to={`${productId}`}>{text}</Link>
            }
        }
    })

    const modifiedColumns = columns.map((col) => ({
        ...col,
        ...columnsProps(col.dataIndex, col.title, col.field_type),
    }));

    return (
        <Content className='content' style={{ paddingTop: '10px' }}>
            <Layout>
                <Card
                    size="small"
                    title={related_module == 'users' ? "Usuários" : related_module}
                    extra={
                        <Can I='create' a={related_module} ability={ability}>
                            <Link to={`/${org}/${related_module}/create`}>
                                <Button
                                    style={{ margin: '10px' }}
                                    icon={<PlusOutlined />}
                                >
                                    Novo
                                </Button>
                            </Link>
                        </Can>
                    }>
                    <Table
                        size="small"
                        columns={(tableData.length > 0 ? modifiedColumns : '')}
                        dataSource={tableData}
                        locale={{ emptyText: emptyText }}
                        pagination={tableData.length > 10 ? { pageSize: 10 } : false}
                        scroll={{
                            x: (tableData.length > 0 ? totalTableWidth : '')
                        }}
                        onRow={(record) => ({
                            onClick: () => navigate(`/${org}/${related_module}/${record.id}`)
                        })}
                    />
                </Card>
            </Layout>
        </Content>
    )
}

export default RelatedList