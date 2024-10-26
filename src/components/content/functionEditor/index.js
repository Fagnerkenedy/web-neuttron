import React from 'react';
import MonacoEditor from '@monaco-editor/react';

function CodeEditor({ height, language, value, theme, handleFieldChange, readOnly }) {
    const handleEditorWillMount = (monaco) => {
        monaco.editor.defineTheme('softContrast', {
            base: 'vs',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '7e7e7e', fontStyle: 'italic' },
                { token: 'keyword', foreground: '007acc', fontStyle: 'bold' },
                { token: 'identifier', foreground: '333333' },
                { token: 'string', foreground: '098658' },
                { token: 'number', foreground: '098658' },
                { token: 'operator', foreground: 'a31515' },
            ],
            colors: {
                'editor.background': '#f5f5f5',
                'editor.foreground': '#333333',
                'editorLineNumber.foreground': '#858585',
                'editorLineNumber.activeForeground': '#333333',
                'editor.selectionBackground': '#d0e7ff',
                'editor.inactiveSelectionBackground': '#e6f2ff',
                'editorCursor.foreground': '#333333',
                'editorIndentGuide.background': '#e0e0e0',
                'editorIndentGuide.activeBackground': '#bfbfbf',
            },
        });
    };

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
            beforeMount={handleEditorWillMount}
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