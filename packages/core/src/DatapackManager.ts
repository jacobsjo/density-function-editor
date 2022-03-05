import { DensityFunction, Identifier, NoiseParameters, NoiseSettings, WorldgenRegistries } from "deepslate"
import { IContextMenuItem } from "litegraph.js"
import { CompositeDatapack, Datapack, ZipDatapack } from "mc-datapack-loader"
import { GraphManager } from "./UI/GraphManager"
import { UIInterface } from "./UIInterface"
import { noise_router_fields } from "./vanilla/schemas"



export class DatapackManager{
    private vanilla_datapack: Datapack
    private noise_settings: Map<string, NoiseSettings> = new Map()

   constructor (
       private uiInterface: UIInterface,
       private include_open: boolean,
       private datapack?: Datapack
   ) {
        /*if (this.datapack !== undefined){
            this.reload()
        }*/
    }

    getDatapack(): Datapack {
        return this.datapack
    }

    getNoiseSettings(): Map<string, NoiseSettings> {
        return this.noise_settings
    }

    async init(vanilla_datapack_url: string){
        this.vanilla_datapack = await ZipDatapack.fromUrl(vanilla_datapack_url)
        this.datapack = new CompositeDatapack([this.vanilla_datapack])
        await this.reload()
    }

    async openDatapack(datapack: Datapack) {
        if (this.datapack instanceof CompositeDatapack){
            this.datapack.readers = [this.vanilla_datapack, datapack]
            await this.reload()
        }
    }

    async reload() {
        WorldgenRegistries.DENSITY_FUNCTION.clear()
        const promises: Promise<any>[] = []
        for (const df of await this.datapack.getIds("worldgen/density_function")) {
            try {
                promises.push(this.datapack.get("worldgen/density_function", df).then(
                    json => WorldgenRegistries.DENSITY_FUNCTION.register(Identifier.parse(df), DensityFunction.fromJson(json))
                ))
            } catch (e) {
                this.uiInterface.logger.error(e, `Could not load density function ${df}`)
            }
        }

        WorldgenRegistries.NOISE.clear()
        for (const n of await this.datapack.getIds("worldgen/noise")) {
            try {
                promises.push(this.datapack.get("worldgen/noise", n).then(
                    json => WorldgenRegistries.NOISE.register(Identifier.parse(n), NoiseParameters.fromJson(json))
                ))
            } catch (e) {
                this.uiInterface.logger.error(e, `Could not load noise ${n}`)
            }
        }

        this.noise_settings.clear()
        for (const ns of await this.datapack.getIds("worldgen/noise_settings")) {
            try {
                promises.push(this.datapack.get("worldgen/noise_settings", ns).then(
                    (json: any) => this.noise_settings.set(ns, NoiseSettings.fromJson(json.noise))
                ))
            } catch (e) {
                this.uiInterface.logger.error(e, `Could not load noise settings ${ns}`)
            }
        }

        //await Promise.all(promises)
    }

    async closeDatapacks() {
        if (this.datapack instanceof CompositeDatapack){
            this.datapack.readers = [this.vanilla_datapack]
           this.reload()
        }
    }

    
    getMenuOptions(graphManager: GraphManager): IContextMenuItem[] {
        return this.include_open ? [{
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
                                        this.uiInterface.prompt("Which noise settings should be used?", ns[0]).then(ns => {
                                            if (!this.noise_settings.has(ns)) {
                                                this.uiInterface.logger.warn(`using minecraft:overworld`, `Noise settings unknown`)
                                                ns = "minecraft:overworld"
                                            }
                                            graphManager.setNoiseSettings(Identifier.parse(ns))
                                            this.datapack.get("worldgen/density_function", df.toString()).then(json => graphManager.loadJSON(json, df.toString()))
                                        })
                                    } else {
                                        this.uiInterface.logger.info(`using noise settings ${ns}`)
                                        graphManager.setNoiseSettings(Identifier.parse(ns))
                                        this.datapack.get("worldgen/density_function", df.toString()).then(json => graphManager.loadJSON(json, df.toString()))
                                    }
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
                                                    graphManager.setNoiseSettings(Identifier.parse(ns))
                                                    graphManager.loadJSON(json.noise_router[field], ns + "/" + field)
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
        }] : []
    }

    tryGetNoiseSettingsFromDensityFunction(df_id: string): string | string[] {
        const [namespace, path] = df_id.split(":", 2)
        const folders = path.split("/")

        for (var i = folders.length - 1; i >= 1; i--) {
            const ns_name = `${namespace}:${folders.slice(0, i).join("/")}`
            if (this.noise_settings.has(ns_name)) {
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
            if (ns_name !== undefined) {
                return ns_name
            }
        }

        return []
    }

    async datapackSave(json: any, id: string) {
        if (!this.datapack.canSave()) {
            return false
        } else {

            if (!(await this.datapack.save("worldgen/density_function", id, json))) {
                return false
            }

            this.uiInterface.logger.success(id, "Denisty function saved")

            return true
        }
    }
}