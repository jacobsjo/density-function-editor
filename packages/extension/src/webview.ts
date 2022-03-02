//import { DatapackManager } from "df-editor-core/src/DatapackManager";
import { GraphManager, DatapackManager } from 'df-editor-core';
import { ProxyDatapack } from './ProxyDatapack';
import { VSCodeUIInterface } from './VSCodeUIInterface';

declare const acquireVsCodeApi;

async function init(){
    const vscode = acquireVsCodeApi();

    const uiInterface = new VSCodeUIInterface(vscode)
    const proxyDatapack = new ProxyDatapack(vscode)
    const datapackManager = new DatapackManager(uiInterface, false, proxyDatapack)
    const graphManager = new GraphManager(uiInterface, datapackManager)
}

init()

console.log("Test")