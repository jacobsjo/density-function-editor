import { DensityFunction, WorldgenRegistries } from "deepslate";
import { IContextMenuItem, INodeInputSlot, IWidget, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";
import { PersistentCacheDensityFunction } from "../DensityFunction/PersistentCacheDensityFunction";
import { GraphManager } from "../UI/GraphManager";
import { MenuManager } from "../UI/MenuManager";
import { Warning } from "../Warning";
import { WarningWidget } from "../widgets/WarningWidget";
import { LGraphNodeFixed } from "./LGraphNodeFixed";

const spline_values = ["offset", "factor", "jaggedness"]
const sampler_types = ["type_1", "type_2"]

export class DensityFunctionNode extends LGraphNodeFixed{

    

    public input_names: string[]
    private wdgs: {[key: string]: IWidget} = {}

    private has_change: boolean = false
    private df: DensityFunction = undefined
    public warning: Warning = undefined

    constructor(private name: string, args: Map<string, string>){
        super()

        this.input_names = []

        this.addCustomWidget(new WarningWidget())

        args.forEach((type, argument) => {
            if (argument === "type") return
            
            if (type === "densityFunction"){
                this.addInput(argument, "densityFunction", {label: argument, locked: true, nameLocked: true})
                this.input_names.push(argument)
            } else if (type === "number") {
                this.addProperty(argument, 0, "number")
                this.wdgs[argument] = this.addWidget("number", argument, 0, (value) => {
                    this.properties[argument] = value
                    this.has_change = true
                },{ min: -1000000, max: 1000000})
            } else if (type === "spline") {
                this.addProperty(argument, 0, "string")
                this.wdgs[argument] = this.addWidget("combo", argument, "offset", (value) => {
                    this.properties[argument] = value
                    this.has_change = true
                }, {values: spline_values})
            } else if (type === "noise") {
                this.addProperty(argument, WorldgenRegistries.NOISE.keys().sort()[0].toString(), "string")
                this.wdgs[argument] = this.addWidget("combo", argument, WorldgenRegistries.NOISE.keys()[0].toString(), (value) => {
                    this.properties[argument] = value
                    this.has_change = true
                }, {values: WorldgenRegistries.NOISE.keys().sort().map(k => k.toString())})
            } else if (type === "sampler_type") {
                this.addProperty(argument, 0, "string")
                this.wdgs[argument] = this.addWidget("combo", argument, "type_1", (value) => {
                    this.properties[argument] = value
                    this.has_change = true
                }, {values: sampler_types})
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
        this.color = this.inputs.filter(i => !i.link).length > 0 ? "#330000" : ((this.warning?.getWarning() ?? "") !== "" ? "#333300" : "#000033") 
        this.has_change = true
    }

    onExecute(){
        this.color = this.inputs.filter(i => !i.link).length > 0 ? "#330000" : ((this.warning?.getWarning() ?? "") !== "" ? "#333300" : "#000033") 
        const input_jsons: Record<string, unknown> = {};
        const input_dfs: Record<string, DensityFunction> = {};
        var error = false
        var input_has_error = false
        var input_has_changed = false
        ;(this as any).setSize(this.computeSize())
        this.input_names.forEach((input) => {
            const i = this.getInputDataByName(input)
            if (i === undefined){
                error = true
                input_dfs[input] = DensityFunction.Constant.ZERO
            } else {
                input_jsons[input] = i.json
                input_dfs[input] = i.df
                input_has_error ||= i.error
                input_has_changed ||= i.changed
            }
        })

        if (this.df === undefined || this.has_change || input_has_changed){
            this.df = new PersistentCacheDensityFunction(GraphManager.visitor.apply(DensityFunction.fromJson({type: this.name, ...this.properties, ...input_dfs}, (obj) => obj as DensityFunction)))
            this.warning = Warning.create(this.df)
        }

        this.setOutputData(0, {
            json: {type: this.name, ...this.properties, ...input_jsons},
            error: error || input_has_error,
            changed: this.has_change || input_has_changed,
            df: this.df
        })

        this.has_change = false
    }
}

