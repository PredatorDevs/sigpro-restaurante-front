import { genRequest } from "./Requests";

const tablesServices = {};

tablesServices.findGroup = (location) =>
    genRequest(`get`, `/tables-group/location/${location}`, {}, '', '', 'La información de las categorías no pudo ser obtenida', 'Error desconocido');

tablesServices.findAllInCommand = (location, orderTypeId) =>
    genRequest(`get`, `/tables-group/tables-no-orders/location/${location}/orderType/${orderTypeId}`, {}, '', '', 'La información de las categorías no pudo ser obtenida', 'Error desconocido');

tablesServices.findByPin = (location, pin, orderTypeId) =>
    genRequest(`get`, `/tables-group/tables-by-pin/location/${location}/${pin}/orderType/${orderTypeId}`, {}, '', '', 'La información de las categorías no pudo ser obtenida', 'Error desconocido');

tablesServices.add = (locationId, name, createdBy) =>
    genRequest(`post`, `/tables-group`, { locationId, name, createdBy });

tablesServices.update = (Id, name, updatedBy) =>
    genRequest(`put`, `/tables-group/${Id}`, { name, updatedBy });

tablesServices.delete = (Id) =>
    genRequest(`delete`, `/tables-group/${Id}`);

tablesServices.findTables = (location) =>
    genRequest(`get`, `/tables-group/tables/location/${location}`, {}, '', '', 'La información de las categorías no pudo ser obtenida', 'Error desconocido');

tablesServices.addTable = (tableGroupId, status, name, color, createdBy, orderTypeId) =>
    genRequest(`post`, `/tables-group/tables`, { tableGroupId, status, name, color, createdBy, orderTypeId });

tablesServices.updateTable = (Id, tableGroupId, name, color, updatedBy, orderTypeId) =>
    genRequest(`put`, `/tables-group/tables/${Id}`, { tableGroupId, name, color, updatedBy, orderTypeId });

tablesServices.deleteTable = (Id) =>
    genRequest(`delete`, `/tables-group/tables/${Id}`);


tablesServices.updateTableByOrderId = (orderSaleId, lastOrderSaleId, status, tableId, updatedBy) =>
    genRequest(`put`, `/tables-group/tables/update-ordersId/${tableId}`, { orderSaleId, lastOrderSaleId, status, updatedBy });

tablesServices.findAllOrderTypes = () =>
    genRequest(`get`, `/tables-group/orderTypes`, {}, '', '', 'La información de los tipos de ordenes no pudo ser obtenida', 'Error desconocido');



export default tablesServices;