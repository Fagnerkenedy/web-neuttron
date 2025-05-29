import React from "react";

export const MainContext = React.createContext({});

export const MainProvider = (props) => {
  const [treadStage, setTreadStage] = React.useState(0);
  const [mappedFields, setMappedFields] = React.useState([]);
  const [unmappedFieldsDb, setunmappedFieldsDb] = React.useState([]);
  const [unmappedFieldsSheet, setunmappedFieldsSheet] = React.useState([]);
  const [filename, setFilename] = React.useState("");
  const [finalData, setFinalData] = React.useState(null);

  return (
    <MainContext.Provider
      value={{ treadStage, setTreadStage, mappedFields, setMappedFields, filename, setFilename, finalData, setFinalData, unmappedFieldsDb, setunmappedFieldsDb, unmappedFieldsSheet, setunmappedFieldsSheet }}
    >
      {props.children}
    </MainContext.Provider>
  );
};
