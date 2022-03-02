import { LiteGraph } from "litegraph.js";
import { GraphManager } from "../main";
import { schemas } from "../vanilla/schemas";
import { ConstantDensityFunctionNode } from "./constant_density_function";
import { DensityFunctionNode } from "./density_function";
import { SplineDensityFunctionNode } from "./density_function_spline";
import { NamedDensityFunctionNode } from "./named_density_function";


export function registerNodes(graphManager: GraphManager ){
    LiteGraph.registerNodeType("special/named", class f extends NamedDensityFunctionNode{constructor(){super(graphManager)}});
    LiteGraph.registerNodeType("input/constant", class f extends ConstantDensityFunctionNode{constructor(){super(graphManager)}} );
    LiteGraph.registerNodeType("special/spline", class f extends SplineDensityFunctionNode{constructor(){super(graphManager)}} );

    schemas.forEach((schema, n) => {
        class f extends DensityFunctionNode{
            static title = n

            constructor(){
                super(n, new Map(Object.entries(schema)), graphManager)
            }
        }
        LiteGraph.registerNodeType(schema.group + "/" + n, f)
    })



}