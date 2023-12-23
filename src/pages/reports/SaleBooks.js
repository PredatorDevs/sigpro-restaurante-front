import React, { useState, useEffect } from 'react';
import { Wrapper } from '../../styled-components/Wrapper';
import { useNavigate } from 'react-router-dom';
import locationsService from '../../services/LocationsServices';
import cashiersServices from '../../services/CashiersServices';
import { Button, Col, DatePicker, Radio, Row, Select, Space, Table } from 'antd';
import { GAddFileIcon, GCreditNoteIcon, GDebitNoteIcon, GInvoice2Icon, GInvoiceTax2Icon, GTicketIcon } from '../../utils/IconImageProvider';

import 'moment/locale/es-mx';
import locale from 'antd/es/date-picker/locale/es_ES';
import moment from 'moment';
import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { filter } from 'lodash';
import generalsServices from '../../services/GeneralsServices';
import reportsServices from '../../services/ReportsServices';
import { columnDatetimeDef, columnDef, columnIfValueEqualsTo, columnMoneyDef } from '../../utils/ColumnsDefinitions';
import { validateSelectedData } from '../../utils/ValidateData';
moment.updateLocale('es-mx', { week: { dow: 1 }});

const { Option } = Select;

function SaleBooks() {
  const navigate = useNavigate();

  const [fetching, setFetching] = useState();
  const [monthFilter, setMonthFilter] = useState(defaultDate());
  const [documentTypeSelectedId, setDocumentTypeSelectedId] = useState(0);
  const [locationSelectedId, setLocationSelectedId] = useState(0);
  const [cashierSelectedId, setCashierSelectedId] = useState(0);

  const [salesData, setSalesData] = useState([]);
  const [documentTypesData, setDocumentTypesData] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  const [cashiersData, setCashiersData] = useState([]);

  function defaultDate() {
    return moment();
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setFetching(true);
    try {
      const locRes = await locationsService.find();
      const cashierRes = await cashiersServices.find();
      const documentTypesResponse = await generalsServices.findDocumentTypes();

      setLocationsData(locRes.data);
      setCashiersData(cashierRes.data);
      setDocumentTypesData(documentTypesResponse.data);
    } catch(err) {
    
    }
    setFetching(false);
  }

  async function generateSaleBook() {
    setFetching(true);
    try {
      if (
        validateSelectedData(locationSelectedId, 'Seleccione una sucursal')
        && validateSelectedData(cashierSelectedId, 'Seleccione una caja')
        && validateSelectedData(documentTypeSelectedId, 'Seleccione un tipo de documento')
      ) {

      }
      const saleRes = await reportsServices.getCashierLocationSalesByMonth(
        locationSelectedId,
        cashierSelectedId,
        documentTypeSelectedId,
        monthFilter.format('YYYY-MM')
      );

      setSalesData(saleRes.data);
    } catch(error) {

    }
    setFetching(false);
  }

  function getDocumentTypeIcon(type, size = '36px') {
    switch(type) {
      case 1: return <GTicketIcon width={size} />;
      case 2: return <GInvoice2Icon width={size} />;
      case 3: return <GInvoiceTax2Icon width={size} />;
      case 4: return <GCreditNoteIcon width={size} />;
      case 5: return <GDebitNoteIcon width={size} />;
      default: return <GAddFileIcon width={size} />;
    }
  }

  return (
    <Wrapper>
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        <Col span={24}>
          <Button
            icon={<SyncOutlined />}
            onClick={() => {
              loadData();
            }}
          >
            Actualizar
          </Button>
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px 0px 5px 0px' }}> {`Sucursal:`}</p>
          <Select
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={locationSelectedId} 
            onChange={(value) => {
              setLocationSelectedId(value);
              setCashierSelectedId(0);
            }}
            optionFilterProp='children'
            showSearch
            filterOption={(input, option) =>
              (option.children).toLowerCase().includes(input.toLowerCase())
            }
          >
            <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
            {
              (locationsData || []).map(
                (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
              )
            }
          </Select>
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px 0px 5px 0px' }}> {`En la caja:`}</p>
          <Select
            dropdownStyle={{ width: '100%' }} 
            style={{ width: '100%' }} 
            value={cashierSelectedId} 
            onChange={(value) => {
              setCashierSelectedId(value);
            }}
            optionFilterProp='children'
            showSearch
            filterOption={(input, option) =>
              (option.children).toLowerCase().includes(input.toLowerCase())
            }
            disabled={locationSelectedId === 0 || locationSelectedId === null}
          >
            <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
            {
              (cashiersData.filter(x => x.locationId === locationSelectedId) || []).map(
                (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
              )
            }
          </Select>
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px 0px 5px 0px' }}> {`Tipo Documento:`}</p>
          <Radio.Group
            buttonStyle="solid"
            value={documentTypeSelectedId}
            onChange={(e) => {
              setDocumentTypeSelectedId(e.target.value);
            }}
          >
            {
              (filter(documentTypesData, ['enableForSales', 1]) || []).map((element) => {
                return (
                  <Radio.Button key={element.id} value={element.id}>
                    <Space>
                    {getDocumentTypeIcon(element.id, '16px')}
                    {element.name}
                    </Space>
                  </Radio.Button>
                )
              })
            }
            
          </Radio.Group>
        </Col>
        <Col span={6}>
          <p style={{ margin: '0px 0px 5px 0px' }}> {`Al mes:`}</p>
          <DatePicker 
            locale={locale}
            allowClear={false}
            format="MMMM-YYYY"
            picker='month'
            value={monthFilter}
            style={{ width: '100%' }}
            onChange={(datetimeMoment, datetimeString) => {
              setMonthFilter(datetimeMoment);
            }}
          />
        </Col>
        <Col span={6}>
          <Button
            icon={<SearchOutlined />}
            onClick={() => {
              generateSaleBook();
            }}
          >
            Generar libro
          </Button>
        </Col>
        <Col span={24}>
          <Table 
            loading={fetching}
            size='small'
            style={{ width: '100%' }}
            rowKey={'id'}
            dataSource={salesData}
            columns={[
              // columnDef({title: 'Código', dataKey: 'id'}),
              columnDef({title: 'Tipo', dataKey: 'documentTypeName'}),
              columnDef({title: 'N° Doc', dataKey: 'docNumber', ifNull: '-'}),
              columnDatetimeDef({title: 'Fecha', dataKey: 'docDatetime'}),
              columnDef({title: 'Cliente', dataKey: 'customerFullname'}),
              // columnDef({title: 'Sucursal', dataKey: 'locationName'}),
              columnDef({title: 'Pago', dataKey: 'paymentTypeName'}),
              columnIfValueEqualsTo({title: '', dataKey: 'isVoided', text: 'Anulada', valueToCompare: 1 }),
              // columnDef({title: 'Anulada', dataKey: 'isVoided'}),
              columnMoneyDef({title: 'Total', dataKey: 'total'}),
              columnMoneyDef({title: 'Pagado', dataKey: 'saleTotalPaid'})
            ]}
            pagination={{ defaultPageSize: 25, showSizeChanger: true, pageSizeOptions: ['25', '50', '100'] }}
          />
        </Col>
      </Row>
    </Wrapper>
  );
}

export default SaleBooks;
