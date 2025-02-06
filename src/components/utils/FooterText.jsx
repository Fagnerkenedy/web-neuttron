import { Typography } from 'antd';
import { CopyrightOutlined } from '@ant-design/icons';
import React from 'react';


const {Text} = Typography;

const FooterText = () => {
    const date = new Date()
    const year = date.getFullYear()
    return (
        <p
            style={{
                textAlign: 'center',
                marginTop: "20px"
            }}
        >
            <Text type="secondary"><CopyrightOutlined /> {year}, CRM | Sua venda com perfeição.</Text>
        </p>
    )
}

export default FooterText