import { useEffect, useState } from "react";
import { Select, Row, Col } from "antd";

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

    async function loadData() {
        const response = await tablesServices.findTables(getUserLocation());
        setEntityTablesData(response.data);

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
        if(selectedCategory !== category) {
            setLoading(true);
        }
    }

    return (
        <Wrapper>
            <Row gutter={[16, 16]} style={{ width: '50%' }}>
                <Col span={3} style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong>Mesa:</strong>
                    <Select style={{ width: 200 }} placeholder="Seleccione una Mesa">
                        <Option value={0} disabled>Seleccione una Mesa</Option>
                        {entityTablesData.map(item => (
                            <Option key={item.id} value={item.id}> {item.name} </Option>
                        ))}
                    </Select>
                </Col>
            </Row>

            <CategoriesScroll categories={categories} selectedCategory={selectedCategory} onClick={selectcategory} />

            <ProductsCard products={availableProducts} loading={loading} />

        </Wrapper>
    );
}

export default NewCommand;