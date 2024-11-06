// SortableItem.js
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Menu, Checkbox } from 'antd';

export const SortableItem = ({ id, item }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginBottom: 8,
        display: 'block',
        width: '100%',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Menu.Item style={{ padding: '8px 16px' }}>
                <Checkbox style={{ marginRight: 8 }} />
                <span>{item.name}</span>
            </Menu.Item>
        </div>
    );
};
