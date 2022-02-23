import { LiteGraph } from "litegraph.js";
import { schemas } from "../vanilla/schemas";
import { ConstantDensityFunctionNode } from "./constant_density_function";
import { DensityFunctionNode } from "./density_function";
import { SplineDensityFunctionNode } from "./density_function_spline";
import { NamedDensityFunctionNode } from "./named_density_function";


export function registerNodes(){
    LiteGraph.registerNodeType("density_function/named", NamedDensityFunctionNode );
    LiteGraph.registerNodeType("density_function/constant", ConstantDensityFunctionNode );
    LiteGraph.registerNodeType("density_function/spline", SplineDensityFunctionNode );

    schemas.forEach((schema, n) => {
        class f extends DensityFunctionNode{
            static title = n.replace("minecraft:", "")

            constructor(){
                super(n, new Map(Object.entries(schema)))
            }
        }
        LiteGraph.registerNodeType("density_function/" + (n.replace("minecraft:", "")), f)
    })



}