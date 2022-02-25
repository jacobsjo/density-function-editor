import { DatapackManager } from './DatapackManager';
import { GraphManager } from './UI/GraphManager';
import { MenuManager } from './UI/MenuManager';

onload = () => {
    MenuManager.addHandlers()
    DatapackManager.init()
    GraphManager.init()
}
