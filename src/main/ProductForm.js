import React, { useState } from "react";
import { Table, Input, InputNumber, Button, Form } from "antd";

const ProductForm = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [totalValues, setTotalValues] = useState({ totalQty: 0, subTotal: 0 });

  // Configuração das colunas
  const columns = [
    {
      title: "Sem N.º",
      dataIndex: "key",
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nome Produto",
      dataIndex: "productName",
      render: (_, record, index) => (
        <Input
          value={record.productName}
          onChange={(e) => handleInputChange(e.target.value, index, "productName")}
        />
      ),
    },
    {
      title: "Quantidade",
      dataIndex: "quantity",
      width: 100,
      render: (_, record, index) => (
        <InputNumber
          value={record.quantity}
          min={1}
          onChange={(value) => handleInputChange(value, index, "quantity")}
        />
      ),
    },
    {
      title: "Preço Negociado (R$)",
      dataIndex: "price",
      width: 150,
      render: (_, record, index) => (
        <InputNumber
          value={record.price}
          min={0}
          onChange={(value) => handleInputChange(value, index, "price")}
        />
      ),
    },
    {
      title: "Total (R$)",
      dataIndex: "total",
      width: 150,
      render: (_, record) => <span>{(record.quantity * record.price || 0).toFixed(2)}</span>,
    },
    {
      title: "Ações",
      dataIndex: "actions",
      width: 100,
      render: (_, __, index) => (
        <Button danger onClick={() => removeRow(index)}>
          Remover
        </Button>
      ),
    },
  ];

  // Adicionar nova linha
  const addRow = () => {
    setDataSource([...dataSource, { productName: "", quantity: 1, price: 0 }]);
  };

  // Remover linha
  const removeRow = (index) => {
    const newData = [...dataSource];
    newData.splice(index, 1);
    setDataSource(newData);
    calculateTotals(newData);
  };

  // Atualizar valores
  const handleInputChange = (value, index, key) => {
    const newData = [...dataSource];
    newData[index][key] = value;
    setDataSource(newData);
    calculateTotals(newData);
  };

  // Calcular totais
  const calculateTotals = (data) => {
    const totalQty = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const subTotal = data.reduce(
      (sum, item) => sum + (item.quantity * item.price || 0),
      0
    );

    setTotalValues({ totalQty, subTotal });
  };

  return (
    <div>
      <h3>Itens da Compra</h3>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        rowKey={(record, index) => index}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={2}>
              Soma das Qtdes
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1}>{totalValues.totalQty}</Table.Summary.Cell>
            <Table.Summary.Cell index={2} colSpan={2}>
              Sub-total (R$)
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3}>{totalValues.subTotal.toFixed(2)}</Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
      <Button type="dashed" onClick={addRow} style={{ marginTop: 16 }}>
        + Adicionar linha
      </Button>
    </div>
  );
};

export default ProductForm;
