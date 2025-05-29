import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Card, Button } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const PdfMessage = ({ pdfUrl, fileName }) => {
  const [numPages, setNumPages] = useState(null);

  return (
    <Card
      style={{ width: 250, textAlign: "center", margin: "10px 0" }}
      cover={
        <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
          <Page pageNumber={1} width={200} />
        </Document>
      }
      actions={[
        <Button type="primary" href={pdfUrl} target="_blank" icon={<FilePdfOutlined />}>
          Abrir PDF
        </Button>,
      ]}
    >
      <p>{fileName}</p>
      <p>{numPages ? `${numPages} páginas` : "Carregando..."}</p>
    </Card>
  );
};

export default PdfMessage;
