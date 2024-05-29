import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag } from 'antd';
import { AppstoreAddOutlined, CloseOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash';
import 'moment/locale/es-mx';

function TaxDetails(props) {

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
                        <p style={{ fontSize: 11 }}>{`Codigo Interno: ${details.id}`}</p>
                        <Descriptions bordered style={{ width: '100%' }} size={'small'}>
                            <Descriptions.Item label="Cantidad" span={3}>
                                <Tag color={'blue'} style={{
                                    display: 'block',
                                    maxWidth: 60
                                }}>
                                    {
                                        details.isPercentage === 1 ?
                                            `${(parseFloat(details.taxRate) * 100).toFixed(2)}%` :
                                            `$${parseFloat(details.taxRate).toFixed(2)}`
                                    }
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Es Porcentual" span={3}>
                                <Tag color={details.isPercentage === 1 ? 'green' : 'red'} style={{
                                    display: 'block',
                                    maxWidth: 30
                                }}>
                                    {details.isPercentage === 1 ? 'Si' : 'No'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Es Opcional" span={3}>
                                <Tag color={details.isApplicable === 1 ? 'green' : 'red'} style={{
                                    display: 'block',
                                    maxWidth: 30
                                }}>
                                    {details.isApplicable === 1 ? 'Si' : 'No'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </>
            }
        </Modal>
    );
}

export default TaxDetails;