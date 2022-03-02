import { DatapackManager } from "df-editor-core/src/DatapackManager"
import { GraphManager } from 'df-editor-core/src/UI/GraphManager'

import { MenuManager } from './MenuManager';
import { WebUIInterface } from "./WebUIInterface";

onload = async () => {
    const uiInterface = new WebUIInterface()

    const datapackManager = new DatapackManager(uiInterface, true)
    await datapackManager.init("./data/vanilla_datapack_1_18_2.zip")

    const graphManager = new GraphManager(uiInterface, datapackManager)
    MenuManager.addHandlers(datapackManager, graphManager)

}
