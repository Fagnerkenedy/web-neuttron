import { Bar } from '@antv/g2plot';
import { useEffect, useRef } from 'react';
import noData from './noData';

const BarChart = ({ xField, yField, data }) => {
    const chartRef = useRef(null)

    useEffect(() => {
        if (data.length === 0) return

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
    }, [data, xField, yField])

    if (data.length === 0) {
        return noData()
    }

    return (
        <div style={{ padding: 10 }} ref={chartRef}></div>
    )

}

export default BarChart;