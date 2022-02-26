import { CubicSpline, DensityFunction } from "deepslate";
import { IWidget} from "litegraph.js";
import { LGraphNodeFixed } from "./LGraphNodeFixed";

const spline_values = ["offset", "factor", "jaggedness"]
const sampler_types = ["type_1", "type_2"]

export class MultiSplineDensityFunctionNode extends LGraphNodeFixed{

    static title = "spline"
    
    private wdgs: {[key: string]: IWidget} = {}
    private has_change: boolean = false

    private readonly spline: CubicSpline<DensityFunction.Context>

    private readonly input_functions: Map<string, PassthroghDensityFunction>
    public readonly input_jsons: Map<string, any>

    constructor(
        json: any
    ){
        super()

        this.input_functions = new Map()
        this.input_jsons = new Map()

        this.addOutput("output", "densityFunction", {locked: true, nameLocked: true});

        var i = 0
        this.spline = CubicSpline.fromJson(json.spline, (j: unknown) => {
            if (typeof j === "string"){
                if (this.input_functions.has(j)){
                    return this.input_functions.get(j)
                } else {
                    const input_function = new PassthroghDensityFunction()
                    this.input_functions.set(j, input_function)
                    this.input_jsons.set(j, j)
                    return input_function
                }
            } else {
                const input_function = new PassthroghDensityFunction()
                this.input_functions.set(`inline_function_${i}`, input_function)
                this.input_jsons.set(`inline_function_${i}`, j)
                i++
                return input_function
            }
        })

        for (const [input, j] of this.input_functions){
            this.addInput(input, "densityFunction", {label: input, locked: true, nameLocked: true})
        }

        this.addProperty("min_value", json.min_value, "number")
        this.wdgs.min_value = this.addWidget("number", "min_value", json.min_value, (value) => {
            this.properties.min_value = value
            this.has_change = true
        })
        this.addProperty("max_value", json.max_value, "number")
        this.wdgs.max_value = this.addWidget("number", "max_value", json.max_value, (value) => {
            this.properties.max_value = value
            this.has_change = true
    
    }),

        this.title = "spline"
        this.color = "#330000"
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
        for (const [input, f] of this.input_functions){
            f.input_name = input

            const i = this.getInputDataByName(input)
            if (i === undefined){
                error = true
                f.wrapping = DensityFunction.Constant.ZERO
            } else {
                f.wrapping = i.df
                input_has_error ||= i.error
                input_has_changed ||= i.changed
            }
        }

        const splineToJson: (spline: CubicSpline<DensityFunction.Context>) => any = (spline: CubicSpline<DensityFunction.Context>) => {
            if (spline instanceof CubicSpline.Constant){
                return spline.compute()
            } else if (spline instanceof CubicSpline.MultiPoint) {
                
                const coordinate = this.getInputDataByName((spline.coordinate as PassthroghDensityFunction).input_name).json
                
                const points = []
                for (var i = 0 ; i < spline.locations.length ; i++){
                    points.push({
                        location: spline.locations[i],
                        value: splineToJson(spline.values[i]),
                        derivative: spline.derivatives[i]
                    })
                }

                return {
                    coordinate: coordinate,
                    points: points
                }
            }
        }




        this.setOutputData(0, {
            json: {
                "type": "minecraft:spline",
                "min_value": this.properties.min_value,
                "max_value": this.properties.max_value,
                "spline": splineToJson(this.spline)
            },
            error: error || input_has_error,
            changed: this.has_change || input_has_changed,
            df: new DensityFunction.Spline(this.spline, this.properties.min_value, this.properties.max_value)
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



