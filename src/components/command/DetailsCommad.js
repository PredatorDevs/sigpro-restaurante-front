import { useState, useEffect } from "react";
import { Col, Empty, Button, Row } from "antd";
import { SearchOutlined, PlusOutlined, MinusOutlined, DeleteFilled, SaveOutlined } from "@ant-design/icons";

import { isEmpty } from "lodash";
import orderSalesServices from "../../services/OrderSalesServices";

const styleSheet = {
    tableFooter: {
        footerCotainer: {
            backgroundColor: '#d9d9d9',
            borderRadius: '5px',
            display: 'flex',
            flexDirection: 'column',
            padding: 5,
            width: '100%'
        },
        detailContainer: {
            backgroundColor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderRadius: '5px',
            marginBottom: '5px',
            padding: 5,
            width: '100%'
        },
        detailLabels: {
            normal: {
                margin: 0,
                fontSize: 12,
                color: '#434343'
            },
            emphatized: {
                margin: 0,
                fontSize: 12,
                color: '#434343',
                fontWeight: 600
            }
        }
    }
};


function DetailsCommand(props) {

    const { itemDetails } = props;
    console.log(itemDetails);
    return (
        <>
            {itemDetails.quantity}
        </>
    );
}

export default DetailsCommand;