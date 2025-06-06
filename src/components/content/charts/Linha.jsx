import React from "react";
import { Line } from '@ant-design/plots';
import { useOutletContext } from "react-router-dom";

function Linha({ xField, yField, data }) {
    const { darkMode } = useOutletContext();
    if (!Array.isArray(data)) {
        data = [data];
    }

    const dataNumber = data.map(item => ({
        [xField]: new Date(item[xField]),
        [yField]: parseFloat(item[yField])
    })).sort((a, b) => new Date(a[xField]) - new Date(b[xField]))

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
            fill: darkMode ? '#ffffff' : '#000000',
        },
    };
    if (dataNumber.length === 0) {
        return (
            <div
                style={{
                    textAlign: "center",
                    color: darkMode ? "#ffffff" : "#000000",
                    padding: "20px",
                }}
            >
                <p>Não há dados para exibir.</p>
                <p>Adicione novos registros para renderizar o gráfico.</p>
            </div>
        );
    }
    return <Line {...config} />;

}

export default Linha