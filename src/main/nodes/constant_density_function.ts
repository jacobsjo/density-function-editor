import { IContextMenuItem, IWidget, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";
import { MenuManager } from "../UI/MenuManager";
import { LGraphNodeFixed } from "./LGraphNodeFixed";

export class ConstantDensityFunction extends LGraphNodeFixed{
    static title = "constant"

    private wdgt: IWidget

    constructor(){
        super()
        const output = this.addOutput("output","densityFunction", {locked: true, nameLocked: true});
        this.addProperty("value", 0, "number")
        this.wdgt = this.addWidget("number", "Value", 0, (value) => {this.properties.value = value})
        this.title = "Constant"
        this.color = "#003333"
    }

    public updateWidgets() {
        this.wdgt.value = this.properties.value
    }

    getTitle() {
        if (this.flags.collapsed) {
            return this.properties.value;
        }
        return this.title;
    };

    onExecute(){
        this.setOutputData(0, this.properties.value)
    }
}

