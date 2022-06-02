import { LGraphNodeFixed } from "./LGraphNodeFixed";
export declare class ConstantDensityFunctionNode extends LGraphNodeFixed {
    static title: string;
    private wdgt;
    private has_change;
    allowMultipleOutputs: boolean;
    constructor();
    updateWidgets(): void;
    getTitle(): any;
    onExecute(): void;
}
//# sourceMappingURL=constant_density_function.d.ts.map