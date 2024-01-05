import React, { useState, useEffect } from 'react';
import { Input, Col, Row, Divider, Button, PageHeader, Modal, Select } from 'antd';
import { AppstoreAddOutlined, DeleteOutlined, SaveOutlined, WarningOutlined } from '@ant-design/icons';

import { isEmpty } from 'lodash';

import ColorPicker from '../pickers/ColorPicker.js';

import tablesServices from '../../services/TablesServices';

import { customNot } from '../../utils/Notifications.js';
import { getUserLocation, getUserId } from '../../utils/LocalData';

const { Option } = Select;

function TablesForm(props) {

    const { open, updateMode, dataToUpdate, onClose } = props;

    const [fetching, setFetching] = useState(false);

    const [formId, setId] = useState(0);
    const [groupInfo, setGroupInfo] = useState([]);

    const [colorPicker, setColorPicker] = useState('#000');

    const [formData, setFormData] = useState({
        id: 0,
        tableGroupId: 0,
        status: 0,
        name: '',
        color: '#000',
        createdBy: 0,
        updateBy: 0
    });

    useEffect(() => {
        const { id, name, tableGroupId, status, color } = dataToUpdate;
        setFormData({
            id: id || 0,
            name: name || '',
            tableGroupId: tableGroupId || 0,
            status: status || 0,
            color: color || '#000',
            updateBy: getUserId()
        });
        setColorPicker(color);
    }, [dataToUpdate]);

    function restoreState() {
        setId(0);
        setFormData({
            id: 0,
            name: '',
            tableGroupId: 0,
            status: 0,
            color: '',
        });
    }

    async function loadData() {
        const response = await tablesServices.findGroup(getUserLocation());
        setGroupInfo(response.data);
    }

    useEffect(() => {
        loadData();
    }, []);

    const inputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            id: !updateMode ? 0 : dataToUpdate.id,
            status: 0,
            [name]: value,
            createdBy: getUserId(),
            updateBy: getUserId(),
        });
    }

    const selectChange = (e) => {
        setFormData({
            ...formData,
            tableGroupId: e
        });
    }

    const handleColorChange = (color) => {
        setFormData({
            ...formData,
            color: color.hex
        });
    };

    const validData = () => {
        const validId = updateMode ? formData.id !== 0 : true;
        const validName = !isEmpty(formData.name);
        const validColor = !isEmpty(formData.color);
        const validGroup = formData.tableGroupId === 0 ? false : true;
        if (!validName) customNot('warning', 'Verifique el nombre de la mesa', 'Dato no válido');
        if (!validColor) customNot('warning', 'Verifique el color de la mesa', 'Color no válido');
        if (!validGroup) customNot('warning', 'Verifique el grupo de la mesa', 'Grupo no válido');
        return (
            validId && validName && validColor && validGroup
        );
    }

    const formAction = (e) => {
        e.preventDefault();
        if (validData()) {
            if (!updateMode) {
                setFetching(true);
                tablesServices.addTable(
                    formData.tableGroupId,
                    formData.status,
                    formData.name,
                    formData.color,
                    formData.createdBy)
                    .then((response) => {
                        customNot('success', 'Operación exitosa', 'Mesa añadida');
                        restoreState();
                        setFetching(false);
                        onClose(true);
                    })
                    .catch((error) => {
                        setFetching(false);
                        customNot('error', 'Algo salió mal', 'Mesa no añadida');
                    });
            } else {
                setFetching(true);
                tablesServices.updateTable(
                    formData.id,
                    formData.tableGroupId,
                    formData.name,
                    formData.color,
                    formData.updateBy)
                    .then((response) => {
                        customNot('success', 'Operación exitosa', 'Mesa actualizada');
                        restoreState();
                        setFetching(false);
                        onClose(true);
                    })
                    .catch((error) => {
                        setFetching(false);
                        customNot('error', 'Algo salió mal', 'Mesa no actualizada');
                    });
            }
        }
    }

    function removeTable() {
        const { id, name } = dataToUpdate;

        Modal.confirm({
            title: '¿Desea eliminar esta Mesa?',
            centered: true,
            icon: <WarningOutlined />,
            content: `${name || 'Not defined'} será eliminada de la lista de Mesas`,
            okText: 'Confirmar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk() {
                setFetching(true);
                tablesServices.deleteTable(id)
                    .then((response) => {
                        customNot('success', 'Operación exitosa', 'Mesas eliminada');
                        restoreState();
                        setFetching(false);
                        onClose(true);
                    })
                    .catch((error) => {
                        setFetching(false);
                        customNot('info', 'Algo salió mal', 'El Mesa no pudo ser eliminada');
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
                    title={`${!updateMode ? 'Nueva' : 'Actualizar'} Mesa`}
                    extra={!updateMode ? [] : [
                        <Button key="1"
                            type="danger"
                            size={'small'}
                            icon={<DeleteOutlined />}
                            onClick={() => removeTable()}>
                            Eliminar Mesa
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
                        <Input placeholder='Nombre de la Mesa'
                            name='name'
                            type='text'
                            autoComplete='off'
                            value={formData.name}
                            onChange={inputChange}
                        />
                    </Col>
                    <Col span={24}>
                        <p style={{ margin: '0px 0px 0px 0px' }}>Grupo</p>
                        <Select style={{ width: 400 }}
                            placeholder="Selecciona una Area"
                            name='tableGroupId'
                            value={formData.tableGroupId}
                            onChange={selectChange} >
                            <Option key={0} value={0} disabled>Seleccione una opción</Option>
                            {groupInfo.map(area => (
                                <Option key={area.id} value={area.id}>
                                    {area.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={24}>
                        <p style={{ margin: '0px 0px 0px 0px' }}>Color:</p>

                        <ColorPicker
                            width={'100%'}
                            height={175}
                            color={formData.color}
                            onChange={handleColorChange}
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

export default TablesForm;