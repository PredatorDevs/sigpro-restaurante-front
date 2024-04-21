import { genRequest } from "./Requests";

const categoriesServices = {};

categoriesServices.find = () => genRequest(`get`, `/categories`, {}, '', '', 'La información de las categorías no pudo ser obtenida', 'Error desconocido');

categoriesServices.add = (name, icon) => 
  genRequest(`post`, `/categories`, { name, icon });

categoriesServices.update = (name, categoryId, icon) => 
  genRequest(`put`, `/categories`, { name, categoryId, icon });

categoriesServices.remove = (categoryId) => 
  genRequest(`delete`, `/categories/${categoryId}`);

export default categoriesServices;
