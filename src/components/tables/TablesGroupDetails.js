import React, { useState, useEffect } from 'react';
import { Col, Row, Divider, Button, PageHeader, Modal } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';

function TablesGroupDetails(props) {

    const { open, entryType, details, onClose } = props;

    function restoreState() {

    }

    return (
        <Modal
            title={
                <PageHeader
                    onBack={() => null}
                    backIcon={<AppstoreAddOutlined />}
                    title={details.name}
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
                    <p style={{ margin: '0' }}>Grupo:</p>
                    <p>{details.GroupName}</p>
                </Col>
                <Col span={24}>
                    <p style={{ margin: '0' }}>Color:</p>
                    <p>{details.color}</p>
                </Col>
                <Col span={24}>
                    <p style={{ margin: '0' }}>Estado:</p>
                    <p>{details.status}</p>
                </Col>
                <Divider />

                <Col span={24}>
                    <Button
                        type={'default'}
                        onClick={(e) => {
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

export default TablesGroupDetails;