import { Datapack, DataType } from "mc-datapack-loader";


declare const acquireVsCodeApi;

export class ProxyDatapack implements Datapack {

    static requestId: number = 0

    constructor(
        private readonly vscode: any
    ) { }


    private request<T>(command: string, argument: any): Promise<T>{
        const requestId = ProxyDatapack.requestId
        ProxyDatapack.requestId ++

        this.vscode.postMessage({
            command: command,
            requestId: requestId,
            text: argument
        });

        return new Promise<T>(resolve => {
            window.addEventListener("message", (message) => {
                if (message.data.result && message.data.result === command && message.data.requestId === requestId ){
                    resolve(message.data.text)
                }
            })
        })

    }

    has(type: DataType, id: string): Promise<boolean> {
        return this.request<boolean>("datapack-has", {type: type, id: id})
    }

    getIds(type: DataType): Promise<string[]> {
        return this.request<string[]>("datapack-getIds", {type: type})
    }

    get(type: DataType, id: string): Promise<unknown> {
        return this.request<unknown>("datapack-get", {type: type, id: id})
    }

    save?(type: DataType, id: string, data: unknown): Promise<boolean> {
        return this.request<boolean>("datapack-save", {type: type, id: id, data: data})
    }

    prepareSave?(): Promise<void> {
        return this.request<void>("datapack-prepareSave", {})
    }

    canSave(): boolean {
        return true
    }

}