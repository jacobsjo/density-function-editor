import { CubicSpline, DensityFunction, NoiseRouter, Noises, NoiseSettings, XoroshiroRandom } from "deepslate";
import { LiteGraph, LGraph, LGraphCanvas, LGraphNode, IContextMenuOptions, LLink } from "litegraph.js";
import { DatapackManager } from "../DatapackManager";
import { ConstantDensityFunctionNode } from "../nodes/constant_density_function";
import { DensityFunctionNode } from "../nodes/density_function";
import { DensityFunctionOutputNode } from "../nodes/density_function_output";
import { SplineDensityFunctionNode } from "../nodes/density_function_spline";
import { NamedDensityFunctionNode } from "../nodes/named_density_function";
import { registerNodes } from "../nodes/register";
import { IdentityNumberFunction } from "../util";
import { MenuManager } from "./MenuManager";
import { PreviewMode } from "./PreviewMode";

export class GraphManager {
    static output_node: LGraphNode
    static graph: LGraph
    static canvas: LGraphCanvas

    static named_nodes: { [key: string]: NamedDensityFunctionNode }

    static has_change: boolean = false

    static id: string

    static oldJson: unknown = {}

    static noiseSettings: NoiseSettings = undefined

    private static currentLink: LLink = undefined
    private static preview_canvas: HTMLCanvasElement

    private static preview_id: number = 2
    private static preview_size = 200

    static init() {
        LiteGraph.clearRegisteredTypes() // don't use default node types
        registerNodes()

        this.preview_canvas = document.createElement("canvas")

        this.graph = new LGraph();

        this.canvas = new LGraphCanvas("#mycanvas", this.graph);
        this.canvas.autoresize = true
        this.canvas.canvas.onresize = () => {
            this.canvas.dirty_canvas = true
        }

        this.canvas.onDrawLinkTooltip = (ctx, link, canvas) => {
            if (!link || this.noiseSettings === undefined) {
                this.currentLink = undefined
                return true
            }

            const pos = (link as any)._pos;
            const data = (link as any).data;
            const preview_mode: PreviewMode = new (PreviewMode.PREVIEW_MODES[this.preview_id])(NoiseSettings.cellWidth(this.noiseSettings))

            if (data === undefined || data.df === undefined) {
                return
            }
            var df: DensityFunction = data.df

            const arrow_height = 20
            const tab_bar_height = 15

            ctx.fillStyle = "black"
            ctx.strokeStyle = "white"
            ctx.beginPath()
            ctx.lineTo(pos[0] - this.preview_size / 2 - 1, pos[1] - this.preview_size - arrow_height - tab_bar_height -1)
            ctx.lineTo(pos[0] + this.preview_size / 2 + 1, pos[1] - this.preview_size - arrow_height - tab_bar_height -1)
            ctx.lineTo(pos[0] + this.preview_size / 2 + 1, pos[1] - arrow_height + 1)
            ctx.lineTo(pos[0] + 20, pos[1] - arrow_height + 1)
            ctx.lineTo(pos[0], pos[1] - 10)
            ctx.lineTo(pos[0] - 20, pos[1] - arrow_height + 1)
            ctx.lineTo(pos[0] - this.preview_size / 2 - 1, pos[1] - arrow_height + 1)
            ctx.lineTo(pos[0] - this.preview_size / 2 - 1, pos[1] - this.preview_size - arrow_height - tab_bar_height - 1)
            ctx.fill()
            ctx.stroke()


            if (this.currentLink !== link) {
                this.currentLink = link

                if (this.noiseSettings !== undefined) {
                    const visitor = NoiseRouter.createVisitor(XoroshiroRandom.create(BigInt(0)).forkPositional(), this.noiseSettings)
                    df = df.mapAll(visitor)
                }

                var min = Infinity
                var max = -Infinity

                const pixels = []

                try {
                    for (var py = 0; py < this.preview_size; py++) {
                        for (var px = 0; px < this.preview_size; px++) {
                            const x = px / this.preview_size
                            const y = py / this.preview_size
                            const context = preview_mode.getContext(x, y)

                            try {
                                const value = df.compute(context)

                                if (value < min) min = value
                                if (value > max) max = value

                                pixels.push(value)
                            } catch (e) {
                                var newErr = new Error(`Could not calculate density function at pos ${x}, ${y}`);
                                newErr.stack += '\nCaused by: ' + e.stack;
                                throw newErr;
                            }

                        }
                    }
                } catch (e) {
                    console.error(e)
                    return
                }


                this.preview_canvas.width = this.preview_size
                this.preview_canvas.height = this.preview_size
                const preview_ctx = this.preview_canvas.getContext("2d")

                const preview_data = preview_ctx.createImageData(this.preview_size, this.preview_size)

                for (var py = 0; py < this.preview_size; py++) {
                    for (var px = 0; px < this.preview_size; px++) {
                        const index = py * (this.preview_size) + px;
                        var color = preview_mode.getColor(pixels[index], min, max)
                        preview_data.data[index * 4] = color[0]
                        preview_data.data[index * 4 + 1] = color[1]
                        preview_data.data[index * 4 + 2] = color[2]
                        preview_data.data[index * 4 + 3] = 255
                    }
                }

                preview_ctx.putImageData(preview_data, 0, 0)
            }
            ctx.drawImage(this.preview_canvas, pos[0] - this.preview_size / 2, pos[1] - this.preview_size - arrow_height)

            var left = pos[0] - this.preview_size / 2
            for (var i = 0 ; i < PreviewMode.PREVIEW_MODES.length ; i++){
                const display_name = PreviewMode.PREVIEW_MODES[i].display_name
                const w = ctx.measureText(display_name).width
                ctx.fillStyle = (i === this.preview_id) ? "#800000" : "#404040"
                ctx.fillRect(left, pos[1] - this.preview_size - arrow_height - tab_bar_height, w+5, tab_bar_height)
                ctx.fillStyle = "white"
                ctx.fillText(display_name, left+2, pos[1] - this.preview_size - arrow_height - 4)
                left+=w+8
            }
            ctx.fillStyle = "white"
            ctx.fillText("[Tab] to change", left+2, pos[1] - this.preview_size - arrow_height - 4)

            return true // hide default data display
        }

        this.canvas.onShowNodePanel = (n) => { }

        this.output_node = new DensityFunctionOutputNode(); // not registered as only one exists
        this.output_node.pos = [900, 400];
        this.graph.add(this.output_node);

        this.graph.start(50)


        document.onkeydown = (ev: KeyboardEvent) => {
            if ((ev.ctrlKey || ev.metaKey) && ev.key === "s") {
                ev.preventDefault()
                MenuManager.save()
            } else if (this.currentLink !== undefined && ev.key === "Tab") {
                this.preview_id = (this.preview_id + 1) % PreviewMode.PREVIEW_MODES.length
                this.currentLink = undefined // redraw
                ev.preventDefault()
            } else {
                this.canvas.processKey(ev)
            }
        }

        this.canvas.getExtraMenuOptions = () => DatapackManager.getMenuOptions()

        this.graph.beforeChange = (_info?: LGraphNode) => {
            this.has_change = true
        }
    }

    static hasChanged() {
        return (JSON.stringify(this.getOutput().json) !== JSON.stringify(this.oldJson))
    }

    static clear(id?: string) {
        if (this.hasChanged() && !confirm("You have unsaved changes. Continue?")) {
            return
        }

        this.graph.clear()
        this.named_nodes = {}

        this.output_node = new DensityFunctionOutputNode(); // not registered as only one exists
        this.output_node.pos = [900, 400];
        this.graph.add(this.output_node);

        this.has_change = false
        this.id = id

        this.graph.start(50)
        this.oldJson = {}
    }

    static getOutput(): { json: unknown, error: boolean, df: DensityFunction } {
        this.graph.runStep()
        return this.output_node.getInputDataByName("result") ?? { json: {}, error: true, df: DensityFunction.Constant.ZERO }
    }

    static setSaved() {
        this.has_change = false
        this.oldJson = this.getOutput().json
    }

    static loadJSON(json: any, id?: string): boolean {
        if (this.hasChanged() && !confirm("You have unsaved changes. Continue?")) {
            return
        }

        this.id = id

        this.graph.clear()
        this.named_nodes = {}

        this.output_node = new DensityFunctionOutputNode(); // not registered as only one exists
        this.graph.add(this.output_node);

        try {
            const [n, y] = this.createNodeFromJson(json, [900 - 250, 400])
            n.connect(0, this.output_node, 0)
            this.output_node.pos = [900, y / 2];
        } catch (e) {
            console.warn(e)
            this.output_node.pos = [900, 400];
        }

        // calculate output df once, to fill caches
        if (this.noiseSettings !== undefined){
            setTimeout(()=>{
                this.graph.runStep()
                const visitor = NoiseRouter.createVisitor(XoroshiroRandom.create(BigInt(0)).forkPositional(), this.noiseSettings)
                const df = this.getOutput().df.mapAll(visitor)
                for (var mode = 0 ; mode < PreviewMode.PREVIEW_MODES.length ; mode ++){
                    const preview_mode = new (PreviewMode.PREVIEW_MODES[mode])(NoiseSettings.cellWidth(this.noiseSettings))
                    for (var py = 0; py < 200; py++) {
                        for (var px = 0; px < this.preview_size; px++) {
                            const x = px / this.preview_size
                            const y = py / this.preview_size
                            const context = preview_mode.getContext(x, y)

                            try {
                                df.compute(context)
                            } catch (e) {
                                var newErr = new Error(`Could not calculate density function at pos ${x}, ${y}`);
                                newErr.stack += '\nCaused by: ' + e.stack;
                                throw newErr;
                            }
                        }
                    }
                }
            }, 0)
        }

        this.graph.start(50)
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