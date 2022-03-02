import { DensityFunction, Holder, Identifier, WorldgenRegistries } from "deepslate";
import { IContextMenuItem, IWidget, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";
import { PersistentCacheDensityFunction } from "../DensityFunction/PersistentCacheDensityFunction";
import { GraphManager } from "../UI/GraphManager";
import { LGraphNodeFixed } from "./LGraphNodeFixed";

export class NamedDensityFunctionNode extends LGraphNodeFixed {
    static title = "Named Density Function"

    private wdgt: IWidget
    private has_change: boolean
    private df: DensityFunction = undefined

    allowMultipleOutputs = true

    constructor(
        private readonly graphManager: GraphManager
    ) {
        super()
        this.addOutput("output", "densityFunction", { locked: true, nameLocked: true });
        this.addProperty("id", "", "string")
        this.wdgt = this.addWidget("combo", "Id", WorldgenRegistries.DENSITY_FUNCTION.keys().sort()[0].toString(), (value) => {
            this.properties.id = value
            this.updateColor()
            this.has_change = true
        }, { values: WorldgenRegistries.DENSITY_FUNCTION.keys().sort().map(df => df.toString()) })
        this.addWidget("button", "open", "Open", () => {
            this.graphManager.datapackManager.getDatapack().get("worldgen/density_function", this.properties.id).then(json => this.graphManager.loadJSON(json, this.properties.id))
        })
        this.title = "Named Density Function"
        this.color = "#003300"
    }

    public updateWidgets() {
        this.wdgt.value = this.properties.id
        this.updateColor()
    }

    private updateColor() {
        this.color = WorldgenRegistries.DENSITY_FUNCTION.get(Identifier.parse(this.properties.id)) ? "#000033" : "#330000"
    }

    getTitle = function () {
        if (this.flags.collapsed) {
            var id: string = this.properties.id
            if (id.length > 20) {
                id = id.substring(id.lastIndexOf("/") + 1)
            }
            return id;
        }
        return this.title;
    };

    onReload() {
        this.wdgt.options.values = WorldgenRegistries.DENSITY_FUNCTION.keys().sort().map(df => df.toString())
        this.has_change = true
    }

    onExecute() {
        if (this.df === undefined || this.has_change) {
            this.df = new PersistentCacheDensityFunction(WorldgenRegistries.DENSITY_FUNCTION.get(Identifier.parse(this.properties.id))
                    ? new DensityFunction.HolderHolder(Holder.reference(WorldgenRegistries.DENSITY_FUNCTION, Identifier.parse(this.properties.id))).mapAll(this.graphManager.visitor)
                    : DensityFunction.Constant.ZERO)
        }

        this.setOutputData(0, {
            json: [
                this.properties.id,
                [{
                    type: 'LineComment',
                    value: "[df-editor]:" + JSON.stringify({
                        pos: [this.pos[0], this.pos[1]],
                        collapsed: this.flags.collapsed ?? false
                    }),
                    inline: true,
                    loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 1 } }
                }]
            ],
            error: false,
            changed: this.has_change,
            df: this.df
        })

        this.has_change = false
    }
}

