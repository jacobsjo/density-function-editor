import { IContextMenuItem, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";

export class DensityFunctionOutput extends LGraphNode{
    static title = "Output"
    removable: boolean;
    clonable: boolean;
    //static removable = false

    constructor(){
        super()
        this.title = "Output"
        this.color = "#333300"
        this.addInput("result", "densityFunction", {label: "result", locked: true, nameLocked: true})
        this.removable = false
        this.clonable = false
    }

    getMenuOptions(onExecute: LGraphCanvas): IContextMenuItem[]{
        return []
    }
}

