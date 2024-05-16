import React, { useState, useEffect } from 'react';
import { Input, Col, Row, Divider, Button, PageHeader, Modal } from 'antd';
import { AppstoreAddOutlined, DeleteOutlined, SaveOutlined, WarningOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash';
import IconCategoriesProvider from '../utils/IconCategoriesProvider.js';
import '../styles/categoriesStyle.css';
import { customNot } from '../utils/Notifications.js';

import categoriesServices from '../services/CategoriesServices.js';

function CategoryForm(props) {
  const [fetching, setFetching] = useState(false);

  const [formId, setId] = useState(0);
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState(null);

  const { open, updateMode, dataToUpdate, resourcesData, onClose } = props;

  useEffect(() => {
    const { id, name, resourceId } = dataToUpdate;
    setId(id || 0);
    setFormName(name || '');
    setFormIcon(resourceId || 0);
  }, [dataToUpdate]);

  function restoreState() {
    setId(0);
    setFormName('');
    setFormIcon(null);
  }

  function validateData() {
    const validId = updateMode ? formId !== 0 : true;
    const validFullName = !isEmpty(formName);
    const validIcon = formIcon !== null;

    if (!validFullName) customNot('warning', 'Verifique nombre', 'Dato no válido');
    if (!validIcon) customNot('warning', 'Verifique El Icono', 'Dato no válido');

    return (
      validId && validFullName && validIcon
    );
  }

  function formAction() {
    if (validateData()) {
      if (!updateMode) {
        setFetching(true);
        categoriesServices.add(
          formName, formIcon
        )
          .then((response) => {
            customNot('success', 'Operación exitosa', 'Categoria añadido');
            restoreState();
            setFetching(false);
            onClose(true);
          })
          .catch((error) => {
            setFetching(false);
            customNot('error', 'Algo salió mal', 'Categoria no añadido');
          })
      } else {
        setFetching(true);
        categoriesServices.update(
          formName, formId, formIcon
        )
          .then((response) => {
            customNot('success', 'Operación exitosa', 'Categoria actualizada');
            restoreState();
            setFetching(false);
            onClose(true);
          })
          .catch((error) => {
            setFetching(false);
            customNot('error', 'Algo salió mal', 'Categoria no actualizada');
          })
      }
    }
  }

  function deleteAction() {
    const { name } = dataToUpdate;
    Modal.confirm({
      title: '¿Desea eliminar este Categoria?',
      centered: true,
      icon: <WarningOutlined />,
      content: `${name || 'Not defined'} será eliminado de la lista de Categorias`,
      okText: 'Confirmar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        setFetching(true);
        categoriesServices.remove(formId)
          .then((response) => {
            restoreState();
            setFetching(false);
            onClose(true);
          })
          .catch((error) => {
            setFetching(false);
            customNot('info', 'Algo salió mal', 'El Categoria no pudo ser eliminado');
          });
      },
      onCancel() { },
    });
  }

  const changeIcon = (iconId) => {
    setFormIcon(iconId);
  }

  return (
    <Modal
      title={
        <PageHeader
          onBack={() => null}
          backIcon={<AppstoreAddOutlined />}
          title={`${!updateMode ? 'Nueva' : 'Actualizar'} Categoria`}
          extra={!updateMode ? [] : [
            <Button key="1" type="danger" size={'small'} icon={<DeleteOutlined />} onClick={(e) => deleteAction()}>
              Eliminar
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
          <Input onChange={(e) => setFormName(e.target.value)} name={'formName'} value={formName} placeholder={'Embotellados'} />
        </Col>
        <Col span={24}>
          <p style={{ margin: '0px 0px 0px 0px' }}>Icono:</p>
          {
            isEmpty(resourcesData) ? <>Vacio</> :
              <>
                <div className="icon-grid">
                  {resourcesData.map((icon) => (
                    <img
                      key={icon.id}
                      src={icon.url}
                      alt={icon.name}
                      className={formIcon === icon.id ? 'selected' : 'no-selected'}
                      onClick={() => changeIcon(icon.id)}
                    />
                  ))}
                </div>
              </>
          }
        </Col>
        <Divider />
        <Col span={24}>
          <Button
            type={'primary'}
            icon={<SaveOutlined />}
            onClick={(e) => formAction()}
            style={{ width: '100%', marginTop: 20 }}
            loading={fetching}
            disabled={fetching}
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
  )
}

export default CategoryForm;
