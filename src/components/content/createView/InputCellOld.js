import React, { useState, useEffect } from 'react';
import { Input, InputNumber, Button, Typography, Form, } from 'antd';

const { Title, Text } = Typography;

const ImputCell = ({ value, type, api_name }) => {
  const handleInputChange = (e) => {
    // Você não precisa mais do estado interno, basta usar o valor diretamente
    // Não estamos mais usando o estado interno inputValue
    // setInputValue(e.target.value);
  };

  console.log("sadfs", value, type, api_name);

  return (
    <div>
      {
        type === 'number' ? (
          <InputNumber style={{ fontSize: '16px' }} value={value} onChange={handleInputChange} autoFocus />
        ) : (
          <Form.Item name={api_name}>
            <Input value={value} onChange={handleInputChange}/>
          </Form.Item>
        )
      }
      {/* {editing && <Button onClick={handleSave}>Salvar</Button>} */}
    </div>
  );
};

export default ImputCell;

