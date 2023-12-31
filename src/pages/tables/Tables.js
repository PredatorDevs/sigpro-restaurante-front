import React, { useState, useEffect } from 'react';
import { Button, Col, Input, Row, Space, Table, Tabs } from 'antd';
import { AppstoreAddOutlined, SyncOutlined } from '@ant-design/icons';
import { find } from 'lodash';
import { useNavigate } from 'react-router-dom';

import TablesForm from '../../components/tables/TablesForm';

import { Wrapper } from '../../styled-components/Wrapper';
import { customNot } from '../../utils/Notifications';
import { filterData } from '../../utils/Filters';
import { columnActionsDef, columnDef } from '../../utils/ColumnsDefinitions';

const { Search } = Input;

function Tables() {

    const [fetching, setFetching] = useState(false);
    const [filter, setFilter] = useState('');

    const [openForm, setOpenForm] = useState(false);
    const [formUpdateMode, setFormUpdateMode] = useState(false);

    const [entityData, setEntityData] = useState([]);
    const [entityRefreshData, setEntityRefreshData] = useState(0);
    const [entityToUpdate, setEntityToUpdate] = useState({});

    const navigate = useNavigate();

    function randomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const areasActives = [
        { id: 1, name: "Salón Principal" },
        { id: 2, name: "Sala Este" },
        { id: 3, name: "Sala Norte" },
        { id: 4, name: "Salón Principal" },
        { id: 5, name: "Área de Juegos" },
        { id: 6, name: "Área de Juegos" },
        { id: 7, name: "Área de Fumadores" },
        { id: 8, name: "Salón Secundario" }
    ];

    const tablesArr = [];

    for (let i = 1; i <= 40; i++) {
        const obj = {
            id: i,
            name: `Mesa ${i}`,
            maxcap: randomNum(2, 10),
            area: areasActives[randomNum(0, areasActives.length - 1)].name
        };

        tablesArr.push(obj);
    }

    async function loadData() {
        setFetching(true);
        setEntityData(tablesArr);
        setFetching(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    const columns = [
        columnDef({ title: 'Id', dataKey: 'id' }),
        columnDef({ title: 'Nombres', dataKey: 'name' }),
        //TODO: Ponerla tilde xd
        columnDef({ title: 'Area', dataKey: 'area' }),
        columnDef({ title: 'Capacidad Max', dataKey: 'maxcap' }),
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
                        placeholder="MESA #"
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
                            Nueva Mesa
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
            <TablesForm
                open={openForm}
                updateMode={formUpdateMode}
                dataToUpdate={entityToUpdate}
                areasAvailable={areasActives}
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

export default Tables;