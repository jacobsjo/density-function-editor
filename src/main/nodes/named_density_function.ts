import { DensityFunction, Holder, Identifier, WorldgenRegistries } from "deepslate";
import { IContextMenuItem, IWidget, LGraphCanvas, LGraphNode, LiteGraph } from "litegraph.js";
import { DatapackManager } from "../DatapackManager";
import { PersistentCacheDensityFunction } from "../DensityFunction/PersistentCacheDensityFunction";
import { GraphManager } from "../UI/GraphManager";
import { MenuManager } from "../UI/MenuManager";
import { LGraphNodeFixed } from "./LGraphNodeFixed";

export class NamedDensityFunctionNode extends LGraphNodeFixed{
    static title = "Named Density Function"

    private wdgt: IWidget
    private has_change: boolean
    private df: DensityFunction = undefined

    constructor(){
        super()
        this.addOutput("output","densityFunction", {locked: true, nameLocked: true});
        this.addProperty("id", "", "string")
        this.wdgt = this.addWidget("text", "Id", "", (value) => {
            this.properties.id = value
            if (GraphManager.is_part_of_datapack){
                DatapackManager.datapack.has("worldgen/density_function", this.properties.id).then(b => this.color = b ? "#000033" : "#330000")
            }
            this.has_change = true
        })
        if (GraphManager.is_part_of_datapack){
            this.addWidget("button", "open", "Open", () => {
                if (GraphManager.is_part_of_datapack){
                    DatapackManager.datapack.get("worldgen/density_function", this.properties.id).then(json => GraphManager.loadJSON(json, (jsonString: string) => {
                        return DatapackManager.datapackSave(jsonString, this.properties.id)
                    }, this.properties.id, true))
                }
            })
        }
        this.title = "Named Density Function"
        this.color = "#003300"
    }

    public updateWidgets() {
        this.wdgt.value = this.properties.id
        if (GraphManager.is_part_of_datapack){
            this.color = DatapackManager.density_functions.includes(this.properties.id) ? "#000033" : "#330000"
        }
}

    getTitle = function() {
        if (this.flags.collapsed) {
            var id:string = this.properties.id
            if (id.length > 20){
                id = id.substring(id.lastIndexOf("/")+1)
            }
            return id;
        }
        return this.title;
    };

    onExecute(){
        if (this.df === undefined || this.has_change){
            this.df = new PersistentCacheDensityFunction(DatapackManager.density_functions.includes(this.properties.id) ? new DensityFunction.HolderHolder(Holder.reference(WorldgenRegistries.DENSITY_FUNCTION, Identifier.parse(this.properties.id))) : DensityFunction.Constant.ZERO)
        }

        this.setOutputData(0, {
            json: this.properties.id,
            error: false,
            changed: this.has_change,
            df: this.df
        })

        this.has_change = false
    }
}

