import React, { useState, useEffect } from 'react';
import { Input, Col, Row, Button, Modal, InputNumber, Space, Tabs, Divider, Select, Checkbox, Switch, Tag, Image } from 'antd';
import { ArrowRightOutlined, CloseOutlined, DeleteOutlined, DollarOutlined, EditOutlined, ExclamationCircleOutlined, PercentageOutlined, PlusOutlined, SaveOutlined, WarningOutlined } from '@ant-design/icons';
import { forEach, isEmpty } from 'lodash';

import { customNot } from '../../utils/Notifications.js';

import productsServices from '../../services/ProductsServices.js';
import brandsServices from '../../services/BrandsServices.js';
import categoriesServices from '../../services/CategoriesServices.js';

import { validateNumberData, validateSelectedData, validateStringData } from '../../utils/ValidateData.js';
import ubicationsServices from '../../services/UbicationsServices.js';
import measurementUnitsServices from '../../services/MeasurementUnitsServices.js';

import generalsServices from '../../services/GeneralsServices.js';
import '../../styles/imgStyle.css';
import "../../styles/pricesStyle.css";

import resourcesServices from '../../services/ResourcesServices.js';
import productPricesServices from '../../services/ProductPricesServices.js';
import ProductPrices from '../prices/ProductPrices.js';

const { Option } = Select;
const { confirm } = Modal;

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

function ProductForm(props) {

  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  const [productPrices, setProductPrices] = useState([]);

  const [brandsData, setBrandsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [unitMesData, setUnitMesData] = useState([]);
  const [ubicationsData, setUbicationsData] = useState([]);
  const [packageTypesData, setPackageTypesData] = useState([]);
  const [printerSelect, setPrinterSelect] = useState("");

  const [formIsAlcholic, setFormIsAlcholic] = useState(0);

  // FIRST STAGE FORM VALUES
  const [formId, setId] = useState(0);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBrandId, setFormBrandId] = useState(0);
  const [formCategoryId, setFormCategoryId] = useState(0);
  const [formUbicationId, setFormUbicationId] = useState(0);
  const [formBarcode, setFormBarcode] = useState('');
  const [formCost, setFormCost] = useState(0);
  const [formUnitMeasurementId, setFormUnitMeasurementId] = useState(0);
  const [formIsService, setFormIsService] = useState(false);
  const [formEnabledForProduction, setFormEnabledForProduction] = useState(false);
  const [formIsTaxable, setFormIsTaxable] = useState(true);
  const [formPackageContent, setFormPackageContent] = useState(1);

  const [formProductPackageConfigs, setFormProductPackageConfigs] = useState([]);

  // SECOND STAGE FORM VALUES
  const [formStocks, setFormStocks] = useState([]);

  //IMG
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('Seleccione un archivo');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [resourceIdToSave, setResourceIdToSave] = useState(0);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const { open, updateMode, dataToUpdate, onClose } = props;

  async function loadData() {
    setFetching(true);
    try {
      const brandsResponse = await brandsServices.find();
      const categoriesResponse = await categoriesServices.find();
      const ubicationsResponse = await ubicationsServices.find();
      const mesUnitRes = await measurementUnitsServices.find();
      const packTypeUnitRes = await generalsServices.findPackageTypes();

      setBrandsData(brandsResponse.data);
      setCategoriesData(categoriesResponse.data);
      setUbicationsData(ubicationsResponse.data);
      setUnitMesData(mesUnitRes.data);
      setPackageTypesData(packTypeUnitRes.data);
    } catch (err) {
      console.log(err);
    }
    setFetching(false);
  }

  async function loadPackageConfig(idToLoad) {
    if (idToLoad !== undefined && idToLoad !== 0) {
      try {
        const productPackageConfigResponse = await productsServices.packageConfigs.findByProductId(idToLoad);

        setFormProductPackageConfigs(productPackageConfigResponse.data);
      } catch (error) {
        console.log(error);
      }
    } else {

    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadDataToUpdate() {

    if (!isEmpty(dataToUpdate)) {
      const {
        productId,
        productName,
        productDescription,
        productBrandId,
        productCategoryId,
        productUbicationId,
        productMeasurementUnitId,
        productBarcode,
        productCost,
        productIsService,
        productEnabledForProduction,
        isTaxable,
        packageContent,
        productAlt,
        productUrl,
        productResourceId,
        isAlcoholic
      } = dataToUpdate;

      setFormIsAlcholic(isAlcoholic || 0);
      setResourceIdToSave(productResourceId);
      setImageUrl(productAlt);
      setFileName(productAlt ? productAlt : 'Archivo no valido');
      setPreviewUrl(productUrl ? productUrl : '');
      setId(productId || 0);
      setFormName(productName || '');
      setFormDescription(productDescription || '');
      setFormBrandId(productBrandId || 0);
      setFormCategoryId(productCategoryId || 0);
      setFormUbicationId(productUbicationId || 0);
      setFormUnitMeasurementId(productMeasurementUnitId || 0);
      setFormBarcode(productBarcode || '');
      setFormCost(productCost || 0);
      setFormIsService(!!productIsService || false);
      setFormEnabledForProduction(!!productEnabledForProduction || false);
      setFormIsTaxable(!!isTaxable || false);
      setFormPackageContent(packageContent);

      if (productId !== undefined) {
        //const pricesResponse = await productsServices.prices.findByProductId(productId);
        const pricesResponse = await productPricesServices.findAllPricesByProductId(productId);
        setProductPrices(pricesResponse.data);

        console.log(pricesResponse.data);

        const stocksResponse = await productsServices.stocks.findByProductId(productId);
        setFormStocks(stocksResponse.data);

        loadPackageConfig(productId);
      } else {
        setActiveTab('1');
        setFormStocks([]);
        // // [productId, price, profitRate, profitRateFixed, productPriceId]
      }

      if (!isEmpty(ubicationsData)) {
        const selectUbication = ubicationsData.find(ubication => ubication.id === productUbicationId);
        setPrinterSelect(selectUbication.printername);
      }
    }
  }

  useEffect(() => {
    loadDataToUpdate();
  }, [dataToUpdate]);

  function restoreState() {
    setFormIsAlcholic(0);
    setProductPrices([]);
    setResourceIdToSave(0);
    setImageUrl('');
    setPrinterSelect("");
    setActiveTab('1');
    setId(0);
    setFormName('');
    setFormDescription('');
    setFormBrandId(0);
    setFormCategoryId(0);
    setFormUbicationId(0);
    setFormUnitMeasurementId(0);
    setFormBarcode('');
    setFormCost(0);
    setFormIsService(false);
    setFormEnabledForProduction(false);
    setFormIsTaxable(true);
    setFormPackageContent(1);
    setFormStocks([]);
    setSelectedFile(null);
    setFileName('Seleccione un archivo');
    setPreviewUrl('');
  }

  //Aqui se guarda el producto
  async function firstStageAction() {
    if (
      !validateSelectedData(formCategoryId, 'Seleccione una categoría')
      || !validateSelectedData(formBrandId, 'Seleccione una marca')
      || !validateSelectedData(formUbicationId, 'Seleccione una ubicación')
      || !validateStringData(formName, 'Ingrese un nombre para el producto')
      // || (!validateStringData(formBarcode, `${formIsService ? '' : 'Ingrese un código de barras'}`) && !formIsService)
      // || !validateSelectedData(formUnitMeasurementId, 'Seleccione una unidad de medida')
    ) return;

    setFetching(true);

    try {

      let resourceId = 1
      if (selectedFile) {
        const title = fileName;
        const baseImage = await readFileAsDataURL(selectedFile);
        const response = await resourcesServices.uploadandSaveImage(title, baseImage.split(',')[1], 1, 1);
        if (response.status === 200) customNot('success', "Imagen agregada", 'Imagen guardada con éxito');

        resourceId = response.data.newRecordId;
      }

      const productAddResponse = await productsServices.add(
        formName,
        formDescription,
        formBrandId,
        formCategoryId,
        formUbicationId || null,
        formUnitMeasurementId || 3,
        formBarcode || null,
        formCost,
        formIsService,
        formIsTaxable,
        formEnabledForProduction,
        formPackageContent,
        resourceId,
        formIsAlcholic
      );

      const { insertId } = productAddResponse.data;

      setId(insertId);

      const productStockResponse = await productsServices.stocks.findByProductId(insertId);

      setFetching(false);
      setActiveTab('2');
      setFormStocks(productStockResponse.data);
    } catch (error) {
      setFetching(false);
    }
  }

  async function secondStageAction() {
    setFetching(true);
    setActiveTab('2');
    try {
      //const productPricesResponse = await productsServices.prices.findByProductId(formId);
      const pricesResponse = await productPricesServices.findAllPricesByProductId(formId);
      setProductPrices(pricesResponse.data);
      
      setFetching(false);
    } catch (error) {
      setFetching(false);
    }
  }

  async function thirdStageAction() {

    if (isEmpty(productPrices)) {
      customNot('warning', 'Debe tener al menos un precio o un valor correcto', 'Dato no válido');
      return;
    }

    restoreState();
    setFetching(false);
    onClose(true);
  }

  function validateData() {
    if (!(updateMode ? true : !(productPrices.length === 0)))
      customNot('warning', 'Debe tener al menos un precio o un valor correcto', 'Dato no válido');

    return (
      updateMode ? validateSelectedData(formId, 'Seleccione una categoría') : true
        && validateStringData(formName, 'Verifique nombre del producto')
        && validateSelectedData(formBrandId, 'Seleccione una marca')
        && validateSelectedData(formCategoryId, 'Seleccione una categoria')
        && validateSelectedData(formUbicationId, 'Seleccione una ubicación')
        && updateMode ? true : !(productPrices.length === 0)
    );
  }

  async function updateAction() {
    if (validateData()) {

      try {

        setFetching(true);

        let newResourceId = resourceIdToSave === 0 ? 1 : resourceIdToSave;
        if (selectedFile && fileName !== imageUrl) {
          if (fileName !== imageUrl) {
            const title = fileName;
            const baseImage = await readFileAsDataURL(selectedFile);
            const response = await resourcesServices.uploadandSaveImage(title, baseImage.split(',')[1], 1, 1);
            if (response.status === 200) customNot('success', "Imagen agregada", 'Imagen guardada con éxito');

            const resourceId = response.data.newRecordId;
            newResourceId = resourceId;
          }
        }

        await productsServices.update(
          formName,
          formDescription,
          formBrandId,
          formCategoryId,
          formUbicationId || null,
          formUnitMeasurementId || 3,
          formBarcode || null,
          formCost,
          formIsService,
          formIsTaxable,
          formEnabledForProduction,
          formPackageContent,
          formId,
          newResourceId,
          formIsAlcholic
        );

        restoreState();
        setFetching(false);
        onClose(true);
      } catch (error) {
        setFetching(false);
      }
    }
  }

  function selectImage(e) {
    const file = e.target.files[0]
    setSelectedFile(file);
    setFileName(file ? file.name : 'Seleccione un archivo');
    setPreviewUrl(file ? URL.createObjectURL(file) : '');
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function insertPrice() {
    setLoadingPrice(true);
    try {
      if (formId > 0) {
        await productPricesServices.insertProductPrice(formId, 0);
        customNot('success', 'Precio agregado correctamente', 'El precio fue agregado de manera correcta');

        const pricesResponse = await productPricesServices.findAllPricesByProductId(formId);
        setProductPrices(pricesResponse.data);
      }
    } catch (error) {
      console.error(error);
      customNot('error', 'Error al agregar el precio', 'Ocurrió un error al agregar el nuevo precio');
    } finally {
      setLoadingPrice(false);
    }
  }

  async function softDeletePrice(priceDeleteId) {
    Modal.confirm({
      title: '¿Eliminar este precio?',
      centered: true,
      icon: <WarningOutlined />,
      content: `El precio ya no estará disponible`,
      okText: 'Confirmar',
      okType: 'danger',
      cancelText: 'Cancelar',
      async onOk() {

        await productPricesServices.softDeletePrice(0, priceDeleteId)
          .then(async () => {
            customNot('success', 'El precio fue eliminado', 'El precio fue eliminado correctamente');

            const pricesResponse = await productPricesServices.findAllPricesByProductId(formId);
            setProductPrices(pricesResponse.data);

          })
          .catch((error) => {
            console.error(error);
            customNot('error', 'Error al elminar el precio', 'El precio no pudo ser eliminado correctamente');
          });
      },
      onCancel() { }
    });
  }

  return (
    <Modal
      centered
      width={650}
      closable={false}
      maskClosable={false}
      open={open}
      footer={null}
    >
      <p
        style={{
          margin: '5px 5px 10px 5px',
          textAlign: 'center',
          fontSize: '20px',
          color: '#434343'
        }}
      >
        {`${!updateMode ? 'Nuevo' : 'Actualizar'} Producto`}
      </p>
      {/* <TabsContainer> */}
      <Tabs
        activeKey={activeTab}
        onChange={(activeKey) => { setActiveTab(activeKey); }}
        tabPosition={'left'}
      >
        <Tabs.TabPane tab="Información" key={'1'} disabled={!updateMode}>
          <Row gutter={[12, 12]}>
            <Col span={12}>
              <p style={styleSheet.labelStyle}>Categoria:</p>
              <Select
                dropdownStyle={{ width: '100%' }}
                style={{ width: '100%' }}
                value={formCategoryId}
                onChange={(value) => setFormCategoryId(value)}
                optionFilterProp='children'
                showSearch
                filterOption={(input, option) =>
                  (option.children).toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
                {
                  (categoriesData || []).map(
                    (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
                  )
                }
              </Select>
            </Col>
            <Col span={12}>
              <p style={styleSheet.labelStyle}>Marca:</p>
              <Select
                dropdownStyle={{ width: '100%' }}
                style={{ width: '100%' }}
                value={formBrandId}
                onChange={(value) => setFormBrandId(value)}
                optionFilterProp='children'
                showSearch
                filterOption={(input, option) =>
                  (option.children).toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
                {
                  (brandsData || []).map(
                    (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
                  )
                }
              </Select>
            </Col>
            <Col span={24}>
              <p style={styleSheet.labelStyle}>Nombre:</p>
              <Input
                onChange={(e) => setFormName(e.target.value.toUpperCase())}
                name={'formName'}
                value={formName}
                placeholder={'Producto 1'}
              />
            </Col>
            <Col span={24}>
              <p style={styleSheet.labelStyle}>Descripción:</p>
              <Input
                type={'textarea'}
                onChange={(e) => setFormDescription(e.target.value.toUpperCase())}
                name={'formDescription'}
                value={formDescription}
                placeholder={'Descripción del producto'}
              />
            </Col>
            <Col span={12}>
              <p style={styleSheet.labelStyle}>Ubicación:</p>
              <Select
                dropdownStyle={{ width: '100%' }}
                style={{ width: '100%' }}
                value={formUbicationId}
                onChange={(value) => {
                  setFormUbicationId(value);
                  if (!isEmpty(ubicationsData)) {
                    const selectUbication = ubicationsData.find(ubication => ubication.id === value);
                    setPrinterSelect(selectUbication.printername);
                  }
                }}
                optionFilterProp='children'
                showSearch
                filterOption={(input, option) =>
                  (option.children).toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option key={0} value={0} disabled>{'No seleccionado'}</Option>
                {
                  (ubicationsData || []).map(
                    (element) => <Option key={element.id} value={element.id}>{element.name}</Option>
                  )
                }
              </Select>
            </Col>
            <Col span={12}>
              <p style={styleSheet.labelStyle}>Producto Alcohólico:</p>
              <Switch
                checked={formIsAlcholic === 0 ? false : true}
                onClick={() => {
                  setFormIsAlcholic(formIsAlcholic === 0 ? 1 : 0);
                }}
              />
            </Col>
            <Col span={12} hidden>
              <p style={styleSheet.labelStyle}>Costo:</p>
              <InputNumber
                addonBefore={'$'}
                onChange={(value) => setFormCost(value)}
                name={'formCost'}
                value={formCost}
                precision={4}
              />
            </Col>
            <Col span={12}>
              <p style={styleSheet.labelStyle}>Imagen:</p>
              {
                previewUrl && (
                  <Image
                    src={previewUrl}
                    alt="Vista previa"
                  />
                  // <img src={previewUrl} alt="Vista previa" className="preview-image" />
                )
              }
              <div className="file-input-container">
                <input
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={selectImage}
                  id="file-input"
                  className="file-input"
                />
                <label htmlFor="file-input" className="file-input-label">{fileName}</label>
              </div>
            </Col>
            <Col span={12} hidden>
              <p style={styleSheet.labelStyle}>Contenido:</p>
              <InputNumber
                onChange={(value) => setFormPackageContent(value)}
                name={'formPackageContent'}
                value={formPackageContent}
                min={1}
              />
            </Col>
            <Col span={12} hidden>
              <Checkbox
                checked={formEnabledForProduction}
                onChange={(e) => setFormEnabledForProduction(e.target.checked)}
                style={{ color: '#434343' }}
              >
                Para producción
              </Checkbox>
            </Col>
            <Col span={12} hidden>
              <Checkbox
                checked={formIsService}
                onChange={(e) => setFormIsService(e.target.checked)}
                style={{ color: '#434343' }}
              >
                Es un servicio
              </Checkbox>
            </Col>
            <Col span={12} hidden>
              <Checkbox
                disabled
                checked={formIsTaxable}
                onChange={(e) => setFormIsTaxable(e.target.checked)}
                style={{ color: '#434343' }}
              >
                Gravado
              </Checkbox>
            </Col>
          </Row>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Precios" key={'2'} disabled={!updateMode}>
          <Row gutter={8}>
            <Col span={24}>
              <div style={{ height: 10 }} />
            </Col>
            <Button
              icon={<PlusOutlined />}
              size='small'
              style={{ margin: '0 0 10px 0' }}
              loading={loadingPrice}
              onClick={() => {
                insertPrice();
              }}
            >
              {loadingPrice ? 'Agregando Precio...' : 'Agregar Precio'}
            </Button>
            <Col
              style={{
                maxHeight: 350,
                overflowY: 'scroll',
                paddingRight: 5
              }}
              className="scroll-prices"
              span={24}
            >
              {
                isEmpty(productPrices) ?
                  <>
                    Sin precios...
                  </>
                  :
                  (productPrices || []).map((element, index) => {
                    return (<ProductPrices price={element} index={index} deletePrice={softDeletePrice} />);
                  })
              }
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>
      {/* </TabsContainer> */}
      <Divider />
      <Row gutter={8}>
        <Col span={12}>
          <Button
            type={'primary'}
            danger
            icon={<CloseOutlined />}
            onClick={(e) => {
              restoreState();
              onClose(false)
            }}
            style={{ width: '100%' }}
          >
            Cancelar
          </Button>
        </Col>
        <Col span={12}>
          <Button
            type={'primary'}
            icon={
              updateMode ?
                <SaveOutlined /> :
                activeTab === '1' || activeTab === '2' ?
                  <ArrowRightOutlined /> : <SaveOutlined />
            }
            onClick={
              updateMode ?
                (e) => updateAction() :
                activeTab === '1' ?
                  (e) => firstStageAction() :
                  activeTab === '2' ?
                    (e) => secondStageAction() :
                    activeTab === '3' ?
                      (e) => thirdStageAction() :
                      null
            }
            style={{ width: '100%' }}
            loading={fetching}
            disabled={fetching}
          >
            {
              updateMode ? 'Guardar' : activeTab === '1' || activeTab === '2' ? 'Siguiente' : 'Guardar'
            }
          </Button>
        </Col>
      </Row>
    </Modal >
  )
}

export default ProductForm;
