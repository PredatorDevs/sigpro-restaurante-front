import { Modal, Row, Col, Space, Input, Divider, Button } from "antd";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { useState } from "react";

const styleSheet = {
    labelStyle: {
        margin: '0px',
        color: '#434343'
    },
    titleStyle: {
        margin: '5px 5px 10px 0px',
        fontSize: '20px',
        color: '#434343'
    }
};


function ConfirmOrder(params) {

    const { open, totalOrder, onClose } = params;

    const [comment, setComment] = useState('');

    const hlandleComment = (e) => {
        setComment(e.target.value);
    }

    return (
        <Modal
            centered
            width={500}
            closable={false}
            maskClosable={false}
            open={open}
            footer={null}
        >
            <Row gutter={[12, 12]}>
                <Col span={24} style={{ display: 'flex', flexDirection: 'column' }}>
                    <Space>
                        <p
                            style={{
                                color: '#434343',
                                backgroundColor: '#f5f5f5',
                                textAlign: 'left',
                                padding: '5px',
                                margin: 0,
                                borderRadius: 10,
                                fontSize: 16
                            }}
                        >
                            ¿Confirmar Orden?
                        </p>

                        <p style={{ margin: 0, fontSize: 12 }}>{`Venta total: $${totalOrder}`}</p>
                    </Space>
                </Col>
                <Col style={{ display: 'flex', flexDirection: 'column' }}>
                    <p style={styleSheet.labelStyle}>Comentario adicional:</p>
                    <Input
                        style={{ width: '100%' }}
                        size={'large'}
                        type={'text'}
                        value={comment}
                        onChange={hlandleComment}
                        maxLength={250}
                        name="Comentario"
                    />
                </Col>
            </Row>
            <Divider />
            <Row gutter={[12, 12]}>
                <Col span={12}>
                    <Button
                        danger
                        type={'primary'}
                        size={'large'}
                        icon={<CloseOutlined />}
                        onClick={() => {
                            setComment('');
                            onClose({}, false);
                        }}
                        style={{ width: '100%' }}
                    >
                        Cancelar
                    </Button>
                </Col>
                <Col span={12}>
                    <Button
                        id={'new-sale-add-detail-button'}
                        type={'primary'}
                        size={'large'}
                        icon={<SaveOutlined />}
                        style={{ width: '100%' }}
                        onClick={() => {
                            onClose({comment}, true);
                            setComment('');
                        }}
                    >
                        Finalizar Orden
                    </Button>
                </Col>
            </Row>
        </Modal>
    );
}

export default ConfirmOrder;