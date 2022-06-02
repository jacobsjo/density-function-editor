import { DensityFunction, Identifier } from "deepslate";
import { LGraph, LGraphCanvas, LGraphNode } from "litegraph.js";
import { ConstantDensityFunctionNode } from "../nodes/constant_density_function";
import { NamedDensityFunctionNode } from "../nodes/named_density_function";
export declare class GraphManager {
    static output_node: LGraphNode;
    static graph: LGraph;
    static canvas: LGraphCanvas;
    static named_nodes: {
        [key: string]: NamedDensityFunctionNode[];
    };
    static constant_nodes: {
        [key: string]: ConstantDensityFunctionNode[];
    };
    static has_change: boolean;
    static id: string;
    static oldJson: unknown;
    static noiseSettings: Identifier;
    static visitor: DensityFunction.Visitor;
    private static currentLink;
    private static preview_canvas;
    private static preview_id;
    private static preview_size;
    static init(): void;
    static setNoiseSettings(ns: Identifier): void;
    static hasChanged(): boolean;
    static clear(id?: string): void;
    static getOutput(): {
        json: unknown;
        error: boolean;
        df: DensityFunction;
    };
    static setSaved(): void;
    static autoLayout(): void;
    static loadJSON(json: any, id?: string, relayout?: boolean): boolean;
    static reload(): void;
    private static updateTitle;
    private static createNodeFromJson;
    private static handleComments;
}
//# sourceMappingURL=GraphManager.d.ts.map