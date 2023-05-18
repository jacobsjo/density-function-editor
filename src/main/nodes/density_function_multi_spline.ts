import { CubicSpline, DensityFunction } from "deepslate";
import { INodeOutputSlot, IWidget, LGraphNode, LiteGraph} from "litegraph.js";
import { LGraphNodeFixed } from "./LGraphNodeFixed";

import * as toastr from "toastr";

const spline_values = ["offset", "factor", "jaggedness"]
const sampler_types = ["type_1", "type_2"]

export class MultiSplineDensityFunctionNode extends LGraphNodeFixed{

    static title = "spline"
    
    private wdgs: {[key: string]: IWidget} = {}
    private has_change: boolean = false

    private readonly spline: CubicSpline<DensityFunction.Context>

    public readonly input_map: Map<string, {json: any, function: PassthroghDensityFunction, is_multiple: boolean}>

    allowMultipleOutputs = false

    constructor(
        json: any
    ){
        super()

        this.input_map = new Map()

        this.addOutput("output", "densityFunction", {locked: true, nameLocked: true});

        var i = 0
        this.spline = CubicSpline.fromJson(json.spline, (j: unknown) => {
            if (typeof j === "string" || typeof j === "number"){
                var input_name: string
                if (typeof j === "number")
                    input_name = `number_${j}`
                else 
                    input_name = j

                if (this.input_map.has(input_name)){
                    this.input_map.get(input_name)!.is_multiple = true
                    return this.input_map.get(input_name)!.function
                } else {
                    const input_function = new PassthroghDensityFunction()
                    this.input_map.set(input_name, {
                        json: j,
                        function: input_function,
                        is_multiple: false
                    })
                    return input_function
                }
            } else {
                const input_function = new PassthroghDensityFunction()
                this.input_map.set(`inline_function_${i}`, {
                    json: j,
                    function: input_function,
                    is_multiple: false
                })
                i++
                return input_function
            }
        })

        for (const [input_name, input] of this.input_map){
            this.addInput(input_name, "densityFunction", {label: input_name, locked: true, nameLocked: true, shape: input.is_multiple ? LiteGraph.ARROW_SHAPE : LiteGraph.CIRCLE_SHAPE})
        }

        this.title = "spline"
        this.color = "#330000"
    }

    onConnectInput?(
        inputIndex: number,
        outputType: INodeOutputSlot["type"],
        outputSlot: INodeOutputSlot,
        outputNode: LGraphNode,
        outputIndex: number
    ): boolean {
        if (this.input_map.get(this.getInputInfo(inputIndex)!.name)!.is_multiple && (outputNode instanceof LGraphNodeFixed) && !(outputNode.allowMultipleOutputs)){
            toastr.error("You can only connect named density functions or constants here", "This input is used multiple times by the spline")
            return false
        }

        return super.onConnectInput!(inputIndex, outputType, outputSlot, outputNode, outputIndex)
    }


    public updateWidgets(){
        this.wdgs.min_value.value = this.properties.min_value
        this.wdgs.max_value.value = this.properties.max_value
    }

    onConnectionsChange(){
        this.color = this.inputs.filter(i => !i.link).length > 0 ? "#330000" : "#000033"
        this.has_change = true
    }

    onExecute(){
        this.color = this.inputs.filter(i => !i.link).length > 0 ? "#330000" : "#000033"

        var error = false
        var input_has_error = false
        var input_has_changed = false
        ;(this as any).setSize(this.computeSize())
        for (const [input, f] of this.input_map){
            f.function.input_name = input

            const i = this.getInputDataByName(input)
            if (i === undefined){
                error = true
                f.function.wrapping = DensityFunction.Constant.ZERO
            } else {
                f.function.wrapping = i.df
                input_has_error ||= i.error
                input_has_changed ||= i.changed
            }
        }

        const splineToJson: (spline: CubicSpline<DensityFunction.Context>) => any = (spline: CubicSpline<DensityFunction.Context>) => {
            if (spline instanceof CubicSpline.Constant){
                return spline.compute()
            } else if (spline instanceof CubicSpline.MultiPoint) {
                
                const coordinate = this.getInputDataByName((spline.coordinate as PassthroghDensityFunction).input_name)?.json ?? {
                    json: {}, error: true, changed: false, df: DensityFunction.Constant.ZERO
                }
                
                const points: any[] = []
                for (var i = 0 ; i < spline.locations.length ; i++){
                    points.push({
                        location: spline.locations[i],
                        value: splineToJson(spline.values[i]),
                        derivative: spline.derivatives[i]
                    })
                }

                return {
                    coordinate: Array.isArray(coordinate) ? coordinate[0] : coordinate,
                    points: points,
                    ...((Array.isArray(coordinate)) && {[Symbol.for('after:coordinate')]: coordinate[1]})
                }
            }
        }

        this.spline.calculateMinMax()

        this.setOutputData(0, {
            json: {
                "type": "minecraft:spline",
                "spline": splineToJson(this.spline),
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
            df: new DensityFunction.Spline(this.spline)
        })

        this.has_change = false
    }
}

class PassthroghDensityFunction implements DensityFunction{
    public wrapping: DensityFunction = DensityFunction.Constant.ZERO
    public input_name: string = ""

    compute(c: DensityFunction.Context): number {
        return this.wrapping.compute(c)
    }
  
    minValue(): number {
        return this.wrapping.minValue()
    }
    maxValue(): number {
        return this.wrapping.maxValue()
    }
    mapAll(visitor: DensityFunction.Visitor): DensityFunction {
        return this.wrapping.mapAll(visitor) // remove self from tree
    }
}



