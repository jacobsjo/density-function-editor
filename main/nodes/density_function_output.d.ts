import { IContextMenuItem, LGraphCanvas, LGraphNode } from "litegraph.js";
export declare class DensityFunctionOutputNode extends LGraphNode {
    static title: string;
    removable: boolean;
    clonable: boolean;
    constructor();
    computeSize(): [number, number];
    getTitle(): string;
    onConnectionsChange(): void;
    onExecute(): void;
    getMenuOptions(onExecute: LGraphCanvas): IContextMenuItem[];
}
//# sourceMappingURL=density_function_output.d.ts.map