import { IContextMenuItem } from "litegraph.js";
import { Datapack } from "mc-datapack-loader";
import { GraphManager } from "./UI/GraphManager";

import { noise_router_fields } from "./vanilla/schemas";

export class DatapackManager{
    static datapack: Datapack
    static density_functions: string[]
    static noise_settings: string[]

    static openDatapack(datapack: Datapack){
        this.datapack = datapack
        this.datapack.getIds("worldgen/density_function").then(v => this.density_functions = v)
        this.datapack.getIds("worldgen/noise_settings").then(v => this.noise_settings = v)

    }

    static closeDatapacks(){
        this.datapack = undefined
        this.density_functions = undefined
        this.noise_settings = undefined
    }

    static getMenuOptions(): IContextMenuItem[] {
        if (this.datapack === undefined) return []

        return [{
            content: "density_function",
            title: "Density Function",
            has_submenu: true,
            submenu: {
                options: this.density_functions.map(df => {
                    return {
                        content: df,
                        title: df,
                        has_submenu: false,
                        callback: () => {
                            this.datapack.get("worldgen/density_function", df).then(json => GraphManager.loadJSON(json, (jsonString: string) => {
                                return this.datapackSave(jsonString, df)
                            }, df, true))
                        }
                    }
                })
            }
        },{
            content: "noise_settings",
            title: "Noise Settings",
            has_submenu: true,
            submenu: {
                options: this.noise_settings.map(ns => {
                    return {
                        content: ns,
                        title: ns,
                        has_submenu: true,
                        submenu: {
                            options: noise_router_fields.map(field => {
                                return {
                                    content: field,
                                    title: field,
                                    has_submenu: false,
                                    callback: () => {
                                        this.datapack.get("worldgen/noise_settings", ns).then((json: any) => GraphManager.loadJSON(json.noise_router[field], async (jsonString: string) => {
                                            return this.datapackSave(jsonString, ns + "/" + field)
                                        }, ns + "/" + field, true))
                                    }
                                }
                            })
                        }
                    }
                })
            }
        }]
    }

    static async datapackSave(jsonString: string, id: string){
        if (this.datapack.save === undefined){
            return false
        } else {
            this.datapack.save("worldgen/density_function", id, JSON.parse(jsonString)) // let the datpack do its own json formating
                                            
            if (!(await this.datapack.has("worldgen/density_function", id)))
                alert("Saving into new density function " + id)
            
            return true
        }
    }
}