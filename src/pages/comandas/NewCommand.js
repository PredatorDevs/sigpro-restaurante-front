import { useEffect, useState } from "react";
import { Row, Col, Empty, Result, Button, Modal, Table, Tag } from "antd";
import { SaveOutlined, SendOutlined, WarningOutlined, DeleteOutlined, CopyOutlined } from "@ant-design/icons";

import { columnActionsDef, columnDef, columnMoneyDef } from '../../utils/ColumnsDefinitions';

import { Wrapper } from '../../styled-components/Wrapper';

import tablesServices from "../../services/TablesServices";
import cashiersServices from "../../services/CashiersServices.js";
import orderSalesServices from "../../services/OrderSalesServices.js";

import CategoriesScroll from "../../components/command/CategoriesScroll";

import { numberToLetters } from "../../utils/NumberToLetters.js";

import ProductsCard from "../../components/command/ProductsCards.js"
import AddProduct from "../../components/command/AddProduct.js";

import { getUserLocation, getUserMyCashier, getUserId } from '../../utils/LocalData';

import TableButton from "../../components/command/TableButton.js";

import { customNot } from "../../utils/Notifications.js";

import categoriesServices from '../../services/CategoriesServices.js';
import productsServices from "../../services/ProductsServices.js";
import { isEmpty, forEach } from "lodash";

import AuthorizeUserPINCode from "../../components/confirmations/AuthorizeUserPINCode.js";

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
            height: 25
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        }
    }
};

const { confirm } = Modal;

function NewCommand() {

    const [ableToProcess, setAbleToProcess] = useState(false);

    const [fetching, setFetching] = useState(false);
    const [fetchingTables, setFetchingTables] = useState(false);

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    const [tablesAvailable, setTablesAvailable] = useState([]);
    const [myTablesAvailable, setMyTablesAvailable] = useState([]);

    const [availableProducts, setAvailableProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [tableOrder, setTableOrder] = useState(0);
    const [openProductInfo, setOpenProductInfo] = useState(false);
    const [selectedProductData, setSelectedProductData] = useState([]);
    const [orderInTable, setOrderInTable] = useState([]);
    const [currentShiftcut, setCurrentShiftcutId] = useState(0);
    const [detailsOrder, setDetailsOrder] = useState([]);

    const [currentWaiter, setCurrentWaiter] = useState(0);
    const [openAuthUserPINCode, setOpenAuthUserPINCode] = useState(true);

    const [showButtons, setShowButtons] = useState(false);

    // #region Order Details
    async function getOrderInfo(tableId) {
        try {
            const response = await orderSalesServices.findByTableId(tableId);
            setOrderInTable(response.data[0]);
            setFetchingTables(false);
        } catch (error) {
            console.error("Error fetching order info:", error);
        }
    }

    useEffect(() => {
        if (tableOrder) {
            getOrderInfo(tableOrder);
        } else {
            setOrderInTable([]);
        }
    }, [tableOrder]);

    async function getOrderDetails(orderId) {
        try {
            const response = await orderSalesServices.details.findByOrderId(orderId);
            setDetailsOrder(response.data[0]);
            if (isEmpty(response.data[0])) {
                setShowButtons(false);
            } else {
                setShowButtons(true);
            }

        } catch (error) {
            console.error("Error fetching order details:", error);
        }
    }

    useEffect(() => {
        if (orderInTable.length > 0) {
            getOrderDetails(orderInTable[0].id);
        } else {
            setShowButtons(false);
        }
    }, [orderInTable]);


    function getTotalCommand() {
        let total = 0;
        forEach(detailsOrder, (detail) => {
            total += (detail.quantity * detail.unitPrice);
        });

        return total || 0;
    }
    // #endregion Order Details

    // #region Check ShiftCut
    async function checkIfAbleToProcess() {
        setFetching(true);

        const response = await cashiersServices.checkIfAbleToProcess(getUserMyCashier());

        const { isOpen, currentShiftcutId } = response.data[0];

        if (isOpen === 1 && currentShiftcutId !== null) {
            setAbleToProcess(true);
            setCurrentShiftcutId(currentShiftcutId);
        }

        setFetching(false);
    }
    // #endregion Check ShiftCut

    // #region Loads
    async function loadData() {
        const response = await tablesServices.findAllInCommand(getUserLocation());
        setTablesAvailable(response.data[0]);

        // if (response.data.length > 0) {
        //     setTableOrder(response.data[0].id);
        // }

        const responseCategories = await categoriesServices.find();
        setCategories(responseCategories.data);

        if (responseCategories.data.length > 0) {
            setSelectedCategory(responseCategories.data[0]);
        }
    }

    async function loadMyTables() {
        try {
            const response = await tablesServices.findByPin(getUserLocation(), currentWaiter);
            setMyTablesAvailable(response.data[0]);
        } catch (error) {
            console.error("Error fetching tables:", error);
        }
    }

    useEffect(async () => {
        if (currentWaiter !== 0) {
            await loadMyTables();
        }
    }, [currentWaiter]);

    useEffect(() => {
        checkIfAbleToProcess();
        loadData();
    }, []);

    async function loadProductsData(categoryId) {
        const response = await productsServices.findByCategoryIdandLocationId(getUserLocation(), categoryId);
        setAvailableProducts(response.data);
        setLoading(false);
    }

    useEffect(() => {
        if (selectedCategory) {
            loadProductsData(selectedCategory.id);
            //loadProductsData(3);
        }
    }, [selectedCategory]);
    // #endregion Loads

    // #region
    function selectcategory(category) {
        setSelectedCategory(category);
        if (selectedCategory !== category) {
            setLoading(true);
        }
    }

    const changeTable = (value) => {
        if (value !== tableOrder) {
            setDetailsOrder([]);
            setOrderInTable([]);
            setShowButtons(false);
            setTableOrder(value);
        }
    }

    function selectedProduct(product) {
        if (tableOrder !== 0) {
            setOpenProductInfo(true);
            setSelectedProductData(product);
        } else {
            customNot('warning', 'Selecciona una mesa', 'Debe de seleccionar una mesa');
        }
    }

    async function updateTableStatus(status, orderId, tableId, byUpdate) {

        tablesServices.updateTableByOrderId(
            byUpdate ? orderId : null,
            !byUpdate ? orderId : null,
            status,
            tableId,
            getUserId()
        )
            .then(async (response) => {
                await loadData();
                await loadMyTables();
                customNot('success', 'Estado de la mesa actualizado', `Mesa: ${!status ? 'Disponible' : 'Ocupada'}`);
            })
            .catch((error) => {
                customNot('error', 'Algo salió mal', 'No se pudo actualizar el Estado de la mesa');
            });
    }

    async function createNewComanda(data, userDetails) {

        orderSalesServices.addCommand(
            getUserLocation(),
            4161,
            tableOrder,
            currentShiftcut,
            data.detailSubTotal,
            data.detailId,
            data.detailQuantity,
            data.detailUnitPrice,
            getUserId(),
            userDetails.commentOrder,
            currentWaiter,
            userDetails.nameOrder
        ).then(async (response) => {
            await getOrderInfo(tableOrder);
            await updateTableStatus(1, response.data[0].NewOrderID, tableOrder, true);
            customNot('success', 'Operación exitosa', 'Su orden fue añadida');
        }).catch((error) => {
            customNot('error', 'Algo salió mal', 'Su order no fue añadida');
        });
    }

    async function updateOrderCommand(data) {

        const { saleDetailToPush, orderInfo, userDetails } = data;
        if (orderInfo === orderInTable[0]) {
            orderSalesServices.details.addByCommand(
                orderInfo.id,
                saleDetailToPush.detailId,
                saleDetailToPush.detailUnitPrice,
                saleDetailToPush.detailQuantity,
                userDetails.commentOrder
            ).then(async (response) => {
                await getOrderInfo(tableOrder);
                customNot('success', 'Operación exitosa', 'Su orden fue actualizada');
            }).catch((error) => {
                customNot('error', 'Algo salió mal', 'Su order no fue actualizada');
            });
        }
    }
    // #endregion

    async function deleteProductDetails(productId) {

        orderSalesServices.details.removeByOrderDetailId(productId)
            .then(async (response) => {
                await getOrderInfo(tableOrder);
                customNot('success', 'Operación exitosa', 'Detalle eliminado');
            })
            .catch((error) => {
                customNot('info', 'Algo salió mal', 'El detalle no pudo ser eliminado');
            });
    }

    async function sendToKitchen() {
        const orderId = orderInTable[0].id;

        Modal.confirm({
            title: '¿Enviar Detalle a cocina?',
            centered: true,
            icon: <WarningOutlined />,
            content: `Los detalles ya no se podrán modificar`,
            okText: 'Confirmar',
            okType: 'info',
            cancelText: 'Cancelar',
            onOk() {
                orderSalesServices.details.sendToKitchen(orderId)
                    .then(async (response) => {
                        await getOrderInfo(tableOrder);
                        customNot('success', 'Operación exitosa', 'Detalle enviados a cocina');
                    })
                    .catch((error) => {
                        customNot('info', 'Algo salió mal', 'No se pudo enviar a cocina');
                    });
            },
            onCancel() { },
        });
    }

    const columns = [
        columnDef({
            title: 'Estado', dataKey: 'isActive', customRender: isActive => (
                <Tag
                    color={isActive ? '#D9F7BE' : '#BAE0FF'}
                    style={{
                        display: 'block',
                        maxWidth: '100%',
                        height: '20px',
                        textAlign: "center",
                        color: "black",
                    }}>
                    {isActive ? 'Ordenando' : 'En Cocina'}
                </Tag >
            )
        }),
        columnDef({ title: 'Cantidad', dataKey: 'quantity', customRender: quantity => (parseInt(quantity)) }),
        columnDef({ title: 'Detalle', dataKey: 'ProductName' }),
        columnMoneyDef({ title: 'Precio Unitario', dataKey: 'unitPrice' }),
        columnMoneyDef({ title: 'Exento', dataKey: 'detailNoTaxableTotal' }),
        columnMoneyDef({ title: 'Gravado', dataKey: 'TotalDetail' }),
        columnActionsDef(
            {
                title: 'Acciones',
                dataKey: 'id',
                detail: false,
                edit: false,
                del: true,
                delAction: async (value) => {
                    confirm({
                        centered: true,
                        title: '¿Desea eliminar este detalle?',
                        icon: <DeleteOutlined />,
                        content: 'Acción irreversible',
                        okType: 'danger',
                        okText: 'Eliminar',
                        async onOk() {
                            await deleteProductDetails(value);
                        },
                        onCancel() { },
                    });
                },
            }
        ),
    ];

    return (
        !ableToProcess ?
            <>
                <Result
                    status="info"
                    title={<p style={{ color: '#434343' }}>{`${fetching ? "Cargando..." : "Caja cerrada, operaciones de comandas limitadas"}`}</p>}
                    subTitle={<p style={{ color: '#434343' }}>{`${fetching ? "Por favor espere..." : "Usted debe aperturar un nuevo turno en su caja para poder procesar"}`}</p>}
                />
            </> :
            <Wrapper>
                <Col style={{ width: '100%' }}>
                    <CategoriesScroll categories={categories} selectedCategory={selectedCategory} onClick={selectcategory} />
                    <ProductsCard products={availableProducts} loading={loading} selectedProduct={selectedProduct} />
                </Col>

                <div
                    style={{
                        backgroundColor: '#F5F5F5',
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: '10px',
                        width: '100%'
                    }}
                >
                    <Row gutter={16} style={{ width: '100%' }}>
                        <Col span={17} style={{
                            display: "flex",
                            gap: 15,
                            flexDirection: 'column'
                        }}>
                            {!tableOrder ?
                                <Empty description="Seleccione una mesa..." />
                                :
                                <>
                                    {
                                        isEmpty(orderInTable) ?
                                            <>
                                                <Empty description="Mesa sin ordenes" style={{}} />
                                            </> :
                                            <>
                                                <Table
                                                    columns={columns}
                                                    rowKey={'id'}
                                                    size={'small'}
                                                    pagination={false}
                                                    dataSource={detailsOrder || []}
                                                />
                                            </>
                                    }
                                </>}
                            <div style={styleSheet.tableFooter.footerCotainer}>
                                <div style={styleSheet.tableFooter.detailContainerLetters}>
                                    <p style={styleSheet.tableFooter.detailLabels.normal}>{`SON:`}</p>
                                    <p style={styleSheet.tableFooter.detailLabels.normal}>{`${numberToLetters(getTotalCommand())}`}</p>
                                </div>
                                <div style={{ width: '30%' }}>
                                    <div style={styleSheet.tableFooter.detailContainer}>
                                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`GRAVADO:`}</p>
                                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`$${parseFloat(getTotalCommand()).toFixed(2)}`}</p>
                                    </div>
                                    <div style={styleSheet.tableFooter.detailContainer}>
                                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`SUBTOTAL:`}</p>
                                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`$${parseFloat(getTotalCommand()).toFixed(2)}`}</p>
                                    </div>
                                    <div style={styleSheet.tableFooter.detailContainer}>
                                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`EXENTO:`}</p>
                                        <p style={styleSheet.tableFooter.detailLabels.normal}>{`$0.00`}</p>
                                    </div>
                                    <div style={styleSheet.tableFooter.detailContainer}>
                                        <p style={styleSheet.tableFooter.detailLabels.emphatized}>{`VENTA TOTAL`}</p>
                                        <p style={styleSheet.tableFooter.detailLabels.emphatized}>{`$${parseFloat(getTotalCommand()).toFixed(2)}`}</p>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col span={7}>
                            <div style={{
                                backgroundColor: '#d9d9d9',
                                borderRadius: '5px',
                                gap: 10,
                                width: '100%',
                                display: "flex",
                                alignItems: "center",
                                flexDirection: 'column'
                            }}>
                                <strong style={styleSheet.TableStyles.headerStyle}>Mesas Disponibles</strong>
                                <div style={styleSheet.TableStyles.gridContainerStyle}>
                                    {tablesAvailable.map((table) => (
                                        <TableButton
                                            key={table.id}
                                            table={table}
                                            tableOrder={tableOrder}
                                            fetchingTables={fetchingTables}
                                            onChangeTable={changeTable}
                                        />
                                    ))}
                                </div>
                                <div style={{ width: '100%', textAlign: 'center' }}>

                                    {
                                        isEmpty(myTablesAvailable) ?
                                            <>
                                            </>
                                            :
                                            <>
                                                <strong style={styleSheet.TableStyles.headerStyle}>Mis Mesas</strong>
                                                <div style={styleSheet.TableStyles.gridContainerStyle}>
                                                    {myTablesAvailable.map((table) => (
                                                        <TableButton
                                                            key={table.id}
                                                            table={table}
                                                            tableOrder={tableOrder}
                                                            fetchingTables={fetchingTables}
                                                            onChangeTable={changeTable}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                    }
                                </div>

                                <div style={{ width: '100%' }}>
                                    <Button
                                        type={'primary'}
                                        icon={<SaveOutlined />}
                                        disabled={!showButtons}
                                        style={{ margin: 5, width: 'calc(100% - 10px)' }}
                                    // onClick={() => formAction()}
                                    // disabled={fetching}
                                    >
                                        CONFIRMAR
                                    </Button>
                                    <div style={{ display: "flex", width: '100%', justifyContent: "space-between" }}>
                                        <Button
                                            type={'button'}
                                            disabled={!showButtons}
                                            icon={<SendOutlined />}
                                            style={{ margin: 5, width: '50%', fontSize: '0.7rem' }}
                                            onClick={() => sendToKitchen()}
                                        // onClick={() => formAction()}
                                        // disabled={fetching}
                                        >
                                            ENVIAR A COCINA
                                        </Button>
                                        <Button
                                            icon={<CopyOutlined />}
                                            disabled={!showButtons}
                                            style={{ margin: 5, width: '50%', fontSize: '0.7rem' }}
                                        // onClick={() => formAction()}
                                        // disabled={fetching}
                                        >
                                            CREAR DETALLE
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                <AddProduct
                    open={openProductInfo}
                    orderDetails={orderInTable}
                    productSelected={selectedProductData}
                    productsInOrder={detailsOrder}
                    onClose={(saleDetailToPush, executePush, currentStock, userDetails) => {

                        setOpenProductInfo(false);

                        if (executePush) {
                            createNewComanda(saleDetailToPush, userDetails);
                        }

                    }}
                    onUpdate={(saleDetailToPush, executePut, orderInfo, userDetails) => {
                        setOpenProductInfo(false);

                        if (executePut) {
                            updateOrderCommand({ saleDetailToPush, orderInfo, userDetails });
                        }
                    }}
                />

                <AuthorizeUserPINCode
                    open={openAuthUserPINCode}
                    title={`PIN requerido`}
                    confirmButtonText={'Confirmar'}
                    onClose={(authorized, userAuthorizer) => {
                        const { successAuth } = userAuthorizer;
                        if (authorized && successAuth) {
                            const { userPINCode } = userAuthorizer;

                            setCurrentWaiter(userPINCode);
                        }
                        setOpenAuthUserPINCode(false);
                    }}
                />


            </Wrapper >
    );
}

export default NewCommand;