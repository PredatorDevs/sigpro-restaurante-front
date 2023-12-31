import React, { useState, useEffect } from 'react';
import { Input, Col, Row, Divider, Button, PageHeader, Modal, Select, Form } from 'antd';
import { AppstoreAddOutlined, DeleteOutlined, SaveOutlined, WarningOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash';

const { Option } = Select;

function TablesForm(props) {

    const { open, updateMode, dataToUpdate, onClose, areasAvailable } = props;

    const [formId, setId] = useState(0);
    const [formName, setFormName] = useState('');

    function restoreState() {
        setId(0);
        setFormName('');
    }

    return (
        <Modal
            title={
                <PageHeader
                    onBack={() => null}
                    backIcon={<AppstoreAddOutlined />}
                    title={`${!updateMode ? 'Nueva' : 'Actualizar'} Mesa`}
                    extra={!updateMode ? [] : [
                        <Button key="1" type="danger" size={'small'} icon={<DeleteOutlined />}>
                            Eliminar Mesa
                        </Button>
                    ]}
                />
            }
            centered
            width={450}
            closable={false}
            maskClosable={false}
            visible={open}
            footer={null}
        >
            <Row gutter={8}>
                <Col span={24}>
                    <p style={{ margin: '0px 0px 0px 0px' }}>Nombre:</p>
                    <Input placeholder='Mesa 0' required />
                </Col>
                <Col span={24}>
                    <p style={{ margin: '0px 0px 0px 0px' }}>Capacidad Maxima:</p>
                    <Input type='number' placeholder='0' required max={10} min={2} />
                </Col>
                <Col span={24}>
                    <p style={{ margin: '0px 0px 0px 0px' }}>Area:</p>
                    <Select style={{ width: 400 }} placeholder="Selecciona una Area">
                        {areasAvailable.map(area => (
                            <Option key={area.id} value={area.id}>
                                {area.name}
                            </Option>
                        ))}
                    </Select>
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

export default TablesForm;