import React from 'react';
import { useDrop } from 'react-dnd';

// Estilo para a área de drop
const style = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '0.5rem',
  backgroundColor: 'white',
};

// Componente para a área de drop
const DropArea = ({ onDrop, children, droppedItem }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'item',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const backgroundColor = isOver ? 'lightgreen' : 'white';

  return (
    <div ref={drop} style={{ ...style, backgroundColor }}>
      {droppedItem ? <div style={{ marginBottom: '0.5rem' }}>{droppedItem.text}</div> : children}
    </div>
  );
};

export default DropArea;
