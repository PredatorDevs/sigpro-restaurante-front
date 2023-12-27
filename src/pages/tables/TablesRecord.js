import React, { useState, useEffect } from 'react';
import { Button, Col, Input, Row, Space, Table } from 'antd';
import { AppstoreAddOutlined, SyncOutlined } from '@ant-design/icons';
import { find } from 'lodash';
import { useNavigate } from 'react-router-dom';

import categoriesServices from '../../services/CategoriesServices.js';

import { Wrapper } from '../../styled-components/Wrapper';
import { customNot } from '../../utils/Notifications';
import { filterData } from '../../utils/Filters';
import { columnActionsDef, columnDef } from '../../utils/ColumnsDefinitions';

const { Search } = Input;

function TablesRecord() {

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

    const areasActives = ["Salón Principal", "Sala Este", "Sala Norte", "Área de Juegos", "Comedor"];

    const tablesArr = [];

    for (let i = 1; i <= 20; i++) {
        const obj = {
            id: i,
            name: `Mesa ${i}`,
            maxcap: randomNum(2, 10),
            area: areasActives[randomNum(0, areasActives.length - 1)]
        };

        tablesArr.push(obj);
    }

    async function loadData() {
        setFetching(true);
        const response = await categoriesServices.find();
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
        </Wrapper>
    );
}

export default TablesRecord;