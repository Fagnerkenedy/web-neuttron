import React from "react";
import { Content, Footer } from "antd/lib/layout/layout";
import UploadComponent from "../../components/Upload/UploadComponent";
import { useNavigate } from "react-router-dom";
import { MainContext } from "../../providers/MainContext";
import { CloudDownloadOutlined, PlusOutlined, PlusSquareOutlined } from '@ant-design/icons';
import Tread from "../../components/Tread";
import './styles.css'
// import wikiImg from "../../images/wiki.png";
import { Row, Col, Button, Typography } from "antd";
const { Link } = Typography;

const Home = () => {
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const org = pathParts[1];
  const moduleName = pathParts[2];
  const navigate = useNavigate();

  const { setTreadStage, setFinalData, setMappedFields } = React.useContext(MainContext);

  React.useEffect(() => {
    setFinalData(null)
    setTreadStage(0);
  }, [setTreadStage, setFinalData]);

  return (
    <>
      <Tread></Tread>
      <Content style={{ padding: "0 50px" }}>
        <div style={{ height: "350px", display: "block" }}>

          <Col >
            <Row style={{ display: "flex", alignItems: "center", justifyContent: "center" }} >
              {/* <img src={wikiImg} alt="logo Wiki" style={{ width: "330px" }} /> */}
              <UploadComponent></UploadComponent>

            </Row>
            <Row style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "30px" }}>
              <Button
                level={5}
                onClick={() => {
                  setMappedFields([])
                  return navigate(`/${org}/${moduleName}/upload/fields`);
                }}
                icon={<PlusOutlined style={{ fontSize: "15px" }} />}
                // className="custom-button"
              >
                Adicionar colunas da planilha
              </Button>
            </Row>
            <Row style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "30px" }}>
              <Button icon={<CloudDownloadOutlined style={{ fontSize: "20px", marginRight: "10px" }} />} href="wiki" style={{ border: "none", background: "transparent", display: "flex", alignItems: "center" }} type="submit"
                onClick={async (e) => {
                  e.preventDefault();
                  fetch(import.meta.env.VITE_LINK_API + "/downloadModel", {
                    method: "GET"
                  }).then(response => response.blob()).then(blob => {
                    var url = window.URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = "modelo-planilha.xls";
                    document.body.appendChild(a);
                    a.click();
                    a.remove()
                  })
                }}>
                Baixar planilha modelo
              </Button>

            </Row>
          </Col>


        </div>

      </Content>
      {/* <Footer style={{ position: "absolute", bottom: "0px", backgroundColor: "#000000", color: "white", height: "30px", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        @wikiconsultoria | 2023
      </Footer> */}
    </>
  );
};

export default Home;
