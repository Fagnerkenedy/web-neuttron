import React from "react";
import { Col, Popover, Row, Steps } from "antd";
import { MainContext } from "../../providers/MainContext";
import "./styles.css"

const { Step } = Steps;

const Tread = () => {
  const { treadStage } = React.useContext(MainContext);


  const customDot = (dot, { status, index }) => (
    <Popover
      content={
        <span>
          step {index} status: {status}
        </span>
      }
    >
      {dot}
    </Popover>
  );

  return (
    <div className="tread" style={{ marginTop: "40px", marginBottom: "60px" }}>
      <Row>
        <Col span={22} offset={1}>
          <Steps current={treadStage} progressDot={customDot} >
            <Step title="Anexo" description="Adicione um documento." />
            <Step
              title="Resultado do Mapeamento"
              description="Verifique as colunas mapeadas."
            />
            <Step title="Processamento" description="Processo de importação." />
            <Step
              title="Resultado final."
              description="Confira o resultado do processo de importação."
            />
          </Steps>
        </Col>
      </Row>
    </div>
  );
};

export default Tread;
