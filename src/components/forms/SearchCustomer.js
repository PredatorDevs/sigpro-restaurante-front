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
    const [customersAddresses, setCustomersAddresses] = useState([]);
    const [fetching, setFetching] = useState(false);

    function restoreState() {
        setDataInput('');
        setCustomers([]);
        setCustomersAddresses([]);
    }

    async function searchCustomer() {
        if (dataInput !== "") {
            setFetching(true);
            customersServices.findByPhone(dataInput)
                .then((response) => {
                    const data = response.data;
                    const customerInfo = data[0];
                    const customerAddressesInfo = data[1];
                    if (customerAddressesInfo.length > 0) {
                        setCustomers(customerInfo);
                        setCustomersAddresses(customerAddressesInfo);
                        setFetching(false);
                    } else {
                        setCustomers([]);
                        setCustomersAddresses([]);
                        setFetching(false);
                        customNot('info', 'No se encontraron registros', `No hay registro que coincidan con: ${dataInput}`);
                    }
                })
                .catch((err) => {
                    setCustomers([]);
                    setCustomersAddresses([]);
                    setFetching(false);
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
            className="search-customer-form"
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
                    loading={fetching}
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
                        (<Empty description="Sin resultados..." />)
                        :
                        (
                            <Space direction="vertical" key="customer-space" style={{
                                height: '100%',
                                width: '100%',
                            }}>
                                {
                                    customers.map(customer => (
                                        <Card
                                            size="small"
                                            key={customer.id}
                                            title={
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        display: "flex",
                                                        justifyContent: "space-between"
                                                    }}
                                                >
                                                    <p style={{ margin: 0 }}>
                                                        {customer.fullName}
                                                    </p>
                                                    <p style={{ margin: 0 }}>
                                                        {customer.phoneNumber}
                                                    </p>
                                                </div>
                                            }
                                            style={{
                                                width: '100%',
                                            }}
                                        >
                                            {
                                                customersAddresses
                                                    .filter(customeraddress => customeraddress.id === customer.id)
                                                    .map(customeraddress => (
                                                        <div
                                                            style={{
                                                                width: '100%',
                                                                display: "flex",
                                                                justifyContent: "space-between"
                                                            }}
                                                        >
                                                            <p style={{ marginTop: 10 }}><strong>Dirección:</strong> {customeraddress.FullAddress}</p>
                                                            <Button
                                                                onClick={(e) => {
                                                                    restoreState();
                                                                    onClose(false, customeraddress);
                                                                }}
                                                            >
                                                                Seleccionar
                                                            </Button>
                                                        </div>
                                                    ))
                                            }
                                        </Card>
                                    ))
                                }
                            </Space>
                        )
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