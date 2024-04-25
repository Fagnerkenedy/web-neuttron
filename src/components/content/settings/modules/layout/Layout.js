import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Layout from 'antd/es/layout/layout';
import axios from 'axios';

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const copy = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const item = sourceClone[droppableSource.index];

  destClone.splice(droppableDestination.index, 0, { ...item, id: uuid() });
  return destClone;
};

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const Content = styled.div`
    margin-left: 200px;
`;

const Item = styled.div`
    width: calc(50% - 16px);
    margin: 8px;
    display: flex;
    user-select: none;
    padding: 12px;
    align-items: center;
    line-height: 1.5;
    border-radius: 6px;
    background: #f4f4f4;
    border: 1px solid #ddd;
    transition: background-color 0.2s ease;
    cursor: grab;

    &:hover {
        background-color: #eaeaea;
    }
`;

const Clone = styled(Item)`
    display: none;
`;

const Handle = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #ddd;
    cursor: grab;

    svg {
        width: 16px;
        height: 16px;
        fill: #555;
    }
`;

const List = styled.div`
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #f9f9f9;
    padding: 8px;
    margin-bottom: 16px;
    min-height: 100px;
`;

const Kiosk = styled(List)`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 200px;
    margin-top: 50px
`;

const Container = styled(List)`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
`;

const Notice = styled.div`
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #888;
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: center;
    margin: 0.5rem;
    padding: 0.5rem;
    color: #000;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 3px;
    font-size: 1rem;
    cursor: pointer;
`;

const ButtonText = styled.div`
    margin: 0 1rem;
`;

// const ITEMS = [
//   {
//     id: uuid(),
//     content: 'Batata'
//   },
//   {
//     id: uuid(),
//     content: 'Copy'
//   },
//   {
//     id: uuid(),
//     content: 'Image'
//   },
//   {
//     id: uuid(),
//     content: 'Slideshow'
//   },
//   {
//     id: uuid(),
//     content: 'Quote'
//   }
// ];

const DragAndDrop = () => {
  const [lists, setLists] = useState({ [uuid()]: [] });
  const [ITEMS, setItems] = useState([])
  const linkApi = process.env.REACT_APP_LINK_API;

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
      setLists({ [uuid()]:responseFields.data })
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    }
  }

  useEffect(()=>{
    fetchData();
  },[])

  const onDragEnd = result => {
    const { source, destination } = result;
    
    if (!destination) {
      return;
    }

    switch (source.droppableId) {
      case destination.droppableId:
        setLists({
          ...lists,
          [destination.droppableId]: reorder(
            lists[source.droppableId],
            source.index,
            destination.index
          )
        });
        break;
      case 'ITEMS':
        setLists({
          ...lists,
          [destination.droppableId]: copy(
            ITEMS,
            lists[destination.droppableId],
            source,
            destination
          )
        });
        break;
      default:
        setLists({
          ...lists,
          ...move(
            lists[source.droppableId],
            lists[destination.droppableId],
            source,
            destination
          )
        });
        break;
    }
  };

  const addList = () => {
    setLists({ ...lists, [uuid()]: [] });
  };

  return (
    <Layout>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="ITEMS" isDropDisabled={true}>
          {(provided, snapshot) => (
            <Kiosk
              ref={provided.innerRef}
              isDraggingOver={snapshot.isDraggingOver}>
              {ITEMS.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id.toString()}
                  index={index}>
                  {(provided, snapshot) => (
                    <React.Fragment>
                      <Item
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        isDragging={snapshot.isDragging}
                        style={
                          provided.draggableProps
                            .style
                        }>
                        {item.name}
                      </Item>
                      {snapshot.isDragging && (
                        <Clone>{item.name}</Clone>
                      )}
                    </React.Fragment>
                  )}
                </Draggable>
              ))}
            </Kiosk>
          )}
        </Droppable>
        <Content>
          <Button onClick={addList}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
              />
            </svg>
            <ButtonText>Add List</ButtonText>
          </Button>
          {Object.keys(lists).map((list, i) => {
            console.log('==> list', list);
            return (
              <Droppable key={list} droppableId={list}>
                {(provided, snapshot) => (
                  <Container
                    ref={provided.innerRef}
                    isDraggingOver={
                      snapshot.isDraggingOver
                    }>
                    {lists[list].length
                      ? lists[list].map(
                        (item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id.toString()}
                            index={index}>
                            {(
                              provided,
                              snapshot
                            ) => (
                              <Item
                                ref={
                                  provided.innerRef
                                }
                                {...provided.draggableProps}
                                isDragging={
                                  snapshot.isDragging
                                }
                                style={
                                  provided
                                    .draggableProps
                                    .style
                                }>
                                <Handle
                                  {...provided.dragHandleProps}>
                                  <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24">
                                    <path
                                      fill="currentColor"
                                      d="M3,15H21V13H3V15M3,19H21V17H3V19M3,11H21V9H3V11M3,5V7H21V5H3Z"
                                    />
                                  </svg>
                                </Handle>
                                {item.name}
                              </Item>
                            )}
                          </Draggable>
                        )
                      )
                      : !provided.placeholder && (
                        <Notice>
                          Drop items here
                        </Notice>
                      )}
                    {provided.placeholder}
                  </Container>
                )}
              </Droppable>
            );
          })}
        </Content>
      </DragDropContext>
    </Layout>
  );
};

export default DragAndDrop;
