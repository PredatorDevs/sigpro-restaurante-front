import { useState, useEffect } from "react";
import { Col, Button, Divider, Modal, Row, Tabs, Space, Tag, InputNumber } from "antd";
import { CloseOutlined, DollarOutlined, SaveOutlined } from "@ant-design/icons";


import productsServices from '../../services/ProductsServices.js';

import SaleDetailModel from "../../models/SaleDetail.js";

import ProductPricePicker from "../pickers/ProductPricePicker.js";
import { getUserLocation } from "../../utils/LocalData";
import { customNot } from "../../utils/Notifications.js";

import { isEmpty, set } from "lodash";

const styleSheet = {
    labelStyle: {
        margin: '0px',
        color: '#434343'
    },
    titleStyle: {
        margin: '5px 5px 10px 0px',
        fontSize: '20px',
        color: '#434343'
    }
};

function AddProduct(props) {

    const { open, productSelected, orderDetails, onClose, onUpdate } = props;

    const [openPricePicker, setOpenPricePicker] = useState(false);

    const [productData, setProductData] = useState([]);
    const [detailQuantity, setDetailQuantity] = useState(null);
    const [detailUnitPrice, setDetailUnitPrice] = useState(null);
    const [priceScale, setPriceScale] = useState(1);
    const [updateMode, setUpdateMode] = useState();
    const [orderInfo, setOrderInfo] = useState([]);


    async function loadProductData(filter) {
        try {
            if (filter) {
                const response = await productsServices.findByMultipleParams(getUserLocation(), filter, 0);
                setProductData(response.data[0]);

                if (response.data[0]?.pricesData?.length !== undefined) {
                    if (response.data[0]?.pricesData?.length >= priceScale) {
                        setDetailUnitPrice(response.data[0]?.pricesData[priceScale - 1]?.price || 0);
                    } else {
                        setDetailUnitPrice(response.data[0]?.pricesData[response.data[0]?.pricesData?.length - 1]?.price || 0);
                    }
                }
            }
        } catch (error) {

        }
    }

    useEffect(() => {
        if (!isEmpty(orderDetails)) {
            setUpdateMode(true);
            setOrderInfo(orderDetails[0]);
        } else {
            setUpdateMode(false);
            setOrderInfo([]);
        }
    }, [orderDetails])

    useEffect(() => {
        loadProductData(productSelected.productName);
    }, [productSelected, open])

    function restoreState() {
        // setActiveTab('1');
        // setFormProductFilterSearch('');
        setProductData([]);
        setOrderInfo([]);
        // setSelectedProductData({});
        setDetailQuantity(null);
        setDetailUnitPrice(null);
    }

    function validateDetail() {
        const validSelectedDetail = !isEmpty(productData) && productData !== null;
        const validDetailQuantity = detailQuantity !== null && detailQuantity > 0;
        const validUnitPrice = isFinite(detailUnitPrice) && detailUnitPrice >= 0;

        // const validDetailQuantityLimit = (docDetails.length <= 10);

        if (!validSelectedDetail) customNot('warning', 'Debe seleccionar un producto', 'Dato no válido');
        if (!validDetailQuantity) customNot('warning', 'Debe definir una cantidad válida', 'Dato no válido');
        if (!validUnitPrice) customNot('warning', 'Debe definir un costo válido', 'Dato no válido');

        // if (!validDetailQuantityLimit) customNot('warning', 'Límite de detalles de venta alcanzado', 'Actualmente el sistema solo permite diez o menos detalles por venta');

        return (
            validSelectedDetail
            && validDetailQuantity
            && validUnitPrice
        );
    }

    const items = [
        {
            key: 1,
            label: "Detalle",
            children: (
                <Row gutter={[12, 12]}>
                    <Col span={24} style={{ display: 'flex', flexDirection: 'column' }}>
                        <Space>
                            <p
                                style={{
                                    color: '#434343',
                                    backgroundColor: '#f5f5f5',
                                    textAlign: 'left',
                                    padding: '5px',
                                    margin: 0,
                                    borderRadius: 10,
                                    fontSize: 16
                                }}
                            >
                                {productData.productName}
                            </p>
                            {
                                productData.productIsService ? <Tag color='blue'>{`Servicio`}</Tag> : <></>
                            }
                            <p style={{ margin: 0, fontSize: 12 }}>{`${productData.currentStock} existencias`}</p>
                        </Space>
                    </Col>
                    <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                        <p style={styleSheet.labelStyle}>Cantidad:</p>
                        <InputNumber
                            id={'newsale-detail-quantity-input'}
                            style={{ width: '100%' }}
                            size={'large'}
                            placeholder={'0'}
                            min={'0'}
                            max={productData.currentStock}
                            value={detailQuantity}
                            onChange={(value) => setDetailQuantity(value)}
                            type={'number'}
                            onKeyDown={
                                (e) => {
                                    if (e.key === 'Enter')
                                        document.getElementById('newsale-detail-unit-price-input').select();
                                    // document.getElementById('newsale-detail-unit-price-input').focus();
                                }
                            }
                        />
                    </Col>
                    <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                        <p style={styleSheet.labelStyle}>Precio:</p>
                        <InputNumber
                            id={'newsale-detail-unit-price-input'}
                            style={{ width: '100%' }}
                            size={'large'}
                            addonBefore='$'
                            placeholder={'1.25'}
                            disabled
                            value={detailUnitPrice}
                            onChange={(value) => setDetailUnitPrice(value)}
                            type={'number'}
                            onKeyDown={
                                (e) => {
                                    if (e.key === 'Enter')
                                        document.getElementById('new-sale-add-detail-button').click();
                                }
                            }
                        />
                        <p style={{ margin: 0, fontSize: 11, color: '#10239e' }}>
                            {`Precio aplicado automáticamente: ${priceScale}`}
                        </p>
                    </Col>
                    <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                    </Col>
                    <Col span={12} style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button
                            style={{ width: '100%' }}
                            // type={'primary'}
                            onClick={() => {
                                // setOpenPricesPreviewConfirmation(true);
                                setOpenPricePicker(true);
                            }}
                            icon={<DollarOutlined />}
                        >
                            Ver precios disponibles
                        </Button>
                    </Col>
                </Row>
            )
        }
    ]

    return (
        <Modal
            centered
            width={700}
            closable={false}
            maskClosable={false}
            open={open}
            // bodyStyle={{ backgroundColor: '#353941', border: '1px solid #787B80' }}
            footer={null}
        >
            <Tabs
                tabPosition={'left'}
                tabBarStyle={{ backgroundColor: 'transparent' }}
                defaultActiveKey={1}
                items={items}
            >
            </Tabs>
            <Divider />
            <div
                style={{
                    width: '100%',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 5,
                    padding: 10
                }}
            >
                <Row gutter={[12, 12]}>
                    <Col span={24}>
                        <p style={styleSheet.labelStyle}>Resumen</p>
                    </Col>
                    <Col span={12}>
                        {/* <p style={styleSheet.labelStyle}>{`Id: ${selectedProductData.productId}`}</p> */}
                        <p style={styleSheet.labelStyle}>{productData.productName}</p>
                        <p style={styleSheet.labelStyle}>{`${detailQuantity || 0} x $${detailUnitPrice || 0}`}</p>
                    </Col>
                    <Col span={12}>
                        <p style={styleSheet.labelStyle}>{`$${((detailQuantity || 0) * (detailUnitPrice || 0)).toFixed(2)}`}</p>
                    </Col>
                </Row>
            </div>
            <Divider />
            <Row gutter={[12, 12]}>
                <Col span={12}>
                    <Button
                        danger
                        type={'primary'}
                        size={'large'}
                        icon={<CloseOutlined />}
                        onClick={(e) => {
                            restoreState();
                            onClose({}, false);
                        }}
                        style={{ width: '100%' }}
                    >
                        Cancelar
                    </Button>
                </Col>
                <Col span={12}>
                    <Button
                        id={'new-sale-add-detail-button'}
                        type={'primary'}
                        size={'large'}
                        icon={<SaveOutlined />}
                        onClick={() => {
                            if (!!!productData.productIsService) {
                                if (productData.currentStock < detailQuantity || productData.productIsService) {
                                    customNot('error', `No hay suficientes existencias para añadir ${productData.productName}`, 'Consulte con su administrador')
                                    return;
                                }
                            }

                            if (validateDetail()) {
                                const detailToAdd = new SaleDetailModel(
                                    productData.productId,
                                    productData.productName,
                                    productData.isTaxable,
                                    detailQuantity || 0,
                                    detailUnitPrice || 0,
                                    productData.taxesData,
                                    productData.productIsService
                                );

                                restoreState();
                                if (!updateMode) {
                                    onClose(detailToAdd, true, productData.currentStock);
                                } else {
                                    onUpdate(detailToAdd, true, orderInfo);
                                }
                            }

                        }}
                        //onClick={(e) => {
                        //  // formAction();
                        //  if (!!!selectedProductData.productIsService) {
                        //    if (selectedProductData.currentStock < detailQuantity || selectedProductData.productIsService) {
                        //      customNot('error', `No hay suficientes existencias para añadir ${selectedProductData.productName}`, 'Consulte con su administrador')
                        //      return;
                        //    }
                        //  }
                        //  if (validateDetail()) {
                        //    const detailToAdd = new SaleDetailModel(
                        //      selectedProductData.productId,
                        //      selectedProductData.productName,
                        //      selectedProductData.isTaxable,
                        //      detailQuantity || 0,
                        //      detailUnitPrice || 0,
                        //      selectedProductData.taxesData,
                        //      selectedProductData.productIsService
                        //    );
                        //    restoreState();
                        //    onClose(detailToAdd, true, selectedProductData.currentStock);
                        //  }
                        //}}
                        style={{ width: '100%' }}
                    //loading={fetching}
                    //disabled={fetching}
                    >
                        {!updateMode ? "Crear Order" : "Añadir Producto"}
                    </Button>
                </Col>
            </Row>
            <ProductPricePicker
                open={openPricePicker}
                productId={productData.productId || 0}
                onClose={() => setOpenPricePicker(false)}
                onSelect={(value) => setDetailUnitPrice(value)}
            />
        </Modal>
    );
}

export default AddProduct;