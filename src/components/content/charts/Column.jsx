import { Column } from '@antv/g2plot';
import { useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import noData from './noData';

const ColumnChart = ({ xField, yField, data }) => {
    const chartRef = useRef(null)
    const { darkMode } = useOutletContext();
    
    useEffect(() => {
        if (data.length === 0) return
        const columnPlot = new Column(chartRef.current, {
            data,
            xField: xField,
            yField: yField,
            // theme: darkMode ? 'dark' : '',
            label: {
                position: 'middle', // 'top', 'bottom', 'middle',
                style: {
                    // fill: '#FFFFFF',
                    opacity: 0.6,
                },
            },
            xAxis: {
                label: {
                    autoHide: true,
                    autoRotate: true,
                },
            },
        });

        columnPlot.render();

        return () => {
            columnPlot.destroy();
        };
    }, [data, xField, yField])

    if (data.length === 0) {
        return noData()
    }

    return (
        <div style={{ padding: 10 }} ref={chartRef}></div>
    )

}

export default ColumnChart;