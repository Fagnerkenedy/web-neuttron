import { Bar } from '@antv/g2plot';
import { useEffect, useRef } from 'react';

const BarChart = ({ xField, yField, data }) => {
    const chartRef = useRef(null)

    useEffect(() => {

        const barPlot = new Bar(chartRef.current, {
            data,
            xField: yField,
            yField: xField,
            seriesField: xField,
            legend: {
                position: 'top-left',
            },
        });

        barPlot.render();

        return () => {
            barPlot.destroy();
        };
    }, [])

    return (
        <div style={{ padding: 10 }} ref={chartRef}></div>
    )

}

export default BarChart;