import { Line } from '@antv/g2plot';
import { useEffect, useRef } from 'react';

const LineChart = ({ xField, yField, data }) => {
    const chartRef = useRef(null)

    useEffect(() => {

        const line = new Line(chartRef.current, {
            data,
            padding: 'auto',
            xField: xField,
            yField: yField,
            xAxis: {
                // type: 'timeCat',
                tickCount: 5,
            },
        });

        line.render();

        return () => {
            line.destroy();
        };
    }, [])

    return (
        <div style={{ padding: 10 }} ref={chartRef}></div>
    )

}

export default LineChart;