import { Funnel } from '@antv/g2plot';
import { useEffect, useRef } from 'react';
import noData from './noData';

const FunnelChart = ({ xField, yField }) => {
    const chartRef = useRef(null)
    const data = []
    useEffect(() => {
        if (data.length === 0) return

        const funnelPlot = new Funnel(chartRef.current, {
            data,
            xField: xField,
            yField: yField,
            dynamicHeight: true,
            legend: true,
            // shapeField: 'pyramid',
        });

        funnelPlot.render();

        return () => {
            funnelPlot.destroy();
        };
    }, [data, xField, yField])

    if (data.length === 0) {
        return noData()
    }

    return (
        <div style={{ padding: 10 }} ref={chartRef}></div>
    )
}

export default FunnelChart;
