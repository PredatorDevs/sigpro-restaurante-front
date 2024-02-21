import { useState, useEffect } from "react";
import { Col, Button, Divider, Modal, Row, Space, Tag, InputNumber } from "antd";
import { CloseOutlined, SaveOutlined } from "@ant-design/icons";


import productsServices from '../../services/ProductsServices.js';

import SaleDetailModel from "../../models/SaleDetail.js";

import { getUserLocation } from "../../utils/LocalData";
import { customNot } from "../../utils/Notifications.js";

import { isEmpty } from "lodash";

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

    const { open, productSelected, provitionalClient, orderDetails, onClose, onUpdate } = props;

    const [productData, setProductData] = useState([]);
    const [detailQuantity, setDetailQuantity] = useState(null);
    const [detailUnitPrice, setDetailUnitPrice] = useState(null);
    const [priceScale, setPriceScale] = useState(1);
    const [updateMode, setUpdateMode] = useState();
    const [orderInfo, setOrderInfo] = useState([]);

    const [nameOrder, setNameOrder] = useState('');
    const [commentOrder, setCommentOrder] = useState('');
    const [commentDetail, setCommentDetail] = useState('');

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
        if(provitionalClient !== "")
        {
            setNameOrder(provitionalClient);
        }
        
    }, [productSelected, open])

    function restoreState() {
        setProductData([]);
        setDetailQuantity(null);
        setInputNumpad('');
        setDetailUnitPrice(null);
        setNameOrder('');
        setCommentOrder('');
        setCommentDetail('');
    }

    function validateDetail() {
        const validSelectedDetail = !isEmpty(productData) && productData !== null;
        const validDetailQuantity = detailQuantity !== null && detailQuantity > 0;
        const validUnitPrice = isFinite(detailUnitPrice) && detailUnitPrice >= 0;
        const validateIdentifier = nameOrder !== null && nameOrder !== '';

        if (!validateIdentifier && !updateMode) customNot('warning', 'Cliente no válido', 'Ingrese información del cliente');
        if (!validSelectedDetail) customNot('warning', 'Debe seleccionar un producto', 'Dato no válido');
        if (!validDetailQuantity) customNot('warning', 'Debe definir una cantidad válida', 'Dato no válido');
        if (!validUnitPrice) customNot('warning', 'Debe definir un costo válido', 'Dato no válido');

        if (!updateMode) {

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
    }, [inputNumpad]);

    const handleNameOrder = (e) => {
        setNameOrder(e.target.value);
    }

    const handleCommentOrder = (e) => {
        setCommentOrder(e.target.value);
    }

    const handleCommentDetail = (e) => {
        setCommentDetail(e.target.value);
    }

    return (
        <Modal
            centered
            width={600}
            closable={false}
            maskClosable={false}
            open={open}
            // bodyStyle={{ backgroundColor: '#353941', border: '1px solid #787B80' }}
            footer={null}
        >
            <div style={{ display: 'flex', justifyContent: "space-between" }}>
                <Row gutter={[12, 12]} style={{ width: '50%' }}>
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
                            value={inputNumpad}
                            // onChange={changeQuantity}
                            type={'number'}
                            name="Cantidad"
                        />

                        <Numpad onKeyPress={handleKeyPress} onDelete={handleDelete} valueNumpad={inputNumpad} validCero={true} />
                    </Col>
                </Row>
                <Row gutter={[12, 12]} style={{ width: '50%' }}>
                    {!updateMode ?
                        <Col
                            style={{ display: 'flex', flexDirection: 'column' }}>
                            <p style={styleSheet.labelStyle}>Cliente:</p>
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

                            <p style={styleSheet.labelStyle}>Comentario adicional de la orden:</p>
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

                        : <></>
                    }
                    <Col style={{ display: 'flex', flexDirection: 'column' }}>
                        <p style={styleSheet.labelStyle}>Comentario adicional del detalle:</p>
                        <Input
                            style={{ width: '100%' }}
                            size={'large'}
                            // onChange={changeQuantity}
                            type={'text'}
                            value={commentDetail}
                            onChange={handleCommentDetail}
                            maxLength={250}
                            name="Comentario"
                        />

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

                            if (validateDetail()) {

                                const validateTotalsDetails = parseInt(detailQuantity * detailUnitPrice);

                                if (validateTotalsDetails !== 0) {
                                    const unitPrice = parseFloat(detailUnitPrice).toFixed(2);
                                    const detailToAdd = new SaleDetailModel(
                                        productData.productId,
                                        productData.productName,
                                        productData.isTaxable,
                                        detailQuantity || 0,
                                        unitPrice || 0,
                                        productData.taxesData,
                                        productData.productIsService
                                    );

                                    const userDetails = { nameOrder, commentOrder, commentDetail }

                                    if (!updateMode) {
                                        onClose(detailToAdd, true, productData.currentStock, userDetails);
                                    } else {
                                        onUpdate(detailToAdd, true, orderInfo, userDetails);
                                    }

                                    restoreState();
                                } else {
                                    customNot('warning', 'El total es incorrecto', 'La orden no puede ser $0.00')
                                }
                            }

                        }}
                        style={{ width: '100%' }}
                    >
                        {!updateMode ? "Crear Order" : "Añadir Producto"}
                    </Button>
                </Col>
            </Row>
        </Modal>
    );
}

export default AddProduct;