import { IContextMenuItem, INodeInputSlot, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";
import { GraphManager } from "../UI/GraphManager";

export class DensityFunctionOutputNode extends LGraphNode{
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

    computeSize() {
        const size = super.computeSize()
        if (!this.flags.collapsed){
            const font_size = LiteGraph.NODE_TEXT_SIZE;
            size[0] = font_size * this.getTitle().length * 0.6 + 30;
        }
        return size
    }

    getTitle() {
        if (GraphManager.id === undefined){
            return "Output"
        }

        if (this.flags.collapsed){
            const str = GraphManager.id.split(":",2)[1]
            return str.substr(str.lastIndexOf("/") + 1)
        } else {
            return GraphManager.id
        }
    }

    onConnectionsChange(){
        this.color = !this.inputs[0].link ? "#330000" : "#000033"
    }

    onExecute(){
    }

    getMenuOptions(onExecute: LGraphCanvas): IContextMenuItem[]{
        return []
    }
}

