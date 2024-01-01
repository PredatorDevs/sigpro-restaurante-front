import React, { useState } from 'react';
import { Tabs } from 'antd';

import Tables from './Tables';
import TablesGroups from './TablesGroup';

function TablesRecord() {

    const [activeTab, setActiveTab] = useState('1');

    const tabChange = (key) => {
        setActiveTab(key);
    };

    const items = [
        {
            key: '1',
            label: 'Mesas',
            children: (
                <Tables />
            )
        },
        {
            key: '2',
            label: 'Grupo de Mesas',
            children: (
                <TablesGroups />
            )
        }
    ]

    return (
        <Tabs activeKey={activeTab} onChange={tabChange}>
            {items.map((item) => (
                <Tabs.TabPane key={item.key} tab={item.label}>
                    {activeTab === item.key && item.children}
                </Tabs.TabPane>
            ))}
        </Tabs>
    );
}

export default TablesRecord;