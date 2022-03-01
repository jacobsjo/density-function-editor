import { DatapackManager } from "df-editor-core/src/DatapackManager"
import { GraphManager } from 'df-editor-core/src/UI/GraphManager'

import { MenuManager } from './MenuManager';
import { WebUIInterface } from "./WebUIInterface";

onload = async () => {
    MenuManager.addHandlers()
    await DatapackManager.init()
    GraphManager.init(new WebUIInterface())
}
