import UniversalCommand from "./UniversalCommand";

function NewCommand() {
    return (
        //1 es comanda normal
        //2 es comanda Dine In
        //3 es comanda ToGO
        <UniversalCommand typeCommand={1}/>
    );
}

export default NewCommand;