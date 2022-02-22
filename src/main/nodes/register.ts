import { LiteGraph } from "litegraph.js";
import { schemas } from "../vanilla/schemas";
import { ConstantDensityFunction } from "./constant_density_function";
import { DensityFunction } from "./density_function";
import { SplineDensityFunction } from "./density_function_spline";
import { NamedDensityFunction } from "./named_density_function";


export function registerNodes(){
    LiteGraph.registerNodeType("density_function/named", NamedDensityFunction );
    LiteGraph.registerNodeType("density_function/constant", ConstantDensityFunction );
    LiteGraph.registerNodeType("density_function/spline", SplineDensityFunction );

    schemas.forEach((schema, n) => {
        class f extends DensityFunction{
            static title = n.replace("minecraft:", "")

            constructor(){
                super(n, new Map(Object.entries(schema)))
            }
        }
        LiteGraph.registerNodeType("density_function/" + (n.replace("minecraft:", "")), f)
    })



}