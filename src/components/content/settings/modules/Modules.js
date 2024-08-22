import React, { useRef, useEffect, useState } from "react";
import { Layout, Card, Table, Button, Modal, Form, Input, Dropdown, Menu, Popconfirm, message } from 'antd';
import Link from "antd/es/typography/Link";
import '../../styles.css'
import { Content } from "antd/es/layout/layout";
import axios from "axios";
import { DownOutlined, MoreOutlined, PlusOutlined, WarningOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
const linkApi = process.env.REACT_APP_LINK_API;

// const onMenuClick = (e) => {
//     console.log('click', e);
// };
// const items = [
//     {
//         key: '1',
//         label: '1st item',
//     },
//     {
//         key: '2',
//         label: '2nd item',
//     },
//     {
//         key: '3',
//         label: '3rd item',
//     },
// ];

function Modules() {
    const [data, setData] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalVisible, setModal] = useState(false);
    const [clickedItem, setClickedItem] = useState('');
    const [form] = Form.useForm();
    const inputRef = useRef(null);
    let navigate = useNavigate()

    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1]

    const onEdit = (value) => {
        console.log("value :", value)
        form.validateFields().then(async values => {
            console.log("! values: ", values.name)
            console.log("! values: ", clickedItem.name)
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            try {
                const response = await axios.put(`${linkApi}/crm/${org}/module`, { name: clickedItem.name, new_name: values.name }, config)

                console.log('response:', response)
                message.success('Registro Atualizado!');
            } catch (error) {
                console.error('Error saving changes:', error);
                message.error('Erro ao atualizar registro!')
            }
            setModal(false);
            fetchData()
        })
    }

    const handleSetModalTrue = (item) => {
        setModal(true)
        console.log("teste: ", item)
        setClickedItem(item)
        form.setFieldsValue({
            name: item.name,
        })
    }

    const handleSetModalFalse = () => {
        setModal(false)
    }

    const onDelete = async (value) => {
        console.log("value delete:", value)
        const name = value.name
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        try {
            // const response = await axios.delete(`${linkApi}/crm/${org}/module`, { name: clickedItem.name, new_name: values.name }, config)
            const responseDelete = await axios.delete(`${linkApi}/crm/${org}/module`, {
                ...config,
                data: { name }
            })
            console.log('response:', responseDelete)
            message.success('Registro Excluído!');
        } catch (error) {
            console.error('Error saving changes:', error);
            message.error('Erro ao excluir registro!')
        }
        setModal(false);
        fetchData()
    }

    // const menu = (
    //     <Menu>
    //         <Menu.Item
    //             onClick={(e) => {
    //                 e.domEvent.stopPropagation()
    //                 onEdit(e)
    //             }}
    //             key="1"
    //         >
    //             Editar
    //         </Menu.Item>
    //         <Menu.Item
    //             onClick={(e) => {
    //                 e.domEvent.stopPropagation()
    //                 onDelete(e)
    //             }}
    //             key="2"
    //         >
    //             Excluir
    //         </Menu.Item>
    //     </Menu>
    // );



    const columns = [
        {
            title: 'Nome do módulo',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => {
                const menu = (
                    <Menu>
                        <Menu.Item
                            onClick={() => handleSetModalTrue(record)}
                            key="1"
                        >
                            Editar
                        </Menu.Item>
                        <Popconfirm
                            title="Excluir"
                            description="Você tem certeza de que deseja excluir este módulo? Esta ação é irreversível e irá apagar todos os registros e campos associados a este módulo permanentemente."
                            onConfirm={(e) => onDelete(record)}
                            okText="Sim"
                            cancelText="Cancelar"
                            icon={<WarningOutlined style={{color: 'red'}}/>}
                        >
                            <Menu.Item
                                key="2"
                            >
                                Excluir
                            </Menu.Item>
                        </Popconfirm>
                    </Menu>
                );
                return (
                    <>
                        <Link href={`/${org}/settings/modules/${record.api_name}`}>{text}</Link>
                        <Dropdown
                            overlay={menu}
                            trigger={['click']}
                        >
                            <Button
                                icon={<MoreOutlined />}
                                type="text"
                                style={{ marginLeft: 15 }}
                            />
                        </Dropdown>
                    </>
                )
            }
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
                    // onRow={(record) => {
                    //     return {
                    //         onClick: () => {
                    //             window.location.href = `/${org}/settings/modules/${record.name}`;
                    //         },
                    //     };
                    // }}
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
                        if (isModalVisible && e.key === 'Enter') {
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
            <Modal
                title="Editar módulo"
                visible={modalVisible}
                onOk={onEdit}
                onCancel={handleSetModalFalse}

            >
                <Form
                    form={form}
                    layout="vertical"
                    onKeyDown={(e) => {
                        if (modalVisible && e.key === 'Enter') {
                            onEdit();
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