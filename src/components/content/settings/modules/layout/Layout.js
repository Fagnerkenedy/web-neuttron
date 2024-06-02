import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import styled from 'styled-components';
import { Button, Card, Layout, theme } from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';

const { Content } = Layout;

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const copy = (source, destination, droppableSource, droppableDestination) => {
  if (!source || !destination) return destination;
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const item = sourceClone[droppableSource.index];

  destClone.splice(droppableDestination.index, 0, { ...item, id: uuid() });
  return destClone;
};

const move = (source, destination, droppableSource, droppableDestination) => {
  if (!source || !destination) return { [droppableSource.droppableId]: source, [droppableDestination.droppableId]: destination };
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const ContentContainer = styled(Content)`
  margin-left: 220px;
  padding: 16px;
`;

const DragContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Column = styled.div`
  flex: 1;
  padding: 8px;
  min-width: 0;
  border: 2px dashed #ddd;
  border-radius: 6px;
  background-color: ${props => props.isDraggingOver ? '#f0f0f0' : '#fff'};
  margin: 8px;
`;

const Notice = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #888;
`;

const initialItems = [
  { id: uuid(), name: 'Linha única' },
  { id: uuid(), name: 'Multilinha' },
  { id: uuid(), name: 'Image' },
  { id: uuid(), name: 'Slideshow' },
  { id: uuid(), name: 'Quote' },
  { id: 'add-list', name: 'Add List' }
];

const DragAndDrop = () => {
  const [lists, setLists] = useState({ left: [], right: [] });
  const [ITEMS, setItems] = useState(initialItems);
  const [sections, setSections] = useState({});
  const [sectionOrder, setSectionOrder] = useState([]);
  const linkApi = process.env.REACT_APP_LINK_API;

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const fetchData = async () => {
    try {
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split('/');
      const org = pathParts[1];
      const moduleName = pathParts[4];
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const responseFields = await axios.get(`${linkApi}/crm/${org}/${moduleName}/fields`, config);
      const items = responseFields.data;

      const left = [];
      const right = [];

      items.forEach((item, index) => {
        if (index % 2 === 0) {
          left.push(item);
        } else {
          right.push(item);
        }
      });

      setLists({ left, right });
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onDragEnd = result => {
    const { source, destination, type } = result;

    if (!destination) {
      return;
    }

    if (type === 'SECTION') {
      const newSectionOrder = reorder(
        sectionOrder,
        source.index,
        destination.index
      );
      setSectionOrder(newSectionOrder);
      return;
    }

    if (source.droppableId === 'ITEMS' && destination.droppableId !== 'ITEMS') {
      const draggedItem = ITEMS[source.index];
      if (draggedItem.id === 'add-list') {
        const newSectionId = uuid();
        setSections(prevSections => ({ ...prevSections, [newSectionId]: [] }));
        setSectionOrder(prevOrder => [...prevOrder, newSectionId]);
        return;
      }
    }

    switch (source.droppableId) {
      case destination.droppableId:
        setSections({
          ...sections,
          [destination.droppableId]: reorder(
            sections[source.droppableId],
            source.index,
            destination.index
          )
        });
        break;
      case 'ITEMS':
        setSections({
          ...sections,
          [destination.droppableId]: copy(
            ITEMS,
            sections[destination.droppableId],
            source,
            destination
          )
        });
        break;
      default:
        setSections({
          ...sections,
          ...move(
            sections[source.droppableId],
            sections[destination.droppableId],
            source,
            destination
          )
        });
        break;
    }
    // switch (source.droppableId) {
    //   case destination.droppableId:
    //     setLists({
    //       ...lists,
    //       [destination.droppableId]: reorder(
    //         lists[source.droppableId],
    //         source.index,
    //         destination.index
    //       )
    //     });
    //     break;
    //   case 'ITEMS':
    //     setLists({
    //       ...lists,
    //       [destination.droppableId]: copy(
    //         ITEMS,
    //         lists[destination.droppableId],
    //         source,
    //         destination
    //       )
    //     });
    //     break;
    //   default:
    //     setLists({
    //       ...lists,
    //       ...move(
    //         lists[source.droppableId],
    //         lists[destination.droppableId],
    //         source,
    //         destination
    //       )
    //     });
    //     break;
    // }
  };

  const addItem = () => {
    const newItem = { id: uuid(), name: `New Item ${ITEMS.length + 1}` };
    setItems([...ITEMS, newItem]);
  };

  const addSection = () => {
    const newSectionId = uuid();
    setSections(prevSections => ({ ...prevSections, [newSectionId]: [] }));
    setSectionOrder(prevOrder => [...prevOrder, newSectionId]);
  };

  const saveChanges = () => {
    console.log('Saved sections:', sections);
  };

  return (
    <Layout>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="ITEMS" isDropDisabled={true}>
          {(provided, snapshot) => (
            <Card
              title="Kiosk"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: 200,
                marginTop: 50,
                padding: 8,
                background: colorBgContainer
              }}
              ref={provided.innerRef}
              isDraggingOver={snapshot.isDraggingOver}
            >
              {ITEMS.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      isDragging={snapshot.isDragging}
                      style={provided.draggableProps.style}
                    >
                      {item.name}
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <Button onClick={addItem} style={{ marginTop: 8 }}>Add Item</Button>
            </Card>
          )}
        </Droppable>
        <ContentContainer>
          <Button onClick={addSection} style={{ marginBottom: 16 }}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Add Section
          </Button>
          <Button onClick={saveChanges} style={{ marginBottom: 16, marginLeft: 16 }}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Save Changes
          </Button>
          <DragContainer>
            <Droppable droppableId="left">
              {(provided, snapshot) => (
                <Column ref={provided.innerRef} isDraggingOver={snapshot.isDraggingOver}>
                  {lists.left.length
                    ? lists.left.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            isDragging={snapshot.isDragging}
                            style={provided.draggableProps.style}
                          >
                            {item.name}
                          </Card>
                        )}
                      </Draggable>
                    ))
                    : !provided.placeholder && <Notice>Drop items here</Notice>}
                  {provided.placeholder}
                </Column>
              )}
            </Droppable>
            <Droppable droppableId="right">
              {(provided, snapshot) => (
                <Column ref={provided.innerRef} isDraggingOver={snapshot.isDraggingOver}>
                  {lists.right.length
                    ? lists.right.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            isDragging={snapshot.isDragging}
                            style={provided.draggableProps.style}
                          >
                            {item.name}
                          </Card>
                        )}
                      </Draggable>
                    ))
                    : !provided.placeholder && <Notice>Drop items here</Notice>}
                  {provided.placeholder}
                </Column>
              )}
            </Droppable>
          </DragContainer>
          {Object.keys(sections).map((sectionId, i) => (
            <Card key={sectionId} style={{ marginBottom: 16 }}>
              <h3>Section {i + 1}</h3>
              <Droppable droppableId={sectionId}>
                {(provided, snapshot) => (
                  <Column ref={provided.innerRef} isDraggingOver={snapshot.isDraggingOver}>
                    {sections[sectionId].length
                      ? sections[sectionId].map((item, index) => (
                        <DragContainer>
                          <Droppable droppableId="left">
                            {(provided, snapshot) => (
                              <Column ref={provided.innerRef} isDraggingOver={snapshot.isDraggingOver}>
                                {lists.left.length
                                  ? lists.left.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                      {(provided, snapshot) => (
                                        <Card
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          isDragging={snapshot.isDragging}
                                          style={provided.draggableProps.style}
                                        >
                                          {item.name}
                                        </Card>
                                      )}
                                    </Draggable>
                                  ))
                                  : !provided.placeholder && <Notice>Drop items here</Notice>}
                                {provided.placeholder}
                              </Column>
                            )}
                          </Droppable>
                          <Droppable droppableId="right">
                            {(provided, snapshot) => (
                              <Column ref={provided.innerRef} isDraggingOver={snapshot.isDraggingOver}>
                                {lists.right.length
                                  ? lists.right.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                      {(provided, snapshot) => (
                                        <Card
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          isDragging={snapshot.isDragging}
                                          style={provided.draggableProps.style}
                                        >
                                          {item.name}
                                        </Card>
                                      )}
                                    </Draggable>
                                  ))
                                  : !provided.placeholder && <Notice>Drop items here</Notice>}
                                {provided.placeholder}
                              </Column>
                            )}
                          </Droppable>
                        </DragContainer>
                      ))
                      : !provided.placeholder && <Notice>Drop items here</Notice>}
                    {provided.placeholder}
                  </Column>
                )}
              </Droppable>
            </Card>
          ))}
        </ContentContainer>
      </DragDropContext>
    </Layout>
  );
};

export default DragAndDrop;
