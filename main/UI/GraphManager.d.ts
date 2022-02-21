import { LGraph, LGraphNode } from "litegraph.js";
import { NamedDensityFunction } from "../nodes/named_density_function";
export declare class GraphManager {
    static output_node: LGraphNode;
    static graph: LGraph;
    static named_nodes: {
        [key: string]: NamedDensityFunction;
    };
    static init(): void;
    static clear(): void;
    static getJSON(): any;
    static loadJSON(json: any): void;
    private static createNodeFromJson;
}
//# sourceMappingURL=GraphManager.d.ts.map