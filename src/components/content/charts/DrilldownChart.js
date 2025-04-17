import React, { useEffect, useRef, useState } from "react";
import { Column } from '@antv/g2plot';

const DrilldownChart = () => {
    const chartRef = useRef(null);

    const initialData = [
        { category: "Eletrônicos", value: 5000 },
        { category: "Roupas", value: 3000 },
        { category: "Alimentos", value: 4000 },
    ];

    const detailData = {
        Eletrônicos: [
            { category: "Celulares", value: 2500 },
            { category: "Notebooks", value: 2000 },
            { category: "Fones", value: 500 },
        ],
        Roupas: [
            { category: "Camisetas", value: 1200 },
            { category: "Calças", value: 1000 },
            { category: "Tênis", value: 800 },
        ],
        Alimentos: [
            { category: "Frutas", value: 1500 },
            { category: "Carnes", value: 1800 },
            { category: "Bebidas", value: 700 },
        ],
    };

    const [data, setData] = useState(initialData);
    const [isDrilldown, setIsDrilldown] = useState(false);

    useEffect(() => {
        if (!chartRef.current) return;

        const chart = new Column(chartRef.current, {
            data,
            xField: "category",
            yField: "value",
            columnWidthRatio: 0.6,
            label: {
                style: { fill: "#fff" },
            },
            interactions: [{ type: "element-active" }],
        });

        chart.render();

        chart.on("element:click", (event) => {
            const clickedCategory = event.data?.data?.category;
            if (!isDrilldown && detailData[clickedCategory]) {
                setData(detailData[clickedCategory]);
                setIsDrilldown(true);
            }
        });

        return () => chart.destroy();
    }, [data, isDrilldown]);

    return (
        <div>
            {isDrilldown && (
                <button onClick={() => { setData(initialData); setIsDrilldown(false); }}>
                    Voltar
                </button>
            )}
            <div ref={chartRef} style={{ width: "50%", height: 400 }} />
        </div>
    );
};

export default DrilldownChart;
