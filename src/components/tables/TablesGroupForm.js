import React, { useState, useEffect } from 'react';
import { Input, Col, Row, Divider, Button, PageHeader, Modal, Form } from 'antd';
import { AppstoreAddOutlined, DeleteOutlined, SaveOutlined, WarningOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash';

import { customNot } from '../../utils/Notifications.js';
import tablesServices from '../../services/TablesServices.js';

import { getUserId, getUserLocation } from '../../utils/LocalData';

function TablesGoupForm(props) {

    const { open, updateMode, dataToUpdate, onClose } = props;

    const [fetching, setFetching] = useState(false);

    const [formData, setFormData] = useState({
        id: 0,
        locationId: 0,
        name: '',
        createdBy: 0,
        updateBy: 0
    });

    useEffect(() => {
        const { id, name } = dataToUpdate;
        setFormData({ id: id || 0, name: name || '' });
    }, [dataToUpdate]);


    function restoreState() {
        setFormData({ id: 0, name: '' });
    }

    function validForm() {
        const validId = updateMode ? formData.id !== 0 : true;
        const validFullName = !isEmpty(formData.name);
        if (!validFullName) customNot('warning', 'Verifique el nombre del grupo', 'Dato no válido');
        return (
            validId && validFullName
        );
    }

    const inputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            id: !updateMode ? 0 : dataToUpdate.id,
            locationId: getUserLocation(),
            [name]: value,
            createdBy: getUserId(),
            updateBy: getUserId(),
        });
    };

    const formAction = (e) => {
        e.preventDefault();

        if (validForm()) {
            if (!updateMode) {
                setFetching(true);
                tablesServices.add(formData.locationId, formData.name, formData.createdBy)
                    .then((response) => {
                        customNot('success', 'Operación exitosa', 'Grupo de Mesas añadido');
                        restoreState();
                        setFetching(false);
                        onClose(true);
                    })
                    .catch((error) => {
                        setFetching(false);
                        customNot('error', 'Algo salió mal', 'Grupo de Mesas no añadido');
                    });
            } else {
                tablesServices.update(formData.id, formData.name, formData.updateBy)
                    .then((response) => {
                        customNot('success', 'Operación exitosa', 'Grupo de Mesas actualizado');
                        restoreState();
                        setFetching(false);
                        onClose(true);
                    })
                    .catch((error) => {
                        setFetching(false);
                        customNot('error', 'Algo salió mal', 'Grupo de Mesas no actualizado');
                    });
            }
        }
    }

    function removeGroup() {
        const { id, name } = dataToUpdate;

        Modal.confirm({
            title: '¿Desea eliminar este Grupo de Mesas?',
            centered: true,
            icon: <WarningOutlined />,
            content: `${name || 'Not defined'} será eliminado de la lista de los Grupos de Mesas`,
            okText: 'Confirmar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk() {
                setFetching(true);
                tablesServices.delete(id)
                    .then((response) => {
                        customNot('success', 'Operación exitosa', 'Grupo de Mesas eliminado');
                        restoreState();
                        setFetching(false);
                        onClose(true);
                    })
                    .catch((error) => {
                        setFetching(false);
                        customNot('info', 'Algo salió mal', 'El Categoria no pudo ser eliminado');
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
                    title={`${!updateMode ? 'Nuevo' : 'Actualizar'} Grupo de Mesas`}
                    extra={!updateMode ? [] : [
                        <Button key="1"
                            type="danger"
                            size={'small'}
                            onClick={() => removeGroup()}
                            icon={<DeleteOutlined />}>
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
            <form onSubmit={formAction}>
                <Row gutter={8}>
                    <Col span={24}>
                        <p style={{ margin: '0px 0px 0px 0px' }}>Nombre:</p>
                        <Input placeholder='Nombre del Grupo'
                            name='name'
                            type='text'
                            autoComplete='off'
                            value={formData.name}
                            onChange={inputChange}
                        />
                    </Col>
                    <Divider />
                    <Col span={24}>
                        <Button
                            htmlType='submit'
                            type={'primary'}
                            icon={<SaveOutlined />}
                            style={{ width: '100%', marginTop: 20 }}
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
            </form>
        </Modal>
    );
}

export default TablesGoupForm;