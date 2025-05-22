import { Pie } from '@antv/g2plot';
import { useEffect, useRef } from 'react';

const PieChart = ({ xField, yField, data }) => {
    const chartRef = useRef(null)

    useEffect(() => {

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
    }, [])

    return (
        <div style={{ padding: 10 }} ref={chartRef}></div>
    )

}

export default PieChart;