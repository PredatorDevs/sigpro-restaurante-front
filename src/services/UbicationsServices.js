import { genRequest } from "./Requests";

const ubicationsServices = {};

ubicationsServices.find = () => genRequest(`get`, `/ubications`, {}, '', '', 'Las ubicaciones en tienda no han podido ser obtenidas', 'Error desconocido');

ubicationsServices.add = (name, printerid) => 
  genRequest(`post`, `/ubications`, { name, printerid });

ubicationsServices.update = (name, printerid, ubicationId) => 
  genRequest(`put`, `/ubications`, { name, printerid, ubicationId });

ubicationsServices.remove = (ubicationId) => 
  genRequest(`delete`, `/ubications/${ubicationId}`);

export default ubicationsServices;
