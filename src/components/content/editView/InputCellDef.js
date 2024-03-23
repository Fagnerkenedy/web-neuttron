import React, { useState } from 'react';
import { Input, InputNumber, Button, Typography, Form, } from 'antd';

const { Title, Text } = Typography;

const EditableCell = ({ value, onChange, type, onSave, onCellValueChange }) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const toggleEditing = () => {
    setEditing(!editing);
  };

  const handleInputChange = (newValue) => {
    setInputValue(newValue);
  };

  const handleSave = () => {
    onChange(inputValue);
    onSave()
    toggleEditing();
  };

  console.log("sadfs", value, type, inputValue)

  return (
    <div>
      {
        type === 'number' ? (
          <InputNumber style={{ fontSize: '16px' }} value={inputValue} onChange={handleInputChange} onBlur={toggleEditing} autoFocus />
        ) : (
          <Form.Item>
            <Input 
              value={inputValue} 
              onChange={(e) => handleInputChange(e.target.value)} 
              onBlur={toggleEditing}
            />
          </Form.Item>
        )}
      {/* {editing && <Button onClick={handleSave}>Salvar</Button>} */}
    </div>
  );
};

export default EditableCell;
