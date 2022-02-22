import { IContextMenuItem, LGraphCanvas, LGraphNode } from "litegraph.js";
export declare class LGraphNodeFixed extends LGraphNode {
    onPropertyChanged(): boolean;
    onConnectionsChange(): void;
    onAdded(): void;
    onRemoved(): void;
    getMenuOptions(onExecute: LGraphCanvas): IContextMenuItem[];
    updateWidgets(): void;
}
//# sourceMappingURL=LGraphNodeFixed.d.ts.map