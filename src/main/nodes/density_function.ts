import { DensityFunction, WorldgenRegistries } from "deepslate";
import { IContextMenuItem, INodeInputSlot, IWidget, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";
import { PersistentCacheDensityFunction } from "../DensityFunction/PersistentCacheDensityFunction";
import { GraphManager } from "../UI/GraphManager";
import { MenuManager } from "../UI/MenuManager";
import { Warning } from "../Warning";
import { WarningWidget } from "../widgets/WarningWidget";
import { LGraphNodeFixed } from "./LGraphNodeFixed";
import * as toastr from "toastr"

const spline_values = ["offset", "factor", "jaggedness"]
const sampler_types = ["type_1", "type_2"]

export class DensityFunctionNode extends LGraphNodeFixed {



    public input_names: string[]
    private wdgs: { [key: string]: IWidget } = {}
    private noiseWdgs: IWidget[] = []

    private has_change: boolean = false
    private df?: DensityFunction = undefined
    public warning?: Warning = undefined

    allowMultipleOutputs = false

    constructor(private name: string, args: Map<string, string>) {
        super()

        this.input_names = []

        this.addCustomWidget(new WarningWidget())

        args.forEach((type, argument) => {
            if (argument === "type") return

            if (type === "densityFunction") {
                this.addInput(argument, "densityFunction", { label: argument, locked: true, nameLocked: true })
                this.input_names.push(argument)
            } else if (type === "number") {
                this.addProperty(argument, 0, "number")
                this.wdgs[argument] = this.addWidget("number", argument, 0, (value) => {
                    this.properties[argument] = value
                    this.has_change = true
                }, { min: -1000000, max: 1000000 })
            } else if (type === "spline") {
                this.addProperty(argument, 0, "string")
                this.wdgs[argument] = this.addWidget("combo", argument, "offset", (value) => {
                    this.properties[argument] = value
                    this.has_change = true
                }, { values: spline_values })
            } else if (type === "noise") {
                this.addProperty(argument, WorldgenRegistries.NOISE.keys().sort()[0].toString(), "string")
                this.wdgs[argument] = this.addWidget("combo", argument, WorldgenRegistries.NOISE.keys()[0].toString(), (value) => {
                    this.properties[argument] = value
                    this.has_change = true
                }, { values: WorldgenRegistries.NOISE.keys().sort().map(k => k.toString()) })
                this.noiseWdgs.push(this.wdgs[argument])
            } else if (type === "sampler_type") {
                this.addProperty(argument, 0, "string")
                this.wdgs[argument] = this.addWidget("combo", argument, "type_1", (value) => {
                    this.properties[argument] = value
                    this.has_change = true
                }, { values: sampler_types })
            }
        })

        this.addOutput("output", "densityFunction", { locked: true, nameLocked: true });
        this.title = name.replace("minecraft:", "")
        this.color = this.inputs.length > 0 ? "#330000" : "#000033"
    }

    public updateWidgets() {
        for (const property in this.properties) {
            this.wdgs[property].value = this.properties[property]
        }
    }

    onReload() {
        this.noiseWdgs.forEach(wdg => {
            wdg.options.values = WorldgenRegistries.NOISE.keys().sort().map(k => k.toString())
        })
        this.has_change = true
    }

    onConnectionsChange() {
        this.color = this.inputs.filter(i => !i.link).length > 0 ? "#330000" : ((this.warning?.getWarning() ?? "") !== "" ? "#333300" : "#000033")
        this.has_change = true
    }

    onExecute() {
        this.color = this.inputs.filter(i => !i.link).length > 0 ? "#330000" : ((this.warning?.getWarning() ?? "") !== "" ? "#333300" : "#000033")
        const input_jsons: any = {}
        const input_dfs: Record<string, DensityFunction> = {};
        var error = false
        var input_has_error = false
        var input_has_changed = false
            ; (this as any).setSize(this.computeSize())
        this.input_names.forEach((input) => {
            const i = this.getInputDataByName(input)
            if (i === undefined) {
                error = true
                input_dfs[input] = DensityFunction.Constant.ZERO
            } else {
                if (i.json && Array.isArray(i.json)) {
                    input_jsons[input] = i.json[0]
                    input_jsons[Symbol.for(`after:${input}`)] = i.json[1]
                } else {
                    input_jsons[input] = i.json
                }
                input_dfs[input] = i.df
                input_has_error ||= i.error
                input_has_changed ||= i.changed
            }
        })

        if (this.df === undefined || this.has_change || input_has_changed) {
            try {
                this.df = new PersistentCacheDensityFunction(GraphManager.visitor.map(DensityFunction.fromJson({ type: this.name, ...this.properties, ...input_dfs }, (obj) => obj as DensityFunction)))
                this.warning = Warning.create(this.df)
            } catch (e) {
                toastr.error(e, "Density Function Error")
                this.df = DensityFunction.Constant.ZERO
                console.warn(e)
            }
        }

        this.setOutputData(0, {
            json: {
                type: this.name,
                ...this.properties,
                ...input_jsons,
                [Symbol.for('before:type')]: [{
                    type: 'LineComment',
                    value: "[df-editor]:" + JSON.stringify({
                        pos: [this.pos[0], this.pos[1]],
                        collapsed: this.flags.collapsed ?? false
                    }),
                    inline: false,
                    loc: {start: {line: 0, column: 0}, end: {line: 0, column: 1}
                    }
                }]
            },
            error: error || input_has_error,
            changed: this.has_change || input_has_changed,
            df: this.df
        })

        this.has_change = false
    }
}

