import { Rose } from '@antv/g2plot';
import { useEffect, useRef } from 'react';

const RoseChart = ({ xField, yField, data }) => {
    const chartRef = useRef(null)

    useEffect(() => {

        const rosePlot = new Rose(chartRef.current, {
            data,
            xField: xField,
            yField: yField,
            seriesField: xField,
            radius: 0.9,
            legend: {
                position: 'bottom',
            },
        });

        rosePlot.render();

        return () => {
            rosePlot.destroy();
        };
    }, [])

    return (
        <div style={{ padding: 10 }} ref={chartRef}></div>
    )

}

export default RoseChart;