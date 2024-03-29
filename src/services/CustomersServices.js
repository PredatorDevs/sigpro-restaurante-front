import { genRequest } from "./Requests";

const customersServices = {};

customersServices.find = () => genRequest(`get`, `/customers`, {});
customersServices.findById = (customerId) => genRequest(`get`, `/customers/${customerId}`, {});

customersServices.findByLocation = (locationId) => genRequest(`get`, `/customers/by-location/${locationId}`, {}, '', '', 'Los clientes no pudieron ser obtenidos', 'Error desconocido');

customersServices.findTypes = () => genRequest(`get`, `/customers/types`, {});

customersServices.findPendingSales = (customerId) => genRequest(`get`, `/customers/pending-sales/${customerId}`, {});

customersServices.add = (customerTypeId, locationId, fullName, address, phone, email, dui, nit, nrc) =>
  genRequest(`post`, `/customers`, { customerTypeId, locationId, fullName, address, phone, email, dui, nit, nrc });

customersServices.addv2 = (
  customerTypeId,
  locationId,
  departmentId,
  cityId,
  deliveryRouteId,
  fullName,
  businessName,
  address,
  phone,
  email,
  dui,
  nit,
  nrc,
  businessLine,
  occupation,
  birthdate,
  applyForCredit,
  creditLimit,
  defPriceIndex,
  customerPhones,
  customerAddresses,
  customerRelatives
) =>
  genRequest(
    `post`, `/customers`,
    {
      customerTypeId,
      locationId,
      departmentId,
      cityId,
      deliveryRouteId,
      fullName,
      businessName,
      address,
      phone,
      email,
      dui,
      nit,
      nrc,
      businessLine,
      occupation,
      birthdate,
      applyForCredit,
      creditLimit,
      defPriceIndex,
      customerPhones,
      customerAddresses,
      customerRelatives
    },
    '',
    '',
    'No se puedo añadir el nuevo cliente',
    'Error desconocido. Consulte los registros.'
  );

customersServices.addPhones = (customerPhones) =>
  genRequest(`post`, `/customers/add-phones`, { customerPhones }, 'Teléfonos añadidos existosamente', '', 'Los teléfonos no fueron añadidos', '');

customersServices.addRelatives = (customerRelatives) =>
  genRequest(`post`, `/customers/add-relatives`, { customerRelatives }, 'Referencias familiares añadidas existosamente', '', 'Las referencias familiares no fueron añadidas', '');

customersServices.update = (
  customerTypeId,
  locationId,
  departmentId,
  cityId,
  deliveryRouteId,
  fullName,
  businessName,
  address,
  phone,
  email,
  dui,
  nit,
  nrc,
  businessLine,
  occupation,
  birthdate,
  applyForCredit,
  creditLimit,
  defPriceIndex,
  customerId
) =>
  genRequest(
    `put`,
    `/customers`,
    {
      customerTypeId,
      locationId,
      departmentId,
      cityId,
      deliveryRouteId,
      fullName,
      businessName,
      address,
      phone,
      email,
      dui,
      nit,
      nrc,
      businessLine,
      occupation,
      birthdate,
      applyForCredit,
      creditLimit,
      defPriceIndex,
      customerId
    }
  );

customersServices.remove = (customerId) =>
  genRequest(`delete`, `/customers/${customerId}`);

customersServices.removePhone = (customerPhoneId) =>
  genRequest(`delete`, `/customers/phone/${customerPhoneId}`, {}, 'Teléfono removido exitosamente', '', 'El teléfono no fue removido', '');

customersServices.removeRelative = (customerRelativeId) =>
  genRequest(`delete`, `/customers/relative/${customerRelativeId}`, {}, 'Referencia removida exitosamente', '', 'La referencia no fue removida', '');

customersServices.findByPhone = (phone) =>
  genRequest(`get`, `/customers/by-phone/${phone}`, {}, '', '', 'Cliente no encontrado', '');

customersServices.findByNewId = (customerId) =>
  genRequest(`get`, `/customers/by-id/${customerId}`, {}, '', '', 'Cliente no encontrado', '');

customersServices.findByIdandPhone = (customerId, phone, addressId) =>
  genRequest(`get`, `/customers/by-id/${customerId}/phone/${phone}/address/${addressId}`, {}, '', '', 'Cliente no encontrado', '');

customersServices.findByIdandPhoneId = (customerId, phoneId, addressId) =>
  genRequest(`get`, `/customers/by-id/${customerId}/by-phoneId/${phoneId}/by-addressId/${addressId}`, {}, '', '', 'Cliente no encontrado', '');

export default customersServices;
