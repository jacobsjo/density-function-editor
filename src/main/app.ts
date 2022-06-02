import { DatapackManager } from './DatapackManager';
import { GraphManager } from './UI/GraphManager';
import { MenuManager } from './UI/MenuManager';

onload = async () => {
    MenuManager.addHandlers()
    await DatapackManager.init('1_19')
    GraphManager.init()
}
