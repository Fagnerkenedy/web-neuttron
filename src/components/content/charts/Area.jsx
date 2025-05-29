import { Area } from '@antv/g2plot';
import { useEffect, useRef } from 'react';
import noData from './noData';

const AreaChart = ({ xField, yField, data }) => {
    const chartRef = useRef(null)

    useEffect(() => {
        if (data.length === 0) return

        const areaPlot = new Area(chartRef.current, {
            data,
            xField: xField,
            yField: yField,
            xAxis: {
                range: [0, 1],
                tickCount: 5,
            },
            areaStyle: () => {
                return {
                    fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
                };
            },
        });

        areaPlot.render();

        return () => {
            areaPlot.destroy();
        };
    }, [data, xField, yField])
    
    if (data.length === 0) {
        return noData()
    }

    return (
        <div style={{ padding: 10 }} ref={chartRef}></div>
    )

}

export default AreaChart;