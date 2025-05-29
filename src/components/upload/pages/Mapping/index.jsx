import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, List, Row, Table, Typography, Space, } from "antd";
import { ExclamationCircleOutlined, CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import { LeftOutlined } from "@ant-design/icons";
import Tread from "../../components/Tread";

import { MainContext } from "../../providers/MainContext";
import "./styles.css"
import { toast } from 'react-toastify';
import { Footer } from "antd/lib/layout/layout";


function Mapping() {
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const org = pathParts[1];
  const moduleName = pathParts[2];
  const { Title } = Typography;
  const navigate = useNavigate();
  const { mappedFields, setMappedFields, setTreadStage, filename, unmappedFieldsDb, unmappedFieldsSheet } = React.useContext(MainContext);

  async function request() {
    navigate(`/${org}/${moduleName}/upload/processing/${filename}`)
  }

  React.useEffect(() => {
    if (mappedFields.length) {
      toast.success("O Upload da planilha foi um sucesso!", {

        position: "bottom-right",
        icon: '👍',
        style: { top: "-20px", backgroundColor: "#58dd6e", color: "#FFF" },
        progressStyle: {
          backgroundColor: "#3e9b4d"
        }
      });
      setTreadStage(1);
    } else {
      setTreadStage(0);
      navigate(`/${org}/${moduleName}/upload/home`)
    }

  }, [setTreadStage, mappedFields, navigate]);

  const column1 = [
    {
      title: (
        <Space>
          <CheckCircleFilled style={{ color: "green", fontSize: "20px" }} />
          Colunas mapeadas
        </Space>
      )
    }
  ]

  const column2 = [
    {
      title: (
        <Space>
          <CloseCircleOutlined style={{ color: "red", fontSize: "20px" }} />
          Campos que não estão na planilha
        </Space>
      ),
    },
  ];

  const column3 = [
    {
      title: (
        <Space>
          <CloseCircleOutlined style={{ color: "red", fontSize: "20px" }} />
          Campos que não estão adicionados
        </Space>
      ),
    },
  ];

  return (<>
    <Tread></Tread>
    <Col span={16} offset={4} style={{ paddingBottom: "90px" }}>
      <Row>
        <Col span={1}>
          <Button
            className="buttonReturn"
            shape="circle"
            icon={<LeftOutlined />}
            onClick={() => {
              setMappedFields([])
              return navigate(`/${org}/${moduleName}/upload/home`);
            }}
          />
        </Col>
        <Col span={6} offset={8}>
          <Title level={3} style={{ fontFamily: "'Montserrat', sans- serif" }}>Colunas Mapeadas</Title>
        </Col>
        <Col span={3} offset={6}>
          <Button className="buttonConfirm" onClick={request}>Confirmar</Button>
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <Table
            bordered
            columns={column1}
            dataSource={mappedFields}
            pagination={false}
          />
        </Col>
        <Col span={8}>
          <Table
            bordered
            columns={column2}
            dataSource={unmappedFieldsDb}
            pagination={false}
          />
        </Col>
        <Col span={8}>
          <Table
            bordered
            columns={column3}
            dataSource={unmappedFieldsSheet}
            pagination={false}
          />
        </Col>
      </Row>
    </Col>
  </>
  );
}

export default Mapping;
