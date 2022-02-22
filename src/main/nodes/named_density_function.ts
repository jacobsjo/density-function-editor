import { IContextMenuItem, IWidget, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";
import { MenuManager } from "../UI/MenuManager";
import { LGraphNodeFixed } from "./LGraphNodeFixed";

export class NamedDensityFunction extends LGraphNodeFixed{
    static title = "Named Density Function"

    private wdgt: IWidget

    constructor(){
        super()
        this.addOutput("output","densityFunction", {locked: true, nameLocked: true});
        this.addProperty("id", "", "string")
        this.wdgt = this.addWidget("text", "Id", "", (value) => {this.properties.id = value})
        this.title = "Named Density Function"
        this.color = "#003300"
    }

    public updateWidgets() {
        this.wdgt.value = this.properties.id
    }

    getTitle = function() {
        if (this.flags.collapsed) {
            var id:string = this.properties.id
            if (id.length > 20){
                id = id.substring(id.lastIndexOf("/")+1)
            }
            return id;
        }
        return this.title;
    };

    onExecute(){
        this.setOutputData(0, {
            json: this.properties.id,
            error: false
        })
    }
}

