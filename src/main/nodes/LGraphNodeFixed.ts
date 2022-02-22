import { IContextMenuItem, LGraphCanvas, LGraphNode } from "litegraph.js";
import { MenuManager } from "../UI/MenuManager";


export class LGraphNodeFixed extends LGraphNode{
    onPropertyChanged() {
        MenuManager.setEdited()
        return false
    }

    onConnectionsChange(){
        MenuManager.setEdited()
    }

    onAdded(){
        MenuManager.setEdited()
    }

    onRemoved(){
        MenuManager.setEdited()
    }

    getMenuOptions(onExecute: LGraphCanvas): IContextMenuItem[]{
        return []
    }

    updateWidgets(): void {}
}