import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const SearchInput = ({ onSearch }) => {
  return (
    <Input
      prefix={<SearchOutlined />}
      placeholder="Pesquisar"
      onSearch={onSearch}
      style={{ width: '100%' }}
    />
  );
};

export default SearchInput;
