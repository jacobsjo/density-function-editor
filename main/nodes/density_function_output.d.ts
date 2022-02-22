import { IContextMenuItem, LGraphCanvas, LGraphNode } from "litegraph.js";
export declare class DensityFunctionOutput extends LGraphNode {
    static title: string;
    removable: boolean;
    clonable: boolean;
    constructor();
    onConnectionsChange(): void;
    onExecute(): void;
    getMenuOptions(onExecute: LGraphCanvas): IContextMenuItem[];
}
//# sourceMappingURL=density_function_output.d.ts.map