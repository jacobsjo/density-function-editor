import { CubicSpline, DensityFunction, NoiseRouter, NoiseSettings, XoroshiroRandom } from "deepslate";
import { LiteGraph, LGraph, LGraphCanvas, LGraphNode, IContextMenuOptions } from "litegraph.js";
import { DatapackManager } from "../DatapackManager";
import { ConstantDensityFunctionNode } from "../nodes/constant_density_function";
import { DensityFunctionNode } from "../nodes/density_function";
import { DensityFunctionOutputNode } from "../nodes/density_function_output";
import { SplineDensityFunctionNode } from "../nodes/density_function_spline";
import { NamedDensityFunctionNode } from "../nodes/named_density_function";
import { registerNodes } from "../nodes/register";
import { IdentityNumberFunction } from "../util";
import { MenuManager } from "./MenuManager";

export class GraphManager {
    static output_node: LGraphNode
    static graph: LGraph
    static canvas: LGraphCanvas

    static named_nodes: { [key: string]: NamedDensityFunctionNode }

    static has_change: boolean = false

    static is_part_of_datapack: boolean = false
    static id: string 

    static oldJson: unknown = {}

    static noiseSettings: NoiseSettings = undefined

    static save: (jsonString: string) => Promise<boolean> = async () => false

    static init() {
        LiteGraph.clearRegisteredTypes() // don't use default node types
        registerNodes()

        this.graph = new LGraph();

        this.canvas = new LGraphCanvas("#mycanvas", this.graph);
        this.canvas.autoresize = true
        this.canvas.canvas.onresize = () => {
            this.canvas.dirty_canvas = true
        }
        this.canvas.onDrawLinkTooltip = (ctx, link, canvas) => {
            if (!link) return

            const pos = (link as any)._pos;
            const data = (link as any).data;
            const preview_size = 200
            const min_x = 0
            const max_x = 2000
            const max_y = 2000
            const min_y = 0
            if (data === undefined || data.df === undefined){
                return
            }
            var df: DensityFunction = data.df

            if (this.noiseSettings !== undefined){
                console.log("using visitor")
                const visitor = NoiseRouter.createVisitor(XoroshiroRandom.create(BigInt(0)).forkPositional(), this.noiseSettings)
                df = df.mapAll(visitor)
            }

            ctx.fillStyle = "black"
            ctx.strokeStyle = "white"
            ctx.beginPath()
            ctx.lineTo(pos[0]-preview_size/2 - 1, pos[1]-preview_size-21)
            ctx.lineTo(pos[0]+preview_size/2 + 1, pos[1]-preview_size-21)
            ctx.lineTo(pos[0]+preview_size/2 + 1, pos[1]-19)
            ctx.lineTo(pos[0]+20, pos[1]-19)
            ctx.lineTo(pos[0], pos[1]-10)
            ctx.lineTo(pos[0]-20, pos[1]-19)
            ctx.lineTo(pos[0]-preview_size/2 - 1, pos[1]-19)
            ctx.lineTo(pos[0]-preview_size/2 - 1, pos[1]-preview_size-21)
            ctx.fill()
            ctx.stroke()
            //ctx.fillRect(pos[0]-10,pos[1]-10, 20, 20)

            var min = Infinity
            var max = -Infinity

            const pixels = []
            for (var px = 0 ; px < preview_size ; px++){
                for (var py = 0 ; py < preview_size ; py++){
                    const x = px / preview_size * (max_x - min_x)
                    const y = py / preview_size * (max_y - min_y)
                    const context = {
                        x: () => x,
                        y: () => 0,
                        z: () => y
                    }
                    const value = df.compute(context)

                    if (value < min) min = value
                    if (value > max) max = value

                    pixels.push(value)
                }
            }

            if (max === min){
                ctx.fillStyle = "#808080"
                ctx.fillRect(pos[0] - preview_size/2, pos[1] - preview_size - 20, preview_size, preview_size)
            } else {
                for (var px = 0 ; px < preview_size ; px++){
                    for (var py = 0 ; py < preview_size ; py++){
                        const index = py * (preview_size) + px;
                        var value = (Math.floor(((pixels[index] - min) / (max - min)) * 256)).toString(16)
                        if (value === "100") value = "ff"
                        if (value.length === 1) value = "0" + value

                        ctx.fillStyle = "#" + value + value + value
                        ctx.fillRect(px + pos[0] - preview_size/2, py + pos[1] - preview_size - 20, 1, 1)
                    }
                }
            }

            return true
        }

        this.canvas.onShowNodePanel = (n) => { }

        this.output_node = new DensityFunctionOutputNode(); // not registered as only one exists
        this.output_node.pos = [900, 400];
        this.graph.add(this.output_node);

        this.graph.start()


        document.onkeydown = (ev: KeyboardEvent) => {
            if ((ev.ctrlKey || ev.metaKey) && ev.key === "s") {
                ev.preventDefault()
                MenuManager.save()
            } else {
                this.canvas.processKey(ev)
            }
        }

        this.canvas.getExtraMenuOptions = () => DatapackManager.getMenuOptions()

        this.graph.beforeChange = (_info?: LGraphNode) => {
            this.has_change = true
        }
    }

    static hasChanged(){
        this.graph.runStep()
        return (JSON.stringify(this.getOutput().json) !== JSON.stringify(this.oldJson))
    }

    static clear(id?: string, save_function: (jsonString: string) => Promise<boolean> = async () => false) {
        if (this.hasChanged() && !confirm("You have unsaved changes. Continue?")){
            return
        }

        this.graph.clear()
        this.named_nodes = {}

        this.output_node = new DensityFunctionOutputNode(); // not registered as only one exists
        this.output_node.pos = [900, 400];
        this.graph.add(this.output_node);

        this.graph.runStep()
        this.has_change = false
        this.is_part_of_datapack = DatapackManager.datapack !== undefined
        this.id = id
        this.oldJson = {}
        this.save = save_function
    }

    static getOutput(): {json: unknown, error: boolean, df: DensityFunction} {
        this.graph.runStep()
        return this.output_node.getInputDataByName("result") ?? { json: {}, error: true, df: DensityFunction.Constant.ZERO }
    }

    static getJsonString() {
        const output = this.getOutput()
        console.log(output.df)
        if (output.error && !confirm("Some nodes have unconnected inputs, the resulting JSON will be invalid. Continue?")) {
            return undefined
        } else {
            const jsonString = JSON.stringify(output.json, null, 2)
            return jsonString
        }
    }

    static setSaved(){
        this.has_change = false
        this.oldJson = this.getOutput().json
    }

    static loadJSON(json: any, save_function: (jsonString: string) => Promise<boolean> = async () => false, id?: string, from_datapack: boolean = false): boolean {
        if (this.hasChanged() && !confirm("You have unsaved changes. Continue?")){
            return
        }

        this.save = save_function
        this.id = id
        this.is_part_of_datapack = from_datapack

        this.graph.clear()
        this.named_nodes = {}

        this.output_node = new DensityFunctionOutputNode(); // not registered as only one exists
        this.graph.add(this.output_node);

        try{
            const [n, y] = this.createNodeFromJson(json, [900 - 250, 400])
            n.connect(0, this.output_node, 0)
            this.output_node.pos = [900, y / 2];
        } catch (e) {
            console.warn(e)
            this.output_node.pos = [900, 400];
        }

        this.graph.runStep()
        this.has_change = false
        this.oldJson = this.getOutput().json
        return true
    }

    private static createNodeFromJson(json: any, pos: [number, number]): [LGraphNode, number] {
        if (typeof json === "string") {
            if (json in this.named_nodes && this.named_nodes[json].pos[0] <= pos[0] + 400) {
                return [this.named_nodes[json], pos[1]]
            } else {
                const node = LiteGraph.createNode("density_function/named");
                node.properties.id = json
                    ; (node as NamedDensityFunctionNode).updateWidgets()
                node.pos = pos;
                this.graph.add(node);
                node.collapse(false)
                this.named_nodes[json] = (node as NamedDensityFunctionNode)
                return [node, pos[1] + 150]
            }
        } else if (typeof json === "number") {
            const node = LiteGraph.createNode("density_function/constant");
            node.properties.value = json
                ; (node as ConstantDensityFunctionNode).updateWidgets()
            node.pos = pos;
            this.graph.add(node);
            node.collapse(false)
            return [node, pos[1] + 150]
        } else if (json.type === "minecraft:spline") {
            var y = pos[1]

            const node = LiteGraph.createNode("density_function/spline") as SplineDensityFunctionNode

            node.properties.min_value = json.min_value
            node.properties.max_value = json.max_value

            const locations = []
            const values = []
            const derivatives = []
            for (const point of json.spline.points) {
                if (typeof point.value !== "number") {
                    alert("Multidimenional Splines are not supported (yet)")
                    throw Error("Multidimenional Splines are not supported (yet)")
                }
                locations.push(point.location)
                values.push(new CubicSpline.Constant(point.value))
                derivatives.push(point.derivative)
            }

            node.splineWidget.value = new CubicSpline.MultiPoint<number>(IdentityNumberFunction, locations, values, derivatives);
            node.splineWidget.min_input = locations[0] - 0.1
            node.splineWidget.max_input = locations[locations.length - 1] + 0.1

            node.updateWidgets()

            var n: LGraphNode
            [n, y] = this.createNodeFromJson(json.spline.coordinate, [pos[0] - 250, y])
            n.connect(0, node, "coordinate")
            node.pos = [pos[0], (pos[1] + y - 150) / 2];
            this.graph.add(node);
            return [node, y]
        } else if (json.type) {
            const node = LiteGraph.createNode("density_function/" + (json.type.replace("minecraft:", ""))) as DensityFunctionNode
            var y = pos[1]
            if (node) {
                for (const property in node.properties) {
                    if (json[property] !== undefined) {
                        node.properties[property] = json[property]
                    } else {
                        console.warn("missing property " + property)
                    }
                }
                node.updateWidgets()

                for (let i = 0; i < node.input_names.length; i++) {
                    const input = node.input_names[i]
                    if (json[input] !== undefined) {
                        var n: LGraphNode
                        [n, y] = this.createNodeFromJson(json[input], [pos[0] - 250, y])
                        n.connect(0, node, input)
                    } else {
                        console.warn("missing density function " + input)
                    }
                }
            }
            node.pos = [pos[0], (pos[1] + y - 150) / 2];
            this.graph.add(node);
            return [node, y]
        } else {
            throw new Error("could not load density function " + JSON.stringify(json))
        }
    }
}