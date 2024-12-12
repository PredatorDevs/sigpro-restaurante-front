import { Button, Tag } from "antd";

const buttonStyle = {
    backgroundColor: "#fff",
    fontSize: '0.8rem',
    height: 80,
    padding: 0,
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
                    onChangeTable({id: table.id, status: table.status});
                }
            }}
            key={table.id}
        >
            <div style={{
                display: "flex",
                flexDirection: 'column',
                maxWidth: '100%',
                alignItems: 'center',
                gap: 5
            }}>
                <p style={{
                    fontWeight: "bolder",
                    margin: 0,
                    maxWidth: '100%',
                    color: "black",
                }}>
                    {table.name}
                </p>
                {table.packoff ? <Tag color="blue">En Entrega</Tag> :
                    <>
                        {table.status ? <Tag color="red">Ocupada</Tag> : <Tag color="green">Libre</Tag>}
                    </>
                }
            </div>
        </Button>
    );

}
export default TableButton;