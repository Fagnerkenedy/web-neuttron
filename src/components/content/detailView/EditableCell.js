import React, { useState } from 'react';
import { Input, InputNumber, Button, Typography, Form, } from 'antd';

const { Title, Text } = Typography;

const EditableCell = ({ value, onChange, type }) => {
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
    toggleEditing();
  };

  console.log("sadfs", value, type)

  return (
    <div>
      {
        type === 'number' ? (
          <InputNumber style={{ fontSize: '16px' }} value={inputValue} onChange={handleInputChange} onBlur={toggleEditing} autoFocus />
        ) : (
          <Form.Item>
            <Input 
              style={{ border: 'none', border: '1px solid transparent', transition: 'border-color 0.3s' }}
              onMouseEnter={(e) => { e.target.style.borderColor = '#ccc'; }}
              onMouseLeave={(e) => { e.target.style.borderColor = 'transparent'; }} 
              value={inputValue} 
              onChange={(e) => handleInputChange(e.target.value)} 
              onPressEnter={handleSave} 
              onBlur={toggleEditing}
            />
          </Form.Item>
        )}
      {/* {editing && <Button onClick={handleSave}>Salvar</Button>} */}
    </div>
  );
};

export default EditableCell;
