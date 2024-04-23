import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Result, Button, Modal, Card, Spin, Space } from "antd";
import { SendOutlined, WarningOutlined, CopyOutlined } from "@ant-design/icons";
import { GAddUserIcon, GClearIcon, GEditUserIcon } from "../../utils/IconImageProvider.js";

import { Wrapper } from '../../styled-components/Wrapper';

import tablesServices from "../../services/TablesServices";
import cashiersServices from "../../services/CashiersServices.js";
import orderSalesServices from "../../services/OrderSalesServices.js";

import CategoriesScroll from "../../components/command/CategoriesScroll";

import ProductsCard from "../../components/command/ProductsCards.js"
import AddProduct from "../../components/command/AddProduct.js";

import { getUserLocation, getUserMyCashier, getUserId } from '../../utils/LocalData';

import TableButton from "../../components/command/TableButton.js";

import { customNot } from "../../utils/Notifications.js";

import categoriesServices from '../../services/CategoriesServices.js';
import productsServices from "../../services/ProductsServices.js";
import { isEmpty, forEach } from "lodash";

import AuthorizeUserPINCode from "../../components/confirmations/AuthorizeUserPINCode.js";

import AddClientModal from "../../components/command/ClientToGoModal.js";

import { printerServices } from "../../services/PrintersServices.js";
import { printersServices } from "../../services/PrinterServices.js";

import DetailsCommand from "../../components/command/DetailsCommad.js";

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

function NewCommandToGo() {

    const navigate = useNavigate();

    const [ableToProcess, setAbleToProcess] = useState(false);

    const [fetching, setFetching] = useState(false);
    const [fetchingTables, setFetchingTables] = useState(false);
    const [fetchingMyTables, setFetchingMyTables] = useState(false);

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    const [tablesAvailable, setTablesAvailable] = useState([]);
    const [myTablesAvailable, setMyTablesAvailable] = useState([]);

    const [availableProducts, setAvailableProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [tableOrder, setTableOrder] = useState(0);
    const [openProductInfo, setOpenProductInfo] = useState(false);
    const [selectedProductData, setSelectedProductData] = useState([]);
    const [orderInTable, setOrderInTable] = useState({});
    const [currentShiftcut, setCurrentShiftcutId] = useState(0);
    const [detailsOrder, setDetailsOrder] = useState([]);

    const [currentWaiter, setCurrentWaiter] = useState({});
    const [openAuthUserPINCode, setOpenAuthUserPINCode] = useState(true);

    const [showButtons, setShowButtons] = useState(false);
    const [chargePreAccount, setChargePreAccount] = useState(false);
    const [chargeKitchen, setChargeKitchen] = useState(false);

    //Clients
    const [customerInfo, setCustomerInfo] = useState('');
    const [clientModal, setClientModal] = useState(false);
    const [updateCLienMode, setUpdateClientMode] = useState(false);
    const [fetchingClient, setFetchingClient] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    const [printers, setPrinters] = useState({});

    // #region Order Details
    async function getOrderInfo(tableId) {
        try {
            setFetchingClient(true);
            setFetchingDetails(true);
            const response = await orderSalesServices.findByTableId(tableId);
            const orderInformation = response.data[0];

            if (!isEmpty(orderInformation) && parseInt(orderInformation[0].userPINCode) !== currentWaiter.userPINCode) {
                setDetailsOrder([]);
                setOrderInTable({});
                setTableOrder(0);
                setFetchingMyTables(true);
                await loadData();
                await loadMyTables();
                customNot('warning', 'Cuenta No disponible', 'La cuenta seleccionada ya fue ocupada.');
            } else {

                setOrderInTable(orderInformation[0]);
                if (!isEmpty(orderInformation)) {
                    setCustomerInfo(orderInformation[0].orderIdentifier);
                } else {
                    setCustomerInfo('');
                }
            }
        } catch (error) {
            console.error("Error fetching order info:", error);
        } finally {
            setFetchingDetails(false);
            setFetchingClient(false);
            setFetchingTables(false);
        }
    }

    useEffect(() => {
        if (tableOrder) {
            getOrderInfo(tableOrder);
        } else {
            setOrderInTable({});
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
        if (!isEmpty(orderInTable)) {
            getOrderDetails(orderInTable.id);
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
        const response = await tablesServices.findAllInCommand(getUserLocation(), 3);
        setTablesAvailable(response.data[0]);

        const responseCategories = await categoriesServices.find();
        setCategories(responseCategories.data);

        const responsePrinters = await printersServices.findByLocationId(getUserLocation());
        setPrinters(responsePrinters.data);

        if (responseCategories.data.length > 0) {
            setSelectedCategory(responseCategories.data[0]);
        }
    }

    async function loadMyTables() {
        try {
            const response = await tablesServices.findByPin(getUserLocation(), currentWaiter.userPINCode, 3);
            setMyTablesAvailable(response.data[0]);
            setFetchingMyTables(false);
        } catch (error) {
            console.error("Error fetching tables:", error);
        }
    }

    useEffect(() => {
        if (currentWaiter.currentWaiter !== 0) {
            setFetchingMyTables(true);
            loadMyTables();
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
            setFetchingTables(true);
            setShowButtons(false);
            setTableOrder(value);
        }
    }

    async function selectedProduct(product) {
        if (!isEmpty(customerInfo)) {
            if (tableOrder !== 0) {

                const response = await orderSalesServices.findByTableId(tableOrder);
                const orderInformation = response.data[0];

                if (!isEmpty(orderInformation) && parseInt(orderInformation[0].userPINCode) !== currentWaiter.userPINCode) {
                    setDetailsOrder([]);
                    setOrderInTable({});
                    setTableOrder(0);
                    setFetchingMyTables(true);
                    await loadData();
                    await loadMyTables();
                    customNot('warning', 'Cuenta No disponible', 'La cuenta seleccionada ya fue ocupada.');
                } else {
                    setOpenProductInfo(true);
                    setSelectedProductData(product);
                }

            } else {
                customNot('warning', 'Seleccione una cuenta', 'Debe de seleccionar una cuenta');
            }
        } else {
            customNot('warning', 'Añade un cliente', 'Debe de añadir un cliente');
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
                customNot('success', 'Estado de la cuenta fue actualizado', `Cuenta: ${!byUpdate ? 'Libre' : 'Ocupada'}`);
            })
            .catch((error) => {
                customNot('error', 'Algo salió mal', 'No se pudo actualizar el Estado de la Cueta');
            });
    }

    async function createNewComanda(data, userDetails) {

        const unitPrice = parseFloat(data.detailUnitPrice).toFixed(2);

        orderSalesServices.addCommand(
            getUserLocation(),
            4161,
            tableOrder,
            currentShiftcut,
            data.detailSubTotal,
            data.detailId,
            data.detailQuantity,
            unitPrice,
            currentWaiter.userId,
            userDetails.commentOrder,
            userDetails.commentDetail,
            currentWaiter.userPINCode,
            userDetails.nameOrder,
            null,
            null,
            3
        ).then(async (response) => {
            setFetchingMyTables(true);
            await getOrderInfo(tableOrder);
            await updateTableStatus(1, response.data[0].NewOrderID, tableOrder, true);
            customNot('success', 'Operación exitosa', 'Su orden fue añadida');
        }).catch(async (error) => {
            setDetailsOrder([]);
            setOrderInTable({});
            setTableOrder(0);
            setFetchingMyTables(true);
            await loadData();
            await loadMyTables();
            customNot('error', 'Algo salió mal', 'Su order no fue añadida, verifique que la cuenta este libre');
        });
    }

    async function updateOrderCommand(data) {

        const { saleDetailToPush, orderInfo, userDetails } = data;
        if (orderInfo === orderInTable) {
            const unitPrice = parseFloat(saleDetailToPush.detailUnitPrice).toFixed(2);

            orderSalesServices.details.addByCommand(
                orderInfo.id,
                saleDetailToPush.detailId,
                unitPrice,
                saleDetailToPush.detailQuantity,
                userDetails.commentDetail
            ).then(async (response) => {
                await getOrderInfo(tableOrder);
                customNot('success', 'Operación exitosa', 'Su orden fue actualizada');
            }).catch((error) => {
                customNot('error', 'Algo salió mal', 'Su order no fue actualizada');
            });
        }
    }
    // #endregion

    const getFormattedDate = () => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        return dd + '/' + mm + '/' + yyyy;
    };

    const getFormattedTime = () => {
        const currentTime = new Date();
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedTime = hours % 12 + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + ampm;
        return formattedTime;
    };

    const getFormattedTimeAndDate = () => {
        const date = getFormattedDate();
        const time = getFormattedTime();
        return { timeComplete: `Fecha: ${date} Hora: ${time}`, timeDB: `${date} - ${time}` }
    }

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

    async function kitchenTicket(orderId, details) {
        try {
            const response = await orderSalesServices.getKitchenTicket(orderId, details);
            const data = response.data;
            if (!isEmpty(data)) {
                const ticketBody = {
                    orderDetails: data[0],
                    orderInfo: data[1],
                    ticketName: `TicketCocina_${orderId}`,
                    date: getFormattedDate(),
                    time: getFormattedTime(),
                }

                await printerServices.printTicketKitchen(ticketBody);
            }
        } catch (error) {
            console.error(error);
            customNot('info', 'No es posible crear el ticket', 'No fue posible generar el PDF');
        }
    }

    async function validateStateOfPrinters() {

        if (isEmpty(printers) || printers.length === 0) {
            console.log('There are no printers to validate');
            customNot('warning', `No hay impresoras disponibles`, 'Verificar disponibilidad');
            return false;
        }

        let responsesSuccess = true;

        if (!isEmpty(printers)) {
            for (const element of printers) {
                try {
                    const response = await printerServices.validateConnection(element.ip, element.port);
                    if (response.status !== 200) {
                        console.log(`Impresora en ${element.ip}:${element.port} no esta conectada correctamente.`);
                        customNot('warning', `La impresora ${element.name} no se encuentra disponible`, 'Verificar disponibilidad');
                        responsesSuccess = false;
                        break;
                    } else {
                        console.log(`Impresora en ${element.ip}:${element.port} conectada correctamente.`);
                    }
                } catch (error) {
                    console.error(`Error al conectar con la impresora en ${element.ip}:${element.port}:`, error);
                    responsesSuccess = false;
                    break;
                }
            }
        }

        return responsesSuccess;
    }

    async function sendToKitchen() {
        try {
            setChargeKitchen(true);
            const orderId = orderInTable.id;

            const detailActives = detailsOrder.filter(obj => obj.isActive === 1);
            if (detailActives.length >= 1) {
                const activeIds = detailActives.map(obj => obj.id);

                const validationOfPrinters = await validateStateOfPrinters();
                if (!validationOfPrinters) {
                    setChargeKitchen(false);
                    customNot('warning', 'Impresora/s no disponible/s', 'No es posible enviar a cocina');
                    return;
                }

                Modal.confirm({
                    title: '¿Enviar Detalle a cocina?',
                    centered: true,
                    icon: <WarningOutlined />,
                    content: `Los detalles ya no se podrán modificar`,
                    okText: 'Confirmar',
                    okType: 'info',
                    cancelText: 'Cancelar',
                    onOk() {

                        setChargeKitchen(true);
                        orderSalesServices.details.sendToKitchen(orderId, activeIds)
                            .then(async (response) => {
                                await kitchenTicket(orderId, activeIds);
                                await getOrderInfo(tableOrder);
                                customNot('success', 'Operación exitosa', 'Detalle enviados a cocina');
                                setChargeKitchen(false);
                            })
                            .catch((error) => {
                                customNot('info', 'Algo salió mal', 'No se pudo enviar a cocina');
                                setChargeKitchen(false);
                            });
                    },
                    onCancel() { },
                });

            } else {
                setChargeKitchen(false);
                customNot('info', 'Todos los detalles en cocina', 'Todos los detalles ya se encuentran en cocina');
            }
        } catch (error) {
            console.log(error);
            setChargeKitchen(false);
            customNot('info', 'Algo salió mal', 'No se pudo enviar a cocina');
        }
    }

    async function createPreCuenta() {
        const orderId = orderInTable.id;
        setChargePreAccount(true);
        try {
            const response = await orderSalesServices.getPreAccountTicket(orderId);
            const data = response.data;
            if (!isEmpty(data)) {
                const ticketBody = {
                    orderDetails: data[0],
                    orderInfo: data[1][0],
                    ticketName: `TicketPrecuenta_${orderId}`,
                    date: getFormattedDate(),
                    time: getFormattedTime(),
                }

                await printerServices.printTicketPreAccount(ticketBody);
            }

        } catch (error) {
            console.error(error);
            customNot('info', 'No es posible crear el ticket', 'No fue posible generar el PDF');

        } finally {
            setChargePreAccount(false);
        }
    }

    async function toGoClient() {
        setClientModal(true);
    }

    function restoreClient() {
        setCustomerInfo('');
    }

    useEffect(() => {
        if (!isEmpty(customerInfo)) {
            setUpdateClientMode(true);
        } else {
            setUpdateClientMode(false);
        }
    }, [customerInfo]);

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
                <Row style={{ width: '100%', maxWidth: '100%', maxHeight: '100%' }}>
                    <Col className="command-size">
                        <div style={{ width: '100%', display: 'flex' }}>
                            <Button
                                loading={chargeKitchen}
                                type={'primary'}
                                icon={<SendOutlined />}
                                disabled={!showButtons}
                                style={{ margin: 5, width: '50%', fontSize: '0.7rem' }}
                                onClick={() => sendToKitchen()}
                            // disabled={fetching}
                            >

                                ENVIAR A COCINA
                            </Button>
                            <Button
                                loading={chargePreAccount}
                                icon={<CopyOutlined />}
                                disabled={!showButtons}
                                style={{ margin: 5, width: '50%', fontSize: '0.7rem' }}
                                onClick={() => createPreCuenta()}
                            >
                                Pre-Cuenta
                            </Button>
                        </div>

                        <Col
                            style={{
                                width: '100%',
                                paddingTop: '10px',
                                paddingBottom: '10px',
                                paddingLeft: '10px',
                                paddingRight: '10px',
                                backgroundColor: '#e6f4ff',
                                borderRadius: '5px'
                            }}
                        >
                            <p style={{ margin: '0px', fontSize: 12 }}>{'Opciones:'}</p>
                            <Space wrap>
                                <Button
                                    disabled={updateCLienMode || fetchingClient}
                                    onClick={() => toGoClient()}
                                >
                                    <Space>
                                        <GAddUserIcon width={'16px'} />
                                        {'Añadir Cliente'}
                                    </Space>
                                </Button>
                                <Button
                                    disabled={!updateCLienMode || fetchingClient}
                                    onClick={() => toGoClient()}
                                >
                                    <Space>
                                        <GEditUserIcon width={'16px'} />
                                        {'Actualizar Cliente'}
                                    </Space>
                                </Button>
                                <Button
                                    disabled={!updateCLienMode || fetchingClient}
                                    onClick={() => {
                                        restoreClient();
                                    }}
                                >
                                    <Space>
                                        <GClearIcon width={'16px'} />
                                        {'Limpiar Cuenta'}
                                    </Space>
                                </Button>
                            </Space>
                            {
                                isEmpty(customerInfo) ? <></> :
                                    <Spin
                                        spinning={fetchingClient}
                                    >
                                        <Card
                                            size="small"
                                            style={{
                                                width: '100%',
                                                marginTop: 5,
                                                marginBottom: 5
                                            }}
                                        >
                                            <p><strong>Cliente:</strong> {customerInfo}</p>
                                        </Card>
                                    </Spin>
                            }
                        </Col>

                        <DetailsCommand
                            tableOrder={tableOrder}
                            orderInTable={orderInTable}
                            detailsOrder={detailsOrder}
                            fetchingDetails={fetchingDetails}
                            onClickDelete={deleteProductDetails}
                        />

                        <div style={{ paddingTop: 10 }}>
                            <Spin spinning={fetchingMyTables}>
                                <div style={{
                                    backgroundColor: '#d9d9d9',
                                    borderRadius: '5px',
                                    gap: 10,
                                    width: '100%',
                                    display: "flex",
                                    alignItems: "center",
                                    flexDirection: 'column'
                                }}>
                                    <div style={{ width: '100%', textAlign: 'center' }}>

                                        {
                                            isEmpty(myTablesAvailable) ?
                                                <>
                                                </>
                                                :
                                                <>
                                                    <strong style={styleSheet.TableStyles.headerStyle}>Mis Cuentas</strong>
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

                                    <strong style={styleSheet.TableStyles.headerStyle}>Cuentas Disponibles</strong>
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
                                </div>
                            </Spin>
                        </div>
                    </Col>

                    <Col className="products-size" style={{ position: "relative" }}>
                        <CategoriesScroll categories={categories} selectedCategory={selectedCategory} onClick={selectcategory} />
                        <div className="product-cont">
                            <ProductsCard products={availableProducts} loading={loading} selectedProduct={selectedProduct} />
                        </div>
                    </Col>
                </Row>
                <AddProduct
                    open={openProductInfo}
                    orderDetails={orderInTable}
                    productSelected={selectedProductData}
                    productsInOrder={detailsOrder}
                    provitionalClient={customerInfo}
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

                <AddClientModal
                    open={clientModal}
                    onClose={(clientName, close) => {

                        if (clientName) {
                            setCustomerInfo(clientName);
                        }

                        setClientModal(close);
                    }}
                />

                <AuthorizeUserPINCode
                    open={openAuthUserPINCode}
                    title={`PIN requerido`}
                    confirmButtonText={'Confirmar'}
                    onClose={(authorized, userAuthorizer) => {
                        const { successAuth } = userAuthorizer;
                        if (authorized && successAuth) {
                            const { userId, userPINCode, fullName } = userAuthorizer;
                            setCurrentWaiter({ userId, userPINCode, fullName });
                            setOpenAuthUserPINCode(false);
                            const titleCommand = document.querySelector('.details-command');
                            titleCommand.textContent = 'Comandas de ' + fullName;
                        } else {
                            navigate("/main");
                        }
                    }}
                />
            </Wrapper >
    );
}

export default NewCommandToGo;