import { useState, useEffect } from "react";
import { Col, Empty, Button } from "antd";
import { SearchOutlined, PlusOutlined, MinusOutlined, DeleteFilled } from "@ant-design/icons";

import { isEmpty } from "lodash";
import orderSalesServices from "../../services/OrderSalesServices";

function DetailsCommand(props) {

    const { tableDetails } = props;

    const [detailsOrder, setDetailsOrder] = useState([]);

    async function getOrderDetails(tableId) {
        const response = await orderSalesServices.findByTableId(tableId);
        setDetailsOrder(response.data[0]);
        console.log(detailsOrder);
    }

    useEffect(async () => {
        if (tableDetails || tableDetails !== 0) {
            await getOrderDetails(tableDetails);
        }
    }, [tableDetails]);

    return (
        <Col span={12} style={{
            backgroundColor: '#F5F5F5',
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: '10px'
        }}>
            <strong>Resumen de la Orden</strong>
            {isEmpty(detailsOrder) ? <>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Mesa sin ordenes"
                />
            </>
                :
                <div style={{ marginTop: 10, width: '100%', display: "flex", flexDirection: "column", gap: 30 }}>
                    {detailsOrder.map(detail => (
                        <div key={detail.id}
                            style={{
                                backgroundColor: !detail.status ? '#BAE0FF' : '#D9F7BE',
                                height: 80,
                                width: '100%',
                                display: "flex",
                                padding: 10,
                                cursor: "pointer",
                                fontWeight: "bolder",
                                justifyContent: "space-between",
                            }}
                        >
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}>
                                <strong> {detail.ProductName} </strong>
                                <span style={{ color: "green" }}>
                                    ${parseFloat(detail.total).toFixed(2)}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: !detail.status ? "center" : "space-between", alignItems: "center", width: '150px' }}>
                                <div style={{ display: "flex", justifyContent: "space-between", width: 90 }}>
                                    <Button type="primary" size="small" hidden={!detail.status} shape="circle" icon={<PlusOutlined />}></Button>
                                    <span style={{ fontSize: 15 }}>{parseInt(detail.quantity)}</span>
                                    <Button type="primary" size="small" hidden={!detail.status} shape="circle" icon={<MinusOutlined />}></Button>
                                </div>

                                <Button size="small" shape="circle"
                                    style={{
                                        border: "none",
                                        boxShadow: "none",
                                        backgroundColor: "#D9F7BE"
                                    }}
                                    icon={<DeleteFilled style={{ color: "red" }} />}
                                >
                                </Button>

                            </div>
                        </div>
                    ))}
                </div>
            }
        </Col>
    );
}

export default DetailsCommand;