import React, { useState, useEffect } from 'react';
import { Input, Col, Row, Divider, Button, PageHeader, Modal, Select, Switch } from 'antd';
import { AppstoreAddOutlined, DeleteOutlined, SaveOutlined, WarningOutlined } from '@ant-design/icons';

import { isEmpty } from 'lodash';

import ColorPicker from '../pickers/ColorPicker.js';

import taxesServices from '../../services/taxesServices';

import { customNot } from '../../utils/Notifications.js';
import { getUserLocation } from '../../utils/LocalData';

const { Option } = Select;

function TaxForm(props) {
    const { open, updateMode, dataToUpdate, onClose } = props;

    const [fetching, setFetching] = useState(false);

    const [name, setName] = useState("");
    const [taxRate, setTaxRate] = useState("");
    const [isPercentage, setIsPercentage] = useState(0);
    const [taxId, setTaxId] = useState(0);

    function restoreState() {
        setName("");
        setTaxRate("");
        setIsPercentage(0);
        setTaxId(0);
    }

    async function saveTax() {
        if (validData()) {
            const totalTax = isPercentage === 1 ? (parseFloat(taxRate) / 100).toFixed(2) : taxRate;

            if (!updateMode) {
                setFetching(true);
                taxesServices.addTax(
                    name,
                    totalTax,
                    isPercentage,
                    getUserLocation()
                )
                    .then((response) => {
                        customNot('success', 'Operación exitosa', 'Impuesto guardado');
                        restoreState();
                        setFetching(false);
                        onClose(true);
                    })
                    .catch((err) => {
                        setFetching(false);
                        customNot('error', 'Algo salió mal', 'Impuesto no guardado');
                        console.error(err);
                    });
            } else {
                setFetching(true);
                taxesServices.updateTax(
                    taxId,
                    name,
                    totalTax,
                    isPercentage,
                    getUserLocation()
                )
                    .then((response) => {
                        customNot('success', 'Operación exitosa', 'Impuesto Actualizado');
                        restoreState();
                        setFetching(false);
                        onClose(true);
                    })
                    .catch((err) => {
                        setFetching(false);
                        customNot('error', 'Algo salió mal', 'Impuesto no Actualizado');
                        console.error(err);
                    });
            }
        }
    }

    function validData() {
        const validName = name.trim() !== "";
        const intTax = parseInt(taxRate);
        const validTaxRate = !isNaN(intTax) && intTax !== 0;

        if (!validName) customNot('warning', 'Verifique el nombre del Impuesto', 'Dato no válido');
        if (!validTaxRate) customNot('warning', 'Verifique el total del impuesto', 'Cantidad no válida');

        return validName && validTaxRate;
    }


    async function removeTax() {
        Modal.confirm({
            title: '¿Desea eliminar este Impuesto?',
            centered: true,
            icon: <WarningOutlined />,
            okText: 'Confirmar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk() {
                setFetching(true);
                taxesServices.removeTax(
                    taxId
                )
                    .then((response) => {
                        customNot('success', 'Operación exitosa', 'Impuesto eliminado');
                        restoreState();
                        setFetching(false);
                        onClose(true);
                    })
                    .catch((error) => {
                        setFetching(false);
                        customNot('error', 'Algo salió mal', 'Impuesto no eliminado');
                    });
            },
            onCancel() { },
        });
    }

    const changePercentage = (checked) => {
        setIsPercentage(checked ? 1 : 0);
    }

    useEffect(() => {
        if (!isEmpty(dataToUpdate)) {
            const totalTax = dataToUpdate.isPercentage === 1 ? (parseFloat(dataToUpdate.taxRate) * 100).toFixed(2) : parseInt(dataToUpdate.taxRate);
            setTaxId(dataToUpdate.id);
            setName(dataToUpdate.name);
            setTaxRate(totalTax);
            setIsPercentage(dataToUpdate.isPercentage);
        } else {
            restoreState();
        }
    }, [dataToUpdate]);

    return (
        <Modal
            title={
                <PageHeader
                    onBack={() => null}
                    backIcon={<AppstoreAddOutlined />}
                    title={`${!updateMode ? 'Nuevo' : 'Actualizar'} Impuesto`}
                    extra={!updateMode ? [] : [
                        <Button key="1"
                            type="danger"
                            size={'small'}
                            icon={<DeleteOutlined />}
                            onClick={() => removeTax()}
                        >
                            Eliminar Impuesto
                        </Button>
                    ]}
                />
            }
            centered
            width={450}
            closable={false}
            maskClosable={false}
            open={open}
            footer={null}
        >
            <Row gutter={8}>
                <Col span={24}>
                    <p style={{ margin: '0px 0px 0px 0px' }}>Nombre:</p>
                    <Input placeholder='Nombre del Impuesto'
                        name='name'
                        type='text'
                        autoComplete='off'
                        value={name}
                        onChange={(e) => setName(e.target.value.toUpperCase())}
                    />
                </Col>
                <Col span={24}>
                    <p style={{ margin: '0px 0px 0px 0px' }}>Cantidad:</p>
                    <Input placeholder='Total del Impuesto'
                        name='taxRate'
                        type='text'
                        autoComplete='off'
                        value={taxRate}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setTaxRate(value);
                        }}
                    />
                </Col>
                <Col span={24}>
                    <p style={{ margin: '0px 0px 0px 0px' }}>Es Porcentual:</p>
                    <Switch checked={isPercentage === 1 ? true : false} onChange={changePercentage} />
                </Col>
                <Divider />
                <Col span={24}>
                    <Button
                        type={'primary'}
                        icon={<SaveOutlined />}
                        style={{ width: '100%', marginTop: 20 }}
                        onClick={() => {
                            saveTax();
                        }}
                    >
                        Guardar
                    </Button>
                </Col>
                <Col span={24}>
                    <Button
                        htmlType='button'
                        type={'default'}
                        onClick={(e) => {
                            if (!updateMode) restoreState();
                            onClose(false)
                        }}
                        style={{ width: '100%', marginTop: 10 }}
                    >
                        Cancelar
                    </Button>
                </Col>
            </Row>
        </Modal>
    );
}

export default TaxForm;