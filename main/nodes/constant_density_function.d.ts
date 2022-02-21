import { IContextMenuItem, LGraphCanvas, LGraphNode } from "litegraph.js";
export declare class ConstantDensityFunction extends LGraphNode {
    static title: string;
    private wdgt;
    constructor();
    updateWidgets(): void;
    getTitle: () => any;
    getMenuOptions(onExecute: LGraphCanvas): IContextMenuItem[];
    onExecute(): void;
}
//# sourceMappingURL=constant_density_function.d.ts.map