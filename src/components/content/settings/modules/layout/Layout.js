import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Field from './Field';

const CRMModuleLayout = () => {
  const [fields, setFields] = useState([
    { id: '1', label: 'Nome' },
    { id: '2', label: 'Email' },
    { id: '3', label: 'Telefone' },
    // Adicione mais campos conforme necessário
  ]);

  const moveField = (dragIndex, hoverIndex) => {
    const draggedField = fields[dragIndex];
    setFields((prevFields) => {
      const newFields = [...prevFields];
      newFields.splice(dragIndex, 1);
      newFields.splice(hoverIndex, 0, draggedField);
      return newFields;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h2>Layout do Módulo de CRM</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {fields.map((field, index) => (
            <Field key={field.id} id={field.id} label={field.label} index={index} moveField={moveField} />
          ))}
        </div>
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            border: '2px dashed #ccc',
            borderRadius: '4px',
            textAlign: 'center',
          }}
        >
          Arraste e solte os campos aqui
        </div>
      </div>
    </DndProvider>
  );
};

export default CRMModuleLayout;
