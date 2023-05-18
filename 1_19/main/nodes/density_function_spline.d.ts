import { SplineWidget } from "../widgets/SplineWidget";
import { LGraphNodeFixed } from "./LGraphNodeFixed";
export declare class SplineDensityFunctionNode extends LGraphNodeFixed {
    static title: string;
    private wdgs;
    splineWidget: SplineWidget;
    private has_change;
    private df?;
    allowMultipleOutputs: boolean;
    constructor();
    updateWidgets(): void;
    onConnectionsChange(): void;
    onExecute(): void;
    computeSize(): [number, number];
}
//# sourceMappingURL=density_function_spline.d.ts.map