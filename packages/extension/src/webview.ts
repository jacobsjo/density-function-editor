//import { DatapackManager } from "df-editor-core/src/DatapackManager";
import { stringify, parse } from 'comment-json';
import { Identifier } from 'deepslate';
import { GraphManager, DatapackManager } from 'df-editor-core';
import { ProxyDatapack } from './ProxyDatapack';
import { VSCodeUIInterface } from './VSCodeUIInterface';

declare const acquireVsCodeApi;

var lastOutput = ""
const vscode = acquireVsCodeApi();

var id: string = ""

async function init(){
    const uiInterface = new VSCodeUIInterface(vscode)
    const proxyDatapack = new ProxyDatapack(vscode)
    const datapackManager = new DatapackManager(uiInterface, false, proxyDatapack)
    const graphManager = new GraphManager(uiInterface, datapackManager, (output: string) => {
        if (output !== lastOutput) {
            vscode.postMessage({ command: "output-change", text: output })
            lastOutput = output
        }
    })

    async function setNoiseSettings(){
        var noise_settings = datapackManager.tryGetNoiseSettingsFromDensityFunction(id)
    
        if (Array.isArray(noise_settings)){
            noise_settings = await uiInterface.prompt("Which noise settings should be used?", noise_settings[0])
        }
    
        if (!datapackManager.getNoiseSettings().has(noise_settings)) {
            uiInterface.logger.warn(`using minecraft:overworld`, `Noise settings unknown`)
            noise_settings = "minecraft:overworld"
        }
    
        console.log(`using noise setting ${noise_settings}`)
    
        graphManager.setNoiseSettings(Identifier.parse(noise_settings))
    }
    

    window.addEventListener("message", async (message) => {
        if (message.data.command && message.data.command === "file-change") {

            if (message.data.id){
                id = message.data.id
                await setNoiseSettings()
            }

            if (message.data.text !== lastOutput) {
                graphManager.loadJSON(message.data.text)
                lastOutput = message.data.text
            }

        }
    })

    window.onkeydown = (ev: KeyboardEvent) => {
        graphManager.onKeyDown(ev)
    }


    vscode.postMessage({
        command: "get-file"
    })

    await datapackManager.reload()
    graphManager.setNoiseSettings(this.noiseSettings)
    await setNoiseSettings()
    graphManager.loadJSON(lastOutput)
}


init()