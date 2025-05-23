import { Funnel } from '@antv/g2plot';
import { useEffect, useRef } from 'react';

const FunnelChart = ({ xField, yField, data }) => {
    const chartRef = useRef(null)

    useEffect(() => {

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
    }, [])

    return (
        <div style={{ padding: 10 }} ref={chartRef}></div>
    )

}

export default FunnelChart;