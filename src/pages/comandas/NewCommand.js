import { useEffect, useState } from "react";
import { Select, Row, Col, Empty } from "antd";

import { Wrapper } from '../../styled-components/Wrapper';

import tablesServices from "../../services/TablesServices";
import CategoriesScroll from "../../components/command/CategoriesScroll";

import ProductsCard from "../../components/command/ProductsCards.js"

import { getUserLocation } from '../../utils/LocalData';

import categoriesServices from '../../services/CategoriesServices.js';
import productsServices from "../../services/ProductsServices.js";

const { Option } = Select;

function NewCommand() {

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [entityTablesData, setEntityTablesData] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [tableOrder, setTableOrder] = useState(0);

    async function loadData() {
        const response = await tablesServices.findTables(getUserLocation());
        setEntityTablesData(response.data);

        if (response.data.length > 0) {
            setTableOrder(response.data[0].id);
        }

        const responseCategories = await categoriesServices.find();
        setCategories(responseCategories.data);

        if (responseCategories.data.length > 0) {
            setSelectedCategory(responseCategories.data[0]);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function loadProductsData(categoryId) {
        const response = await productsServices.findByCategoryIdandLocationId(getUserLocation(), categoryId);
        setAvailableProducts(response.data);
        setLoading(false);
    }

    useEffect(() => {
        if (selectedCategory) {
            loadProductsData(selectedCategory.id);
            //loadProductsData(3);
        }
    }, [selectedCategory]);

    function selectcategory(category) {
        setSelectedCategory(category);
        if (selectedCategory !== category) {
            setLoading(true);
        }
    }

    const changeTable = (value) => {
        setTableOrder(value);
    }

    return (
        <Wrapper>
            <Row gutter={16} style={{ width: '100%' }}>
                <Col span={12}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong>Mesa:</strong>
                        <Select style={{ width: 200 }} onChange={changeTable} value={tableOrder}>
                            {entityTablesData.map(item => (
                                <Option key={item.id} value={item.id}> {item.name} </Option>
                            ))}
                        </Select>
                    </div>
                    {
                        tableOrder > 0 ?
                            <>
                                <CategoriesScroll categories={categories} selectedCategory={selectedCategory} onClick={selectcategory} />
                                <ProductsCard products={availableProducts} loading={loading} />
                            </> : <>
                                <Empty description="Debe de seleccionar una mesa..." />
                            </>
                    }
                </Col>
                <Col span={12} style={{
                    backgroundColor: '#F5F5F5',
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: '10px'
                }}>
                    <strong>Resumen de la Orden</strong>
                </Col>
            </Row>

        </Wrapper>
    );
}

export default NewCommand;