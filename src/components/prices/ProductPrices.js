import { useState, useEffect } from "react";
import { CloseCircleOutlined, DeleteOutlined, DollarCircleOutlined, EditOutlined, ExclamationCircleOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, Col, InputNumber, Row, Space, Switch, Tag, Modal } from "antd";
import productPricesServices from "../../services/ProductPricesServices";
import { customNot } from "../../utils/Notifications";
import "../../styles/pricesStyle.css";
import { forEach, isEmpty } from "lodash";

function ProductPrices(props) {

    const { price, index, deletePrice } = props;

    const [updatedMode, setUpdatedMode] = useState(true);
    const [loading, setLoading] = useState(true);
    const [btnActions, setBtnActions] = useState(true);
    const [priceInfo, setPriceInfo] = useState({});
    const [profitTotal, setProfitTotal] = useState(0);
    const [profitFinal, setProfitFinal] = useState(0);
    const [profitDefault, setProfitDefault] = useState(0);
    const [productTaxes, setProductTaxes] = useState([]);

    useEffect(() => {
        loadData();
    }, [price]);

    async function loadData() {
        try {
            const priceId = price.id;

            if (priceId != null) {
                const response = await productPricesServices.findByProductId(priceId);
                const result = response.data[0];
                setPriceInfo(result);
                setBtnActions(false);
                setLoading(false);

                const total = parseFloat(result.price).toFixed(2);
                setProfitTotal(total);
                setProfitDefault(result.isDefault);

                const responseTaxes = await productPricesServices.findTaxByProductId(priceId);
                setProductTaxes(responseTaxes.data);

                setProfitFinal(calcFinalPrice(responseTaxes.data, total));
            }

        } catch (error) {
            customNot('error', 'Error al cargar el precio', 'No se pudo cargar el precio correctamente')
            console.error(error);
        }
    }

    function calcFinalPrice(taxes, price) {
        if (!isEmpty(taxes) && price > 0) {
            let totalTaxes = 0;

            forEach(taxes, (tax) => {
                if ((tax.status === 'associated' || tax.isApplicable === 1) && tax.isActive === 1) {
                    if (tax.isPercentage === 1) {
                        totalTaxes += (+price * +tax.taxRate);
                    } else {
                        totalTaxes += +tax.taxRate;
                    }
                }
            });
            return (+price + totalTaxes).toFixed(2);
        } else {
            return (0).toFixed(2);
        }
    }

    function calcPriceTax(tax, price) {
        if ((tax.status === 'associated' || tax.isApplicable === 1) && price > 0 && tax.isActive === 1) {
            const taxRate = parseFloat(tax.taxRate).toFixed(2);
            if (tax.isPercentage === 1) {
                const totalTax = parseFloat((price * taxRate)).toFixed(2);
                return `$${totalTax}`
            } else {
                return `$${taxRate}`
            }
        } else {
            const total = parseFloat(0).toFixed(2);
            return `$${total}`;
        }
    }

    const changeInputsHandle = () => {
        setUpdatedMode(!updatedMode);
    }

    const changeMainPriceHandle = () => {
        setProfitDefault(profitDefault === 0 ? 1 : 0);
    }

    const changeProfitMargin = (value) => {
        setProfitTotal(parseFloat(value).toFixed(2));
        setProfitFinal(calcFinalPrice(productTaxes, parseFloat(value).toFixed(2)));
    }

    function ProfitRate() {
        return (+profitFinal - +profitTotal).toFixed(2);
    }

    async function SavePrice() {
        setBtnActions(true);

        try {
            await productPricesServices.updateProductPrice(
                profitTotal,
                ProfitRate(),
                profitDefault,
                priceInfo.id,
                priceInfo.productId
            );
            customNot('success', 'Precio actualizado', 'El precio se actualizó correctamente');
        } catch (error) {
            console.error(error);
            customNot('error', 'No se pudo actualizar el precio', 'Ocurrió un error al momento de actualizar el precio');
        } finally {
            setUpdatedMode(!updatedMode);
            setBtnActions(false);
        }
    }

    return (
        <Card
            key={index}
            style={{ marginBottom: 10, width: '100%' }}
            type="inner"
            title={loading ? 'Cargando...' : `Precio ${priceInfo.id}`}
            loading={loading}
            extra={
                <div
                    style={{
                        display: "flex",
                        padding: 5,
                        gap: 10
                    }}
                >
                    {updatedMode ?
                        <>
                            <Button
                                id={'edit-btn'}
                                icon={<EditOutlined />}
                                loading={btnActions}
                                size='small'
                                onClick={changeInputsHandle}
                            >
                            </Button>
                        </>
                        :
                        <>
                            <Button
                                id={'save-btn'}
                                icon={<SaveOutlined />}
                                loading={btnActions}
                                size='small'
                                onClick={() => {
                                    SavePrice();
                                }}
                            >
                            </Button>
                        </>
                    }

                    <Button
                        loading={btnActions}
                        icon={<DeleteOutlined />}
                        color="red"
                        size='small'
                        type={'primary'}
                        onClick={() => {
                            if (profitDefault === 0) {
                                deletePrice(priceInfo.id);
                            } else {
                                customNot('info', 'El precio es principal', 'No se pueden eliminar los precios principales')
                            }
                        }}
                        danger
                    >
                    </Button>
                </div>
            }
        >
            <Col span={24}>
                <Row gutter={8}>
                    <Col span={8}>
                        <p className="prices-info">{`Margen Ganancia`}</p>
                        <InputNumber
                            size='small'
                            type={'number'}
                            min={0}
                            prefix={<DollarCircleOutlined />}
                            precision={2}
                            style={{ width: '125px' }}
                            value={profitTotal}
                            disabled={updatedMode}
                            onChange={(value) => {
                                changeProfitMargin(value);
                            }}
                        />
                    </Col>
                    <Col span={8}>
                        <p className="prices-info">{`Precio Final`}</p>
                        <InputNumber
                            size='small'
                            type={'number'}
                            min={0}
                            precision={2}
                            style={{ width: '125px' }}
                            value={profitFinal}
                            disabled={updatedMode}
                            readOnly
                            onChange={(value) => {
                            }}
                        />
                    </Col>
                    <Col span={8}>
                        <p className="prices-info">{`Precio Principal`}</p>
                        <Switch
                            checked={profitDefault === 0 ? false : true}
                            disabled={updatedMode}
                            onClick={changeMainPriceHandle}
                        />
                    </Col>
                </Row>
            </Col>
            <Space align="start" size={'large'}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 5, marginTop: 5, maxWidth: '100%', flexWrap: 'wrap' }}>
                    {
                        (productTaxes || []).map((element, index) => {
                            if (element.isActive === 1) {
                                return (
                                    <Tag
                                        key={element.id}
                                        style={{ cursor: 'pointer' }}
                                        color={element.isApplicable === 1 ? 'blue' : element.status === 'not_associated' ? 'green' : 'blue'}
                                        icon={element.isApplicable === 1 ? <ExclamationCircleOutlined /> : element.status === 'not_associated' ? <CloseCircleOutlined /> : <ExclamationCircleOutlined />}
                                        onClick={() => {
                                            if (element.isApplicable === 0) {

                                            } else {
                                                customNot('info', 'Impuesto Obligatorio', 'Este Impuesto no se puede modificar');
                                            }
                                        }}
                                    >
                                        {element.name}: {calcPriceTax(element, profitTotal)}
                                    </Tag>
                                )
                            }
                        })
                    }
                </div>
            </Space>
        </Card>
    );
}

export default ProductPrices;