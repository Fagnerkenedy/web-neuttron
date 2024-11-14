import React from "react";
import { Column } from '@ant-design/plots';
import { useOutletContext } from "react-router-dom";

function Barra({ xField, yField, data }) {
    const { darkMode } = useOutletContext();
    if (!Array.isArray(data)) {
        data = [data];
    }

    const dataNumber = data.map(item => ({
        ...item,
        [yField]: parseFloat(item[yField])
    }));
    console.log("datanumero", dataNumber)

    const config = {
        data: dataNumber,
        xField: xField,
        yField: yField,
        text: (d) => `${(d.yField * 100).toFixed(1)}%`,
        label: {
            text: (d) => `R$ ${d[yField]}`,
            textBaseline: 'bottom',
            style: {
                fill: darkMode ? '#ffffff' : '#000000',
            }
        },
        axis: {
            y: {
                labelFormatter: (val) => `R$ ${val}`,
            },
        },
        style: {
            radiusTopLeft: 10,
            radiusTopRight: 10
        },
    };
    return <Column {...config} />;

}

export default Barra