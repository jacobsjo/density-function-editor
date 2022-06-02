import { IContextMenuItem, INodeOutputSlot, LGraphCanvas, LGraphNode } from "litegraph.js";
export declare abstract class LGraphNodeFixed extends LGraphNode {
    getMenuOptions(onExecute: LGraphCanvas): IContextMenuItem[];
    resizable: boolean;
    updateWidgets(): void;
    onConnectInput?(inputIndex: number, outputType: INodeOutputSlot["type"], outputSlot: INodeOutputSlot, outputNode: LGraphNode, outputIndex: number): boolean;
    abstract allowMultipleOutputs: boolean;
}
//# sourceMappingURL=LGraphNodeFixed.d.ts.map