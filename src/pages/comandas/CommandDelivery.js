import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Empty, Result, Button, Modal, Table, Space, Spin, Card } from "antd";
import { SendOutlined, WarningOutlined, DeleteOutlined, CopyOutlined, CloseOutlined } from "@ant-design/icons";
import { GAddUserIcon, GClearIcon, GEditUserIcon, GSearchForIcon } from "../../utils/IconImageProvider.js";

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
import { isEmpty, forEach, find, set } from "lodash";

import AuthorizeUserPINCode from "../../components/confirmations/AuthorizeUserPINCode.js";
import CustomerForm from "../../components/forms/CustomerForm.js";
import SearchCustomer from "../../components/forms/SearchCustomer.js";
import download from "downloadjs";
import reportsServices from "../../services/ReportsServices.js";
import customersServices from "../../services/CustomersServices.js";
import { printerServices } from "../../services/PrintersServices.js";

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
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        }
    }
};

const { confirm } = Modal;

function NewCommandDelivery() {

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

    //Fetching
    const [fetchingClient, setFetchingClient] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    //Clients
    const [openForm, setOpenForm] = useState(false);
    const [openSearchForm, setOpenSearchForm] = useState(false);
    const [customerUpdateMode, setCustomerUpdateMode] = useState(false);
    const [customerToUpdate, setCustomerToUpdate] = useState({});
    const [customerInfo, setCustomerInfo] = useState({});

    //Timers
    const [currentTime, setCurrentTime] = useState(null);

    // #region Order Details
    async function getOrderInfo(tableId) {
        try {
            const response = await orderSalesServices.findByTableId(tableId);
            const orderInformation = response.data[0];

            if (!isEmpty(orderInformation) && parseInt(orderInformation[0].userPINCode) !== currentWaiter.userPINCode) {
                setDetailsOrder([]);
                setOrderInTable({});
                setCustomerInfo([]);
                setTableOrder(0);
                setFetchingMyTables(true);
                await loadData();
                await loadMyTables();
                customNot('warning', 'Cuenta No disponible', 'La cuenta seleccionada ya fue ocupada.');
            } else {
                setOrderInTable(orderInformation[0]);

                if (!isEmpty(orderInformation)) {
                    const clientInfo = await customersServices.findByIdandPhoneId(orderInformation[0].customerId, orderInformation[0].customerphoneId, orderInformation[0].customeraddressId);
                    setCustomerUpdateMode(true);
                    setCustomerInfo(clientInfo.data[0]);

                    if (orderInformation[0].packoff === 1) {
                        setCurrentTime(orderInformation[0].dispatchedAt);
                    } else {
                        setCurrentTime(null);
                    }
                } else {
                    setDetailsOrder([]);
                    setCustomerInfo([]);
                    setCustomerUpdateMode(false);
                }
            }
        } catch (error) {
            console.error("Error fetching order info:", error);
        } finally {
            setFetchingTables(false);
            setFetchingClient(false);
            setFetchingDetails(false);
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
        const response = await tablesServices.findAllInCommand(getUserLocation(), 2);
        setTablesAvailable(response.data[0]);

        const responseCategories = await categoriesServices.find();
        setCategories(responseCategories.data);

        if (responseCategories.data.length > 0) {
            setSelectedCategory(responseCategories.data[0]);
        }
    }

    async function loadMyTables() {
        try {
            setFetchingMyTables(true);
            const response = await tablesServices.findByPin(getUserLocation(), currentWaiter.userPINCode, 2);
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

    async function selectedProduct(product) {

        if (tableOrder !== 0) {
            const response = await orderSalesServices.findByTableId(tableOrder);
            const orderInformation = response.data[0];

            if (!isEmpty(orderInformation) && orderInformation[0].packoff === 1) {
                customNot('warning', 'La cuenta ya no esta disponible', 'La cuenta se encuentra en entrega');
                return;
            }

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
            customNot('warning', 'Selecciona una cuenta', 'Debe de seleccionar una cuenta');
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

        if (isEmpty(customerInfo)) {
            customNot('warning', 'No se ha seleccionado un cliente', 'Para crear una comanda debe de seleccionar un cliente');
        } else {

            const unitPrice = parseFloat(data.detailUnitPrice).toFixed(2);
            orderSalesServices.addCommand(
                getUserLocation(),
                customerInfo.id,
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
                customerInfo.AddressIdentifier,
                customerInfo.PhoneIdentifier,
                2
            ).then(async (response) => {
                setFetchingMyTables(true);
                await getOrderInfo(tableOrder);
                await updateTableStatus(1, response.data[0].NewOrderID, tableOrder, true);
                customNot('success', 'Operación exitosa', 'La orden fue añadida');
            }).catch(async (error) => {
                setDetailsOrder([]);
                setOrderInTable({});
                setTableOrder(0);
                setFetchingMyTables(true);
                await loadData();
                await loadMyTables();
                customNot('error', 'Algo salió mal', 'La order no fue añadida, verifique que la cuenta este libre');
            });
        }
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
                customNot('success', 'Operación exitosa', 'La orden fue actualizada');
            }).catch((error) => {
                customNot('error', 'Algo salió mal', 'La orden no fue actualizada');
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

    async function sendToKitchen() {
        try {
            const orderId = orderInTable.id;

            const detailActives = detailsOrder.filter(obj => obj.isActive === 1);
            if (detailActives.length >= 1) {
                const activeIds = detailActives.map(obj => obj.id);

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
                customNot('info', 'Todos los detalles en cocina', 'Todos los detalles ya se encuentran en cocina');
            }
        } catch (error) {
            console.log(error);
            customNot('info', 'Algo salió mal', 'No se pudo enviar a cocina');
        }
    }

    function redirectToMain() {

        Modal.confirm({
            title: '¿Desea salir del modulo de comandas?',
            centered: true,
            icon: <WarningOutlined />,
            content: `Los detalles no se guardaran`,
            okText: 'Confirmar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk() {
                navigate("/main");
            },
            onCancel() { },
        });
    }

    const columns = [
        columnDef({ title: 'Cantidad', dataKey: 'quantity', customRender: quantity => (parseInt(quantity)) }),
        columnDef({ title: 'Detalle', dataKey: 'ProductName' }),
        columnMoneyDef({ title: 'Precio Unitario', dataKey: 'unitPrice' }),
        columnMoneyDef({ title: 'Gravado', dataKey: 'TotalDetail' }),
        columnActionsDef(
            {
                title: 'Acciones',
                dataKey: 'id',
                detail: false,
                edit: false,
                del: true,
                delAction: async (value) => {
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
                                await deleteProductDetails(value);
                            },
                            onCancel() { },
                        });
                    }
                },
            }
        ),
    ];

    async function restoreClient() {
        setCustomerUpdateMode(false);
        setCustomerToUpdate({});
        setCustomerInfo({});
        setDetailsOrder([]);
        setOrderInTable({});
        setDetailsOrder([]);
        setTableOrder(0);
        setFetchingMyTables(true);
        setCurrentTime(null);
        await loadData();
        await loadMyTables();
    }

    const changeTable = (value) => {

        if (value !== tableOrder) {
            setFetchingDetails(true);
            setFetchingClient(true);
            setFetchingTables(true);
            setShowButtons(false);
            setTableOrder(value);
        }
    }

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

    async function packOffCommand() {
        const currentTimer = getFormattedTimeAndDate();
        const detailActives = detailsOrder.filter(obj => obj.isActive === 1);
        if (detailActives.length >= 1) {
            customNot('info', 'No se puede despachar', 'Hay detalles que aun no se encuentran en cocina');
        } else {
            if (orderInTable.packoff === 1) {
                customNot('info', 'La orden ya fue despachada', 'La orden ya se encuentra en camino');
            } else {

                Modal.confirm({
                    title: '¿Desea despachar el pedido?',
                    centered: true,
                    icon: <WarningOutlined />,
                    content: `${currentTimer.timeComplete}`,
                    okText: 'Confirmar',
                    okType: 'info',
                    cancelText: 'Cancelar',
                    async onOk() {
                        await packOffActions();
                    },
                    onCancel() { },
                });
            }
        }
    }

    async function packOffActions() {
        setChargePreAccount(true);
        const currentTimer = getFormattedTimeAndDate();
        await orderSalesServices.getPackOffTicket(
            orderInTable.id,
            orderInTable.customerId,
            orderInTable.customerphoneId,
            orderInTable.customeraddressId,
        )
            .then(async response => {
                const data = response.data;
                if (!isEmpty(data)) {
                    const ticketBody = {
                        orderDetails: data[0],
                        orderInfo: data[1][0],
                        clientInfo: data[3][0],
                        ticketName: `TicketCocina_${orderInTable.id}`,
                        date: getFormattedDate(),
                        time: getFormattedTime(),
                    }

                    const printerResult = await printerServices.printPackOff(ticketBody);
                    if (printerResult.status === 200) {
                        await updatePackOffStatus();
                    } else {
                        customNot('danger', 'Ticket No Impreso', `El ticket del pedido no pudo ser envidado`);
                    }
                }
            })
            .catch(error => {
                customNot('danger', 'La cuenta no fue despachada con exito', `${currentTimer.timeComplete}`)
            })
            .finally(() => {
                setChargePreAccount(false);
            });
    }

    async function updatePackOffStatus() {
        try {
            const currentTimer = getFormattedTimeAndDate();
            await orderSalesServices.updatePackOffTicket(
                orderInTable.id,
                1,
                currentWaiter.userId,
                currentTimer.timeDB
            );
            restoreClient();
            customNot('success', 'Pedido Actualizado', `El pedido fue actualizado con éxito`);
        } catch (error) {
            customNot('danger', 'Error al actualizar', `Ocurrió un error al actualizar el estado del ticket`);
        }
    }


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
                <Row style={{ width: '100%', maxWidth: '100%', maxHeight: '100%', marginTop: 10 }}>
                    <Col span={12} style={{ paddingRight: 5 }}>

                    <div style={{ width: '100%' }}>
                            <Button
                                loading={chargeKitchen}
                                type={'primary'}
                                icon={<SendOutlined />}
                                disabled={!showButtons}
                                style={{ margin: 5, width: 'calc(100% - 10px)' }}
                                onClick={() => sendToKitchen()}
                            // disabled={fetching}
                            >

                                ENVIAR A COCINA
                            </Button>
                            <div style={{ display: "flex", width: '100%', justifyContent: "space-between" }}>
                                <Button
                                    hidden
                                    type={'danger'}
                                    icon={<CloseOutlined />}
                                    style={{ margin: 5, width: '50%', fontSize: '0.7rem' }}
                                    onClick={() => redirectToMain()}
                                // onClick={() => formAction()}
                                // disabled={fetching}
                                >
                                    Salir
                                </Button>
                                <Button
                                    loading={chargePreAccount}
                                    disabled={!showButtons}
                                    style={{ margin: 5, width: '50%', fontSize: '0.7rem' }}
                                    onClick={() => packOffCommand()}
                                >
                                    Despachar
                                </Button>
                            </div>
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
                                    disabled={customerUpdateMode || fetchingClient}
                                    onClick={() => setOpenSearchForm(true)}
                                >
                                    <Space>
                                        <GSearchForIcon width={'16px'} />
                                        {'Buscar Cliente'}
                                    </Space>
                                </Button>
                                <Button
                                    disabled={customerUpdateMode || fetchingClient}
                                    onClick={() => setOpenForm(true)}
                                >
                                    <Space>
                                        <GAddUserIcon width={'16px'} />
                                        {'Añadir Cliente'}
                                    </Space>
                                </Button>
                                <Button
                                    disabled={!customerUpdateMode || fetchingClient}
                                    onClick={async () => {
                                        const response = await customersServices.findById(customerInfo.id);
                                        setCustomerToUpdate(response.data);
                                        setCustomerUpdateMode(true);
                                        setOpenForm(true);
                                    }}
                                >
                                    <Space>
                                        <GEditUserIcon width={'16px'} />
                                        {'Actualizar Cliente'}
                                    </Space>
                                </Button>
                                <Button
                                    disabled={!customerUpdateMode || fetchingClient}
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
                                    <Spin spinning={fetchingClient} key={customerInfo.id}>
                                        <Card
                                            title={customerInfo.fullName}
                                            style={{
                                                width: '100%',
                                                marginTop: 5,
                                                marginBottom: 5
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <p><strong>Email:</strong> {customerInfo.email}</p>
                                                <p><strong>Telefono:</strong> {customerInfo.phoneNumber}</p>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <p><strong>DUI:</strong> {customerInfo.dui}</p>
                                                <p><strong>NIT:</strong> {customerInfo.nit}</p>
                                                <p><strong>RNC:</strong> {customerInfo.nrc}</p>
                                            </div>
                                            <p><strong>Dirección:</strong> {customerInfo.FullAddress}</p>
                                            {
                                                currentTime != null ?
                                                    <p><strong>Fecha de salida:</strong> {currentTime}</p>
                                                    :
                                                    <></>

                                            }
                                        </Card>
                                    </Spin>
                            }
                        </Col>

                        <div style={{
                            display: "flex",
                            gap: 15,
                            flexDirection: 'column',
                            width: "100%",
                            marginTop: 5
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
                                </>
                            }
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
                        </div>
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
                                                    <strong style={styleSheet.TableStyles.headerStyle}>Mis Domicilios</strong>
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

                                    <strong style={styleSheet.TableStyles.headerStyle}>Domicilios Disponibles</strong>
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
                    <Col span={12} style={{ position: "relative" }}>
                        <CategoriesScroll categories={categories} selectedCategory={selectedCategory} onClick={selectcategory} />
                        <div style={{ overflowX: "auto", position: "absolute", height: '100%', maxHeight: 'calc(100% - 120px)', width: '100%' }}>
                            <ProductsCard products={availableProducts} loading={loading} selectedProduct={selectedProduct} />
                        </div>
                    </Col>
                </Row>
                <AddProduct
                    open={openProductInfo}
                    orderDetails={orderInTable}
                    productSelected={selectedProductData}
                    productsInOrder={detailsOrder}
                    provitionalClient={customerInfo.fullName}
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

                <CustomerForm
                    open={openForm}
                    showDeleteButton={false}
                    updateMode={customerUpdateMode}
                    dataToUpdate={customerToUpdate}
                    onClose={async (refresh) => {
                        setOpenForm(false);

                        if (!customerUpdateMode && !refresh) {
                            setCustomerUpdateMode(false);
                            setCustomerToUpdate({});
                        } else {
                            if (!isEmpty(customerInfo)) {
                                const clientInfo = await customersServices.findByIdandPhone(customerInfo.id, customerInfo.phoneNumber, customerInfo.AddressIdentifier);
                                setCustomerInfo(clientInfo.data[0]);
                            }
                        }
                    }}
                />

                <SearchCustomer
                    open={openSearchForm}
                    updateMode={customerUpdateMode}
                    onClose={(close, customer) => {

                        setOpenSearchForm(close);

                        if (!isEmpty(customer)) {
                            setCustomerUpdateMode(true);
                            setCustomerInfo(customer);
                        }
                    }}
                />
            </Wrapper >
    );
}

export default NewCommandDelivery;