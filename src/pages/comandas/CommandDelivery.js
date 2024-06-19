import UniversalCommand from "./UniversalCommand";

function NewCommandDelivery() {
    return (
        //1 es comanda normal
        //2 es comanda Dine In
        //3 es comanda ToGO
        <UniversalCommand typeCommand={2}/>
    );
}

export default NewCommandDelivery;