import { IContextMenuItem, INodeInputSlot, INodeOutputSlot, LGraphCanvas, LGraphNode } from "litegraph.js";

export abstract class LGraphNodeFixed extends LGraphNode{
    getMenuOptions(onExecute: LGraphCanvas): IContextMenuItem[]{
        return []
    }

    resizable: boolean = false

    updateWidgets(): void {}

    // for some reason onConnectOutput doesn't work
    onConnectInput?(
        inputIndex: number,
        outputType: INodeOutputSlot["type"],
        outputSlot: INodeOutputSlot,
        outputNode: LGraphNode,
        outputIndex: number
    ): boolean {
        if (outputSlot.links && outputSlot.links.length > 0 && (outputNode instanceof LGraphNodeFixed) && !(outputNode.allowMultipleOutputs)){
            outputNode.disconnectOutput(0)
        }
        return true
    }

    abstract allowMultipleOutputs: boolean

}