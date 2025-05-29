import React from 'react';
import { useDrag } from 'react-dnd';

// Estilo para os itens arrastáveis
const style = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '0.5rem',
  backgroundColor: 'white',
  cursor: 'move',
};

// Componente para os itens arrastáveis
const DraggableItem = ({ id, text, moveItem, isDragging, renderItem }) => {
  const [{ opacity }, drag] = useDrag({
    type: 'item',
    item: { id, text },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        moveItem(item.id, dropResult.index);
      }
    },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  });

  return (
    <div ref={drag} style={{ ...style, opacity }}>
      {renderItem ? renderItem(text) : text}
    </div>
  );
};

export default DraggableItem;
