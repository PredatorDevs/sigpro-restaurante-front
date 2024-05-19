import { genRequest } from "./Requests";

const resourcesServices = {};

resourcesServices.find = (typeId, categoryId) =>
    genRequest(`get`, `/resources/get-resources/${typeId}/${categoryId}`, {}, '', '', 'La información de los recursos no pudo ser obtenida', 'Error desconocido');

resourcesServices.add = (title, url, typeId, categoryId) =>
    genRequest(`post`, `/resources/add-resource`, { title, url, typeId, categoryId }, '', '', 'La información de los recursos no pudo ser guardada', 'Error desconocido');

resourcesServices.uploadImage = (image) =>
    genRequest(`post`, `/resources/upload-image`, { image }, '', '', 'La imagen no pudo ser guardada', 'Error desconocido');

resourcesServices.uploadandSaveImage = (title, image, typeId, categoryId) =>
    genRequest(`post`, `/resources/upload-and-save-image`, { title, image, typeId, categoryId }, '', '', 'La información de los recursos no pudo ser guardada', 'Error desconocido');


export default resourcesServices;
