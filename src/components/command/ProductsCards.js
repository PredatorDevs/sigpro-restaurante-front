import { Card, Empty, Spin } from "antd";

import { isEmpty } from "lodash";

function ProductsCard({ products, selectedProduct, loading }) {

    const cardStyles = {
        width: 250,
        height: 80,
        borderRadius: 5,
        cursor: 'pointer'
    }

    return (
        <Spin spinning={loading} tip="Cargando...">
            {

                isEmpty(products) ?
                    <>
                        <Empty style={{ padding: '16px 0', }} description='No se encontraron productos...' />
                    </>
                    :
                    <div
                        style={{
                            display: 'grid',
                            gap: '15px',
                            gridTemplateRows: 'auto auto auto',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'
                        }}
                    >

                        {products.map(product => (
                            <Card key={product.productId}
                                style={{
                                    ...cardStyles,
                                    // backgroundColor: parseFloat(product.stock) > 0 ? '#E4FDF9' : '#F5F5F7',
                                    backgroundColor: '#E4FDF9',

                                    // border: parseFloat(product.stock) > 0 ? '2px solid #13C2C2' : '2px solid #DCE0E6',
                                    border: '2px solid #13C2C2',
                                }}
                                onClick={() => selectedProduct(product)}
                                bodyStyle={{ padding: 5 }}
                            >
                                <p style={{ fontWeight: "bolder", margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.productName}</p>
                                <p style={{ margin: 0 }}>{product.Description}</p>
                                <p style={{
                                    fontWeight: "bolder",
                                    // color: parseFloat(product.stock) > 0 ? '#13C2C2' : '#DCE0E6',
                                    color: '#13C2C2',
                                    margin: 0
                                }}>${product.DefaultPrice}</p>
                            </Card>
                        ))}
                    </div>
            }
        </Spin>
    );
}

export default ProductsCard;