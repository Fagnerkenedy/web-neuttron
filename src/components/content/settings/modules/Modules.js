import React, { useRef, useEffect, useState } from "react";
import { Layout, Card, Table, Button, Modal, Form, Input, Dropdown, Menu } from 'antd';
import Link from "antd/es/typography/Link";
import '../../styles.css'
import { Content } from "antd/es/layout/layout";
import axios from "axios";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
const linkApi = process.env.REACT_APP_LINK_API;

const onMenuClick = (e) => {
    console.log('click', e);
};
const items = [
    {
        key: '1',
        label: '1st item',
    },
    {
        key: '2',
        label: '2nd item',
    },
    {
        key: '3',
        label: '3rd item',
    },
];

function Modules() {
    const [data, setData] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const inputRef = useRef(null);
    let navigate = useNavigate()

    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]

    // const menu = (
    //     <Menu>
    //         <Menu.Item key="1">
    //             Opção 1
    //         </Menu.Item>
    //         <Menu.Item key="2">
    //             Opção 2
    //         </Menu.Item>
    //         <Menu.Item key="3">
    //             Opção 3
    //         </Menu.Item>
    //     </Menu>
    // );

    

    const columns = [
        {
            title: 'Nome do módulo',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <>
                    <Dropdown.Button type='text' menu={{ items, onClick: onMenuClick }}>{text}</Dropdown.Button>

                    {/* <Link href={`/${org}/settings/modules/${text}`}>{text}</Link>
                    <Dropdown
                        overlay={menu}
                        trigger={['click']}
                    >
                        <Button
                            onClick={(e) => {
                                e.stopPropagation()
                            }}
                            icon={<MoreOutlined />}
                            type="text"
                            style={{ marginLeft: 15 }}
                        />
                    </Dropdown> */}
                </>
            )
        }
    ]

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

    useEffect(() => {
        fetchData();
    }, []);

    const handleButtonClick = () => {
        setIsModalVisible(true);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus({
                    cursor: 'all',
                });
            }
        }, 100);
    }

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleOk = () => {
        form.validateFields().then(async values => {
            console.log("! values: ", values)
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            try {
                const response = await axios.post(`${linkApi}/crm/${org}/module`, values, config)

                console.log('response:', response)
            } catch (error) {
                console.error('Error saving changes:', error);
            }
            setIsModalVisible(false);
            navigate(`/${org}/settings/modules/${values.name}`)
            window.location.reload()
        })

    }

    return (
        <Content className='content' style={{ paddingTop: '20px' }}>
            <Layout style={{ minHeight: 'calc(100vh - 160px)' }}>
                <Card title="Módulos" extra={<Button onClick={handleButtonClick} style={{ margin: '10px' }} icon={<PlusOutlined />} >Novo</Button>}>
                    <Table
                        columns={columns}
                        dataSource={data}
                        pagination={false}
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
            <Modal
                title="Criar novo módulo"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}

            >
                <Form
                    form={form}
                    layout="vertical"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleOk();
                        }
                    }}>
                    <Form.Item
                        name="name"
                        label="Nome do Módulo"
                        rules={[{ required: true, message: 'Insira um nome!' }]}
                    >
                        <Input ref={inputRef} />
                    </Form.Item>
                </Form>
            </Modal>
        </Content>
    )
}

export default Modules