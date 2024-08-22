import { genRequest } from "./Requests";

const productPricesServices = {};

productPricesServices.findAllPricesByProductId = (productId) =>
    genRequest(`get`, `/prices/get-prices/${productId}`, {}, '', '', 'Información de precios del producto no obtenida', 'Error desconocido');

productPricesServices.findDefultPrice = (priceId) =>
    genRequest(`get`, `/prices/get-default-prices/${priceId}`, {}, '', '', 'Información de precios del producto no obtenida', 'Error desconocido');

productPricesServices.findByProductId = (productId) =>
    genRequest(`get`, `/prices/by-product/${productId}`, {}, '', '', 'Información de precios del producto no obtenida', 'Error desconocido');

productPricesServices.findTaxByProductId = (productId) =>
    genRequest(`get`, `/prices/tax/by-product/${productId}`, {}, '', '', 'Información de precios del producto no obtenida', 'Error desconocido');

productPricesServices.updateProductPrice = (price, profitRate, isDefault, id, productId) =>
    genRequest(`put`, `/prices/update-price`, { price, profitRate, isDefault, id, productId }, '', '', '', '');

productPricesServices.insertProductPrice = (productId, isDefault) =>
    genRequest(`post`, `/prices/save-price`, { productId, isDefault }, '', '', '', '');

productPricesServices.softDeletePrice = (isActive, productId) =>
    genRequest(`post`, `/prices/remove-price`, { isActive, productId }, '', '', '', '');

productPricesServices.addTax = (taxId, productId) =>
    genRequest(`post`, `/prices/add-tax`, { taxId, productId }, '', '', '', '');

productPricesServices.deleteTax = (productTaxId) =>
    genRequest(`delete`, `/prices/delete-tax/${productTaxId}`, { }, '', '', '', '');

export default productPricesServices;