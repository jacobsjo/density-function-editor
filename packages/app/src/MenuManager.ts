import { DatapackManager } from "df-editor-core/src/DatapackManager"
import { GraphManager } from 'df-editor-core/src/UI/GraphManager'
import { Datapack, FileListDatapack, FileSystemDirectoryDatapack } from 'mc-datapack-loader'
import { IContextMenuOptions, LiteGraph } from "litegraph.js"
import { DensityFunction, Identifier, WorldgenRegistries } from "deepslate"

import * as toastr from "toastr"
import { parse, stringify } from "comment-json"

export class MenuManager {
    static save_button: HTMLElement

    static addHandlers(datapackManager: DatapackManager, graphManager: GraphManager) {
        this.save_button = document.getElementById("menu-button-save")

        document.getElementById("menu-button-new").onclick = async () => {
            if (datapackManager.getDatapack() !== undefined) {
                graphManager.clear()
            } else {
                graphManager.clear()
            }
        }

        document.getElementById("menu-button-open-datapack").onclick = async () => {
            var datapack: Datapack

            if ("showDirectoryPicker" in window) {
                datapack = new FileSystemDirectoryDatapack(await window.showDirectoryPicker())
            } else {
                datapack = await new Promise<Datapack>((resolve) => {
                    const input: any = document.createElement('input')
                    input.type = 'file'
                    input.webkitdirectory = true

                    input.onchange = async () => {
                        resolve(new FileListDatapack(Array.from(input.files)))
                    }
                    input.click()
                })
            }

            datapackManager.openDatapack(datapack)
            toastr.success(`Open density functions from context menu`, 'Datapack opened')
        }

        const load = (jsonString: string) => {
            try {
                const json = parse(jsonString) as any

                if (json.noise_router !== undefined) {
                    var menu_info: any = []
                    Object.keys(json.noise_router).forEach((element) => menu_info.push({
                        content: element,
                        callback: () => {
                            graphManager.loadJSON(json.noise_router[element])
                            datapackManager.closeDatapacks()
                        }
                    }))
                    const options = { top: 200, left: 200 }
                    const e = console.error
                    console.error = () => { }
                    var menu = new LiteGraph.ContextMenu(menu_info, options as IContextMenuOptions, graphManager.canvas.getCanvasWindow());
                    console.error = e
                } else {
                    graphManager.loadJSON(json)
                    datapackManager.closeDatapacks()
                }
            } catch (e) {
                toastr.error(e, "Could not load file")
            }

        }

        document.getElementById("menu-button-open-file").onclick = async () => {
            if ("showOpenFilePicker" in window) {
                const [fileHandle] = await window.showOpenFilePicker({
                    types: [
                        {
                            description: "All JSON files",
                            accept: {
                                "application/json": [".json"]
                            }
                        }
                    ]
                })

                const file = await fileHandle.getFile()
                const jsonString = await file.text()
                load(jsonString)
            } else {
                const input = document.createElement('input') as HTMLInputElement
                input.type = 'file'
                input.accept = '.json'

                input.onchange = (evt) => {
                    const file = (evt.target as HTMLInputElement).files[0]

                    const reader = new FileReader();
                    reader.readAsText(file, 'UTF-8')

                    reader.onload = (evt: ProgressEvent<FileReader>) => {
                        const jsonString = evt.target.result as string
                        load(jsonString)
                    }
                }

                input.click()
            }

        }

        document.getElementById("menu-button-save-as").onclick = async () => {
            graphManager.id = (await this.save(undefined, graphManager, graphManager.id)) ?? graphManager.id
        }

        this.save_button.onclick = async () => {
            await this.save(datapackManager, graphManager, graphManager.id)
        }

        document.getElementById("menu-button-reload").onclick = async () => {
            await datapackManager.reload()
            graphManager.reload()
            toastr.success("Reload successfull")
        }

        document.getElementById("menu-button-autolayout").onclick = () => {
            if (confirm("This will delete all unconnected nodes. Continue?")){
                graphManager.autoLayout()
            }
        }

        document.body.onkeydown = (ev: KeyboardEvent) => {
            if (ev.key === "s" && (ev.ctrlKey || ev.metaKey)){
                this.save(datapackManager, graphManager)
            } else {
                graphManager.onKeyDown(ev)
            }
        }

    }

    static async save(datapackManager: DatapackManager, graphManager: GraphManager,  id?: string, suggested_id?: string): Promise<string> {
        if (datapackManager.getDatapack().canSave()) {
            datapackManager.getDatapack().prepareSave()
        }

        const output = graphManager.getOutput()
        if (output.error && !confirm("Some nodes have unconnected inputs, the resulting JSON will be invalid. Continue?"))
            return undefined

        if (datapackManager.getDatapack().canSave()) {
            if (id === undefined || id === "") {
                const input_id = prompt("Set id of density function", suggested_id ?? "minecraft:")

                if (input_id === null) {
                    return undefined
                }
                id = input_id
                try {
                    Identifier.parse(input_id)
                } catch (e) {
                    toastr.error("not saved", "Invalid identifier")
                    return undefined
                }
            }
            if (await datapackManager.datapackSave(output.json, id)) {
                graphManager.setSaved()
                WorldgenRegistries.DENSITY_FUNCTION.register(Identifier.parse(id), DensityFunction.fromJson(output.json)) //create new DensityFunction without all the caching...
            } else {
                toastr.error("Saving unsuccessfull")
                return undefined
            }
        } else {
            const jsonString = stringify(output.json, null, 2)

            id ??= suggested_id // id and suggested id should behave identically when user interaction is nessecarry anyways
            if ("showSaveFilePicker" in window) {
                const fileHandle = await window.showSaveFilePicker(
                    {
                        types: [
                            {
                                description: "All JSON files",
                                accept: {
                                    "application/json": [".json"]
                                }
                            }
                        ],
                        suggestedName: id ? id.substr(id.lastIndexOf("/") + 1) + ".json" : "density_function.json"
                    })
                const writable = await fileHandle.createWritable()
                await writable.write(jsonString)
                await writable.close()

                graphManager.setSaved()
            } else {
                const bb = new Blob([jsonString], { type: 'text/plain' })
                const a = document.createElement('a')
                a.download = id ? id.substr(id.lastIndexOf("/") + 1) + ".json" : "density_function.json"
                a.href = window.URL.createObjectURL(bb)
                a.click()
                graphManager.setSaved()
            }
        }
        return id
    }
}