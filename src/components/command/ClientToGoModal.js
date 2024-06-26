import { useState, useEffect } from "react";
import { Col, Button, Divider, Modal, Row, Input } from "antd";
import { CloseOutlined, SaveOutlined } from "@ant-design/icons";
import { customNot } from "../../utils/Notifications";


function AddClientModal(props) {
    const { open, updateMode, clientName, onClose } = props;

    const [client, setClient] = useState('');

    function restoreState() {
        if (!updateMode) {
            setClient('');
        }
    }

    function isValid() {
        const validClient = client !== null && client !== '';

        if (!validClient) customNot('warning', 'Dato no valido', 'Por favor, ingrese un cliente')

        return (validClient);
    }

    return (
        <Modal
            centered
            width={600}
            closable={false}
            maskClosable={false}
            open={open}
            footer={null}
        >
            <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
                <strong>Cliente:</strong>
                <Input
                    value={client}
                    maxLength={30}
                    placeholder={updateMode ? clientName : "Identificador para el cliente"}
                    onChange={(e) => {
                        setClient(e.target.value);
                    }}
                />
            </div>
            <Divider />
            <Row gutter={[12, 12]}>
                <Col span={12}>
                    <Button
                        danger
                        type={'primary'}
                        size={'large'}
                        icon={<CloseOutlined />}
                        onClick={(e) => {
                            restoreState();
                            onClose('', false);
                        }}
                        style={{ width: '100%' }}
                    >
                        Cancelar
                    </Button>
                </Col>
                <Col span={12}>
                    <Button
                        id={'new-client-add--button'}
                        type={'primary'}
                        size={'large'}
                        icon={<SaveOutlined />}
                        onClick={() => {
                            if (isValid()) {
                                restoreState();
                                onClose(client, false, updateMode);
                            }
                        }}
                        style={{ width: '100%' }}
                    >
                        {!updateMode ? "Añadir Cliente" : "Actualizar Cliente"}
                    </Button>
                </Col>
            </Row>
        </Modal>
    );
}

export default AddClientModal;