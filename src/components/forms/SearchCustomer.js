import { useState } from "react";
import { Drawer, PageHeader, Col, Divider, Button, Input, Empty, Card, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import customersServices from "../../services/CustomersServices";
import { customNot } from "../../utils/Notifications";

const { Search } = Input;

function SearchCustomer(props) {

    const { open, onClose } = props;

    const [dataInput, setDataInput] = useState('');
    const [customers, setCustomers] = useState([]);

    function restoreState() {
        setDataInput('');
        setCustomers([]);
    }

    async function searchCustomer() {
        if (dataInput !== "") {
            customersServices.findByPhone(dataInput)
                .then((response) => {
                    const data = response.data;
                    
                    if (data.length > 0) {
                        setCustomers(data);
                    } else {
                        setCustomers([]);
                        customNot('info', 'No se encontraron registros', `No hay registro que coincidan con: ${dataInput}`);
                    }
                })
                .catch((err) => {
                    setCustomers([]);
                    customNot('warning', 'Ocurrio un problema inesperado', 'No se pudo completar la busqueda');
                    console.error(err);
                });
        } else {
            customNot('warning', 'Data no valido', 'Por favor ingrese un parametro de busqueda valido');
        }
    }

    return (
        <Drawer
            title={
                <PageHeader
                    onBack={() => null}
                    backIcon={<UserOutlined />}
                    title={`Buscar Cliente`}
                />
            }
            width={800}
            placement="right"
            onClose={(e) => {
                restoreState();
                onClose(false, {});
            }}
            open={open}
            maskClosable={false}
        >
            <Col span={24} style={{ display: 'inline' }}>
                <Search
                    id={'newsale-product-search-input'}
                    name={'filter'}
                    placeholder="Parametro de busqueda"
                    allowClear
                    value={dataInput}
                    onChange={(e) => setDataInput(e.target.value)}
                    onSearch={() => searchCustomer()}
                    style={{ width: '100%', marginBottom: 5 }}
                />
            </Col>
            <div style={{
                height: 'calc(100% - 120px)',
                width: '100%',
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                {
                    customers.length === 0
                        ?
                        <Empty description="Sin resultados..." />
                        :
                        <>
                            <Space direction="vertical" style={{
                                height: '100%',
                                width: '100%',
                            }}>
                                {
                                    customers.map(customer => (
                                        <Card
                                            key={customer.id}
                                            title={customer.fullName}
                                            extra={
                                                <a
                                                    onClick={() => {
                                                        restoreState();
                                                        onClose(false, customer);
                                                    }}
                                                >
                                                    Seleccionar
                                                </a>
                                            }
                                            style={{
                                                width: '100%',
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <p>Email: {customer.email}</p>
                                                <p>Telefono: {customer.phoneNumber}</p>
                                            </div>
                                            <p>Dirección: {customer.FullAddress}</p>
                                        </Card>
                                    ))
                                }
                            </Space>
                        </>
                }
            </div>
            <Divider />
            <Col span={24}>
                <Button
                    type={'default'}
                    onClick={(e) => {
                        restoreState();
                        onClose(false, {});
                    }}
                    style={{ width: '100%' }}
                >
                    Cancelar
                </Button>
            </Col>
        </Drawer >
    );
}

export default SearchCustomer;