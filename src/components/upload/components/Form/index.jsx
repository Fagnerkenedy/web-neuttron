import React, { useState } from 'react';
import { Form, Input, Select, Button } from 'antd';

const { Option } = Select;

const CustomForm = ({ onSubmit }) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(values => {
      form.resetFields();
      onSubmit(values);
    });
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item label="Nome da Coluna" name="name" rules={[{ required: true, message: 'Campo obrigatório' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Nome Lógico do Campo" name="api" rules={[{ required: true, message: 'Campo obrigatório' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Tipo" name="type" rules={[{ required: true, message: 'Campo obrigatório' }]}>
        <Select>
          <Option value="text">Texto</Option>
          <Option value="number">Número</Option>
          <Option value="date">Data</Option>
        </Select>
      </Form.Item>
      <Form.Item label="Módulo" name="module" rules={[{ required: true, message: 'Campo obrigatório' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Campo de Pesquisa" name="lookup_field" rules={[{ required: true, message: 'Campo obrigatório' }]}>
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Enviar
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CustomForm;
