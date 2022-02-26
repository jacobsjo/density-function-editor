import { LiteGraph } from "litegraph.js";
import { schemas } from "../vanilla/schemas";
import { ConstantDensityFunctionNode } from "./constant_density_function";
import { DensityFunctionNode } from "./density_function";
import { SplineDensityFunctionNode } from "./density_function_spline";
import { NamedDensityFunctionNode } from "./named_density_function";


export function registerNodes(){
    LiteGraph.registerNodeType("special/named", NamedDensityFunctionNode );
    LiteGraph.registerNodeType("input/constant", ConstantDensityFunctionNode );
    LiteGraph.registerNodeType("special/spline", SplineDensityFunctionNode );

    schemas.forEach((schema, n) => {
        class f extends DensityFunctionNode{
            static title = n

            constructor(){
                super(n, new Map(Object.entries(schema)))
            }
        }
        LiteGraph.registerNodeType(schema.group + "/" + n, f)
    })



}