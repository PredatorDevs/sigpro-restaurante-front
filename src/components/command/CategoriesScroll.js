import { useEffect, useState, useRef } from "react";
import { Button, Card } from "antd";
import { CaretLeftOutlined, CaretRightFilled } from "@ant-design/icons";

import menuLogo from '../../img/logos/logo.png'

function CategoriesScroll({ categories, selectedCategory, onClick }) {

    const categoriesContainer = useRef(null);

    const buttonStyle = {
        width: 83,
        height: 83,
        borderRadius: '5px',
        border: '2px solid #1677FF',
        display: "flex",
        justifyContent: "center"
    };

    const pStyle = {
        color: '#000',
        margin: 0,
        // fontWeight: 500
    }
    
    const handleScroll = (scrollDirection) => {
        const scrollAmount = 94;
        const container = categoriesContainer.current;

        if (container) {
            if (scrollDirection === 'left') {
                container.scrollLeft -= scrollAmount;
            } else {
                container.scrollLeft += scrollAmount;
            }
        }
    };

    return (
        <div style={{
            width: '50%',
            height: '110px',
            display: "flex",
            backgroundColor: '#D9D9D9',
            alignItems: "center",
            padding: '0 10px',
            gap: '10px',
            marginTop: '10px',

        }}>
            <CaretLeftOutlined onClick={() => handleScroll('left')} style={{ display: "flex", alignItems: "center", cursor: 'pointer', height: '90%', width: '20px', backgroundColor: '#fff', border: 'none' }} />
            <div style={{
                display: 'flex',
                width: '100%',
                gap: '11px',
                overflowX: 'hidden',
                scrollBehavior: 'smooth'
            }} ref={categoriesContainer}>

                {categories.map(category => (
                    <Button
                        key={category.id}
                        type="primary"
                        shape="square"
                        style={{
                            ...buttonStyle,
                            backgroundColor: category === selectedCategory ? '#BAE0FF' : '#E6F4FF',
                        }}
                        onClick={() => onClick(category)}
                    >
                        <div style={{ width: '100%' }}>
                            <img
                                width={55}
                                height={55}
                                src={menuLogo}
                                style={{ objectFit: 'cover' }}
                            />
                            <p style={pStyle}>{category.name}</p>
                        </div>
                    </Button>
                ))}
            </div>
            <CaretRightFilled onClick={() => handleScroll('right')} style={{ display: "flex", alignItems: "center", cursor: 'pointer', height: '90%', width: '20px', backgroundColor: '#fff', border: 'none' }} />
        </div>
    );
}

export default CategoriesScroll;