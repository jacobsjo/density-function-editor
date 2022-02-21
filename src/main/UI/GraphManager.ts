import { LiteGraph, LGraph, LGraphCanvas, LGraphNode } from "litegraph.js";
import { ConstantDensityFunction } from "../nodes/constant_density_function";
import { DensityFunction } from "../nodes/density_function";
import { DensityFunctionOutput } from "../nodes/density_function_output";
import { NamedDensityFunction } from "../nodes/named_density_function";
import { registerNodes } from "../nodes/register";

export class GraphManager{
    static output_node: LGraphNode
    static graph: LGraph

    static named_nodes: {[key: string]: NamedDensityFunction}
    
    static init(){
        LiteGraph.clearRegisteredTypes() // don't use default node types
        registerNodes()
    
        this.graph = new LGraph();
    
        var canvas = new LGraphCanvas("#mycanvas", this.graph);
        canvas.autoresize = true
        canvas.canvas.onresize = () => {
            canvas.dirty_canvas = true
        }
        canvas.onDrawLinkTooltip = (ctx,link,canvas) => {
            return true
        }
    
        canvas.onShowNodePanel = (n) => {}
    
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

    static loadJSON(json: any){
        this.graph.clear()
        this.named_nodes = {}

        this.output_node = new DensityFunctionOutput(); // not registered as only one exists
        this.output_node.pos = [900,400];
        this.graph.add(this.output_node);

        const output_pos = this.output_node.pos
        const n = this.createNodeFromJson(json, [output_pos[0] - 250, output_pos[1]], 1000)
        
        n.connect(0, this.output_node, 0)

        this.graph.runStep()
    }

    private static createNodeFromJson(json: any, pos: [number, number], seperation: number): LGraphNode{
        var node: LGraphNode
        if (typeof json === "string"){
            if (json in this.named_nodes){
                return this.named_nodes[json]
            } else {
                node = LiteGraph.createNode("density_function/named");
                node.properties.id = json
                ;(node as NamedDensityFunction).updateWidgets()
                node.pos = pos;
                this.graph.add(node);
                node.collapse(false)
                this.named_nodes[json] = (node as NamedDensityFunction)
            }
        } else if (typeof json === "number"){
            node = LiteGraph.createNode("density_function/constant");
            node.properties.value = json
            ;(node as ConstantDensityFunction).updateWidgets()
            node.pos = pos;
            this.graph.add(node);
        node.collapse(false)
        } else if (json.type){
            const density_function_node = LiteGraph.createNode("density_function/" + (json.type.replace("minecraft:", ""))) as DensityFunction
            if (density_function_node){
                for (const property in density_function_node.properties){
                    if (json[property] !== undefined){
                        density_function_node.properties[property] = json[property]
                    } else {
                        console.warn("missing property " + property)
                    }
                }
                density_function_node.updateWidgets()

                const space_for_child = seperation / density_function_node.input_names.length
                for (let i = 0 ; i < density_function_node.input_names.length ; i++){
                    const input = density_function_node.input_names[i]
                    if (json[input] !== undefined){
                        const n = this.createNodeFromJson(json[input], [pos[0]-250, pos[1]-seperation/2 + (i+0.5) * space_for_child], space_for_child)
                        n.connect(0, density_function_node, input)
                    } else {
                        console.warn("missing density function " + input)
                    }
                }
            }
            node = density_function_node
            node.pos = pos;
            this.graph.add(node);
        } else {
            throw new Error("could not load density function " + JSON.stringify(json))
        }
        return node;
    }
}