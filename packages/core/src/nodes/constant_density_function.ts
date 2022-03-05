import { DensityFunction } from "deepslate";
import { IContextMenuItem, IWidget, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";
import { GraphManager } from "../UI/GraphManager";
import { LGraphNodeFixed } from "./LGraphNodeFixed";

export class ConstantDensityFunctionNode extends LGraphNodeFixed{
    static title = "constant"

    private wdgt: IWidget
    private has_change: boolean = false

    allowMultipleOutputs = true

    constructor(
        private readonly graphManager: GraphManager
    ){
        super()
        const output = this.addOutput("output","densityFunction", {locked: true, nameLocked: true});
        this.addProperty("value", 0, "number")
        this.wdgt = this.addWidget("number", "Value", 0, (value) => {
            this.properties.value = value
            this.has_change = true
            this.graph.afterChange()
        }, { min: -1000000, max: 1000000})
        this.title = "Constant"
        this.color = "#000033"
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
        this.setOutputData(0, {
            json: [
                this.properties.value,
                [{
                    type: 'LineComment',
                    value: "[df-editor]:" + JSON.stringify({
                        pos: [this.pos[0], this.pos[1]],
                        collapsed: this.flags.collapsed ?? false
                    }),
                    inline: true,
                    loc: {start: {line: 0, column: 0}, end: {line: 0, column: 1}
                    }
                }]
            ],
            error: false,
            changed: this.has_change,
            df: new DensityFunction.Constant(this.properties.value)
        })
        this.has_change = false
    }
}

