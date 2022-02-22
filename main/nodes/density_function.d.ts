import { LGraphNodeFixed } from "./LGraphNodeFixed";
export declare class DensityFunction extends LGraphNodeFixed {
    private name;
    input_names: string[];
    private wdgs;
    constructor(name: string, args: Map<string, string>);
    updateWidgets(): void;
    onConnectionsChange(): void;
    onExecute(): void;
}
//# sourceMappingURL=density_function.d.ts.map