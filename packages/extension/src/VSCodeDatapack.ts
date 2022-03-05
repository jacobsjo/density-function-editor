import { Datapack, DataType, getFileType, idToPath } from "mc-datapack-loader";

import * as vscode from 'vscode';
import * as fs from 'fs';
import { parse } from "comment-json";

export class VSCodeDatapack implements Datapack{
    private cache: Map<string, unknown> = new Map()

    async has(type: DataType, id: string): Promise<boolean> {
        return (await vscode.workspace.findFiles(`**/data/${idToPath(type,id)}`)).length > 0
    }

    async getIds(type: DataType): Promise<string[]> {
        return (await vscode.workspace.findFiles(`**/data/*/${type}/**/*.${getFileType(type)}`)).map(uri => {
            const paths = uri.path.match(`.*\/data\/([^\/]*)\/${type.replaceAll('/','\/')}\/(.*)\.json`)
            return `${paths[1]}:${paths[2]}`
        })
    }

    async get(type: DataType, id: string): Promise<unknown> {
        //if (this.cache.has(id)){
        //    return this.cache.get(id)
        //}

        const uri = (await vscode.workspace.findFiles(`**/data/${idToPath(type,id)}`))[0]
        if (uri === undefined){
            return undefined
        }
        
        const file = fs.readFileSync(uri.fsPath)
        const fileType = getFileType(type)

        var result: unknown
        if (fileType === "json"){
            result = parse(file.toString())
        } else {
            result = file.buffer
        }

        this.cache.set(id, result)
        return result
    }
    
    canSave(): boolean {
        return false  //saving happens through editor itself
    }
}