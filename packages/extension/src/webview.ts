//import { DatapackManager } from "df-editor-core/src/DatapackManager";
import { stringify, parse } from 'comment-json';
import { GraphManager, DatapackManager } from 'df-editor-core';
import { ProxyDatapack } from './ProxyDatapack';
import { VSCodeUIInterface } from './VSCodeUIInterface';

declare const acquireVsCodeApi;

var lastOutput = ""

async function init() {
    const vscode = acquireVsCodeApi();

    const uiInterface = new VSCodeUIInterface(vscode)
    const proxyDatapack = new ProxyDatapack(vscode)
    const datapackManager = new DatapackManager(uiInterface, false, proxyDatapack)
    const graphManager = new GraphManager(uiInterface, datapackManager, (output: string) => {
        if (output !== lastOutput) {
            vscode.postMessage({ command: "output-change", text: output })
            lastOutput = output
        }
    })

    window.addEventListener("message", (message) => {
        if (message.data.command && message.data.command === "file-change") {
            if (message.data.text !== lastOutput){
                console.log(parse(message.data.text))
                graphManager.loadJSON(message.data.text)
                lastOutput = message.data.text
            }
        }
    })
}

init()

console.log("Test")