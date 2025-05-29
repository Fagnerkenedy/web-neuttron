import { Card, Input, Typography, Tooltip, message, Row, Col, Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useState } from 'react';

const CopyableCard = ({ textToCopy }) => {
    //   const textToCopy = 'Texto para copiar';
    const [copied, setCopied] = useState(false);


    return (
        <Tooltip title={copied ? 'Copiado' : 'Copiar'}>
            <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={async () => {
                    try {
                        await navigator.clipboard.writeText(textToCopy);
                        setCopied(true);
                        message.success('Texto copiado!');
                        setTimeout(() => setCopied(false), 2000);
                    } catch (err) {
                        message.error('Erro ao copiar.');
                    }
                }}
                style={{
                    padding: '8px 12px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 8,
                    fontWeight: 500,
                    color: '#333',
                    boxShadow: 'none',
                }}
            >
                {textToCopy}
            </Button>
        </Tooltip>
    );
};

export default CopyableCard;
