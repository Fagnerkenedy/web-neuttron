import React from "react";
import { Line } from '@ant-design/plots';

function Linha({ xField, yField, data }) {
    if (!Array.isArray(data)) {
        data = [data];
    }

    const dataNumber = data.map(item => ({
        [xField]: new Date(item[xField]),
        [yField]: parseFloat(item[yField])
    })).sort((a, b) => new Date(a[xField]) - new Date(b[xField]))
    console.log("dataNumber", dataNumber)

    const config = {
        data: dataNumber,
        xField: xField,
        yField: yField,
        point: {
            shapeField: 'square',
            sizeField: 3,
        },
        axis: {
            y: {
                labelFormatter: (val) => `R$ ${val}`,
            },
        },
        interaction: {
            tooltip: {
                marker: false,
            },
        },
        style: {
            lineWidth: 2,
        },
    };
    return <Line {...config} />;

}

export default Linha