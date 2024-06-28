import { genRequest } from "./Requests";

const productPricesServices = {};

productPricesServices.findAllPricesByProductId = (productId) =>
    genRequest(`get`, `/prices/get-prices/${productId}`, {}, '', '', 'Información de precios del producto no obtenida', 'Error desconocido');

productPricesServices.findByProductId = (productId) =>
    genRequest(`get`, `/prices/by-product/${productId}`, {}, '', '', 'Información de precios del producto no obtenida', 'Error desconocido');

productPricesServices.findTaxByProductId = (productId) =>
    genRequest(`get`, `/prices/tax/by-product/${productId}`, {}, '', '', 'Información de precios del producto no obtenida', 'Error desconocido');

productPricesServices.updateProductPrice = (price, profitRate, isDefault, id, productId) =>
    genRequest(`post`, `/prices/update-price`, { price, profitRate, isDefault, id, productId }, '', '', '', '');

productPricesServices.insertProductPrice = (productId, isDefault) =>
    genRequest(`post`, `/prices/save-price`, { productId, isDefault }, '', '', '', '');

productPricesServices.softDeletePrice = (isActive, productId) =>
    genRequest(`post`, `/prices/remove-price`, { isActive, productId }, '', '', '', '');

export default productPricesServices;