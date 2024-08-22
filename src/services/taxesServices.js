import { genRequest } from "./Requests";

const taxesServices = {};

taxesServices.findByLocationId = (locationId) =>
    genRequest(`get`, `/taxes/by-location/${locationId}`, {}, '', '', 'La información de los impuestos no pudo ser obtenida', 'Error desconocido');

taxesServices.addTax = (name, taxRate, isPercentage, isAlcoholic, locationid) =>
    genRequest(`post`, `/taxes/add-tax`, { name, taxRate, isPercentage, isAlcoholic, locationid }, '', '', 'La información de los impuestos no pudo ser guardada', 'Error desconocido');

taxesServices.updateTax = (taxid, name, taxRate, isPercentage, isAlcoholic, locationid) =>
    genRequest(`put`, `/taxes/update-tax/${taxid}`, { name, taxRate, isPercentage, isAlcoholic, locationid }, '', '', 'La información de los impuestos no pudo ser actualizada', 'Error desconocido');

taxesServices.removeTax = (taxid) =>
    genRequest(`delete`, `/taxes/remove-tax/${taxid}`, { }, '', '', 'La información de los impuestos no pudo ser actualizada', 'Error desconocido');

export default taxesServices;