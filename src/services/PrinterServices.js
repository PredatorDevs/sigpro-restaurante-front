import { genRequest } from "./Requests";

const printersServices = {};

printersServices.findByLocationId = (locationid) =>
    genRequest(`get`, `/printers/${locationid}`, {}, '', '', 'La información de las impresoras no pudo ser obtenida', 'Error desconocido');

printersServices.findById = (printerid) =>
    genRequest(`get`, `/printers/printer/${printerid}`, {}, '', '', 'La información de la impresora no pudo ser obtenida', 'Error desconocido');

printersServices.addPrinter = (name, ip, port, locationid, createdBy) =>
    genRequest(`post`, `/printers/add-printer`, { name, ip, port, locationid, createdBy }, '', '', 'La información de la impresora no pudo ser Guardada', 'Error desconocido');

printersServices.updatePrinter = (name, ip, port, updatedBy, printerid) =>
    genRequest(`put`, `/printers/update-printer/${printerid}`, { name, ip, port, updatedBy }, '', '', 'La información de la impresora no pudo ser Actualizada', 'Error desconocido');

printersServices.deletePrinter = (printerid, updatedBy) =>
    genRequest(`put`, `/printers/delete-printer/${printerid}`, { updatedBy }, '', '', 'La información de la impresora no pudo ser Eliminada', 'Error desconocido');

export {
    printersServices
}