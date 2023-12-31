import { Tabs } from 'antd';

import Tables from './Tables';
import TablesGroups from './TablesGroup';

function TablesRecord() {

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
        <Tabs defaultActiveKey="1" items={items} />
    );
}

export default TablesRecord;