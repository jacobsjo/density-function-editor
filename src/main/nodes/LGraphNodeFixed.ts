import { IContextMenuItem, LGraphCanvas, LGraphNode } from "litegraph.js";
import { MenuManager } from "../UI/MenuManager";


export class LGraphNodeFixed extends LGraphNode{
    getMenuOptions(onExecute: LGraphCanvas): IContextMenuItem[]{
        return []
    }

    updateWidgets(): void {}
}