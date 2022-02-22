import { Spline } from "deepslate";
import { LiteGraph, LGraph, LGraphCanvas, LGraphNode, IContextMenuOptions } from "litegraph.js";
import { ConstantDensityFunction } from "../nodes/constant_density_function";
import { DensityFunction } from "../nodes/density_function";
import { DensityFunctionOutput } from "../nodes/density_function_output";
import { SplineDensityFunction } from "../nodes/density_function_spline";
import { NamedDensityFunction } from "../nodes/named_density_function";
import { registerNodes } from "../nodes/register";
import { MenuManager } from "./MenuManager";

export class GraphManager{
    static output_node: LGraphNode
    static graph: LGraph
    static canvas: LGraphCanvas

    static named_nodes: {[key: string]: NamedDensityFunction}
    
    static init(){
        LiteGraph.clearRegisteredTypes() // don't use default node types
        registerNodes()
    
        this.graph = new LGraph();
    
        this.canvas = new LGraphCanvas("#mycanvas", this.graph);
        this.canvas.autoresize = true
        this.canvas.canvas.onresize = () => {
            this.canvas.dirty_canvas = true
        }
        this.canvas.onDrawLinkTooltip = (ctx,link,canvas) => {
            return true
        }
    
        this.canvas.onShowNodePanel = (n) => {}
    
        this.output_node = new DensityFunctionOutput(); // not registered as only one exists
        this.output_node.pos = [900,400];
        this.graph.add(this.output_node);

        this.graph.start()
    }

    static clear(){
        this.graph.clear()
        this.named_nodes = {}

        this.output_node = new DensityFunctionOutput(); // not registered as only one exists
        this.output_node.pos = [900,400];
        this.graph.add(this.output_node);

        this.graph.runStep()
    }

    static getJSON(): any{
        this.graph.runStep()
        return this.output_node.getInputDataByName("result") ?? {}
    }

    static loadJSON(json: any): boolean{
        if (json.noise_router !== undefined){
            var menu_info: any = []
            Object.keys(json.noise_router).forEach((element) => menu_info.push({
                content: element,
                callback: () => {
                    this.loadJSON(json.noise_router[element])
                    MenuManager.fileName = element + ".json"
                }
            }))
            const options = {top: 200, left: 200}
            const e = console.error
            console.error = () => {}
            var menu = new LiteGraph.ContextMenu(menu_info, options as IContextMenuOptions, this.canvas.getCanvasWindow());
            console.error = e
            return false
        } else {
            this.graph.clear()
            this.named_nodes = {}

            this.output_node = new DensityFunctionOutput(); // not registered as only one exists
            this.graph.add(this.output_node);

            const [n, y] = this.createNodeFromJson(json, [900 - 250, 400])
            
            n.connect(0, this.output_node, 0)
            this.output_node.pos = [900,y/2];

            this.graph.runStep()
            MenuManager.setEdited(false)
            return true
        }
    }

    private static createNodeFromJson(json: any, pos: [number, number]): [LGraphNode, number]{
        if (typeof json === "string"){
            if (json in this.named_nodes && this.named_nodes[json].pos[0] <= pos[0]+400 ){
                return [this.named_nodes[json], pos[1]]
            } else {
                const node = LiteGraph.createNode("density_function/named");
                node.properties.id = json
                ;(node as NamedDensityFunction).updateWidgets()
                node.pos = pos;
                this.graph.add(node);
                node.collapse(false)
                this.named_nodes[json] = (node as NamedDensityFunction)
                return [node, pos[1]+150]
            }
        } else if (typeof json === "number"){
            const node = LiteGraph.createNode("density_function/constant");
            node.properties.value = json
            ;(node as ConstantDensityFunction).updateWidgets()
            node.pos = pos;
            this.graph.add(node);
            node.collapse(false)
            return [node, pos[1]+150]
        } else if (json.type === "minecraft:spline"){
            var y = pos[1]

            const node = LiteGraph.createNode("density_function/spline") as SplineDensityFunction
            
            node.properties.min_value = json.min_value
            node.properties.max_value = json.max_value

            const locations = []
            const values = []
            const derivatives = []
            for (const point of json.spline.points){
                if (typeof point.value !== "number"){
                    alert("Multidimenional Splines are not supported (yet)")
                    throw Error("Multidimenional Splines are not supported (yet)")
                }
                locations.push(point.location)
                values.push(() => point.value)
                derivatives.push(point.derivative)
            }

            node.splineWidget.value = new Spline<number>("spine", (c) => c, locations, values, derivatives);
            node.splineWidget.min_input = locations[0] - 0.1
            node.splineWidget.max_input = locations[locations.length-1] + 0.1

            node.updateWidgets()

            var n: LGraphNode
            [n, y] = this.createNodeFromJson(json.spline.coordinate, [pos[0]-250, y])
            n.connect(0, node, "coordinate")
            node.pos = [pos[0], (pos[1] + y-150) / 2];
            this.graph.add(node);
            return [node,y]
        } else if (json.type){
            const node = LiteGraph.createNode("density_function/" + (json.type.replace("minecraft:", ""))) as DensityFunction
            var y = pos[1]
            if (node){
                for (const property in node.properties){
                    if (json[property] !== undefined){
                        node.properties[property] = json[property]
                    } else {
                        console.warn("missing property " + property)
                    }
                }
                node.updateWidgets()

                for (let i = 0 ; i < node.input_names.length ; i++){
                    const input = node.input_names[i]
                    if (json[input] !== undefined){
                        var n: LGraphNode
                        [n, y] = this.createNodeFromJson(json[input], [pos[0]-250, y])
                        n.connect(0, node, input)
                    } else {
                        console.warn("missing density function " + input)
                    }
                }
            }
            node.pos = [pos[0], (pos[1] + y-150) / 2];
            this.graph.add(node);
            return [node, y]
        } else {
            throw new Error("could not load density function " + JSON.stringify(json))
        }
    }
}