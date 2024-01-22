import { useState, useEffect } from "react";
import { Col, Button, Divider, Modal, Row, Tabs, Space, Tag, InputNumber } from "antd";
import { CloseOutlined, DollarOutlined, SaveOutlined, ArrowRightOutlined } from "@ant-design/icons";


import productsServices from '../../services/ProductsServices.js';

import SaleDetailModel from "../../models/SaleDetail.js";

import ProductPricePicker from "../pickers/ProductPricePicker.js";
import { getUserLocation } from "../../utils/LocalData";
import { customNot } from "../../utils/Notifications.js";

import { isEmpty, set, forEach } from "lodash";

import Numpad from "./Numpad.js";
import Input from "antd/lib/input/Input.js";

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

    const { open, productSelected, productsInOrder, orderDetails, onClose, onUpdate } = props;

    const [openPricePicker, setOpenPricePicker] = useState(false);

    const [productData, setProductData] = useState([]);
    const [detailQuantity, setDetailQuantity] = useState(null);
    const [detailUnitPrice, setDetailUnitPrice] = useState(null);
    const [priceScale, setPriceScale] = useState(1);
    const [updateMode, setUpdateMode] = useState();
    const [orderInfo, setOrderInfo] = useState([]);
    const [activeTab, setActiveTab] = useState(1);

    const [nameOrder, setNameOrder] = useState('');
    const [commentOrder, setCommentOrder] = useState('');

    const [inputNumpad, setInputNumpad] = useState('');

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
        // setOrderInfo([]);
        // setSelectedProductData({});
        setDetailQuantity(null);
        setInputNumpad('');
        setDetailUnitPrice(null);
        setActiveTab(1);
        setNameOrder('');
        setCommentOrder('');
    }

    function validateDetail() {
        const validSelectedDetail = !isEmpty(productData) && productData !== null;
        const validDetailQuantity = detailQuantity !== null && detailQuantity > 0;
        const validUnitPrice = isFinite(detailUnitPrice) && detailUnitPrice >= 0;
        const validateIdentifier = nameOrder !== null && nameOrder !== '';

        const validateTab = activeTab === 2;

        if (!validateIdentifier && validateTab && !updateMode) customNot('warning', 'Debe de ingresar un identificador', 'Dato no válido');
        if (!validSelectedDetail) customNot('warning', 'Debe seleccionar un producto', 'Dato no válido');
        if (!validDetailQuantity) customNot('warning', 'Debe definir una cantidad válida', 'Dato no válido');
        if (!validUnitPrice) customNot('warning', 'Debe definir un costo válido', 'Dato no válido');

        if (validateTab && !updateMode) {

            return (
                validSelectedDetail
                && validDetailQuantity
                && validUnitPrice
                && validateIdentifier
            );

        } else {

            return (
                validSelectedDetail
                && validDetailQuantity
                && validUnitPrice
            );
        }
    }

    const handleKeyPress = (key) => {
        setInputNumpad((prevInput) => prevInput + key);
    };

    const handleDelete = () => {
        setInputNumpad((prevInput) => prevInput.slice(0, -1));
    };

    useEffect(() => {
        setDetailQuantity(parseInt(inputNumpad));
    }, [inputNumpad])

    const handleNameOrder = (e) => {
        setNameOrder(e.target.value);
    }

    const handleCommentOrder = (e) => {
        setCommentOrder(e.target.value);
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
                    <Col style={{ display: 'flex', flexDirection: 'column' }}>
                        <p style={styleSheet.labelStyle}>Cantidad:</p>
                        <InputNumber
                            readOnly
                            id={'newsale-detail-quantity-input'}
                            style={{ width: '100%' }}
                            size={'large'}
                            placeholder={'0'}
                            min={'0'}
                            max={productData.currentStock}
                            value={inputNumpad}
                            // onChange={changeQuantity}
                            type={'number'}
                            name="Cantidad"
                        />

                        <Numpad onKeyPress={handleKeyPress} onDelete={handleDelete} valueNumpad={inputNumpad} />
                    </Col>
                </Row>
            )
        },
        {
            key: 2,
            label: "Informacion adicional",
            children: (
                <Row gutter={[12, 12]}>
                    {!updateMode ?
                        <Col
                            style={{ display: 'flex', flexDirection: 'column' }}>
                            <p style={styleSheet.labelStyle}>Identificador:</p>
                            <Input
                                style={{ width: '100%' }}
                                size={'large'}
                                // onChange={changeQuantity}
                                type={'text'}
                                maxLength={250}
                                value={nameOrder}
                                name="Nombre"
                                onChange={handleNameOrder}
                            />

                        </Col>
                        : <></>
                    }
                    <Col style={{ display: 'flex', flexDirection: 'column' }}>
                        <p style={styleSheet.labelStyle}>Comentario adicional:</p>
                        <Input
                            style={{ width: '100%' }}
                            size={'large'}
                            // onChange={changeQuantity}
                            type={'text'}
                            value={commentOrder}
                            onChange={handleCommentOrder}
                            maxLength={250}
                            name="Comentario"
                        />

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
                activeKey={activeTab}
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
                    {activeTab === 1 ?
                        <Button
                            type={'primary'}
                            size={'large'}
                            icon={<ArrowRightOutlined />}
                            style={{ width: '100%' }}
                            onClick={() => {
                                if (!!!productData.productIsService) {
                                    if (productData.currentStock < detailQuantity || productData.productIsService) {
                                        customNot('error', `No hay suficientes existencias para añadir ${productData.productName}`, 'Consulte con su administrador')
                                        return;
                                    }
                                }

                                if (validateDetail()) {
                                    setActiveTab(2);
                                }
                            }}
                        >
                            Siguiente
                        </Button>
                        :
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

                                    const userDetails = { nameOrder, commentOrder }

                                    if (!updateMode) {
                                        onClose(detailToAdd, true, productData.currentStock, userDetails);
                                    } else {
                                        onUpdate(detailToAdd, true, orderInfo, userDetails);
                                    }

                                    restoreState();
                                }

                            }}
                            style={{ width: '100%' }}
                        >
                            {!updateMode ? "Crear Order" : "Añadir Producto"}
                        </Button>
                    }
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