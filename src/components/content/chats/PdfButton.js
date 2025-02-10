import { Button } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";

const PdfDownload = ({ pdfUrl, fileName }) => (
  <div style={{ padding: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
    <FilePdfOutlined style={{ fontSize: "24px", color: "red" }} />
    <span>{fileName}</span>
    <Button type="link" href={pdfUrl} download target="_blank">
      Baixar
    </Button>
  </div>
);

export default PdfDownload;
