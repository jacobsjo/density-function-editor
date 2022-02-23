import { GraphManager } from './UI/GraphManager';
import { MenuManager } from './UI/MenuManager';

onload = () => {
    MenuManager.addHandlers()
    GraphManager.init()
}
