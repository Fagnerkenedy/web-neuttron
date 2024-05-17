import React, { useEffect, useState } from "react";
import { Col, Row, Layout, theme } from "antd";
import { Typography } from 'antd';
import { BarChart } from '@mui/x-charts/BarChart';
import { fetchCharts } from './fetchCharts'
import { Column } from '@ant-design/plots';

const { Text } = Typography;

function Barra({ xField, yField, data }) {
    if (!Array.isArray(data)) {
        data = [data];
    }

    const dataNumerico = data.map(item => ({
        ...item,
        [yField]: parseFloat(item[yField])
    }));
    console.log("datanumero", dataNumerico)

    const config = {
        data: dataNumerico,
        xField: xField,
        yField: yField,
        // text: (d) => `${(d.yField * 100).toFixed(1)}%`,
        label: {
            text: (d) => `R$${d[yField]}`,
            textBaseline: 'bottom',
        },
        axis: {
            y: {
                labelFormatter: (val) => `R$${val}`,
            },
        },
        style: {
            radiusTopLeft: 10,
            radiusTopRight: 10,
        },
    };
    return <Column {...config} />;

}

export default Barra