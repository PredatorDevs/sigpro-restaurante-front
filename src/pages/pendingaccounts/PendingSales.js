import React, { useState, useEffect } from 'react';
import { Avatar, Button, Card, Col, Descriptions, List, Modal, PageHeader, Result, Row, Space, Spin, Statistic, Table, Tag } from 'antd';
import { FileProtectOutlined, LogoutOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { Wrapper } from '../../styled-components/Wrapper';

import { customNot } from '../../utils/Notifications';
import styled from 'styled-components';
import cashiersServices from '../../services/CashiersServices.js';
import { isEmpty } from 'lodash';
import moment from 'moment';
import 'moment/locale/es-mx';
import ClosingShiftcutModal from '../../components/ClosingShiftcutModal.js';
import { TableContainer } from '../../styled-components/TableContainer.js';
import { columnDef, columnMoneyDef } from '../../utils/ColumnsDefinitions.js';
import salesServices from '../../services/SalesServices';
import customersServices from '../../services/CustomersServices';
import NewSalePayment from '../../components/NewSalePayment';
import { getUserLocation, getUserMyCashier } from '../../utils/LocalData';

import personIcon from '../../img/icons/person.png';
import invoiceIcon from '../../img/icons/invoice.png';
import invoiceTaxIcon from '../../img/icons/invoicetax.png';
import { GRefreshIcon } from '../../utils/IconImageProvider';

const { confirm } = Modal;

function PendingSales() {
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState('');

  const [ableToProcess, setIsAbleToProcess] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [formUpdateMode, setFormUpdateMode] = useState(false);

  const [entityData, setEntityData] = useState([]);
  const [entitySelectedId, setEntitySelectedId] = useState(0);
  const [entityDataFiltered, setEntityDataFiltered] = useState('');
  const [entityDetailData, setEntityDetailData] = useState([]);
  const [entityRefreshData, setEntityRefreshData] = useState(0);
  const [entityToUpdate, setEntityToUpdate] = useState({});

  const [saleSelectedToPay, setSaleSelectedToPay] = useState(0);
  const [saleDocNumberSelected, setSaleDocNumberSelected] = useState(0);

  const navigate = useNavigate();

  async function checkIfAbleToProcess() {
    setFetching(true);
    
    try {
      const response = await cashiersServices.checkIfAbleToProcess(getUserMyCashier());
      const { isOpen, currentShiftcutId } = response.data[0];
      
      if (isOpen === 1 && currentShiftcutId !== null) {
        setIsAbleToProcess(true);
      }
    } catch(error) {

    }

    setFetching(false);
  }
  
  async function loadData() {
    setFetching(true);
    
    try {
      const pendingRes = await salesServices.findPendingsByLocation(getUserLocation());
      setEntityData(pendingRes.data);
    } catch(error) {

    }

    setFetching(false);
  }

  async function loadDetailData(customerId) {
    setFetching(true);

    try {
      const cusPendingRes = await customersServices.findPendingSales(customerId || 0);
      setEntitySelectedId(customerId);
      setEntityDetailData(cusPendingRes.data);
      setEntityDataFiltered(entityData.find((x) => x.customerId === customerId)['customerFullname'] || '');
    } catch(error) {

    }

    setFetching(false);
  }

  useEffect(() => {
    checkIfAbleToProcess();
    loadData();
  }, []);

  return (
    !ableToProcess ? <>
      <Result
        status="info"
        title={<p style={{ color: '#434343' }}>{`${fetching ? "Cargando..." : "Caja cerrada, operaciones de cobro limitadas"}`}</p>}
        subTitle={<p style={{ color: '#434343' }}>{`${fetching ? "Por favor espere..." : "Usted debe aperturar un nuevo turno en su caja para poder procesar"}`}</p>}
      />
    </> : <Wrapper xCenter>
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
      <Col
          span={24}
          style={{
            paddingTop: '10px',
            paddingBottom: '10px',
            paddingLeft: '10px',
            paddingRight: '10px',
            backgroundColor: '#e6f4ff',
            borderRadius: '5px'
          }}
        >
          <p style={{ margin: '0px', fontSize: 12 }}>{'Opciones:'}</p>
          <Space wrap>
            <Button
              // type='primary'
              onClick={() => loadData()}
            >
              <Space>
                <GRefreshIcon width={'16px'} />
                {'Actualizar'}
              </Space>
            </Button>
          </Space>
        </Col>
        <Col span={8}>
          {/* <p style={{ fontWeight: 600, fontSize: 20 }}>Clientes pendientes</p> */}
          <List
            style={{ backgroundColor: '#F0F2F5', borderRadius: 5, padding: 10 }}
            size='small'
            itemLayout="horizontal"
            dataSource={entityData || []}
            renderItem={item => (
              <List.Item
                onClick={() => loadDetailData(item.customerId)}
                style={{
                  backgroundColor: item.customerId === entitySelectedId ? '#d9d9d9' : 'transparent',
                  borderLeft: `5px solid ${item.customerId === entitySelectedId ? '#69b1ff' : '#bae0ff'}`,
                  borderBottom: `5px solid ${item.customerId === entitySelectedId ? '#69b1ff' : '#bae0ff'}`,
                  borderRight: `1px solid ${item.customerId === entitySelectedId ? '#69b1ff' : '#bae0ff'}`,
                  borderTop: `1px solid ${item.customerId === entitySelectedId ? '#69b1ff' : '#bae0ff'}`,
                  marginBottom: `5px`,
                  borderRadius: 10
                }}
              >
                <List.Item.Meta
                  avatar={<Avatar src={personIcon} style={{ backgroundColor: '#ff4d4f' }} />}
                  title={<p style={{ margin: 0 }}>{item.customerFullname}</p>}
                  description={
                    <>
                      <p style={{ margin: 0 }}>{`${item.pendingSales} ${item.pendingSales > 1 ? 'cuentas pendientes' : 'cuenta pendiente'}`}</p>
                      {
                        +(item.expiredSales) > 0 ?
                          <p style={{ margin: 0, fontSize: 10, color: 'red' }}>{`${item.expiredSales} ${item.expiredSales > 1 ? 'vencidas' : 'vencida'}`}</p> :
                          <></>
                      }
                    </>
                  }
                />
              </List.Item>
            )}
            pagination
          />
        </Col>
        <Col span={16} style={{ backgroundColor: '#F0F2F5', borderRadius: 5, padding: 10 }}>
          <p style={{ fontSize: 18, padding: '3px 10px' }}>{`${entityDataFiltered}`}</p>
          {/* {
            entitySelectedId !== 0 ? (
              <Button
                style={{ margin: '3px 10px' }}
              >
                Nuevo Abono General
              </Button>
            ) : <></>
          } */}
          <List
            style={{ backgroundColor: '#F0F2F5', borderRadius: 5, padding: 10 }}
            size='small'
            itemLayout="horizontal"
            dataSource={entityDetailData || []}
            loading={fetching}
            renderItem={(item, index) => (
              <List.Item
                // onClick={() => loadDetailData(item.customerId)}
                style={{
                  backgroundColor: index % 2 === 0 ? '#fafafa' : '#F0F2F5',
                  borderLeft: '5px solid #bae0ff',
                  borderBottom: '5px solid #bae0ff',
                  borderRight: '1px solid #bae0ff',
                  borderTop: '1px solid #bae0ff',
                  marginBottom: '5px',
                  borderRadius: 10
                }}
                extra={[
                  <Button
                    onClick={() => { 
                      setSaleSelectedToPay(item.saleId);
                      setSaleDocNumberSelected(item.docNumber);
                      setOpenModal(true);
                    }}
                  >
                    Cobrar
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      src={item.documentTypeId === 3 ? invoiceTaxIcon : invoiceIcon} 
                    />
                  }
                  title={
                    <>
                      <p 
                        style={{ margin: '0px' }}
                      >
                        {`${item.documentTypeName} ${item.docNumber}`}
                      </p>
                      <p 
                        style={{ margin: '0px', fontSize: 10, color: +(item.expiresIn) > 0 ? 'black' : 'red' }}
                      >
                        {`${item.expirationInformation || ''}`}
                      </p>
                    </>
                  }
                  description={
                    <Space wrap>
                      <p style={{ margin: 0 }}>{`Debe `}<Tag color={'red'}>{`$ ${item.salePendingAmount}`}</Tag></p>
                      <p style={{ margin: 0 }}>{`Pagado `}<Tag color={'green'}>{`$ ${item.saleTotalPaid}`}</Tag></p>
                      <p style={{ margin: 0 }}>{`Total `}<Tag>{`$ ${item.saleTotal}`}</Tag></p>
                    </Space>
                  }
                />
              </List.Item>
            )}
            pagination
          />
        </Col>
      </Row>
      <NewSalePayment 
        open={openModal}
        saleId={saleSelectedToPay}
        docNumber={saleDocNumberSelected}
        onClose={(success) => {
          setOpenModal(false);
          if (success) {
            loadData();
            loadDetailData(entitySelectedId);
            setSaleSelectedToPay(0);
          }
        }}
      />
    </Wrapper>
  );
}

export default PendingSales;
