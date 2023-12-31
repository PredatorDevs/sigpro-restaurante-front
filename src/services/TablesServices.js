import { genRequest } from "./Requests";

const tablesServices = {};

tablesServices.findGroup = (location) =>
    genRequest(`get`, `/tables-group/location/${location}`, {}, '', '', 'La información de las categorías no pudo ser obtenida', 'Error desconocido');

tablesServices.add = (locationId, name, createdBy) =>
    genRequest(`post`, `/tables-group`, { locationId, name, createdBy });

tablesServices.update = (Id, name, updatedBy) =>
    genRequest(`put`, `/tables-group/${Id}`, { name, updatedBy });

tablesServices.delete = (Id) =>
    genRequest(`delete`, `/tables-group/${Id}`);


export default tablesServices;