import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Result, Button, Modal, Spin, Space, Card } from "antd";
import { SendOutlined, WarningOutlined, CopyOutlined } from "@ant-design/icons";
import { GAddUserIcon, GClearIcon, GEditUserIcon, GSearchForIcon } from "../../utils/IconImageProvider.js";

import AddClientModal from "../../components/command/ClientToGoModal.js";

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
import { isEmpty } from "lodash";

import AuthorizeUserPINCode from "../../components/confirmations/AuthorizeUserPINCode.js";

import { printerServices } from "../../services/PrintersServices.js";
import { printersServices } from "../../services/PrinterServices.js";

import DetailsCommand from "../../components/command/DetailsCommad.js";

import CustomerForm from "../../components/forms/CustomerForm.js";
import SearchCustomer from "../../components/forms/SearchCustomer.js";

import customersServices from "../../services/CustomersServices.js";

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

function UniversalCommand(props) {
    const { typeCommand } = props;
    console.log(typeCommand);
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

    const [printers, setPrinters] = useState({});
    const [fetchingDetails, setFetchingDetails] = useState(false);

    const [reprintersDetails, setReprintersDetails] = useState(true);
    const [reprintBtn, setReprintBtn] = useState(false);

    //Clients
    const [openForm, setOpenForm] = useState(false);
    const [openSearchForm, setOpenSearchForm] = useState(false);
    const [customerUpdateMode, setCustomerUpdateMode] = useState(false);
    const [clientUpdateModal, setClientUpdateModal] = useState(false);
    const [clientModal, setClientModal] = useState(false);
    const [customerToUpdate, setCustomerToUpdate] = useState({});
    const [customerInfo, setCustomerInfo] = useState({});

    const [fetchingClient, setFetchingClient] = useState(false);

    //Timers
    const [currentTime, setCurrentTime] = useState(null);

    async function toGoClient() {
        setClientModal(true);
    }

    // #region Order Details
    async function getOrderInfo(tableId) {
        try {
            setFetchingDetails(true);
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

                if (typeCommand === 2) {
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

                if (typeCommand === 3) {
                    if (!isEmpty(orderInformation)) {
                        setCustomerUpdateMode(true);
                        setCustomerInfo(orderInformation[0].orderIdentifier);
                    } else {
                        setCustomerUpdateMode(false);
                        setCustomerInfo('');
                    }
                }
            }
            
        } catch (error) {
            console.error("Error fetching order info:", error);
        } finally {
            setFetchingDetails(false);
            setFetchingTables(false);
            setFetchingClient(false);
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
            const details = response.data[0];

            setDetailsOrder(details);

            if (isEmpty(details)) {
                setShowButtons(false);
            } else {
                const isPrinterDetails = details.filter(obj => obj.isActive === 1 && obj.isPrinter);
                setReprintersDetails(isPrinterDetails.length > 0 ? true : false);
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
            setReprintersDetails(false);
        }
    }, [orderInTable]);

    // #endregion Order Details

    // #region Check ShiftCut
    async function checkIfAbleToProcess() {
        try {
            setFetching(true);

            const response = await cashiersServices.checkIfAbleToProcess(getUserMyCashier());
            const { isOpen, currentShiftcutId } = response.data[0];

            if (isOpen === 1 && currentShiftcutId !== null) {
                setAbleToProcess(true);
                setCurrentShiftcutId(currentShiftcutId);
            } else {
                setAbleToProcess(false);
                setCurrentShiftcutId(null);
            }
        } catch (error) {
            console.error("Error checking ability to process:", error);
        } finally {
            setFetching(false);
        }
    }

    // #endregion Check ShiftCut

    // #region Loads
    async function loadData() {
        try {
            const userLocation = getUserLocation();

            const [tablesResponse, categoriesResponse, printersResponse] = await Promise.all([
                tablesServices.findAllInCommand(userLocation, typeCommand),
                categoriesServices.find(),
                printersServices.findByLocationId(userLocation)
            ]);

            setTablesAvailable(tablesResponse.data[0]);
            setCategories(categoriesResponse.data);
            setPrinters(printersResponse.data);

            await refreshPrinters();

            if (categoriesResponse.data.length > 0) {
                setSelectedCategory(categoriesResponse.data[0]);
            }
        } catch (error) {
            console.error("Error al cargar los datos:", error);
        }
    }

    async function refreshPrinters() {
        try {

            const userLocation = getUserLocation();

            const [printersResponse] = await Promise.all([
                printersServices.findByLocationId(userLocation)
            ]);

            setPrinters(printersResponse.data);
        } catch (error) {
            console.error("Error al cargar los datos:", error);
        }
    }

    function logAndNotify(printer, message) {
        console.error(message);
        customNot('warning', `La impresora ${printer.name} no se encuentra disponible`, 'Verificar disponibilidad');
    }

    async function loadMyTables() {
        try {
            const response = await tablesServices.findByPin(getUserLocation(), currentWaiter.userPINCode, typeCommand);
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
            setDetailsOrder([]);
            setOrderInTable({});
            setFetchingClient(false);
            setFetchingDetails(true);
            setFetchingTables(true);
            setShowButtons(false);
            setTableOrder(value);
        }
    }

    async function selectedProduct(product) {

        if (isEmpty(customerInfo) && typeCommand === 3) {
            customNot('warning', 'Añade un cliente', 'Debe de añadir un cliente');
            return;
        }

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

        if (isEmpty(customerInfo) && typeCommand === 2) {
            customNot('warning', 'No se ha seleccionado un cliente', 'Para crear una comanda debe de seleccionar un cliente');
            return;
        }

        const unitPrice = parseFloat(data.detailUnitPrice).toFixed(2);

        orderSalesServices.addCommand(
            getUserLocation(),
            typeCommand === 2 ? customerInfo.id : 4161,
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
            typeCommand === 2 ? customerInfo.AddressIdentifier : null,
            typeCommand === 2 ? customerInfo.PhoneIdentifier : null,
            typeCommand
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

    async function validateStateOfPrinters() {

        setOpenAuthUserPINCode(false);
        await refreshPrinters();

        if (printers.length === 0) {
            console.log('There are no printers to validate');
            customNot('warning', 'No hay impresoras disponibles', 'Verificar disponibilidad');
            return [];
        }

        const detailActives = detailsOrder.filter(obj => obj.isActive === 1);
        const activePrinterIds = new Set(detailActives.map(detail => detail.printerid));
        const activePrinters = printers.filter(printer => activePrinterIds.has(printer.printerid));

        const validationResults = await Promise.all(activePrinters.map(async (printer) => {
            try {
                const response = await printerServices.validateConnection(printer.ip, printer.port);
                if (response.status !== 200) {
                    logAndNotify(printer, `Printer at ${printer.ip}:${printer.port} is not connected correctly.`);
                    return { id: printer.printerid, status: 1 };
                } else {
                    console.log(`Printer at ${printer.ip}:${printer.port} connected successfully.`);
                    return { id: printer.printerid, status: 0 };
                }
            } catch (error) {
                logAndNotify(printer, `Error connecting to printer at ${printer.ip}:${printer.port}: ${error.message}`);
                return { id: printer.printerid, status: 0 };
            }
        }));

        return validationResults;
    }

    async function kitchenTicket(orderId, details, isPrinter = 0) {
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
                    reprint: isPrinter
                }

                await printerServices.printTicketKitchen(ticketBody);
            }
        } catch (error) {
            console.error(error);
            customNot('info', 'No es posible crear el ticket', 'No fue posible generar el PDF');
        }
    }

    async function sendToKitchen(pintersVal = 0) {
        try {
            setChargeKitchen(true);
            const orderId = orderInTable.id;

            const detailActives = detailsOrder.filter(obj => obj.isActive === 1 && obj.isPrinter === pintersVal);
            if (detailActives.length < 1) {
                setChargeKitchen(false);
                customNot('info', 'Todos los detalles en cocina', 'Todos los detalles ya se encuentran en cocina');
                return;
            }

            const printersAvailable = await validateStateOfPrinters();

            if (printersAvailable.length === 0) {
                setChargeKitchen(false);
                customNot('warning', 'Impresora/s no disponible/s', 'No es posible enviar a cocina');
                return;
            }

            const activeIds = detailActives.map(detailActive => {
                const printer = printersAvailable.find(printer => printer.id === detailActive.printerid);
                if (printer) {
                    return {
                        detailId: detailActive.id,
                        printerStatus: printer.status
                    };
                }
            }).filter(Boolean);

            Modal.confirm({
                title: `¿${pintersVal === 0 ? "Enviar" : "Reenviar"} orden a cocina?`,
                centered: true,
                icon: <WarningOutlined />,
                content: `Los detalles ya no se podrán modificar`,
                okText: 'Confirmar',
                okType: 'info',
                cancelText: 'Cancelar',
                async onOk() {
                    try {
                        setChargeKitchen(true);
                        await orderSalesServices.details.sendToKitchen(orderId, activeIds);
                        await kitchenTicket(orderId, activeIds, pintersVal);
                        await getOrderInfo(tableOrder);
                        customNot('success', 'Operación exitosa', 'Detalles enviados a cocina');
                    } catch (error) {
                        console.error(error);
                        customNot('info', 'Algo salió mal', 'No se pudo enviar a cocina');
                    } finally {
                        setChargeKitchen(false);
                    }
                },
                onCancel() {
                    setChargeKitchen(false);
                },
            });
        } catch (error) {
            console.error(error);
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

    async function reprintProduct(reprint) {
        setOpenAuthUserPINCode(true);
    }

    //#region delivery
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

    async function restoreClient() {
        setCustomerInfo('');
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
    //#endregion delivery

    //#region Timers
    const getFormattedTimeAndDate = () => {
        const date = getFormattedDate();
        const time = getFormattedTime();
        return { timeComplete: `Fecha: ${date} Hora: ${time}`, timeDB: `${date} - ${time}` }
    }
    //#endregion Timers

    async function updateOrderIdentifierToGO(name) {
        try {
            if (!isEmpty(orderInTable)) {
                await orderSalesServices.updateOrderIdentifier(orderInTable.id, name);
                customNot('success', 'Orden actualizada', 'Se actualizó el identificador de la orden');
            } else {
                customNot('warning', 'Orden no válida', 'Debe seleccionar una orden para actualizar');
            }
        } catch (error) {
            console.error('Error al actualizar la orden:', error);
            customNot('error', 'Error al actualizar la orden', 'Ocurrió un error al intentar actualizar la orden');
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
                <Row style={{ width: '100%', maxWidth: '100%', maxHeight: '100%' }}>

                    <Col className="command-size">
                        <div style={{ width: '100%', display: 'flex' }}>

                            {reprintersDetails ?
                                <Button
                                    loading={chargeKitchen}
                                    icon={<WarningOutlined />}
                                    disabled={!showButtons}
                                    style={{ margin: 5, width: '50%', fontSize: '0.7rem' }}
                                    onClick={() => reprintProduct(1)}
                                // disabled={fetching}
                                >
                                    REIMPRIMIR TICKET
                                </Button> : <></>
                            }

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

                            {typeCommand === 1 || typeCommand == 3 ?
                                <Button
                                    loading={chargePreAccount}
                                    icon={<CopyOutlined />}
                                    disabled={!showButtons}
                                    style={{ margin: 5, width: '50%', fontSize: '0.7rem' }}
                                    onClick={() => createPreCuenta()}
                                >
                                    Pre-Cuenta
                                </Button> : <></>
                            }

                            {typeCommand === 2 ?
                                <Button
                                    loading={chargePreAccount}
                                    disabled={!showButtons}
                                    style={{ margin: 5, width: '50%', fontSize: '0.7rem' }}
                                    onClick={() => packOffCommand()}
                                >
                                    Despachar
                                </Button> : <></>
                            }
                        </div>

                        {typeCommand === 2 || typeCommand === 3 ?
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
                                    {typeCommand === 2 ?
                                        <Button
                                            disabled={customerUpdateMode || fetchingClient}
                                            onClick={() => setOpenSearchForm(true)}
                                        >
                                            <Space>
                                                <GSearchForIcon width={'16px'} />
                                                {'Buscar Cliente'}
                                            </Space>
                                        </Button> :
                                        <></>
                                    }
                                    <Button
                                        disabled={customerUpdateMode || fetchingClient}
                                        onClick={() => {
                                            if (typeCommand === 2) {

                                                setOpenForm(true);
                                            }

                                            if (typeCommand === 3) {
                                                toGoClient();
                                                setClientUpdateModal(false);
                                            }
                                        }}
                                    >
                                        <Space>
                                            <GAddUserIcon width={'16px'} />
                                            {'Añadir Cliente'}
                                        </Space>
                                    </Button>
                                    <Button
                                        disabled={!customerUpdateMode || fetchingClient}
                                        onClick={async () => {
                                            if (typeCommand === 2) {
                                                const response = await customersServices.findById(customerInfo.id);
                                                setCustomerToUpdate(response.data);
                                                setCustomerUpdateMode(true);
                                                setOpenForm(true);
                                            }

                                            if (typeCommand === 3) {
                                                toGoClient();
                                                setClientUpdateModal(false);
                                            }
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
                                            {typeCommand === 2 ?
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
                                                </Card> : <></>
                                            }

                                            {typeCommand === 3 ?
                                                <Card
                                                    size="small"
                                                    style={{
                                                        width: '100%',
                                                        marginTop: 5,
                                                        marginBottom: 5
                                                    }}
                                                >
                                                    <p><strong>Cliente:</strong> {customerInfo}</p>
                                                </Card> : <></>
                                            }
                                        </Spin>
                                }
                            </Col> : <></>
                        }

                        <DetailsCommand
                            tableOrder={tableOrder}
                            orderInTable={orderInTable}
                            detailsOrder={detailsOrder}
                            fetchingDetails={fetchingDetails}
                            onClickReprint={reprintProduct}
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
                                                    <strong style={styleSheet.TableStyles.headerStyle}>
                                                        {typeCommand === 2 ? "Mis Domicilios" : "Mis Cuentas"}
                                                    </strong>
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

                                    <strong style={styleSheet.TableStyles.headerStyle}>
                                        {typeCommand === 2 ? "Domicilios Disponibles" : "Cuentas Disponibles"}
                                    </strong>
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
                    provitionalClient={typeCommand === 2 ? customerInfo.fullName : typeCommand === 3 ? customerInfo : ""}
                    onClose={(saleDetailToPush, executePush, currentStock, userDetails) => {

                        setOpenProductInfo(false);

                        if (executePush) {
                            createNewComanda(saleDetailToPush, userDetails);
                        }

                        setSelectedProductData([]);
                    }}
                    onUpdate={(saleDetailToPush, executePut, orderInfo, userDetails) => {
                        setOpenProductInfo(false);

                        if (executePut) {
                            updateOrderCommand({ saleDetailToPush, orderInfo, userDetails });
                        }

                        setSelectedProductData([]);
                    }}
                />

                <AuthorizeUserPINCode
                    open={openAuthUserPINCode}
                    title={`PIN requerido`}
                    confirmButtonText={'Confirmar'}
                    onClose={async (authorized, userAuthorizer) => {
                        const { successAuth } = userAuthorizer;

                        if (isEmpty(detailsOrder)) {
                            if (authorized && successAuth) {
                                const { userId, userPINCode, fullName } = userAuthorizer;
                                setCurrentWaiter({ userId, userPINCode, fullName });
                                setOpenAuthUserPINCode(false);
                                const titleCommand = document.querySelector('.details-command');
                                titleCommand.textContent = 'Comandas de ' + fullName;
                            } else {
                                navigate("/main");
                            }
                        } else {

                            if (authorized && successAuth) {
                                await sendToKitchen(1);
                            }
                            else {
                                setOpenAuthUserPINCode(false);
                            }

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

                <AddClientModal
                    open={clientModal}
                    updateMode={clientUpdateModal}
                    clientName={customerInfo}
                    onClose={async (clientName, close, isUpdate) => {

                        if (clientName) {
                            if (!isUpdate) {
                                setCustomerInfo(clientName);
                                setCustomerUpdateMode(true);
                            } else {
                                if (!isEmpty(orderInTable) && isUpdate) {
                                    await updateOrderIdentifierToGO(clientName)
                                }
                                
                                setCustomerUpdateMode(true);
                                setCustomerInfo(clientName);
                            }
                        }

                        setClientModal(close);
                    }}
                />

            </Wrapper >
    );
}

export default UniversalCommand;