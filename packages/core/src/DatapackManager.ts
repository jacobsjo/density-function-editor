import { DensityFunction, Identifier, NoiseParameters, NoiseSettings, WorldgenRegistries } from "deepslate";
import { IContextMenuItem } from "litegraph.js";
import { CompositeDatapack, Datapack, ZipDatapack } from "mc-datapack-loader";
import { GraphManager } from "./UI/GraphManager";

import { noise_router_fields } from "./vanilla/schemas";

export class DatapackManager {
    static datapack: CompositeDatapack
    static vanilla_datapack: Datapack
    static noise_settings: Map<string, NoiseSettings> = new Map()

    static async init() {
        this.vanilla_datapack = await ZipDatapack.fromUrl("./data/vanilla_datapack_1_18_2.zip")
        this.datapack = new CompositeDatapack([this.vanilla_datapack])
        await this.reload()
    }

    static async openDatapack(datapack: Datapack) {
        this.datapack.readers = [this.vanilla_datapack, datapack]
        await this.reload()
    }

    static async reload() {
        WorldgenRegistries.DENSITY_FUNCTION.clear()
        for (const df of await this.datapack.getIds("worldgen/density_function")) {
            try{
                const json = await this.datapack.get("worldgen/density_function", df)
                WorldgenRegistries.DENSITY_FUNCTION.register(Identifier.parse(df), DensityFunction.fromJson(json))
            } catch (e) {
                GraphManager.uiInterface.logger.error(e, `Could not load density function ${df}`)
            }
        }

        WorldgenRegistries.NOISE.clear()
        for (const n of await this.datapack.getIds("worldgen/noise")) {
            try{
                const json = await this.datapack.get("worldgen/noise", n)
                WorldgenRegistries.NOISE.register(Identifier.parse(n), NoiseParameters.fromJson(json))
            } catch (e) {
                GraphManager.uiInterface.logger.error(e, `Could not load noise ${n}`)
            }
        }

        this.noise_settings.clear()
        for (const ns of await this.datapack.getIds("worldgen/noise_settings")) {
            try{
                const json: any = await this.datapack.get("worldgen/noise_settings", ns)
                this.noise_settings.set(ns, NoiseSettings.fromJson(json.noise))
            } catch (e) {
                GraphManager.uiInterface.logger.error(e, `Could not load noise settings ${ns}`)
            }
        }
    }

    static async closeDatapacks() {
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
                        options: WorldgenRegistries.DENSITY_FUNCTION.keys().sort().map(df => {
                            return {
                                content: df.toString(),
                                title: df.toString(),
                                has_submenu: false,
                                callback: () => {
                                    var ns = this.tryGetNoiseSettingsFromDensityFunction(df.toString())
                                    if (Array.isArray(ns)) {
                                        ns = GraphManager.uiInterface.prompt("Which noise settings should be used?", ns[0])
                                        if (!this.noise_settings.has(ns)) {
                                            GraphManager.uiInterface.logger.warn(`using minecraft:overworld`, `Noise settings unknown`)
                                            ns = "minecraft:overworld"
                                        }
                                    } else {
                                        GraphManager.uiInterface.logger.info(`using noise settings ${ns}`)
                                    }
                                    GraphManager.setNoiseSettings(Identifier.parse(ns))
                                    this.datapack.get("worldgen/density_function", df.toString()).then(json => GraphManager.loadJSON(json, df.toString()))
                                }
                            }
                        })
                    }
                }, {
                    content: "noise_settings",
                    title: "Noise Settings",
                    has_submenu: true,
                    submenu: {
                        options: Array.from(this.noise_settings.keys()).sort().map(ns => {
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
                                                    GraphManager.setNoiseSettings(Identifier.parse(ns))
                                                    GraphManager.loadJSON(json.noise_router[field], ns + "/" + field)
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
        }]
    }

    static tryGetNoiseSettingsFromDensityFunction(df_id: string): string | string[] {
        const [namespace, path] = df_id.split(":", 2)
        const folders = path.split("/")

        for (var i = folders.length - 1; i >= 1; i--) {
            const ns_name = `${namespace}:${folders.slice(0, i).join("/")}`
            if (this.noise_settings.has(ns_name)){
                return ns_name
            }
        }

        const ns_in_namespace = Array.from(this.noise_settings.keys()).filter(id => id.split(":", 2)[0] === namespace)
        if (ns_in_namespace.length === 1) {
            return ns_in_namespace[0]
        } else if (ns_in_namespace.length > 1) {
            return ns_in_namespace
        }

        const noise_setting_keys = Array.from(this.noise_settings.keys())
        for (var i = folders.length - 1; i >= 1; i--) {
            const ns_name = noise_setting_keys.find(ns_id => ns_id.match(`^[^\/:]+:${folders.slice(0, i).join("/")}$`))
            if (ns_name !== undefined){
                return ns_name
            }
        }

        return []
    }

    static async datapackSave(json: any, id: string) {
        if (!this.datapack.canSave()) {
            return false
        } else {
           
            if (!(await this.datapack.save("worldgen/density_function", id, json))) {
                return false
            }

            GraphManager.uiInterface.logger.success(id, "Denisty function saved")

            return true
        }
    }
}