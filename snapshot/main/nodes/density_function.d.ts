import { Warning } from "../Warning";
import { LGraphNodeFixed } from "./LGraphNodeFixed";
export declare class DensityFunctionNode extends LGraphNodeFixed {
    private name;
    input_names: string[];
    private wdgs;
    private noiseWdgs;
    private has_change;
    private df;
    warning: Warning;
    allowMultipleOutputs: boolean;
    constructor(name: string, args: Map<string, string>);
    updateWidgets(): void;
    onReload(): void;
    onConnectionsChange(): void;
    onExecute(): void;
}
//# sourceMappingURL=density_function.d.ts.map