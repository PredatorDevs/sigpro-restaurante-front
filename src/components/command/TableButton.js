import { Button, Tag } from "antd";

const buttonStyle = {
    backgroundColor: "#fff",
    fontSize: '0.8rem',
    height: 80,
    display: "flex",
    borderRadius: '5px',
    justifyContent: "center",
    alignItems: "center",
};

function TableButton({ table, tableOrder, fetchingTables, onChangeTable }) {
    return (
        <Button
            style={{
                ...buttonStyle,
                backgroundColor: table.id === tableOrder ? `${table.color}` : "#fff",
            }}
            disabled={fetchingTables}
            onClick={() => {
                if (table.id !== tableOrder) {
                    onChangeTable(table.id);
                }
            }}
            key={table.id}
        >
            <div>
                <p style={{ fontWeight: "bolder" }}>{table.name}</p>
                {table.status ? <Tag color="red">Ocupada</Tag> : <Tag color="green">Libre</Tag>}
            </div>
        </Button>
    );

}
export default TableButton;