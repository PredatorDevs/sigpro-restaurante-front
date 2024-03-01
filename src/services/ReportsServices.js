import { genRequest } from "./Requests";

const reportsServices = {};

reportsServices.kardexByProduct = (locationId, productId, startDate, endDate) =>
  genRequest(`get`, `/reports/kardex/by-product/${locationId}/${productId}/${startDate}/${endDate}`, {});

reportsServices.getLocationProductsByCategory = (locationId) =>
  genRequest(`get`, `/reports/get-product-by-cat/${locationId}`, {}, '', '', '', '', 'application/pdf', 'blob');

reportsServices.getLocationProductsByBrand = (locationId) =>
  genRequest(`get`, `/reports/get-product-by-brand/${locationId}`, {}, '', '', '', '', 'application/pdf', 'blob');

reportsServices.shiftcutSettlement = (shiftcutId) =>
  genRequest(
    `get`,
    `/reports/shiftcut-settlement/${shiftcutId}`,
    {},
    '',
    '',
    '',
    '',
    'application/pdf',
    'blob'
  );

reportsServices.getLocationProductsByFilteredData = (filteredData) =>
  genRequest(`post`, `/reports/get-product-by-filtered-data`, { productsData: filteredData }, '', '', '', '', 'application/json', 'blob');

reportsServices.getCashierLocationSalesByMonth = (locationId, cashierId, documentTypeId, month) =>
  genRequest(`get`, `/reports/cashier-location-sales-by-month/${locationId}/${cashierId}/${documentTypeId}/${month}`, {});

reportsServices.getTransferSheet = (transferId) =>
  genRequest(`get`, `/reports/transfer-sheet/${transferId}`, {}, '', '', 'No se ha podido descargar la hoja de traslados', 'Error desconocido', 'application/json', 'blob');

reportsServices.getKitchenTicket = (orderId, bulkData) =>
  genRequest(`post`, `/reports/kitchen/ticket/${orderId}`, { bulkData }, '', '', 'No se ha podido descargar la hoja de traslados', 'Error desconocido', 'application/json', 'blob');

reportsServices.getPreAccountTicket = (orderId) =>
  genRequest(`get`, `/reports/preaccount/ticket/${orderId}`, {}, '', '', 'No se ha podido descargar la hoja de traslados', 'Error desconocido', 'application/json', 'blob');

reportsServices.getPackOffTicket = (orderId, customerId, phoneIdentifier, addressIdentifier, packoffStatus, currentWaiter, currentTimer) =>
  genRequest(`post`, `/reports/packoff/ticket/${orderId}`, { customerId, phoneIdentifier, addressIdentifier, packoffStatus, currentWaiter, currentTimer}, '', '', 'No se ha podido descargar la hoja de traslados', 'Error desconocido', 'application/json', 'blob');


export default reportsServices;
