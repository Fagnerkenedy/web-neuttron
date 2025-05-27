import { Pie } from '@antv/g2plot';
import { useEffect, useRef } from 'react';
import noData from './noData';

const PieChart = ({ xField, yField, data }) => {
    const chartRef = useRef(null)

    useEffect(() => {
        if (data.length === 0) return

        const piePlot = new Pie(chartRef.current, {
            appendPadding: 10,
            data,
            colorField: xField,
            angleField: yField,
            radius: 0.8,
            label: {
                type: 'outer',
                content: '{name} {percentage}',
            },
            interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
        });

        piePlot.render();

        return () => {
            piePlot.destroy();
        };
    }, [data, xField, yField])

    if (data.length === 0) {
        return noData()
    }

    return (
        <div style={{ padding: 10 }} ref={chartRef}></div>
    )

}

export default PieChart;