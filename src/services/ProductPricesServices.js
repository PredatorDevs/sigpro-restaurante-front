import { genRequest } from "./Requests";

const productPricesServices = {};

productPricesServices.findByProductId = (productId) =>
    genRequest(`get`, `/prices/by-product/${productId}`, {}, '', '', 'Información de precios del producto no obtenida', 'Error desconocido');  

productPricesServices.findTaxByProductId = (productId) =>
    genRequest(`get`, `/prices/tax/by-product/${productId}`, {}, '', '', 'Información de precios del producto no obtenida', 'Error desconocido');  

export default productPricesServices;