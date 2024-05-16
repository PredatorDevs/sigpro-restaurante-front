import { genRequest } from "./Requests";

const resourcesServices = {};

resourcesServices.find = (typeId, categoryId) => 
    genRequest(`get`, `/resources/get-resources/${typeId}/${categoryId}`, {}, '', '', 'La información de los recursos no pudo ser obtenida', 'Error desconocido');

export default resourcesServices;
