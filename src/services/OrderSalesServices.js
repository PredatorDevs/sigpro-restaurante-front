import { genRequest } from "./Requests";

const orderSalesServices = {};

orderSalesServices.details = {};

orderSalesServices.find = () => genRequest(`get`, `/ordersales`, {});
orderSalesServices.findById = (orderSaleId) => genRequest(`get`, `/ordersales/byId/${orderSaleId || 0}`, {});

orderSalesServices.findByLocationCurrentActiveShiftcut = (locationId) => genRequest(`get`, `/ordersales/active-shiftcut/location/${locationId || 0}`, {});

orderSalesServices.findByRangeDate = (initialDate, finalDate) => genRequest(`get`, `/ordersales/by-range-date/${initialDate}/${finalDate}`, {});

orderSalesServices.findByLocationRangeDate = (locationId, initialDate, finalDate) =>
  genRequest(`get`, `/ordersales/by-location/${locationId}/by-range-date/${initialDate}/${finalDate}`, {});

orderSalesServices.findSettlementByRangeDate = (initialDate, finalDate) => genRequest(`get`, `/ordersales/settlement-by-range-date/${initialDate}/${finalDate}`, {});

orderSalesServices.findSettlementByLocationRangeDate = (locationId, initialDate, finalDate) =>
  genRequest(`get`, `/ordersales/settlement/by-location/${locationId}/by-range-date/${initialDate}/${finalDate}`, {});

orderSalesServices.findRecents = () => genRequest(`get`, `/ordersales/recents`, {});

orderSalesServices.add = (locationId, customerId, docType, docDatetime, total) =>
  genRequest(`post`, `/ordersales`, { locationId, customerId, docType, docDatetime, total });

orderSalesServices.update = (locationId, customerId, docType, docDatetime, status, total, orderSaleId) =>
  genRequest(`put`, `/ordersales`, { locationId, customerId, docType, docDatetime, status, total, orderSaleId });

orderSalesServices.setStatus = (status, orderSaleId) =>
  genRequest(`put`, `/ordersales/setstatus`, { status, orderSaleId });

orderSalesServices.remove = (orderSaleId) =>
  genRequest(`delete`, `/ordersales/${orderSaleId}`);

orderSalesServices.recalculateTotal = (orderSaleId) =>
  genRequest(`put`, `/ordersales/recalculate/${orderSaleId}`);

// PRODUCTION DETAILS

orderSalesServices.details.findByOrderSaleId = (orderSaleId) =>
  genRequest(`get`, `/ordersales/details/${orderSaleId}`, {});

// EXPECTED req.body => details = [[orderSaleId, productId, unitPrice, quantity], [...]]
orderSalesServices.details.add = (bulkData) =>
  genRequest(`post`, `/ordersales/details`, { bulkData });

orderSalesServices.details.update = (orderSaleId, productId, unitPrice, quantity, orderSaleDetailId) =>
  genRequest(`put`, `/ordersales/details`, { orderSaleId, productId, unitPrice, quantity, orderSaleDetailId });

orderSalesServices.details.remove = (orderSaleDetailId) =>
  genRequest(`delete`, `/ordersales/details/${orderSaleDetailId}`);

//Commands
orderSalesServices.addCommand = (locationId, customerId, tableId, shiftcutId, total, productId, quantity, unitPrice, createdBy, commentOrder, commentsDetails, userPINCode, orderIdentifier, addressIdentifier, phoneIdentifier, orderTypeId) =>
  genRequest('post', '/ordersales/command/new', { locationId, customerId, tableId, shiftcutId, total, productId, quantity, unitPrice, createdBy, commentOrder, commentsDetails, userPINCode, orderIdentifier, addressIdentifier, phoneIdentifier, orderTypeId });

orderSalesServices.details.addByCommand = (orderSaleId, productId, unitPrice, quantity, comments) =>
  genRequest(`post`, `/ordersales/details/by-command`, { orderSaleId, productId, unitPrice, quantity, comments });

orderSalesServices.findByTableId = (tableId) =>
  genRequest('get', `/ordersales/by-table/${tableId}`, {});

orderSalesServices.details.findByOrderId = (orderId) =>
  genRequest('get', `/ordersales/by-orderid/${orderId}`, {}, '', '', 'La información de las ordenes no pudo ser obtenida', 'Error desconocido');

orderSalesServices.details.removeByOrderDetailId = (ordersaleId) =>
  genRequest('delete', `/ordersales/order-detail/${ordersaleId}`, {}, '', '', 'La información de las ordenes no pudo ser obtenida', 'Error desconocido');

orderSalesServices.details.sendToKitchen = (ordersaleId, bulkData) =>
  genRequest('post', `/ordersales/send-to-kitchen/${ordersaleId}`, { bulkData }, '', '', 'La información de las ordenes no pudo ser obtenida', 'Error desconocido');

orderSalesServices.updateComment = (orderSaleId, commentOrder, total, updateBy, locationId, status) =>
  genRequest('put', `/ordersales/update-by-command`, { orderSaleId, commentOrder, total, updateBy, locationId, status }, '', '', 'La información de las ordenes no pudo ser obtenida', 'Error desconocido');

orderSalesServices.getKitchenTicket = (orderId, bulkData) =>
  genRequest(`post`, `/ordersales/kitchen/ticket/${orderId}`, { bulkData }, '', '', 'No se ha podido descargar la hoja de traslados', 'Error desconocido');

orderSalesServices.getPreAccountTicket = (orderId) =>
  genRequest(`get`, `/ordersales/preacccount/ticket/${orderId}`, { }, '', '', 'No se ha podido descargar la hoja de traslados', 'Error desconocido');


export default orderSalesServices;
