import { Gauge } from '@antv/g2plot';
import { useEffect, useRef } from 'react';
import noData from './noData';

const GaugeChart = ({ xField, yField, data }) => {
    const chartRef = useRef(null)

    useEffect(() => {
        if (data.length === 0) return

        const gaugePlot = new Gauge(chartRef.current, {
            percent: data,
            range: {
                color: '#30BF78',
            },
            indicator: {
                pointer: {
                    style: {
                        stroke: '#D0D0D0',
                    },
                },
                pin: {
                    style: {
                        stroke: '#D0D0D0',
                    },
                },
            },
            axis: {
                label: {
                    formatter(v) {
                        return Number(v) * 100;
                    },
                },
                subTickLine: {
                    count: 3,
                },
            },
            statistic: {
                content: {
                    formatter: ({ percent }) => `Rate: ${(percent * 100).toFixed(0)}%`,
                    style: {
                        color: 'rgba(0,0,0,0.65)',
                        fontSize: 48,
                    },
                },
            },
        });

        gaugePlot.render();

        return () => {
            gaugePlot.destroy();
        };
    }, [data])

    if (data.length === 0) {
        return noData()
    }

    return (
        <div style={{ padding: 10 }} ref={chartRef}></div>
    )

}

export default GaugeChart;