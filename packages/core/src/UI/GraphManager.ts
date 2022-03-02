import { CubicSpline, DensityFunction, Identifier, NoiseRouter, Noises, NoiseSettings, XoroshiroRandom } from "deepslate";
import { LiteGraph, LGraph, LGraphCanvas, LGraphNode, IContextMenuOptions, LLink } from "litegraph.js";
import { DatapackManager } from "../DatapackManager";
import { UIInterface } from "../UIInterface";
import { ConstantDensityFunctionNode } from "../nodes/constant_density_function";
import { DensityFunctionNode } from "../nodes/density_function";
import { MultiSplineDensityFunctionNode } from "../nodes/density_function_multi_spline";
import { DensityFunctionOutputNode } from "../nodes/density_function_output";
import { SplineDensityFunctionNode } from "../nodes/density_function_spline";
import { NamedDensityFunctionNode } from "../nodes/named_density_function";
import { registerNodes } from "../nodes/register";
import { IdentityNumberFunction } from "../util";
import { schemas } from "../vanilla/schemas";
import { PreviewMode } from "./PreviewMode";
import { CommentArray, CommentToken, parse, stringify } from "comment-json";
import { LGraphNodeFixed } from "../nodes/LGraphNodeFixed";

export class GraphManager {
    output_node: LGraphNode
    graph: LGraph
    canvas: LGraphCanvas

    named_nodes: { [key: string]: NamedDensityFunctionNode[] }
    constant_nodes: { [key: string]: ConstantDensityFunctionNode[] }

    has_change: boolean = false

    id: string

    oldJson: unknown = {}

    noiseSettings: Identifier
    visitor: DensityFunction.Visitor

    private currentLink: LLink = undefined
    private preview_canvas: HTMLCanvasElement

    private preview_id: number = 2
    private preview_size = 200

    private isLoading: boolean = false

    uiInterface: UIInterface
    datapackManager: DatapackManager;

    constructor(uiInterface: UIInterface, datapackManager: DatapackManager, onChange?: (output: string) => void) {
        this.uiInterface = uiInterface
        this.datapackManager = datapackManager

        LiteGraph.clearRegisteredTypes() // don't use default node types
        registerNodes(this)

        this.setNoiseSettings(Identifier.parse("minecraft:overworld"))

        this.preview_canvas = document.createElement("canvas")

        this.graph = new LGraph();
        console.log(this.graph)

        this.canvas = new LGraphCanvas("#mycanvas", this.graph);
        this.canvas.resize()
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
            const preview_mode: PreviewMode = new (PreviewMode.PREVIEW_MODES[this.preview_id])(NoiseSettings.cellWidth(this.datapackManager.getNoiseSettings().get(this.noiseSettings.toString())))

            if (data === undefined || data.df === undefined) {
                return
            }
            var df: DensityFunction = data.df

            const arrow_height = 20
            const tab_bar_height = 15
            const status_bar_height = 15

            ctx.fillStyle = "black"
            ctx.strokeStyle = "white"
            ctx.beginPath()
            ctx.lineTo(pos[0] - this.preview_size / 2 - 1, pos[1] - this.preview_size - arrow_height - tab_bar_height - status_bar_height - 1)
            ctx.lineTo(pos[0] + this.preview_size / 2 + 1, pos[1] - this.preview_size - arrow_height - tab_bar_height - status_bar_height - 1)
            ctx.lineTo(pos[0] + this.preview_size / 2 + 1, pos[1] - arrow_height + 1)
            ctx.lineTo(pos[0] + 20, pos[1] - arrow_height + 1)
            ctx.lineTo(pos[0], pos[1] - 10)
            ctx.lineTo(pos[0] - 20, pos[1] - arrow_height + 1)
            ctx.lineTo(pos[0] - this.preview_size / 2 - 1, pos[1] - arrow_height + 1)
            ctx.lineTo(pos[0] - this.preview_size / 2 - 1, pos[1] - this.preview_size - arrow_height - tab_bar_height - status_bar_height - 1)
            ctx.fill()
            ctx.stroke()

            /*if (this.noiseSettings !== undefined) {
                const visitor = NoiseRouter.createVisitor(XoroshiroRandom.create(BigInt(0)).forkPositional(), this.noiseSettings)
                df = df.mapAll(visitor)
            }*/

            if (this.currentLink !== link) {
                this.currentLink = link


                var min = Infinity
                var max = -Infinity

                const pixels = []

                try {
                    for (var px = 0; px < this.preview_size; px++) {
                        for (var py = 0; py < this.preview_size; py++) {
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
                        const pixel_index = px * (this.preview_size) + py;
                        var color = preview_mode.getColor(pixels[pixel_index], min, max)
                        const data_index = (py * (this.preview_size) + px) * 4;
                        preview_data.data[data_index] = color[0]
                        preview_data.data[data_index + 1] = color[1]
                        preview_data.data[data_index + 2] = color[2]
                        preview_data.data[data_index + 3] = 255
                    }
                }

                preview_ctx.putImageData(preview_data, 0, 0)
            }
            ctx.drawImage(this.preview_canvas, pos[0] - this.preview_size / 2, pos[1] - this.preview_size - arrow_height - status_bar_height)

            var left = pos[0] - this.preview_size / 2
            for (var i = 0; i < PreviewMode.PREVIEW_MODES.length; i++) {
                const display_name = PreviewMode.PREVIEW_MODES[i].display_name
                const w = ctx.measureText(display_name).width
                ctx.fillStyle = (i === this.preview_id) ? "#800000" : "#404040"
                ctx.fillRect(left, pos[1] - this.preview_size - arrow_height - tab_bar_height - status_bar_height, w + 5, tab_bar_height)
                ctx.fillStyle = "white"
                ctx.fillText(display_name, left + 2, pos[1] - this.preview_size - arrow_height - status_bar_height - 4)
                left += w + 8
            }
            ctx.fillStyle = "white"
            ctx.fillText("[Tab] to change", left + 2, pos[1] - this.preview_size - arrow_height - status_bar_height - 4)

            ctx.fillStyle = "orange"
            ctx.fillText(`minValue: ${df.minValue().toFixed(2)}, maxValue: ${df.maxValue().toFixed(2)}`, pos[0] - this.preview_size / 2 + 2, pos[1] - arrow_height - 4)

            return true // hide default data display
        }

        this.canvas.onShowNodePanel = (n) => { }

        this.output_node = new DensityFunctionOutputNode(this); // not registered as only one exists
        this.output_node.pos = [900, 400];
        this.graph.add(this.output_node);

        this.graph.start(50)


        this.canvas.getExtraMenuOptions = () => this.datapackManager.getMenuOptions(this)

        this.graph.beforeChange = (_info?: LGraphNode) => {
            this.has_change = true
        }

        this.graph.afterChange = () => {
            if (onChange && !this.isLoading){
                onChange(stringify(this.getOutput().json, null, 2))
            }
        }
    }

    onKeyDown(ev: KeyboardEvent){
        if (this.currentLink !== undefined && ev.key === "Tab") {
            this.preview_id = (this.preview_id + 1) % PreviewMode.PREVIEW_MODES.length
            this.currentLink = undefined // redraw
            ev.preventDefault()
        } else {
            this.canvas.processKey(ev)
        }
    }

    setNoiseSettings(ns: Identifier) {
        this.noiseSettings = ns
        this.visitor = new NoiseRouter.Visitor(XoroshiroRandom.create(BigInt(0)).forkPositional(), this.datapackManager.getNoiseSettings().get(ns.toString()))
    }

    hasChanged() {
        return (JSON.stringify(this.getOutput().json) !== JSON.stringify(this.oldJson)) // JSON.strigify to ignore comments
    }

    clear(id?: string) {
        if (this.hasChanged() && !this.uiInterface.confirm("You have unsaved changes. Continue?")) {
            return
        }

        this.isLoading = true

        this.graph.clear()
        this.named_nodes = {}
        this.constant_nodes = {}

        this.output_node = new DensityFunctionOutputNode(this); // not registered as only one exists
        this.output_node.pos = [900, 400];
        this.graph.add(this.output_node);

        this.has_change = false
        this.id = id

        this.graph.start(50)
        this.oldJson = {}
        this.updateTitle()
        this.isLoading = false

    }

    getOutput(): { json: unknown, error: boolean, df: DensityFunction } {
        if (!this.graph){
            return {
                json: {},
                error: true,
                df: undefined
            }
        }
        this.graph.runStep()
        const output = this.output_node.getInputDataByName("result") ?? { json: {}, error: true, df: DensityFunction.Constant.ZERO }
        output.json[Symbol.for('before-all')] = [{
            type: 'LineComment',
            value: "[df-editor]:" + JSON.stringify({
                pos: [this.output_node.pos[0], this.output_node.pos[1]],
                collapsed: this.output_node.flags.collapsed ?? false
            }),
            inline: false,
            loc: {start: {line: 0, column: 0}, end: {line: 0, column: 1}
            }
        }]
        return output
    }

    setSaved() {
        this.has_change = false
        this.oldJson = this.getOutput().json
    }

    autoLayout(){
        this.loadJSON(this.getOutput().json, this.id, true)
    }

    loadJSON(json: string | any, id?: string, relayout: boolean = false): boolean {
        this.isLoading = true

        if (typeof json === "string"){
            json = parse(json)
        }
        //if (this.hasChanged() && !this.uiInterface.confirm("You have unsaved changes. Continue?")) {
        //    return
        //}

        this.id = id

        this.graph.clear()
        this.named_nodes = {}
        this.constant_nodes = {}

        this.output_node = new DensityFunctionOutputNode(this); // not registered as only one exists
        this.graph.add(this.output_node);

        try {
            const [n, y] = this.createNodeFromJson(json, [900 - 250, 400], relayout)
            n.connect(0, this.output_node, 0)

            if (!relayout){
                const comment_pos = this.handleComments(json[Symbol.for('before-all')])
                if (comment_pos !== undefined) {
                    this.output_node.pos = comment_pos.pos
                    if (comment_pos.collapsed)
                        this.output_node.collapse(false)
                } else {
                    this.output_node.pos = [900, y / 2];
                }
            } else {
                this.output_node.pos = [900, y / 2];
            }
        } catch (e) {
            this.uiInterface.logger.warn(e, "Could not load Denisty Function")
            console.warn(e)
            this.output_node.pos = [900, 400];
        }

        this.graph.start(50)
        this.has_change = false
        this.oldJson = this.getOutput().json

        this.updateTitle()


        this.isLoading = false

        return true
    }

    public reload() {
        if (!this.datapackManager.getNoiseSettings().has(this.noiseSettings.toString())) {
            this.uiInterface.logger.warn(`falling back to minecraft:overworld; reopen file to change`, `The used noise settings ${this.noiseSettings.toString()} were removed`)
            this.noiseSettings = Identifier.parse("minecraft:overworld")
        }

        this.setNoiseSettings(this.noiseSettings)

        this.graph.sendEventToAllNodes("onReload", [])
    }

    private updateTitle() {
        window.document.title = `${this.id ? this.id + " - " : ""}Density Function Editor`
    }

    private createNodeFromJson(json: any, pos: [number, number], relayout: boolean, fix_pos: boolean = false): [LGraphNode, number] {
        if (typeof json === "string") {
            if (json in this.named_nodes) {
                for (const node of this.named_nodes[json]){
                    if (!fix_pos && node.pos[0] <= pos[0] + 400) 
                        return [node, pos[1]]
                    if (fix_pos && node.pos[0] === pos[0] && node.pos[1] === pos[1]) 
                        return [node, pos[1]]
                }
            }
            const node = LiteGraph.createNode("special/named");
            node.properties.id = json
                ; (node as NamedDensityFunctionNode).updateWidgets()
            node.pos = pos;
            this.graph.add(node);
            node.collapse(false)
            if (!(json in this.named_nodes))
                this.named_nodes[json] = []
            this.named_nodes[json].push(node as NamedDensityFunctionNode)
            return [node, pos[1] + 150]
        } else if (typeof json === "number") {
            
            if (json in this.constant_nodes && fix_pos) {
                for (const node of this.constant_nodes[json]){
                    if (node.pos[0] === pos[0] && node.pos[1] === pos[1]) 
                        return [node, pos[1]]
                }
            }

            const node = LiteGraph.createNode("input/constant");
            node.properties.value = json
                ; (node as ConstantDensityFunctionNode).updateWidgets()
            node.pos = pos;
            this.graph.add(node);
            node.collapse(false)
            if (!(json in this.constant_nodes))
                this.constant_nodes[json] = []
            this.constant_nodes[json].push(node as ConstantDensityFunctionNode)
            return [node, pos[1] + 150]
        } else if (typeof json === "object"){
            var fixed_pos: [number, number] = undefined
            var collapsed: boolean = false
            if (!relayout){
                const comment_pos = this.handleComments(json[Symbol.for('before:type')])
                if (comment_pos !== undefined) {
                    fixed_pos = comment_pos.pos
                    collapsed = comment_pos.collapsed ?? false
                    pos[0] = fixed_pos[0]
                }
            }

            var node: LGraphNodeFixed
            if (json.type.replace("minecraft:", "") === "spline") {
                var y = pos[1]

                var multi_d: boolean = false
                for (const point of json.spline.points) {
                    if (typeof point.value !== "number") {
                        multi_d = true
                        break
                    }
                }

                if (multi_d) {
                    node = new MultiSplineDensityFunctionNode(json, this)
                    node.mode = LiteGraph.ALWAYS; // needed as node is not created from registy
                    var y = pos[1]

                    for (const [input, j] of (node as MultiSplineDensityFunctionNode).input_map) {
                        if (j.json !== undefined) {
                            var n: LGraphNode
                            [n, y] = this.createNodeFromJson(j.json, [pos[0] - 250, y], relayout) //TODO position comment!
                            n.connect(0, node, input)
                        } else {
                            this.uiInterface.logger.error(input, `Density function not recognices`)
                        }
                    }
                    node.pos = fixed_pos ?? [pos[0], (pos[1] + y - 150) / 2];
                    this.graph.add(node);
                    return [node, y]
                } else {
                    node = LiteGraph.createNode("special/spline") as SplineDensityFunctionNode

                    node.properties.min_value = json.min_value
                    node.properties.max_value = json.max_value

                    const locations = []
                    const values = []
                    const derivatives = []
                    for (const point of json.spline.points) {
                        locations.push(point.location)
                        values.push(new CubicSpline.Constant(point.value))
                        derivatives.push(point.derivative)
                    }

                    ;(node as SplineDensityFunctionNode).splineWidget.value = new CubicSpline.MultiPoint<number>(IdentityNumberFunction, locations, values, derivatives);
                    ;(node as SplineDensityFunctionNode).splineWidget.min_input = locations[0] - 0.1
                    ;(node as SplineDensityFunctionNode).splineWidget.max_input = locations[locations.length - 1] + 0.1

                    node.updateWidgets()

                    var n: LGraphNode
                    var child_pos: [number, number] = [pos[0] - 250, y]
                    var fix_client_pos = false

                    if (!relayout && typeof json.spline.coordinate !== "object"){
                        const comment_pos = this.handleComments(json.spline[Symbol.for('after:coordinate')])
                        if (comment_pos !== undefined) {
                            child_pos = comment_pos.pos
                            fix_client_pos = true
                        }
                    }
        
                    [n, y] = this.createNodeFromJson(json.spline.coordinate, child_pos, relayout, fix_client_pos)
                    n.connect(0, node, "coordinate")
                }
            } else if (json.type) {
                const type = json.type.replace("minecraft:", "")
                node = LiteGraph.createNode(schemas.get(type).group + "/" + type) as DensityFunctionNode
                var y = pos[1]
                if (node) {
                    for (const property in node.properties) {
                        if (json[property] !== undefined) {
                            node.properties[property] = json[property]
                        } else {
                            this.uiInterface.logger.warn(property, `Density function ${type} is missing properties`)
                        }
                    }
                    node.updateWidgets()

                    for (let i = 0; i < (node as DensityFunctionNode).input_names.length; i++) {
                        const input = (node as DensityFunctionNode).input_names[i]
                        if (json[input] !== undefined) {
                            var n: LGraphNode
                            var child_pos: [number, number] = [pos[0] - 250, y]
                            var fix_client_pos = false

                            if (!relayout && typeof json[input] !== "object"){
                                const comment_pos = this.handleComments(json[Symbol.for(`after:${input}`)])
                                if (comment_pos !== undefined) {
                                    child_pos = comment_pos.pos
                                    fix_client_pos = true
                                }
                            }
                
                            [n, y] = this.createNodeFromJson(json[input], child_pos, relayout, fix_client_pos)
                            n.connect(0, node, input)
                        } else {
                            this.uiInterface.logger.warn(input, `Density function ${type} is missing properties`)
                        }
                    }
                }
            } else {
                throw new Error("could not load Density function " + JSON.stringify(json))
            }

            if (fixed_pos !== undefined){
                node.pos = fixed_pos
            } else {
                node.pos = [pos[0], (pos[1] + y - 150) / 2];
            }

            this.graph.add(node);

            if (collapsed)
                node.collapse(false)

            return [node, y]

        }
    }

    private handleComments(comments : CommentToken[]){
        if (comments !== undefined){
            for (const comment of comments){
                if (comment.type === "LineComment" && comment.value.startsWith("[df-editor]:")){
                    try{
                        const pos_data = JSON.parse(comment.value.substr(12))
                        return pos_data
                    } catch (e) {
                        this.uiInterface.logger.warn(e, `Could not load node positioning`)
                    }
                    break
                }
            }
        }
        return undefined
    }
}