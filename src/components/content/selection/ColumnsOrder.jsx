import React, { useEffect, useRef, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button, Card, Checkbox, Col, Dropdown, Input, Menu, Row, theme, Tooltip, Typography } from 'antd';
import axios from 'axios';
import { ColumnHeightOutlined, DragOutlined, EllipsisOutlined, HolderOutlined, SearchOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
const { useToken } = theme;

const ColumnsOrder = ({ reload }) => {
    const [items, setItems] = useState([]);
    const [visible, setVisible] = useState(false);
    const ref = useRef(null);
    const [searchValue, setSearchValue] = useState('')
    const { Title, Text } = Typography;
    const { token } = useToken();
    const { darkMode } = useOutletContext();
    const [isOpen, setIsOpen] = useState(false)

    const apiConfig = {
        baseURL: import.meta.env.VITE_LINK_API,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    };
    const org = window.location.pathname.split('/')[1];
    const moduleName = window.location.pathname.split('/')[2];

    const fetchStages = async () => {
        const response = await axios.get(`/kanbans/fieldsOrder/${org}/${moduleName}`, apiConfig);
        setItems(response.data.kanbanFieldsOrder)
    };

    useEffect(() => {
        fetchStages();
    }, []);

    const updateKanbanOrder = async (fields) => {
        await axios.post(`/kanbans/updateOrder/${org}/${moduleName}`, fields, apiConfig);
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const reorderedItems = Array.from(items);
        const [movedItem] = reorderedItems.splice(source.index, 1);
        reorderedItems.splice(destination.index, 0, movedItem);
        const updatedItems = reorderedItems.map((item, index) => ({
            ...item,
            kanban_order: index + 1,
        }));

        setItems(updatedItems);
        updateKanbanOrder(updatedItems);
        reload()
    };

    const contentStyle = {
        backgroundColor: token.colorBgElevated,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary,
    };

    const menuStyle = {
        boxShadow: 'none',
    };

    const openSelect = () => {
        setIsOpen(!isOpen);
        setTimeout(() => {
            if (ref.current) {
                ref.current.focus({
                    cursor: 'all',
                });
            }
        }, 100);
    };

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const handleCheckboxChange = async (id, checked) => {
        const updatedItems = items.map(item => item.id === id ? { ...item, is_visible_in_kanban: checked } : item);
        setItems(updatedItems);
        const updatedField = { id, is_visible_in_kanban: checked }
        await axios.post(`/kanbans/updateVisibleFields/${org}/${moduleName}`, updatedField, apiConfig);
        reload()
    }

    const menu = (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable" direction="vertical">
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} style={{ overflowY: 'auto', maxWidth: '300px', maxHeight: '600px' }}>
                        {/* <h2>Ordem dos campos</h2> */}
                        <Menu>

                            <Menu.Item
                                style={{
                                    marginBottom: 8,
                                }}
                            >
                                <Input
                                    prefix={<SearchOutlined />}
                                    ref={ref}
                                    placeholder="Pesquisar campos"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    // onBlur={() => setIsOpen(false)} // Fecha ao perder o foco
                                    autoFocus
                                />
                            </Menu.Item>
                            {filteredItems.map((item, index) => (
                                <Menu.Item
                                    style={{
                                        // padding: '8px 16px',
                                    }}
                                >
                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    // marginBottom: 8,
                                                    width: '100%'
                                                }}
                                            >
                                                <HolderOutlined />
                                                <Checkbox checked={item.is_visible_in_kanban} onChange={(e) => handleCheckboxChange(item.id, e.target.checked)} style={{ marginRight: 8, marginLeft: 8 }} />
                                                <Text style={{ color: darkMode ? '#fff' : '#000' }}>
                                                    {item.name}
                                                </Text>
                                            </div>
                                        )}
                                    </Draggable>
                                </Menu.Item>
                            ))}
                        </Menu>
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )

    return (
        <Dropdown
            overlay={menu}
            style={{ padding: 5, display: 'flex' }}
            onVisibleChange={(visible) => setIsOpen(visible)}
            visible={isOpen}
            trigger={['click']}
            // onClick={() => setIsOpen(!isOpen)}
            dropdownRender={(menu) => (
                <div style={contentStyle}>
                    {React.cloneElement(menu, {
                        style: menuStyle,
                    })}
                </div>
            )}
        >
            <Tooltip title="Configurar campos" placement="left">
                <Button style={{ marginLeft: 10, marginRight: 7 }} variant="filled" onClick={openSelect} icon={<EllipsisOutlined />} />
            </Tooltip>
        </Dropdown>
    );
};

export default ColumnsOrder;
