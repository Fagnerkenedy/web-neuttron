import React from 'react';
import { Breadcrumb, Flex, Select, Pagination, Button, Popconfirm, message } from 'antd';
import Link from 'antd/es/typography/Link';
import { Option } from 'antd/es/mentions';
import apiURI from '../../../Utility/recordApiURI.js';
const { deleteRecord } = apiURI;
const pluralize = require('pluralize')

const currentPath = window.location.pathname;
const pathParts = currentPath.split('/');
const org = pathParts[1]
const moduleName = pathParts[2]

const TableControls = ({ hasSelected, selectedRowKeys, start, totalItems, pageSize, onPageChange, onPageSizeChange, currentPage }) => {
  const confirm = async (e) => {
    console.log(e);
    await deleteRecord(org, moduleName, selectedRowKeys)
    window.location.reload()
  }

  const toSingular = (plural) => {
    return pluralize.singular(plural)
  }

  return (
    <Flex justify={'space-between'} style={{height: '50px', marginTop: '50px'}}>
      <Flex justify={'flex-start'} align={'center'}>
        <Breadcrumb>
          {hasSelected ? (
            <Breadcrumb.Item>
              {`${selectedRowKeys.length} Registro(s) selecionado(s) `}
              <Link onClick={start} disabled={!hasSelected} style={{margin: '15px'}}>
                Limpar
              </Link>
              <Popconfirm
                title="Excluir"
                description="Tem certeza de que deseja excluir o(s) registro(s) selecionado(s)?"
                onConfirm={() => confirm()}
                okText="Sim"
                cancelText="Cancelar"
              >
                <Button type="text" danger>Excluir</Button>
              </Popconfirm>
            </Breadcrumb.Item>
          ) : null}
          {!hasSelected && <Breadcrumb.Item>{`Total de registros ${totalItems}`}</Breadcrumb.Item>}
        </Breadcrumb>
      </Flex>
      <Flex justify={'flex-end'} align={'center'}>
        <Flex style={{paddingRight: '15px'}}>
          <Button href={`/${org}/${moduleName}/create`}>Criar {toSingular(moduleName)}</Button>
        </Flex>

        <Flex align={'center'}>
          <Select defaultValue={pageSize} onChange={onPageSizeChange} style={{ marginRight: '8px' }}>
            {[5, 10, 20, 50, 100, 200, 500, 1000].map((option) => (
              <Option key={option} value={option}>
                {option} por página
              </Option>
            ))}
          </Select>
          <Pagination responsive={true} size='small' current={currentPage} pageSize={pageSize} total={totalItems} onChange={onPageChange} />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default TableControls;
