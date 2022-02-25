import { DensityFunction, Identifier, NoiseParameters, NoiseSettings, WorldgenRegistries } from "deepslate";
import { IContextMenuItem } from "litegraph.js";
import { CompositeDatapack, Datapack, ZipDatapack } from "mc-datapack-loader";
import { GraphManager } from "./UI/GraphManager";

import { noise_router_fields } from "./vanilla/schemas";

export class DatapackManager{
    static datapack: CompositeDatapack
    static vanilla_datapack: Datapack
    static noise_settings: Map<string, NoiseSettings> = new Map()

    static async init(){
        this.vanilla_datapack = await ZipDatapack.fromUrl("./data/vanilla_datapack_1_18_2.zip")
        await this.register(this.vanilla_datapack)
        this.datapack = new CompositeDatapack([this.vanilla_datapack])
    }

    static async openDatapack(datapack: Datapack){
        this.datapack.readers = [this.vanilla_datapack, datapack]
        await this.register(datapack)
    }

    static async register(datapack: Datapack){
        for (const df of await datapack.getIds("worldgen/density_function")){
            const json = await datapack.get("worldgen/density_function", df)
            WorldgenRegistries.DENSITY_FUNCTION.register(Identifier.parse(df), DensityFunction.fromJson(json))
        }

        for (const n of await datapack.getIds("worldgen/noise")){
            const json = await datapack.get("worldgen/noise", n)
            WorldgenRegistries.NOISE.register(Identifier.parse(n), NoiseParameters.fromJson(json))
        }

        for (const ns of await datapack.getIds("worldgen/noise_settings")){
            this.noise_settings.set(ns, NoiseSettings.fromJson(datapack.get("worldgen/noise_settings", ns)))
        }
    }

    static async closeDatapacks(){
        this.datapack.readers = [this.vanilla_datapack]
    }

    static getMenuOptions(): IContextMenuItem[] {
        return [{
            content: "Open",
            title: "Open",
            has_submenu: true,
            submenu: {
                options: [{
                    content: "density_function",
                    title: "Density Function",
                    has_submenu: true,
                    submenu: {
                        options: WorldgenRegistries.DENSITY_FUNCTION.keys().map(df => {
                            return {
                                content: df.toString(),
                                title: df.toString(),
                                has_submenu: false,
                                callback: () => {
                                    this.datapack.get("worldgen/density_function", df.toString()).then(json => GraphManager.loadJSON(json, df.toString()))
                                    this.datapack.get("worldgen/noise_settings", df.toString().split("/", 2)[0]).then((json: any) => {
                                        if (json !== undefined){
                                            GraphManager.noiseSettings = NoiseSettings.fromJson(json.noise)
                                        }
                                    })
                                }
                            }
                        })
                    }
                },{
                    content: "noise_settings",
                    title: "Noise Settings",
                    has_submenu: true,
                    submenu: {
                        options: Array.from(this.noise_settings.keys()).map(ns => {
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
                                                this.datapack.get("worldgen/noise_settings", ns).then((json: any) => {
                                                    GraphManager.loadJSON(json.noise_router[field], ns + "/" + field)
                                                    GraphManager.noiseSettings = NoiseSettings.fromJson(json.noise)
                                                })
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                }]
            }
        },{
            content: "select_noise_settings",
            title: "Set noise_settings",
            has_submenu: true,
            submenu: {
                options: Array.from(this.noise_settings.keys()).map(ns => {
                    return {
                        content: ns,
                        title: ns,
                        has_submenu: false,
                        callback: () => {
                            this.datapack.get("worldgen/noise_settings", ns).then((json: any) => GraphManager.noiseSettings = NoiseSettings.fromJson(json.noise))
                        }
                    }
                })
            }
        }]
    
    }

    static async datapackSave(jsonString: string, id: string){
        if (!this.datapack.canSave()){
            return false
        } else {
            if (!(await this.datapack.save("worldgen/density_function", id, JSON.parse(jsonString)))){ // let the datpack do its own json formating
                return false
            } 
                                            
            if (!(await this.datapack.has("worldgen/density_function", id)))
                alert("Saving into new density function " + id)

            return true
        }
    }
}