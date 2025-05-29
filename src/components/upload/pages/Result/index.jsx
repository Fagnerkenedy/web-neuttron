import { List, Typography, Col, Row, Button } from 'antd';
import { CheckOutlined, DislikeOutlined } from '@ant-design/icons';
import React from 'react';
import { MainContext } from '../../providers/MainContext';
import { useNavigate } from 'react-router-dom';
import "./styles.css"
import Tread from "../../components/Tread";

const Result = () => {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1];
    const moduleName = pathParts[2];
    const navigate = useNavigate();

    const { setTreadStage, finalData } = React.useContext(MainContext);

    React.useEffect(() => {
        setTreadStage(3)
        if (!finalData) {
            navigate(`/${org}/${moduleName}/upload/home`)
        }

    }, [setTreadStage, finalData, navigate])


    return <div>
        <Tread></Tread>
        <Row style={{ padding: "0 100px" }}>
            <Col span={2} offset={20}>
                <Button className='buttonHome' onClick={() => navigate(`/${org}/${moduleName}/upload/home`)}>Nova Carga</Button>
            </Col>
        </Row>
        <Row style={{ marginTop: "15px", padding: "0 100px" }}>
            <Col span={9} offset={2}>
                <div>
                    {finalData && <List
                        header={<div><CheckOutlined style={{ color: "#4dff56", fontSize: "40px", display: "inline-block" }} /><h2 style={{ display: "inline-block", marginLeft: "20px", fontFamily: "'Montserrat', sans- serif" }}>Sucesso</h2></div>}
                        bordered
                        dataSource={finalData.success}
                        renderItem={item => (
                            <List.Item>
                                <Typography.Text mark>{item.id}</Typography.Text> {item.Subject}
                            </List.Item>
                        )}
                    />}
                </div>
            </Col>
            <Col span={9} offset={2} >
                <div>
                    {finalData && <List
                        header={<div><DislikeOutlined style={{ color: "#ff4d56", fontSize: "40px", display: "inline-block" }} /><h2 style={{ display: "inline-block", marginLeft: "20px", fontFamily: "'Montserrat', sans- serif" }}>Não Importados</h2></div>}
                        bordered
                        dataSource={finalData.error}
                        renderItem={item => (
                            <List.Item>
                                <Typography.Text type='danger' >{item.data.id}</Typography.Text> {"Erro: " + item.error.code + " Campo: " + item.error.details.api_name}
                            </List.Item>
                        )}
                    />}
                </div>
            </Col>
        </Row>

    </div >;
};

export default Result;

