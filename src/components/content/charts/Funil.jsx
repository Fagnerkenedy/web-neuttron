import React from "react";
import { Funnel } from '@ant-design/plots';
import { useOutletContext } from "react-router-dom";

function Funil({ xField, yField, data }) {
    const { darkMode } = useOutletContext();
    if (!Array.isArray(data)) {
        data = [data];
    }
    const dataa = [
        { action: '浏览网站', pv: 50000 },
        { action: '放入购物车', pv: 35000 },
        { action: '生成订单', pv: 25000 },
        { action: '支付订单', pv: 15000 },
        { action: '完成交易', pv: 8000 },
    ];
    // const newData = data.map(item => ({
    //     action: item.name,
    //     pv: item.value
    // }))
    console.log("datadatadata", data)

    const dataNumber = data.map(item => ({
        [xField]: item[xField],
        [yField]: parseFloat(item[yField])
    }))
    console.log("dataNumber", dataNumber)

    const config = {
        data: dataNumber,
        xField: xField,
        yField: yField,
        // shapeField: 'pyramid',
        label: [
            {
                text: (d) => d[yField],
                // position: 'inside',
                fontSize: 16,
                style: {
                    fill: darkMode ? '#ffffff' : '#000000',
                }
            },
            {
                render: ($, _, i) => {
                    if (i)
                        return (
                            <div
                                style={{
                                    height: 1,
                                    width: 30,
                                    background: '#aaa',
                                    margin: '0 20',
                                }}
                            ></div>
                        );
                },
                position: 'top-right',
            },
            {
                text: (d, i, data) => {
                    if (i) return ((d[yField] / data[i - 1][yField]) * 100).toFixed(2) + '%';
                },
                position: 'top-right',
                textAlign: 'left',
                textBaseline: 'middle',
                dx: 40,
                style: {
                    fill: darkMode ? '#ffffff' : '#000000',
                }
            },
        ],
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
    return <Funnel {...config} />;

}

export default Funil