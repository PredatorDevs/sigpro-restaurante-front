import { useState, useEffect } from "react";
import { Wrapper } from "../../styled-components/Wrapper";
import { Row, Col, Input, Space, Button, Table, Tag } from "antd";
import { find } from 'lodash';

import { AppstoreAddOutlined, SyncOutlined } from "@ant-design/icons";

import { getUserLocation } from '../../utils/LocalData';
import { printerServices } from "../../services/PrinterServices";
import { columnActionsDef, columnDef } from '../../utils/ColumnsDefinitions';

import { filterData } from '../../utils/Filters';
import PrinterFrom from "../../components/printers/PrinterFrom";
import PrinterDetails from "../../components/printers/PrinterDetails";

const { Search } = Input;

function Printers() {

    const [filter, setFilter] = useState('');
    const [fetching, setFetching] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [formUpdateMode, setFormUpdateMode] = useState(false);

    const [entityData, setEntityData] = useState([]);
    const [entityToUpdate, setEntityToUpdate] = useState({});
    const [openDetails, setOpenDetails] = useState(false);

    async function loadData() {
        setFetching(true);
        const response = await printerServices.findByLocationId(getUserLocation());
        setEntityData(response.data);
        setFetching(false);
    }

    const columns = [
        columnDef({ title: 'Codigo Interno', dataKey: 'printerid' }),
        columnDef({ title: 'Nombre', dataKey: 'name' }),
        columnDef({ title: 'Dirección IP', dataKey: 'ip' }),
        columnDef({ title: 'Puerto', dataKey: 'port' }),
        columnDef({
            title: 'Dirección Completa',
            dataKey: 'printerdirection',
            customRender: printerdirection => (
                <Tag color={'blue'} style={{
                    display: 'block',
                    cursor: 'copy'
                }}>
                    {printerdirection}
                </Tag>
            )
        }),
        columnActionsDef(
            {
                title: 'Acciones',
                dataKey: 'printerid',
                detailAction: (value) => {
                    setOpenDetails(true);
                    setFormUpdateMode(true);
                    setEntityToUpdate(find(entityData, ['printerid', value]));
                },
                editAction: (value) => {
                    setOpenForm(true);
                    setFormUpdateMode(true);
                    setEntityToUpdate(find(entityData, ['printerid', value]));
                },
            }
        )
    ];

    useEffect(() => {
        loadData();
    }, []);

    return (
        <Wrapper>
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
                <Col span={24} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Search
                        name={'filter'}
                        value={filter}
                        placeholder="IMPRESORA"
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
                                setFormUpdateMode(false);
                            }}
                        >
                            Nueva Impresora
                        </Button>
                        <Button
                            loading={fetching}
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
                        loading={fetching}
                        size='small'
                        style={{ width: '100%' }}
                        rowKey={'printerid'}
                        dataSource={filterData(entityData, filter, ['name']) || []}
                        columns={columns}
                    />
                </Col>
            </Row>

            <PrinterFrom
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
            <PrinterDetails
                open={openDetails}
                entryType={formUpdateMode}
                details={entityToUpdate}
                onClose={() => {
                    setOpenDetails(false);
                    setFormUpdateMode(false);
                }}
            />
        </Wrapper>
    );
}

export default Printers;