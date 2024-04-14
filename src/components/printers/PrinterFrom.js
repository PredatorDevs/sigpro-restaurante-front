import React, { useState, useEffect } from 'react';
import { Input, Col, Row, Divider, Button, PageHeader, Modal, Select } from 'antd';
import { AppstoreAddOutlined, DeleteOutlined, SaveOutlined, WarningOutlined } from '@ant-design/icons';

import { isEmpty } from 'lodash';

import ColorPicker from '../pickers/ColorPicker.js';

import { printersServices } from '../../services/PrinterServices.js';

import { customNot } from '../../utils/Notifications.js';
import { getUserLocation, getUserId } from '../../utils/LocalData';

const { Option } = Select;

function PrinterFrom(props) {

    const { open, updateMode, dataToUpdate, onClose } = props;

    const [fetching, setFetching] = useState(false);
    const [name, setName] = useState("");
    const [ip, setIP] = useState("");
    const [port, setPort] = useState("");
    const [printerid, setPrinterid] = useState(0);
    function restoreState() {
        setName("");
        setPrinterid(0);
        setIP("");
        setPort("");
    }

    async function SavePrinter() {
        if (validData()) {
            if (!updateMode) {
                setFetching(true);
                printersServices.addPrinter(
                    name,
                    ip,
                    port,
                    getUserLocation(),
                    getUserId()
                )
                    .then((response) => {
                        customNot('success', 'Operación exitosa', 'Impresora guardada');
                        restoreState();
                        setFetching(false);
                        onClose(true);
                    })
                    .catch((error) => {
                        setFetching(false);
                        customNot('error', 'Algo salió mal', 'Impresora no guardada');
                    });
            } else {
                setFetching(true);
                printersServices.updatePrinter(
                    name,
                    ip,
                    port,
                    getUserId(),
                    printerid
                )
                    .then((response) => {
                        customNot('success', 'Operación exitosa', 'Impresora actualizada');
                        restoreState();
                        setFetching(false);
                        onClose(true);
                    })
                    .catch((error) => {
                        setFetching(false);
                        customNot('error', 'Algo salió mal', 'Impresora no fue actualizada');
                    });
            }
        };
    }

    function validData() {
        const validName = name !== "";
        const validIP = ip !== "" && ip.length > 7;
        const validPort = port !== "" && port.length > 3;

        if (!validName) customNot('warning', 'Verifique el nombre de la impresora', 'Dato no válido');
        if (!validIP) customNot('warning', 'Verifique la direcció IP de la impresora', 'IP no válida');
        if (!validPort) customNot('warning', 'Verifique el puerto la impresora', 'Puerto no válido');

        return (
            validName && validIP && validPort
        )
    }

    useEffect(() => {
        if (!isEmpty(dataToUpdate)) {
            setPrinterid(dataToUpdate.printerid);
            setName(dataToUpdate.name);
            setIP(dataToUpdate.ip)
            setPort(String(dataToUpdate.port))
        } else {
            restoreState();
        }
    }, [dataToUpdate]);

    async function removeTable() {
        Modal.confirm({
            title: '¿Desea eliminar esta Impresora?',
            centered: true,
            icon: <WarningOutlined />,
            okText: 'Confirmar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk() {
                setFetching(true);
                printersServices.deletePrinter(
                    printerid,
                    getUserId()
                )
                    .then((response) => {
                        customNot('success', 'Operación exitosa', 'Impresora fue eliminada');
                        restoreState();
                        setFetching(false);
                        onClose(true);
                    })
                    .catch((error) => {
                        setFetching(false);
                        customNot('error', 'Algo salió mal', 'Impresora no fue eliminada');
                    });
            },
            onCancel() { },
        });
    }

    return (
        <Modal
            title={
                <PageHeader
                    onBack={() => null}
                    backIcon={<AppstoreAddOutlined />}
                    title={`${!updateMode ? 'Nueva' : 'Actualizar'} Impresora`}
                    extra={!updateMode ? [] : [
                        <Button key="1"
                            type="danger"
                            size={'small'}
                            icon={<DeleteOutlined />}
                            onClick={() => removeTable()}
                        >
                            Eliminar Impresora
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
                    <Input placeholder='Nombre de la Impresora'
                        name='name'
                        type='text'
                        autoComplete='off'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Col>
                <Col span={24}>
                    <p style={{ margin: '0px 0px 0px 0px' }}>IP:</p>
                    <Input placeholder='IP la Impresora'
                        name='ip'
                        type='text'
                        autoComplete='off'
                        value={ip}
                        onChange={(e) => {
                            const regex = /^(\d{1,3}\.){0,3}\d{0,3}$/; // Expresión regular para permitir la entrada de una dirección IP
                            if (regex.test(e.target.value)) {
                                setIP(e.target.value);
                            }
                        }}
                    />
                </Col>
                <Col span={24}>
                    <p style={{ margin: '0px 0px 0px 0px' }}>Puerto:</p>
                    <Input placeholder='Puerto la Impresora'
                        name='port'
                        type='text'
                        maxLength={5}
                        minLength={4}
                        autoComplete='off'
                        value={port}
                        onChange={(e) => {
                            const regex = /^[0-9]*$/;
                            if (regex.test(e.target.value)) {
                                setPort(e.target.value);
                            }
                        }}
                    />
                </Col>
                <Col span={24} style={{ margin: '10px 0px 0px 0px' }}>
                    {
                        port !== "" || ip !== "" ?
                            <strong>
                                http://{ip === "" ? "0.0.0.0" : ip}:{port === "" ? "00000" : port}
                            </strong>
                            :
                            <>
                            </>
                    }
                </Col>
                <Divider />
                <Col span={24}>
                    <Button
                        type={'primary'}
                        icon={<SaveOutlined />}
                        style={{ width: '100%', marginTop: 20 }}
                        onClick={() => {
                            SavePrinter();
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

export default PrinterFrom;