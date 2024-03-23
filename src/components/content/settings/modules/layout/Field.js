import React from 'react';
import { useDrag } from 'react-dnd';

const Field = ({ id, label }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'field',
    item: { id, label },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}>
      {label}
    </div>
  );
};

export default Field;
