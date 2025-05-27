import { Rose } from '@antv/g2plot';
import { useEffect, useRef } from 'react';
import noData from './noData';

const RoseChart = ({ xField, yField, data }) => {
    const chartRef = useRef(null)
    
    useEffect(() => {
        if (data.length === 0) return

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
    }, [data, xField, yField])

    if (data.length === 0) {
        return noData()
    }

    return (
        <div style={{ padding: 10 }} ref={chartRef}></div>
    )

}

export default RoseChart;