import { useState, useEffect } from "react";
import { Space, Input, Col, Button, Card, Modal } from "antd";
import { SaveOutlined, DeleteFilled, WarningOutlined } from "@ant-design/icons";

import { customNot } from "../utils/Notifications";
import DepartmentSelector from "./selectors/DepartmentSelector";

function CustomerAddresses(props) {

    const { label, updateMode, onDataChange, elementSizes, setResetState } = props;

    const [formDepartmentId, setFormDepartmentId] = useState(13);
    const [formCityId, setFormCityId] = useState(0);
    const [resetForm, setResetForm] = useState(0);
    const [resetSelectStates, setResetSelectStates] = useState(0);
    const [formAddress, setFormAddress] = useState('');
    const [formReferences, setFormReferences] = useState('');
    const [formCustomerAddresses, setFormCustomerAddresses] = useState([]);

    useEffect(() => {
        resetData(false);
        setResetSelectStates(resetSelectStates + 1);
    }, [setResetState]);

    useEffect(() => {
        resetData(true);
        setResetSelectStates(resetSelectStates + 1);
    }, [resetForm]);

    function resetData(status) {
        setFormDepartmentId(13);
        setFormCityId(0);
        setFormAddress('');
        setFormReferences('');
        if (!status) {
            setFormCustomerAddresses([]);
        }
    }

    useEffect(() => {
        onDataChange(formCustomerAddresses);
    }, [formCustomerAddresses]);

    function deleteDataElement(index) {
        Modal.confirm({
            title: '¿Desea eliminar esta dirección?',
            centered: true,
            icon: <WarningOutlined />,
            content: `Será eliminada de la lista de dirección`,
            okText: 'Confirmar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk() { setFormCustomerAddresses((prev) => prev.filter((element, prevIndex) => (prevIndex !== index))); },
            onCancel() { },
        });
    }

    function validForm() {
        const validAddress = formAddress !== null && formAddress !== undefined && formAddress !== '';
        const validCity = formCityId !== null && formCityId !== undefined && formCityId !== 0;
        const validDepartment = formDepartmentId !== null && formDepartmentId !== undefined;

        if (!validAddress) {
            customNot('warning', 'Dirección Requerida', 'Por favor, ingrese una dirección válida');
        }

        if (!validCity) {
            customNot('warning', 'Municipio Requerido', 'Por favor, ingrese un municipio válido');
        }

        if (!validDepartment) {
            customNot('warning', 'Departamento Requerido', 'Por favor, ingrese un departamento válido');
        }

        return (validAddress && validCity && validDepartment);
    }

    return (
        <>
            <Space direction="vertical" style={{ width: '100%' }}   >
                <Col span={24}>
                    <p style={{ margin: '0px' }}>{label}</p>
                    <Input
                        placeholder={'Av. Testa Ca. Edison 101'}
                        style={{ width: '100%' }}
                        maxLength={50}
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                    />
                </Col>
                <Col span={24}>
                    <p style={{ margin: '0px' }}>Referencias:</p>
                    <Input
                        placeholder={'Punto de referencias, Color de la casa'}
                        style={{ width: '100%' }}
                        maxLength={50}
                        value={formReferences}
                        onChange={(e) => setFormReferences(e.target.value)}
                    />
                </Col>
                <Space wrap >
                    <DepartmentSelector
                        onSelect={(dataSelected) => {
                            const { departmentSelected, citySelected } = dataSelected;
                            setFormDepartmentId(departmentSelected);
                            setFormCityId(citySelected);
                        }}
                        defDepartmentId={updateMode ? formDepartmentId : 13}
                        defCityId={updateMode ? formCityId : 0}
                        setResetState={resetSelectStates}
                    />
                    <Button
                        icon={<SaveOutlined />}
                        type='primary'
                        size={elementSizes || 'middle'}
                        style={{ marginTop: 20 }}
                        onClick={() => {

                            if (validForm()) {
                                const departmentText = document.getElementById(`department_${formDepartmentId}`)?.getAttribute('title');
                                const cityText = document.getElementById(`city_${formCityId}`)?.getAttribute('title');
                                setFormCustomerAddresses([
                                    ...formCustomerAddresses, {
                                        departmentId: formDepartmentId,
                                        cityId: formCityId,
                                        address: formAddress,
                                        reference: formReferences,
                                        departmentText: departmentText === undefined || departmentText == "" ? 'SAN MIGUEL' : departmentText,
                                        cityText: cityText,
                                        isActive: 1
                                    }
                                ]);

                                setResetForm(resetForm + 1);
                            }
                        }
                        }
                    />
                </Space>
                {
                    formCustomerAddresses.map((element, index) => (
                        <Card size="small" style={{ width: '100%' }} key={index}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <p style={{ margin: 0 }}><strong>Dirección:</strong> {element.address}</p>
                                <Button
                                    size={elementSizes || 'middle'}
                                    danger
                                    icon={<DeleteFilled />}
                                    onClick={(e) => deleteDataElement(index)}
                                />
                            </div>
                            {
                                element.reference === "" ? <></>
                                    :
                                    <p style={{ margin: 0 }}><strong>Puntos de Referencia:</strong> {element.reference}</p>
                            }
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <p style={{ margin: 0 }}><strong>Departamento:</strong> {element.departmentText} </p>
                                <p style={{ margin: 0 }}><strong>Municipio:</strong> {element.cityText} </p>
                            </div>
                        </Card>
                    ))
                }
            </Space>
        </>
    );
}

export default CustomerAddresses;