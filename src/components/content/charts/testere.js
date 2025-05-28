import { Column } from '@ant-design/plots';
import { Select } from 'antd';
import { useState } from 'react';

const Demo = () => {
    const [selectedType, setSelectedType] = useState('Todos');

    const rawData = [
        { type: 'A', value: 30 },
        { type: 'B', value: 20 },
        { type: 'C', value: 40 },
    ];

    const filteredData = selectedType === 'Todos'
        ? rawData
        : rawData.filter(d => d.type === selectedType);

    return (
        <>
            <Select
                value={selectedType}
                onChange={value => setSelectedType(value)}
                options={[
                    { label: 'Todos', value: 'Todos' },
                    { label: 'A', value: 'A' },
                    { label: 'B', value: 'B' },
                    { label: 'C', value: 'C' },
                ]}
                style={{ width: 200, marginBottom: 16 }}
            />
            <Column
                data={filteredData}
                xField="type"
                yField="value"
            />
        </>
    );
};

export default Demo;