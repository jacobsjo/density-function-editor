import { LGraph, LGraphCanvas, LiteGraph } from 'litegraph.js';
import { DensityFunctionOutput } from './nodes/density_function_output';
import { registerNodes } from './nodes/register';
import { GraphManager } from './UI/GraphManager';
import { MenuManager } from './UI/MenuManager';

onload = () => {
    MenuManager.addHandlers()
    GraphManager.init()
}
