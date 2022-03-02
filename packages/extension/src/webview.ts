//import { DatapackManager } from "df-editor-core/src/DatapackManager";
import { DatapackManager } from 'df-editor-core';
import { GraphManager } from 'df-editor-core';
import { VSCodeUIInterface } from './VSCodeUIInterface';

declare const vanillaDatapackUrl: string

async function init(){
    console.log(vanillaDatapackUrl)
    await DatapackManager.init(vanillaDatapackUrl)
    GraphManager.init(new VSCodeUIInterface())
}

init()

console.log("Test")