import { useState, useEffect } from "react";
import { Empty, Table, Tag, Modal, Spin } from "antd";
import { DeleteOutlined, WarningOutlined } from "@ant-design/icons";

import orderSalesServices from "../../services/OrderSalesServices";
import { isEmpty, forEach, find } from "lodash";
import { numberToLetters } from "../../utils/NumberToLetters";
import { customNot } from "../../utils/Notifications";
import { columnDef, columnMoneyDef } from '../../utils/ColumnsDefinitions';

const styleSheet = {
    tableFooter: {
        footerCotainer: {
            backgroundColor: '#d9d9d9',
            borderRadius: '5px',
            display: 'flex',
            flexDirection: 'row',
            padding: 5,
            width: '100%',
            gap: 5
        },
        detailContainer: {
            backgroundColor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderRadius: '5px',
            marginBottom: '5px',
            padding: 5,
            width: '100%'
        },
        detailContainerLetters: {
            backgroundColor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderRadius: '5px',
            marginBottom: '5px',
            padding: 5,
            width: '70%',
            height: '10%'
        },
        detailLabels: {
            normal: {
                margin: 0,
                fontSize: 12,
                color: '#434343'
            },
            emphatized: {
                margin: 0,
                fontSize: 12,
                color: '#434343',
                fontWeight: 600
            }
        }
    },
    TableStyles: {
        containerStyle: {
            backgroundColor: '#d9d9d9',
            borderRadius: '5px',
            gap: 10,
            width: '100%',
            display: "flex",
            alignItems: "center",
            flexDirection: 'column',
        },
        headerStyle: {
            width: '100%',
            textAlign: 'center',
            paddingTop: 10,
        },
        gridContainerStyle: {
            padding: 5,
            width: '100%',
            display: 'grid',
            gap: '15px',
            maxHeight: '280px',
            marginBottom: '10px',
            overflowX: 'auto',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        }
    }
};

const { confirm } = Modal;

function DetailsCommand(props) {

    const { tableOrder, orderInTable, detailsOrder, fetchingDetails, onClickReprint, onClickDelete } = props;

    function getTotalCommand() {
        let total = 0;
        forEach(detailsOrder, (detail) => {
            total += (detail.quantity * detail.unitPrice);
        });

        return total || 0;
    }

    const columns = [
        columnDef({ title: 'Cantidad', dataKey: 'quantity', customRender: quantity => (parseInt(quantity)) }),
        columnDef({ title: 'Detalle', dataKey: 'ProductName' }),
        columnMoneyDef({ title: 'Precio Unitario', dataKey: 'unitPrice' }),
        columnMoneyDef({ title: 'Gravado', dataKey: 'TotalDetail' }),
        columnDef(
            {
                title: 'Acciones',
                dataKey: 'id',
                customRender: (value, record) => (
                    <div style={{ display: "flex", justifyContent: 'center' }}>
                        {
                            record.isPrinter === 1 ? (
                                <Tag
                                    color={'yellow'}
                                    style={{
                                        display: 'block',
                                        width: 30,
                                        cursor: "pointer"
                                    }}
                                    onClick={() => {
                                        customNot(`info`, `El detalle no pudo ser imprimido`, `Por favor, intente de nuevo`)
                                    }}
                                >
                                    <WarningOutlined color={'red'} />
                                </Tag >
                            ) : (
                                record.isActive === 0 ? (
                                    <Tag
                                        color={'blue'}
                                        style={{
                                            display: 'block',
                                            width: 30,
                                            cursor: "pointer"
                                        }}
                                        onClick={() => {
                                            customNot('info', 'No se puede eliminar el detalle', 'El detalle ya se encuentra en cocina');
                                        }}
                                    >
                                        <DeleteOutlined />
                                    </Tag >
                                ) : (

                                    <Tag
                                        color={'red'}
                                        style={{
                                            display: 'block',
                                            width: 30,
                                            cursor: "pointer"
                                        }}
                                        onClick={() => {
                                            const lengthProducts = detailsOrder.length;
                                            const productCheck = find(detailsOrder, ['id', value]);

                                            if (lengthProducts === 1) {
                                                customNot('warning', 'No se puede eliminar el detalle', 'La cuenta no puede quedar sin detalles');
                                            } else if (productCheck.isActive === 0) {
                                                customNot('info', 'No se puede eliminar el detalle', 'El detalle ya se encuentra en cocina');
                                            } else {
                                                confirm({
                                                    centered: true,
                                                    title: '¿Desea eliminar este detalle?',
                                                    icon: <DeleteOutlined />,
                                                    content: 'Acción irreversible',
                                                    okType: 'danger',
                                                    okText: 'Eliminar',
                                                    async onOk() {
                                                        onClickDelete(value);
                                                    },
                                                    onCancel() { },
                                                });
                                            }
                                        }}
                                    >
                                        <DeleteOutlined />
                                    </Tag >
                                )
                            )
                        }
                    </div>

                )

            }
        ),
    ];

    return (
        <div style={{
            display: "flex",
            gap: 15,
            flexDirection: 'column',
            width: "100%"
        }}>
            {!tableOrder ?
                <Empty description="Seleccione una Cuenta..." />
                :
                <>
                    {
                        isEmpty(orderInTable) ?
                            <>
                                <Empty description="Cuenta sin ordenes" style={{}} />
                            </> :
                            <Spin spinning={fetchingDetails}>
                                <Table
                                    columns={columns}
                                    rowKey={'id'}
                                    size={'small'}
                                    pagination={false}
                                    dataSource={detailsOrder || []}
                                />
                            </Spin>
                    }
                </>}
            <div style={styleSheet.tableFooter.footerCotainer}>
                <div className="letters-total" style={styleSheet.tableFooter.detailContainerLetters}>
                    <p style={styleSheet.tableFooter.detailLabels.normal}>{`SON:`}</p>
                    <p style={styleSheet.tableFooter.detailLabels.normal}>{`${numberToLetters(getTotalCommand())}`}</p>
                </div>
                <div className="other-totals" style={{ width: '30%' }}>
                    <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`GRAVADO:`}</p>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`$${parseFloat(getTotalCommand()).toFixed(2)}`}</p>
                    </div>
                    <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`SUBTOTAL:`}</p>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`$${parseFloat(getTotalCommand()).toFixed(2)}`}</p>
                    </div>
                    <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`PROPINA:`}</p>
                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`$0.00`}</p>
                    </div>
                    <div style={styleSheet.tableFooter.detailContainer}>
                        <p style={styleSheet.tableFooter.detailLabels.emphatized}>{`VENTA TOTAL`}</p>
                        <p style={styleSheet.tableFooter.detailLabels.emphatized}>{`$${parseFloat(getTotalCommand()).toFixed(2)}`}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailsCommand;