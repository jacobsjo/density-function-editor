import { LGraphNodeFixed } from "./LGraphNodeFixed";
export declare class DensityFunctionNode extends LGraphNodeFixed {
    private name;
    input_names: string[];
    private wdgs;
    private has_change;
    private df;
    constructor(name: string, args: Map<string, string>);
    updateWidgets(): void;
    onConnectionsChange(): void;
    onExecute(): void;
}
//# sourceMappingURL=density_function.d.ts.map