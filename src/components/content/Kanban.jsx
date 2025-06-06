import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Badge, Button, Card, Col, Empty, Layout, Row, Table, Tooltip, Typography, theme } from 'antd';
import axios from 'axios';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import ColumnsOrder from './selection/ColumnsOrder';
import Link from '../utils/Link';
import { CalendarOutlined, CheckCircleOutlined, CheckOutlined, DollarOutlined, EditOutlined, FormOutlined, LinkOutlined, MailOutlined, NumberOutlined, PhoneFilled, PhoneOutlined, SelectOutlined } from '@ant-design/icons';
// import './styles.css'

const KanbanBoard = ({ data }) => {
  const [columns, setColumns] = useState('');
  const { Title, Text } = Typography;
  const apiConfig = {
    baseURL: import.meta.env.VITE_LINK_API,
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  };
  // const org = window.location.pathname.split('/')[1];
  // const moduleName = window.location.pathname.split('/')[2];
  const { org, module } = useParams();
  const moduleName = module
  const [loading, setLoading] = useState(true);
  const [field, setField] = useState('');
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  let navigate = useNavigate()
  const { darkMode } = useOutletContext();
  const [relatedFieldData, setRelatedFieldData] = useState([]);
  const [dataAll, setDataAll] = useState(null);

  const fetchStages = async () => {
    setLoading(true)
    const columns = await axios.get(`/kanbans/${org}/${moduleName}`, apiConfig);
    if (columns.data.hasOwnProperty("kanban")) {
      setField('')
      setColumns('')
    } else {
      setField(columns.data.field_api_name)
      setColumns(columns.data.resultObject)
    }
    setLoading(false)
  }

  const fetchData = async () => {
    try {
      const responseFields = await axios.get(`/crm/${org}/${moduleName}/fields`, apiConfig);
      const response = await axios.get(`/crm/${org}/${moduleName}`, apiConfig);
      const groupRecords = (records) => {
        const groupedData = {};

        records.forEach((record) => {
          const { field_api_name, field_value, id } = record;

          if (!groupedData[id]) {
            groupedData[id] = { key: id };
          }

          Object.entries(record).forEach(([key, value]) => {
            if (key !== 'id') {
              groupedData[id][key] = value;
            }
          });
        });

        return Object.values(groupedData);
      };

      const result = groupRecords(response.data);
      const all = result.map(async record => {
        const response = await axios.get(`/crm/${org}/${moduleName}/${record.key}`, apiConfig);
        const combinedData = responseFields.data.map(field => {
          const matchingResponse = response.data.find(item => item[field.api_name]);
          return {
            ...field,
            field_value: matchingResponse ? matchingResponse[field.api_name] : ''
          };
        });
        const relatedModulePromises = combinedData.map(async field => {
          if (field.related_module != null && field.field_value != "" && field.related_module != "fields") {
            const response = await axios.get(`/crm/${org}/${field.related_module}/relatedDataById/${record.key}`, apiConfig);
            if (response.data.row.length != 0) {
              const fieldToUpdate5 = {
                related_module: field.related_module,
                related_id: field.related_id,
                module_id: null,
                id: field.id,
                api_name: field.api_name,
                name: field.field_value
              };

              const index = combinedData.findIndex(combinedDataField => combinedDataField.id === field.id);
              let updatedRelatedFieldData = [...relatedFieldData];
              updatedRelatedFieldData[index] = fieldToUpdate5
              // setRelatedFieldData(updatedRelatedFieldData);
              return {
                name: field.field_value,
                api_name: field.api_name,
                related_id: response.data.row[0].related_id,
                related_module: field.related_module,
                module_id: null,
                id: field.id
              };

            }

          }
        })
        const relatedModuleResponses = await Promise.all(relatedModulePromises)
        setRelatedFieldData(prevData => ({ ...prevData, relatedModuleResponses }));

        const updatedCombinedData = combinedData.map(field => {
          if (field.related_module != null) {
            const relatedData = relatedModuleResponses.find(data => data && data.api_name === field.api_name)
            if (relatedData) {
              return {
                ...field,
                related_id: relatedData.related_id
              };
            } else {
              return field
            }
          } else {
            return field
          }
        });
        return updatedCombinedData
      })

      const promisseAll = await Promise.all(all)

      if (Array.isArray(promisseAll)) {
        setDataAll(promisseAll);
      } else {
        setDataAll([promisseAll]);
      }
    } catch (error) {
      console.error("Erro ao buscar os dados:", error)
    }
  };

  useEffect(() => {
    fetchStages();
    fetchData();
  }, []);

  const onDragEnd = async (result) => {
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

      const dataRecord = data.find(registro => registro.key === draggableId)
      dataRecord[field] = destination.droppableId
      const newJson = { ...dataRecord }
      const records = relatedFieldData.relatedModuleResponses.filter(record => !!record);

      newJson['related_record'] = records.reduce((acc, record) => {
        if (record != null) {
          acc[record.api_name] = {
            name: record.name,
            id: record.related_id,
            module: record.related_module
          }
        }
        return acc;
      }, {});
      delete newJson.key
      delete newJson.created_at
      delete newJson.updated_at
      await axios.put(`/crm/${org}/${moduleName}/${draggableId}`, newJson, apiConfig);
    }
    fetchStages()
  };

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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', zIndex: 1000, right: 5, top: 5 }}>
          <ColumnsOrder reload={fetchStages} />
        </div>
        <Row gutter={16} wrap={false} style={{ overflowY: 'auto', height: 'calc(100vh - 129px)', padding: '0 10px 0 10px' }} className='custom-scrollbar'>
          {/* <Row gutter={16} wrap={false} style={{ maxWidth: '100vw', width: '100vw', overflow: 'auto', height: 'calc(100vh - 127px)' }}> */}
          {columns != '' && field != '' ? (Object.entries(columns).map(([columnId, column]) => (
            <Droppable droppableId={columnId} key={columnId}>
              {(provided, snapshot) => (
                // <Tooltip title={column.name}>
                // <Layout>
                <Card
                  title={column.name
                    // colors.map((color) => (
                    //   <Badge key={color} color={color} text={color} />
                    // ))
                    // <Badge color="green" status='success' text={column.name} />
                  }
                  ref={provided.innerRef} isDraggingOver={snapshot.isDraggingOver} {...provided.droppableProps}
                  size='small'
                  className='custom-scrollbar'
                  style={{
                    paddingBottom: -8,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    borderRadius: 4,
                    maxHeight: 'calc(100vh - 155px)',
                    minWidth: 340,
                    height: '100%',
                    marginLeft: snapshot.isDraggingOver ? 4 : 5,
                    marginRight: snapshot.isDraggingOver ? 4 : 5,
                    // marginBottom: 10,
                    backgroundColor: snapshot.isDraggingOver
                      ? (darkMode ? '#3a3a3c' : '#e6f7ff')
                      : darkMode ? '' : '#e0e0e0',
                    borderTop: 
                      // ? (darkMode ? '3px solid green' : '3px solid green')
                      // : '3px solid green',
                      // ? (darkMode ? '1px solid #8c8c8c' : '1px solid #1890ff')
                      // : '',
                      `5px solid ${column.color}`,
                    borderLeft: snapshot.isDraggingOver
                      ? (darkMode ? '1px solid #8c8c8c' : '1px solid #1890ff')
                      : '',
                    borderRight: snapshot.isDraggingOver
                      ? (darkMode ? '1px solid #8c8c8c' : '1px solid #1890ff')
                      : '',
                    borderBottom: snapshot.isDraggingOver
                      ? (darkMode ? '1px solid #8c8c8c' : '1px solid #1890ff')
                      : '',
                  }}
                  bordered={false}
                // hoverable={true}
                >
                  {/* <div style={{ height: 'calc(100vh - 214px)', minWidth: 300, marginBottom: 10, padding: '0 0 15px 0' }} > */}
                  {column.items && column.items.length > 0 ? (
                    column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <Card
                            title={column.name}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              transition: snapshot.isDropAnimating ? "transform 0.07s ease" : provided.draggableProps.style.transition,
                              ...provided.draggableProps.style,
                              marginBottom: 8,
                              cursor: 'grab'
                            }}
                            size='small'
                            hoverable={true}
                            // style={{ cursor: 'grab' }}
                            onClick={() => navigate(`/${org}/${moduleName}/${item.id}`)}
                            extra={
                              <Tooltip title={"Editar"}>
                                <Button
                                  type='text'
                                  icon={<EditOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/${org}/${moduleName}/${item.id}/edit`)
                                  }}
                                />
                              </Tooltip>
                            }
                          >
                            {Object.entries(item.content).map(([key, value]) => {
                              return (
                                <Row>
                                  <Tooltip title={value.field_name}>
                                    <Text>
                                      {/* {
                                        key == 'id' ? '' : value.value
                                      } */}
                                      {(() => {
                                        if (value.value) {
                                          switch (value.field_type) {
                                            case "loockup":
                                              // return <Link to={`/${org}/${moduleName}/${}`}></Link>
                                              return (
                                                <>
                                                  <LinkOutlined style={{ marginRight: 5 }} />
                                                  {value.value}
                                                </>
                                              )
                                            case "select":
                                              return (
                                                <>
                                                  <SelectOutlined style={{ marginRight: 5 }} />
                                                  {value.value}
                                                </>
                                              )
                                            case "multi_line":
                                              return (
                                                <>
                                                  <FormOutlined style={{ marginRight: 5 }} />
                                                  <Text ellipsis={{ tooltip: true }} style={{ maxWidth: 200 }}>{value.value}</Text>
                                                </>
                                              )
                                            case "currency":
                                              return (
                                                <>
                                                  <DollarOutlined style={{ marginRight: 5 }} />
                                                  {`R$ ${value.value.replace(/\B(?=(\d{3})+(?!\d))/g, ".").replace(/\.(?=\d{0,2}$)/g, ",")}`}
                                                </>
                                              )
                                            case "number":
                                              return (
                                                <>
                                                  <NumberOutlined style={{ marginRight: 5 }} />
                                                  {value.value}
                                                </>
                                              )
                                            case "checkbox":
                                              return (
                                                <>
                                                  <CheckCircleOutlined style={{ marginRight: 5 }} />
                                                  {value.value == 1 ? "Sim" : "Não"}
                                                </>
                                              )
                                            case "date":
                                              return (
                                                <>
                                                  <CalendarOutlined style={{ marginRight: 5 }} />
                                                  {formatDate(value.value)}
                                                </>
                                              )
                                            case "date_time":
                                              return (
                                                <>
                                                  <CalendarOutlined style={{ marginRight: 5 }} />
                                                  {formatDateTime(value.value)}
                                                </>
                                              )
                                            case "email":
                                              return (
                                                <>
                                                  <MailOutlined style={{ marginRight: 5 }} />
                                                  {value.value}
                                                </>
                                              )
                                            case "phone":
                                              return (
                                                <>
                                                  <PhoneOutlined style={{ marginRight: 5 }} />
                                                  {value.value}
                                                </>
                                              )
                                            default:
                                              return (
                                                <>
                                                  <EditOutlined style={{ marginRight: 5 }} />
                                                  {value.value}
                                                </>
                                              )
                                          }
                                        }
                                      })()}
                                    </Text>
                                  </Tooltip>
                                </Row>
                              )
                            })}
                          </Card>
                        )}
                      </Draggable>
                    ))) : (
                    <Text type="secondary">Nenhum item disponível</Text>
                  )}
                  {provided.placeholder}
                </Card>
                //* </Layout> */}
                // </Tooltip> 
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
                  <Link to={`/${org}/kanban/create`}>
                    <Button
                      type="primary"
                    >Criar Novo Kanban
                    </Button>
                  </Link>
                </Empty>
              </Layout>
            )
          )}
        </Row>

      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
