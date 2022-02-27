import { LGraphNodeFixed } from "./LGraphNodeFixed";
export declare class NamedDensityFunctionNode extends LGraphNodeFixed {
    static title: string;
    private wdgt;
    private has_change;
    private df;
    constructor();
    updateWidgets(): void;
    private updateColor;
    getTitle: () => any;
    onReload(): void;
    onExecute(): void;
}
//# sourceMappingURL=named_density_function.d.ts.map