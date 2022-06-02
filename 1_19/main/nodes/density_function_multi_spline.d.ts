import { DensityFunction } from "deepslate";
import { INodeOutputSlot, LGraphNode } from "litegraph.js";
import { LGraphNodeFixed } from "./LGraphNodeFixed";
export declare class MultiSplineDensityFunctionNode extends LGraphNodeFixed {
    static title: string;
    private wdgs;
    private has_change;
    private readonly spline;
    readonly input_map: Map<string, {
        json: any;
        function: PassthroghDensityFunction;
        is_multiple: boolean;
    }>;
    allowMultipleOutputs: boolean;
    constructor(json: any);
    onConnectInput?(inputIndex: number, outputType: INodeOutputSlot["type"], outputSlot: INodeOutputSlot, outputNode: LGraphNode, outputIndex: number): boolean;
    updateWidgets(): void;
    onConnectionsChange(): void;
    onExecute(): void;
}
declare class PassthroghDensityFunction implements DensityFunction {
    wrapping: DensityFunction;
    input_name: string;
    compute(c: DensityFunction.Context): number;
    minValue(): number;
    maxValue(): number;
    mapAll(visitor: DensityFunction.Visitor): DensityFunction;
}
export {};
//# sourceMappingURL=density_function_multi_spline.d.ts.map