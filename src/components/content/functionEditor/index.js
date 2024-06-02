import React from 'react';
import MonacoEditor from '@monaco-editor/react';

function CodeEditor({ height, language, value, theme, handleFieldChange, readOnly }) {
    return (
        <MonacoEditor
            height={height}
            defaultLanguage={language}
            defaultValue={value}
            theme={theme}
            onChange={handleFieldChange}
            automaticLayout={true}
            options={{
                readOnly: readOnly
            }}
        />
    );
}

export default CodeEditor;


/* <MonacoEditor
      height="90vh"
      defaultLanguage="javascript"
      defaultValue="// write your code here"
      theme="vs-dark"
    /> */