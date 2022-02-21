import { IContextMenuItem, INodeInputSlot, IWidget, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";
import { MenuManager } from "../UI/MenuManager";

const spline_values = ["offset", "factor", "jaggedness"]
const sampler_types = ["type_1", "type_2"]

export class DensityFunction extends LGraphNode{

    

    public input_names: string[]
    private wdgs: {[key: string]: IWidget} = {}

    constructor(private name: string, args: Map<string, string>){
        super()

        this.input_names = []

        args.forEach((type, argument) => {
            if (type === "densityFunction"){
                this.addInput(argument, "densityFunction", {label: argument, locked: true, nameLocked: true})
                this.input_names.push(argument)
            } else if (type === "number") {
                this.addProperty(argument, 0, "number")
                this.wdgs[argument] = this.addWidget("number", argument, 0, argument)
            } else if (type === "spline") {
                this.addProperty(argument, 0, "string")
                this.wdgs[argument] = this.addWidget("combo", argument, "offset", (value) => {this.properties[argument] = value}, {values: spline_values})
            } else if (type === "noise") {
                this.addProperty(argument, 0, "string")
                this.wdgs[argument] = this.addWidget("text", argument, "minecraft:", argument)
            } else if (type === "sampler_type") {
                this.addProperty(argument, 0, "string")
                this.wdgs[argument] = this.addWidget("combo", argument, "type_1", (value) => {this.properties[argument] = value}, {values: sampler_types})
            }
        })

        this.addOutput("output","densityFunction", {locked: true, nameLocked: true});
        this.title = name.replace("minecraft:", "")
        this.color = "#000033"
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

    public updateWidgets(){
        for (const property in this.properties){
            this.wdgs[property].value = this.properties[property]
        }
    }

    getMenuOptions(onExecute: LGraphCanvas): IContextMenuItem[]{
        return []
    }

    onExecute(){
        const inputs: Record<string, any> = {};
        this.input_names.forEach((input) => inputs[input] = this.getInputDataByName(input))
        this.setOutputData(0, {type: this.name, ...this.properties, ...inputs})
    }
}

