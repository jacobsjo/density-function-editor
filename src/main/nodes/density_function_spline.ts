import { CubicSpline, DensityFunction } from "deepslate";
import { IContextMenuItem, INodeInputSlot, IWidget, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";
import { PersistentCacheDensityFunction } from "../DensityFunction/PersistentCacheDensityFunction";
import { GraphManager } from "../UI/GraphManager";
import { MenuManager } from "../UI/MenuManager";
import { SplineWidget } from "../widgets/SplineWidget";
import { LGraphNodeFixed } from "./LGraphNodeFixed";

const spline_values = ["offset", "factor", "jaggedness"]
const sampler_types = ["type_1", "type_2"]

export class SplineDensityFunctionNode extends LGraphNodeFixed{

    static title = "spline"
    

    private wdgs: {[key: string]: IWidget} = {}
    public splineWidget: SplineWidget
    private has_change: boolean = false
    private df: DensityFunction = undefined

    constructor(){
        super()

        this.addInput("coordinate", "densityFunction", {label: "coordinate", locked: true, nameLocked: true})
        this.addOutput("output", "densityFunction", {locked: true, nameLocked: true});
        this.splineWidget = this.addCustomWidget<SplineWidget>(new SplineWidget(() => {
            this.has_change = true
        }))
        this.addProperty("min_value", -1, "number")
        this.wdgs.min_value = this.addWidget("number", "min_value", -1, (value) => {
            this.properties.min_value = value
            this.splineWidget.min_value = value
            this.has_change = true
        }, { min: -1000000, max: 1000000})
        this.addProperty("max_value", 1, "number")
        this.wdgs.max_value = this.addWidget("number", "max_value", 1, (value) => {
            this.properties.max_value = value
            this.splineWidget.max_value = value
            this.has_change = true
        }, { min: -1000000, max: 1000000})

        this.title = "spline"
        this.color = "#330000"
    }

    public updateWidgets(){
        this.wdgs.min_value.value = this.properties.min_value
        this.wdgs.max_value.value = this.properties.max_value
        this.splineWidget.min_value = this.properties.min_value
        this.splineWidget.max_value = this.properties.max_value
    }

    onConnectionsChange(){
        this.color = !this.inputs[0].link ? "#330000" : "#000033"
        this.has_change = true
    }

    onExecute(){

        const points = []
        for (var i = 0 ; i < this.splineWidget.value.locations.length ; i++){
            points.push({
                location: this.splineWidget.value.locations[i],
                value: this.splineWidget.value.values[i].compute(0),
                derivative: this.splineWidget.value.derivatives[i]
            })
        }

        const input = this.getInputDataByName("coordinate") ?? {
            json: {}, error: true, changed: false, df: DensityFunction.Constant.ZERO
        }

        const error = (input === undefined || input.error)

        if (this.df === undefined || this.has_change || input.changed){
            this.df = (input && input.df !== undefined) ? new PersistentCacheDensityFunction(GraphManager.visitor.map(new DensityFunction.Spline(
                new CubicSpline.MultiPoint<DensityFunction.Context>(
                    input.df, this.splineWidget.value.locations, this.splineWidget.value.values as CubicSpline.Constant[], this.splineWidget.value.derivatives),
                this.properties.min_value,
                this.properties.max_value)))
            : DensityFunction.Constant.ZERO
        }
        this.setOutputData(0, {
            json: {
                type: "minecraft:spline",
                min_value: this.properties.min_value,
                max_value: this.properties.max_value,
                spline: {
                    coordinate: (Array.isArray(input.json)) ? input.json[0] : input.json,
                    points: points,
                    ...((Array.isArray(input.json)) && {[Symbol.for('after:coordinate')]: input.json[1]})
                },
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
            error: error,
            changed: input.changed || this.has_change,
            df: this.df
        })

        this.has_change = false
    }
}

