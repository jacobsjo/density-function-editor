import { SplineWidget } from "../widgets/SplineWidget";
import { LGraphNodeFixed } from "./LGraphNodeFixed";
export declare class SplineDensityFunction extends LGraphNodeFixed {
    static title: string;
    private wdgs;
    splineWidget: SplineWidget;
    constructor();
    updateWidgets(): void;
    onConnectionsChange(): void;
    onExecute(): void;
}
//# sourceMappingURL=density_function_spline.d.ts.map