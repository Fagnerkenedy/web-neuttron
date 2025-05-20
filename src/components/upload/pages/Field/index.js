import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Button } from 'antd';
import { MainContext } from "../../providers/MainContext";
import CustomForm from '../../components/Form';
import CustomTable from '../../components/Table';
import axios from 'axios';
import 'antd/dist/antd.css';
//import './App.css';

const { Header, Content } = Layout;

const Fields = () => {
    const { setTreadStage, setFinalData } = React.useContext(MainContext);

    React.useEffect(() => {
        setFinalData(null)
        setTreadStage(0);
    }, [setTreadStage, setFinalData]);

    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:3005/fields/read');
            setData(response.data);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    };

    const handleFormSubmit = async values => {
        try {
            await axios.post('http://localhost:3005/fields/create', values);
            fetchData();
        } catch (error) {
            console.error('Erro ao criar item:', error);
        }
    };

    const handleEdit = async (id, values) => {
        try {
            await axios.put(`http://localhost:3005/fields/update/${id}`, values);
            fetchData();
        } catch (error) {
            console.error('Erro ao editar item:', error);
        }
    };

    const handleDelete = async id => {
        try {
            await axios.delete(`http://localhost:3005/fields/delete/${id}`);
            fetchData();
        } catch (error) {
            console.error('Erro ao deletar item:', error);
        }
    };

    return (
        <Layout>
            <Row gutter={16} style={{ padding: '30px'}}>
                <Col span={24}>
                    <CustomTable data={data} onEdit={handleEdit} onDelete={handleDelete} />
                </Col>
            </Row>
        </Layout>
    );
};

export default Fields;
