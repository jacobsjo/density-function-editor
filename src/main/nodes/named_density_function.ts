import { IContextMenuItem, IWidget, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";

export class NamedDensityFunction extends LGraphNode{
    static title = "Named Density Function"

    private wdgt: IWidget

    constructor(){
        super()
        this.addOutput("output","densityFunction", {locked: true, nameLocked: true});
        this.addProperty("id", "", "string")
        this.wdgt = this.addWidget("text", "Id", "", "id")
        this.title = "Named Density Function"
        this.color = "#330000"
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

    getMenuOptions(onExecute: LGraphCanvas): IContextMenuItem[]{
        return []
    }

    onExecute(){
        this.setOutputData(0, this.properties.id)
    }
}

