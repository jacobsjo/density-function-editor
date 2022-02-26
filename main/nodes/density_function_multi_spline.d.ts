import { LGraphNodeFixed } from "./LGraphNodeFixed";
export declare class MultiSplineDensityFunctionNode extends LGraphNodeFixed {
    static title: string;
    private wdgs;
    private has_change;
    private readonly spline;
    private readonly input_functions;
    readonly input_jsons: Map<string, any>;
    constructor(json: any);
    updateWidgets(): void;
    onConnectionsChange(): void;
    onExecute(): void;
}
//# sourceMappingURL=density_function_multi_spline.d.ts.map