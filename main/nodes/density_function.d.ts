import { IContextMenuItem, LGraphCanvas, LGraphNode } from "litegraph.js";
export declare class DensityFunction extends LGraphNode {
    private name;
    input_names: string[];
    private wdgs;
    constructor(name: string, args: Map<string, string>);
    onPropertyChanged(): boolean;
    onConnectionsChange(): void;
    onAdded(): void;
    onRemoved(): void;
    updateWidgets(): void;
    getMenuOptions(onExecute: LGraphCanvas): IContextMenuItem[];
    onExecute(): void;
}
//# sourceMappingURL=density_function.d.ts.map