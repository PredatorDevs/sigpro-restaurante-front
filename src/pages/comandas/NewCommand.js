import { useEffect, useState } from "react";
import { Select, Row, Col, Empty, Result } from "antd";

import { Wrapper } from '../../styled-components/Wrapper';

import tablesServices from "../../services/TablesServices";
import cashiersServices from "../../services/CashiersServices.js";
import orderSalesServices from "../../services/OrderSalesServices.js";

import CategoriesScroll from "../../components/command/CategoriesScroll";

import ProductsCard from "../../components/command/ProductsCards.js"
import AddProduct from "../../components/command/AddProduct.js";
import DetailsCommand from "../../components/command/DetailsCommad.js";

import { getUserLocation, getUserMyCashier } from '../../utils/LocalData';

import { customNot } from "../../utils/Notifications.js";

import categoriesServices from '../../services/CategoriesServices.js';
import productsServices from "../../services/ProductsServices.js";

const { Option } = Select;

function NewCommand() {

    const [ableToProcess, setAbleToProcess] = useState(false);

    const [fetching, setFetching] = useState(false);

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [entityTablesData, setEntityTablesData] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [tableOrder, setTableOrder] = useState(0);
    const [openProductInfo, setOpenProductInfo] = useState(false);
    const [selectedProductData, setSelectedProductData] = useState([]);
    const [orderInTable, setOrderInTable] = useState([]);
    const [currentShiftcut, setCurrentShiftcutId] = useState(0);

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

    async function loadData() {
        const response = await tablesServices.findTables(getUserLocation());
        setEntityTablesData(response.data);

        if (response.data.length > 0) {
            setTableOrder(response.data[0].id);
        }

        const responseCategories = await categoriesServices.find();
        setCategories(responseCategories.data);

        if (responseCategories.data.length > 0) {
            setSelectedCategory(responseCategories.data[0]);
        }
    }

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

    function selectcategory(category) {
        setSelectedCategory(category);
        if (selectedCategory !== category) {
            setLoading(true);
        }
    }

    const changeTable = (value) => {
        setTableOrder(value);
    }

    async function getOrderDetails(tableId) {
        const response = await orderSalesServices.findByTableId(tableId);
        setOrderInTable(response.data[0]);
    }

    useEffect(() => {
        if (tableOrder || tableOrder !== 0) {
            getOrderDetails(tableOrder);
        }
    }, [tableOrder]);

    function selectedProduct(product) {
        setOpenProductInfo(true);
        setSelectedProductData(product);
    }

    async function createNewComanda(data) {

        orderSalesServices.addCommand(
            getUserLocation(),
            4161,
            tableOrder,
            currentShiftcut,
            data.detailSubTotal,
            data.detailId,
            data.detailQuantity,
            data.detailUnitPrice
        ).then(async (response) => {
            customNot('success', 'Operación exitosa', 'Su orden fue añadida');
            await getOrderDetails(tableOrder);
        }).catch((error) => {
            customNot('error', 'Algo salió mal', 'Su order no fue añadida');
        });
    }

    async function updateOrderCommand(data) {
        const { saleDetailToPush, orderInfo } = data;
        if (orderInfo === orderInTable[0]) {
            orderSalesServices.details.addByCommand(
                orderInfo.id,
                saleDetailToPush.detailId,
                saleDetailToPush.detailUnitPrice,
                saleDetailToPush.detailQuantity
            ).then(async (response) => {
                customNot('success', 'Operación exitosa', 'Su orden fue actualizada');
                await getOrderDetails(tableOrder);
            }).catch((error) => {
                customNot('error', 'Algo salió mal', 'Su order no fue actualizada');
            });
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
                <Row gutter={16} style={{ width: '100%' }}>
                    <Col span={12}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <strong>Mesa:</strong>
                            <Select style={{ width: 200 }} onChange={changeTable} value={tableOrder}>
                                {entityTablesData.map(item => (
                                    <Option key={item.id} value={item.id}> {item.name} </Option>
                                ))}
                            </Select>
                        </div>
                        {
                            tableOrder > 0 ?
                                <>
                                    <CategoriesScroll categories={categories} selectedCategory={selectedCategory} onClick={selectcategory} />
                                    <ProductsCard products={availableProducts} loading={loading} selectedProduct={selectedProduct} />
                                </> : <>
                                    <Empty description="Debe de seleccionar una mesa..." />
                                </>
                        }
                    </Col>
                    <DetailsCommand tableDetails={tableOrder} orderTable={orderInTable} />
                </Row>
                <AddProduct
                    open={openProductInfo}
                    orderDetails={orderInTable}
                    productSelected={selectedProductData}
                    onClose={(saleDetailToPush, executePush, currentStock) => {
                        setOpenProductInfo(false);
                        const { detailId, detailName, detailQuantity, detailIsService } = saleDetailToPush;

                        if (executePush) {
                            createNewComanda(saleDetailToPush);
                        }


                    }}
                    onUpdate={(saleDetailToPush, executePut, orderInfo) => {
                        setOpenProductInfo(false);

                        if (executePut) {
                            updateOrderCommand({ saleDetailToPush, orderInfo });
                        }
                    }}
                />
            </Wrapper>
    );
}

export default NewCommand;