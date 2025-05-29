import { Col, Row, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import React from 'react';
import { MainContext } from '../../providers/MainContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Result, Button } from 'antd';
import Tread from "../../components/Tread";

function Processing() {
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const org = pathParts[1];
  const moduleName = pathParts[2];
  let { filename } = useParams();
  const navigate = useNavigate();
  const { setTreadStage, setFinalData } = React.useContext(MainContext);
  const [spin, setSpin] = React.useState(true);
  const [error, setError] = React.useState(false);


  const antIcon = <LoadingOutlined style={{ fontSize: "200px", border: "none" }} spin />;

  React.useEffect(() => {
    setTreadStage(2)
    fetch(import.meta.env.VITE_LINK_API + `/processing/${filename}`, {
      method: "POST"
    }).then(response => {
      if (!response.ok) {
        return { error: "Algum erro aconteceu, não foi possível processar seu documento!" }
      }
      return response.json()
    }).then(data => {
      if (!data.success) {
        setSpin(false)
        setError(data.error)
        return;
      }
      //setar dados e redirecionar
      setTreadStage(4);
      setFinalData(data);
      navigate(`/${org}/${moduleName}/upload/result`)
    })
    // setTreadStage(2)
  }, [filename, navigate, setTreadStage, setFinalData])

  return <div>
    <Tread></Tread>
    {spin && <> <Row style={{ display: "flex", justifyContent: "center" }}>
      <Col>
        <Spin indicator={antIcon} style={{ color: "#ea7e02" }} />
      </Col>

    </Row>
      <Row style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <Col>
          <h2>Processando...</h2>
        </Col>
      </Row>
    </>}
    {error && <Result
      status="warning"
      title="Falha no Processamento"
      subTitle={error}
      extra={[
        <Button type="primary" key="console" onClick={() => navigate(`/${org}/${moduleName}/upload/home`)}>
          Voltar à página principal
        </Button>
      ]}
    ></Result>}
  </div>;
}

export default Processing;
