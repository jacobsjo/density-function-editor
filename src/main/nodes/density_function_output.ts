import { IContextMenuItem, INodeInputSlot, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";

export class DensityFunctionOutput extends LGraphNode{
    static title = "Output"
    removable: boolean;
    clonable: boolean;
    //static removable = false

    constructor(){
        super()
        this.title = "Output"
        this.color = "#330000"
        this.addInput("result", "densityFunction", {label: "result", locked: true, nameLocked: true})
        this.removable = false
        this.clonable = false
    }


    onConnectionsChange(){
        console.log("test")
        this.color = !this.inputs[0].link ? "#330000" : "#000033"
    }

    onExecute(){
    }

    getMenuOptions(onExecute: LGraphCanvas): IContextMenuItem[]{
        return []
    }
}

