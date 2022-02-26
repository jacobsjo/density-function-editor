import { DensityFunction, NoiseSettings } from "deepslate";
import { LGraph, LGraphCanvas, LGraphNode } from "litegraph.js";
import { NamedDensityFunctionNode } from "../nodes/named_density_function";
export declare class GraphManager {
    static output_node: LGraphNode;
    static graph: LGraph;
    static canvas: LGraphCanvas;
    static named_nodes: {
        [key: string]: NamedDensityFunctionNode;
    };
    static has_change: boolean;
    static id: string;
    static oldJson: unknown;
    static noiseSettings: NoiseSettings;
    static visitor: DensityFunction.Visitor;
    private static currentLink;
    private static preview_canvas;
    private static preview_id;
    private static preview_size;
    static init(): void;
    static setNoiseSettings(ns: NoiseSettings): void;
    static hasChanged(): boolean;
    static clear(id?: string): void;
    static getOutput(): {
        json: unknown;
        error: boolean;
        df: DensityFunction;
    };
    static setSaved(): void;
    static loadJSON(json: any, id?: string): boolean;
    private static updateTitle;
    private static createNodeFromJson;
}
//# sourceMappingURL=GraphManager.d.ts.map