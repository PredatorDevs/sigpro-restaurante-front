import UniversalCommand from "./UniversalCommand";

function NewCommandToGo() {
    return (
        //1 es comanda normal
        //2 es comanda Dine In
        //3 es comanda ToGO
        <UniversalCommand typeCommand={3}/>
    );
}

export default NewCommandToGo;