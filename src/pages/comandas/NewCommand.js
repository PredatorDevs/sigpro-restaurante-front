import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Result, Button, Modal, Spin } from "antd";
import { SendOutlined, WarningOutlined, CopyOutlined } from "@ant-design/icons";

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

function NewCommand() {

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

    // #region Order Details
    async function getOrderInfo(tableId) {
        try {
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
            }
        } catch (error) {
            console.error("Error fetching order info:", error);
        } finally {
            setFetchingDetails(false);
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
                tablesServices.findAllInCommand(userLocation, 1),
                categoriesServices.find(),
                printersServices.findByLocationId(userLocation)
            ]);

            setTablesAvailable(tablesResponse.data[0]);
            setCategories(categoriesResponse.data);
            setPrinters(printersResponse.data);

            if (categoriesResponse.data.length > 0) {
                setSelectedCategory(categoriesResponse.data[0]);
            }
        } catch (error) {
            console.error("Error al cargar los datos:", error);
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

    async function loadMyTables() {
        try {
            const response = await tablesServices.findByPin(getUserLocation(), currentWaiter.userPINCode, 1);
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
            setFetchingDetails(true);
            setFetchingTables(true);
            setShowButtons(false);
            setTableOrder(value);
        }
    }

    async function selectedProduct(product) {
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
            1
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
            setChargeKitchen(true);
            const orderId = orderInTable.id;

            const detailActives = detailsOrder.filter(obj => obj.isActive === 1);
            if (detailActives.length >= 1) {

                const validationOfPrinters = await validateStateOfPrinters();
                if (!validationOfPrinters) {
                    setChargeKitchen(false);
                    customNot('warning', 'Impresora/s no disponible/s', 'No es posible enviar a cocina');
                    return;
                }

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
                setChargeKitchen(false);
                customNot('info', 'Todos los detalles en cocina', 'Todos los detalles ya se encuentran en cocina');
            }
        } catch (error) {
            setChargeKitchen(false);
            console.log(error);
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
                    provitionalClient={""}
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

            </Wrapper >
    );
}

export default NewCommand;