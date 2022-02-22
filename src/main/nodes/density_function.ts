import { IContextMenuItem, INodeInputSlot, IWidget, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";
import { MenuManager } from "../UI/MenuManager";
import { LGraphNodeFixed } from "./LGraphNodeFixed";

const spline_values = ["offset", "factor", "jaggedness"]
const sampler_types = ["type_1", "type_2"]

export class DensityFunction extends LGraphNodeFixed{

    

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
                this.wdgs[argument] = this.addWidget("number", argument, 0, (value) => {this.properties[argument] = value})
            } else if (type === "spline") {
                this.addProperty(argument, 0, "string")
                this.wdgs[argument] = this.addWidget("combo", argument, "offset", (value) => {this.properties[argument] = value}, {values: spline_values})
            } else if (type === "noise") {
                this.addProperty(argument, 0, "string")
                this.wdgs[argument] = this.addWidget("text", argument, "minecraft:", (value) => {this.properties[argument] = value})
            } else if (type === "sampler_type") {
                this.addProperty(argument, 0, "string")
                this.wdgs[argument] = this.addWidget("combo", argument, "type_1", (value) => {this.properties[argument] = value}, {values: sampler_types})
            }
        })

        this.addOutput("output","densityFunction", {locked: true, nameLocked: true});
        this.title = name.replace("minecraft:", "")
        this.color = this.inputs.length > 0 ? "#330000" : "#000033"
    }

    public updateWidgets(){
        for (const property in this.properties){
            this.wdgs[property].value = this.properties[property]
        }
    }

    onConnectionsChange(){
        this.color = this.inputs.filter(i => !i.link).length > 0 ? "#330000" : "#000033"
    }

    onExecute(){
        this.onConnectionsChange()
        const inputs: Record<string, any> = {};
        var error = false
        var input_has_error = false
        this.input_names.forEach((input) => {
            const i = this.getInputDataByName(input)
            if (i === undefined){
                error = true
            } else {
                inputs[input] = i.json
                input_has_error ||= i.error
            }
        })

        this.setOutputData(0, {
            json: {type: this.name, ...this.properties, ...inputs},
            error: error || input_has_error
        })
    }
}

