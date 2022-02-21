import { IContextMenuItem, IWidget, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";
import { MenuManager } from "../UI/MenuManager";

export class ConstantDensityFunction extends LGraphNode{
    static title = "constant"

    private wdgt: IWidget

    constructor(){
        super()
        const output = this.addOutput("output","densityFunction", {locked: true, nameLocked: true});
        this.addProperty("value", 0, "number")
        this.wdgt = this.addWidget("number", "Value", 0, "value")
        this.title = "Constant"
        this.color = "#003333"
    }

    public updateWidgets() {
        this.wdgt.value = this.properties.value
    }

    onPropertyChanged() {
        MenuManager.setEdited()
        return false
    }

    onConnectionsChange(){
        MenuManager.setEdited()
    }

    onAdded(){
        MenuManager.setEdited()
    }

    onRemoved(){
        MenuManager.setEdited()
    }


    getTitle() {
        if (this.flags.collapsed) {
            return this.properties.value;
        }
        return this.title;
    };

    getMenuOptions(onExecute: LGraphCanvas): IContextMenuItem[]{
        return []
    }

    
    onExecute(){
        this.setOutputData(0, this.properties.value)
    }
}

