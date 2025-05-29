import React, { useState } from 'react';
import { Select } from 'antd';
import axios from 'axios';

const { Option } = Select;
const currentPath = window.location.pathname;
const pathParts = currentPath.split('/');
const moduleName = 'Clientes';
const linkApi = import.meta.env.VITE_LINK_API

const MyComponent = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchClientes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get(`${linkApi}/crm/${moduleName}/records`, config);
            console.log("Clientes: ", response.data)
            setClientes(response.data);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDropdownVisibleChange = (open) => {
        if (open && clientes.length === 0) {
            fetchClientes();
        }
    };

    return (
        <Select
            placeholder="Selecione um cliente"
            loading={loading}
            onDropdownVisibleChange={handleDropdownVisibleChange}
        >
            {clientes.map(cliente => {
                if (cliente.field_api_name === 'nome_completo') {
                    return (
                        <Option key={cliente.record_id} value={cliente.record_id}>
                            {cliente.field_value}
                        </Option>
                    );
                }
                return null; // Retorna null para ignorar os clientes que não correspondem à condição
            })}
        </Select>
    );
};

export default MyComponent;
