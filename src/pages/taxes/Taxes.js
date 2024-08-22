import { useState, useEffect } from "react";
import { Wrapper } from "../../styled-components/Wrapper";
import { Row, Col, Input, Space, Button, Table, Tag } from "antd";
import { find } from 'lodash';

import { AppstoreAddOutlined, SyncOutlined } from "@ant-design/icons";

import { getUserLocation } from '../../utils/LocalData';
import { printerServices } from "../../services/PrinterServices";
import { columnActionsDef, columnDef } from '../../utils/ColumnsDefinitions';

import { filterData } from '../../utils/Filters';
import taxesServices from "../../services/taxesServices";

import TaxForm from "../../components/taxes/TaxForm";
import TaxDetails from "../../components/taxes/TaxDetails";

const { Search } = Input;

function Taxes() {

    const [filter, setFilter] = useState('');
    const [fetching, setFetching] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [formUpdateMode, setFormUpdateMode] = useState(false);

    const [entityData, setEntityData] = useState([]);
    const [entityToUpdate, setEntityToUpdate] = useState({});
    const [openDetails, setOpenDetails] = useState(false);

    async function loadData() {
        setFetching(true);
        const response = await taxesServices.findByLocationId(getUserLocation());
        setEntityData(response.data);
        setFetching(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    const columns = [
        columnDef({ title: 'Codigo Interno', dataKey: 'id' }),
        columnDef({ title: 'Nombre', dataKey: 'name' }),
        columnDef({
            title: 'Cantidad',
            dataKey: 'taxRate',
            customRender: (text, record) => (

                <Tag color={'blue'} style={{
                    display: 'block',
                    maxWidth: 55
                }}>
                    {
                        record.isPercentage === 1 ?
                            `${(parseFloat(text) * 100).toFixed(2)}%` :
                            `$${parseFloat(text).toFixed(2)}`
                    }
                </Tag>
            )
        }),
        columnDef({
            title: 'Es Porcentual',
            dataKey: 'isPercentage',
            customRender: isPercentage => (
                <Tag color={isPercentage === 1 ? 'green' : 'red'} style={{
                    display: 'block',
                    maxWidth: 30
                }}>
                    {isPercentage === 1 ? 'Si' : 'No'}
                </Tag>
            )
        }),
        columnDef({
            title: 'Aplicable a productos alcoholicos',
            dataKey: 'isAlcoholic',
            customRender: isApplicable => (
                <Tag color={isApplicable === 1 ? 'green' : 'red'} style={{
                    display: 'block',
                    maxWidth: 30
                }}>
                    {isApplicable === 1 ? 'Si' : 'No'}
                </Tag>
            )
        }),
        columnActionsDef(
            {
                title: 'Acciones',
                dataKey: 'id',
                detailAction: (value) => {
                    setOpenDetails(true);
                    setFormUpdateMode(true);
                    setEntityToUpdate(find(entityData, ['id', value]));
                },
                editAction: (value) => {
                    setOpenForm(true);
                    setFormUpdateMode(true);
                    setEntityToUpdate(find(entityData, ['id', value]));
                },
            }
        )
    ];

    return (
        <Wrapper>
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
                <Col span={24} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Search
                        name={'filter'}
                        value={filter}
                        placeholder="IMPUESTO"
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
                            Nuevo Impuesto
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
                        rowKey={'id'}
                        dataSource={filterData(entityData, filter, ['name']) || []}
                        columns={columns}
                    />
                </Col>
            </Row>

            <TaxForm
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

            <TaxDetails
                open={openDetails}
                entryType={formUpdateMode}
                details={entityToUpdate}
                onClose={() => {
                    setOpenDetails(false);
                    setFormUpdateMode(false);
                }} />
        </Wrapper>
    );
}

export default Taxes;