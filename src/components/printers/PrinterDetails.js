import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag } from 'antd';
import { AppstoreAddOutlined, CloseOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash';
import 'moment/locale/es-mx';

function PrinterDetails(props) {

    const { open, entryType, details, onClose } = props;

    return (
        <Modal
            centered
            width={650}
            closeIcon={<CloseOutlined style={{ padding: 5, backgroundColor: '#f0f0f0', borderRadius: 5, color: '#f5222d' }} />}
            onCancel={() => onClose()}
            maskClosable={false}
            open={open}
            footer={null}
        >
            {
                isEmpty(details) ?
                    <>
                    </> :
                    <>
                        <p style={{ fontSize: 14, margin: 0, fontWeight: 600 }}>{details.name}</p>
                        <p style={{ fontSize: 11 }}>{`Codigo Interno: ${details.printerid}`}</p>
                        <Descriptions bordered style={{ width: '100%' }} size={'small'}>
                            <Descriptions.Item label="Dirección IP" span={3}>{details.ip}</Descriptions.Item>
                            <Descriptions.Item label="Puerto" span={3}>{details.port}</Descriptions.Item>
                            <Descriptions.Item label="Color" span={3}>
                                <Tag color={'blue'} style={{
                                    display: 'block',
                                }}>
                                    {details.printerdirection}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </>
            }
        </Modal>
    );
}

export default PrinterDetails;