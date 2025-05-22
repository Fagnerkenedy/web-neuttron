import { Pie } from '@antv/g2plot';
import { useEffect, useRef } from 'react';

const DonutChart = ({ xField, yField, data }) => {
    const chartRef = useRef(null)

    useEffect(() => {

        const donutPlot = new Pie(chartRef.current, {
            appendPadding: 10,
            data,
            colorField: xField,
            angleField: yField,
            radius: 1,
            innerRadius: 0.6,
            label: {
                type: 'inner',
                offset: '-50%',
                content: '{value}',
                style: {
                    textAlign: 'center',
                    fontSize: 14,
                },
            },
            interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
            statistic: {
                title: false,
                content: {
                    style: {
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    },
                    content: '',
                },
            },
        });

        donutPlot.render();

        return () => {
            donutPlot.destroy();
        };
    }, [])

    return (
        <div style={{ padding: 10 }} ref={chartRef}></div>
    )

}

export default DonutChart;