import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Badge, Button, Card, Col, Empty, Layout, Row, Table, Typography, theme } from 'antd';
import axios from 'axios';
import Link from 'antd/es/typography/Link';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate, useOutletContext } from 'react-router-dom';

const KanbanBoard = () => {
  const [columns, setColumns] = useState('');
  const { Title, Text } = Typography;
  const apiConfig = {
    baseURL: process.env.REACT_APP_LINK_API,
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  };
  const org = window.location.pathname.split('/')[1];
  const moduleName = window.location.pathname.split('/')[2];
  const [loading, setLoading] = useState(true);
  const [field, setField] = useState('');
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  let navigate = useNavigate()
  const { darkMode } = useOutletContext();

  const fetchStages = async () => {
    setLoading(true)
    const columns = await axios.get(`/kanbans/${org}/${moduleName}`, apiConfig);
    console.log("Columns ns", columns.data)
    if (columns.data.hasOwnProperty("kanban")) {
      setField('')
      setColumns('')
    } else {
      setField(columns.data.field_api_name)
      setColumns(columns.data.resultObject)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStages();
  }, []);

  const onDragEnd = async (result) => {
    console.log("result ondragend", result)
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [movedItem] = sourceItems.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceItems.splice(destination.index, 0, movedItem);
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
      });
    } else {
      destItems.splice(destination.index, 0, movedItem);
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems },
      });
      await axios.put(`/crm/${org}/${moduleName}/${draggableId}`, { [field]: destination.droppableId }, apiConfig);
    }
    fetchStages()
  };

  const Column = styled.div`
    flex: 1;
    min-width: 0;
    border-radius: 6px;
    .dragging {
      opacity: 0.5;
    }
  `;

  const colors = [
    'pink',
    'red',
    'yellow',
    'orange',
    'cyan',
    'green',
    'blue',
    'purple',
    'geekblue',
    'magenta',
    'volcano',
    'gold',
    'lime',
  ];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Row gutter={16} wrap={false} style={{ overflowX: 'auto', height: '100%' }}>
        {columns != '' && field != '' ? (Object.entries(columns).map(([columnId, column]) => (
          <Droppable droppableId={columnId} key={columnId}>
            {(provided, snapshot) => (
              <Card
                title={column.name
                  // colors.map((color) => (
                  //   <Badge key={color} color={color} text={color} />
                  // ))
                  // <Badge color="green" status='success' text={column.name} />
                }
                size='small'
                style={{
                  height: 'calc(100vh - 155px)',
                  width: '100%',
                  marginLeft: snapshot.isDraggingOver ? 4 : 5,
                  marginRight: snapshot.isDraggingOver ? 4 : 5,
                  marginBottom: 10,
                  backgroundColor: snapshot.isDraggingOver
                    ? (darkMode ? '#3a3a3c' : '#e6f7ff')
                    : '',
                  border: snapshot.isDraggingOver
                    ? (darkMode ? '1px solid #8c8c8c' : '1px solid #1890ff')
                    : '',
                }}
                bordered={false}
              // hoverable={true}
              >
                <Column style={{ height: 'calc(100vh - 220px)', minWidth: 250, overflowY: 'auto' }} ref={provided.innerRef} isDraggingOver={snapshot.isDraggingOver} {...provided.droppableProps}>
                  {column.items && column.items.length > 0 ? (
                    column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              transition: snapshot.isDropAnimating ? "transform 0.07s ease" : provided.draggableProps.style.transition,
                              ...provided.draggableProps.style,
                              marginBottom: 8,
                            }}
                          >
                            <Card
                              size='small'
                              hoverable={true}
                              style={{ marginRight: 5, cursor: 'grab' }}
                              onClick={() => navigate(`/${org}/${moduleName}/${item.id}`)}
                            >
                              {Object.entries(item.content).map(([key, value]) => {
                                return (
                                  <Row>
                                    <Text>
                                      {key == 'id' ? '' : value}
                                    </Text>
                                  </Row>
                                )
                              })}
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))) : (
                    <Text type="secondary">Nenhum item disponível</Text>
                  )}
                  {provided.placeholder}
                </Column>
              </Card>
            )}
          </Droppable>
        ))) : (
          !loading && (
            <Layout
              style={{
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
                margin: '0 10px'
              }}
            >
              <Empty
                loading={loading}
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                imageStyle={{ height: 60 }}
                description={
                  <Text>
                    Nenhum registro encontrado
                  </Text>
                }
                style={{ height: 'calc(100vh - 140px)', display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center' }}
              >
                <Button
                  type="primary"
                  href={`/${org}/kanban/create`}
                >Criar Novo Kanban
                </Button>
              </Empty>
            </Layout>
          )
        )}
      </Row>
    </DragDropContext>
  );
};

export default KanbanBoard;
