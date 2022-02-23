import { IContextMenuItem, INodeInputSlot, IWidget, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";
import { MenuManager } from "../UI/MenuManager";
import { SplineWidget } from "../widgets/SplineWidget";
import { LGraphNodeFixed } from "./LGraphNodeFixed";

const spline_values = ["offset", "factor", "jaggedness"]
const sampler_types = ["type_1", "type_2"]

export class SplineDensityFunction extends LGraphNodeFixed{

    static title = "spline"
    

    private wdgs: {[key: string]: IWidget} = {}
    public splineWidget: SplineWidget

    constructor(){
        super()

        this.addInput("coordinate", "densityFunction", {label: "coordinate", locked: true, nameLocked: true})
        this.addOutput("output", "densityFunction", {locked: true, nameLocked: true});
        this.splineWidget = this.addCustomWidget<SplineWidget>(new SplineWidget())
        this.addProperty("min_value", -1, "number")
        this.wdgs.min_value = this.addWidget("number", "min_value", -1, (value) => {
            this.properties.min_value = value
            this.splineWidget.min_value = value
        })
        this.addProperty("max_value", 1, "number")
        this.wdgs.max_value = this.addWidget("number", "max_value", 1, (value) => {
            this.properties.max_value = value
            this.splineWidget.max_value = value
        })

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

        const input = this.getInputDataByName("coordinate")

        const error = (input === undefined || input.error)

        this.setOutputData(0, {
            json: {
                type: "minecraft:spline",
                min_value: this.properties.min_value,
                max_value: this.properties.max_value,
                spline: {
                    coordinate: input.json,
                    points: points
                }
            },
            error: error
        })
    }
}

