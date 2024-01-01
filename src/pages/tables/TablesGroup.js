import React, { useState, useEffect } from 'react';
import { Button, Col, Input, Row, Space, Table, Tabs } from 'antd';
import { AppstoreAddOutlined, SyncOutlined } from '@ant-design/icons';
import { find } from 'lodash';
import { useNavigate } from 'react-router-dom';

import TablesGoupForm from '../../components/tables/TablesGroupForm';
import tablesServices from '../../services/TablesServices';

import { Wrapper } from '../../styled-components/Wrapper';
import { customNot } from '../../utils/Notifications';
import { filterData } from '../../utils/Filters';
import { columnActionsDef, columnDef } from '../../utils/ColumnsDefinitions';

import { getUserLocation } from '../../utils/LocalData';

const { Search } = Input;

function TablesGroups() {

    const [fetching, setFetching] = useState(false);
    const [filter, setFilter] = useState('');

    const [openForm, setOpenForm] = useState(false);
    const [formUpdateMode, setFormUpdateMode] = useState(false);

    const [entityData, setEntityData] = useState([]);
    const [entityRefreshData, setEntityRefreshData] = useState(0);
    const [entityToUpdate, setEntityToUpdate] = useState({});

    const navigate = useNavigate();

    async function loadData() {
        setFetching(true);
        const response = await tablesServices.findGroup(getUserLocation());
        setEntityData(response.data);
        setFetching(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    const columns = [
        columnDef({ title: 'Id', dataKey: 'id' }),
        columnDef({ title: 'Nombres', dataKey: 'name' }),
        columnActionsDef(
            {
                title: 'Acciones',
                dataKey: 'id',
                detailAction: (value) => customNot('info', 'En desarrollo', 'Próximamente'),
                editAction: (value) => {
                    setOpenForm(true);
                    setFormUpdateMode(true);
                    setEntityToUpdate(find(entityData, ['id', value]));
                },
            }
        ),
    ];

    return (
        <Wrapper>
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
                <Col span={24} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Search
                        name={'filter'}
                        value={filter}
                        placeholder="GRUPO"
                        allowClear
                        style={{ width: 300 }}
                        onChange={(e) => setFilter(e.target.value)}
                        size={'large'}
                    />
                    <Space>
                        <Button
                            size='large'
                            type='primary'
                            icon={<AppstoreAddOutlined />}
                            onClick={() => {
                                setEntityToUpdate({});
                                setOpenForm(true);
                            }}
                        >
                            Nuevo Grupo de Mesas
                        </Button>
                        <Button
                            size='large'
                            icon={<SyncOutlined />}
                            onClick={() => {
                                loadData();
                            }}
                        >
                            Actualizar
                        </Button>
                    </Space>
                </Col>
                <Col span={24}>
                    <Table
                        size='small'
                        style={{ width: '100%' }}
                        rowKey={'id'}
                        dataSource={filterData(entityData, filter, ['name']) || []}
                        columns={columns}
                    />
                </Col>
            </Row>
            <TablesGoupForm
                open={openForm}
                updateMode={formUpdateMode}
                dataToUpdate={entityToUpdate}
                onClose={(refresh) => {
                    setOpenForm(false);
                    setFormUpdateMode(false);
                    if (refresh) {
                        loadData();
                    }
                }}
            />
        </Wrapper>
    );
}

export default TablesGroups;