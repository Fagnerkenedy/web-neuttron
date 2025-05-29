import { Line } from '@antv/g2plot';
import { useEffect, useRef } from 'react';
import noData from './noData';

const LineChart = ({ xField, yField, data }) => {
    const chartRef = useRef(null)

    useEffect(() => {
        if (data.length === 0) return
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
    }, [data, xField, yField])

    if (data.length === 0) {
        return noData()
    }

    return (
        <div style={{ padding: 10 }} ref={chartRef}></div>
    )

}

export default LineChart;