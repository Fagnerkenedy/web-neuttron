import React from 'react';
import { Table, Button, Popconfirm, message } from 'antd';

const CustomTable = ({ data, onEdit, onDelete }) => {
  const columns = [
    { title: 'Nome da Coluna', dataIndex: 'name', key: 'name' },
    { title: 'Nome Lógico do Campo', dataIndex: 'api', key: 'api' },
    { title: 'Tipo', dataIndex: 'type', key: 'type' },
    { title: 'Módulo', dataIndex: 'module', key: 'module' },
    { title: 'Campo de Pesquisa', dataIndex: 'lookup_field', key: 'lookup_field' },
    {
      title: 'Ações',
      key: 'actions',
      render: (text, record) => (
        <span>
          <Button type="primary" onClick={() => onEdit(record._id, record)}>
            Editar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja deletar?"
            onConfirm={() => onDelete(record._id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button type="danger" style={{ marginLeft: '8px' }}>
              Deletar
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return <Table dataSource={data} columns={columns} />;
};

export default CustomTable;
