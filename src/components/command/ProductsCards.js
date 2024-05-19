import { Card, Empty, Image, Spin } from "antd";

import { isEmpty } from "lodash";

function ProductsCard({ products, selectedProduct, loading }) {
    
    return (
        <Spin spinning={loading} tip="Cargando...">
            {

                isEmpty(products) ?
                    <>
                        <Empty style={{ padding: '16px 0', }} description='No se encontraron productos...' />
                    </>
                    :
                    <div className="products-ind">

                        {products.map(product => (
                            <Card
                                key={product.productId}
                                className="card-product"
                                style={{
                                    backgroundColor: '#E4FDF9',
                                    border: '2px solid #13C2C2',
                                }}
                                onClick={() => selectedProduct(product)}
                                bodyStyle={{ padding: 5 }}
                            >
                                {/* <Image /> */}
                                <img alt={product.alt} src={product.url} className="img-product" />
                                <div className="description-card-product">
                                    <p style={{ fontWeight: "bolder", margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.productName}</p>
                                    <p style={{ margin: 0 }}>{product.Description}</p>
                                    <p style={{
                                        fontWeight: "bolder",
                                        // color: parseFloat(product.stock) > 0 ? '#13C2C2' : '#DCE0E6',
                                        color: '#13C2C2',
                                        margin: 0
                                    }}>${product.DefaultPrice}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
            }
        </Spin>
    );
}

export default ProductsCard;