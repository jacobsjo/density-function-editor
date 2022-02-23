import { GraphManager } from "./GraphManager"
import { Datapack, FileListDatapack, FileSystemDirectoryDatapack } from 'mc-datapack-loader'
import { DatapackManager } from "../DatapackManager"
import { IContextMenuOptions, LiteGraph } from "litegraph.js"

export class MenuManager {
    static save_button: HTMLElement

    static addHandlers() {
        this.save_button = document.getElementById("menu-button-save")

        document.getElementById("menu-button-new").onclick = async () => {
            if (DatapackManager.datapack !== undefined){
                const id = prompt("Create density function with id", "minecraft:")
                GraphManager.clear(id, (jsonString) => {
                    return DatapackManager.datapackSave(jsonString, id)
                })
            } else {
                GraphManager.clear()
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

            DatapackManager.openDatapack(datapack)

        }

        const load = (jsonString: string, save_function?: (jsonString: string) => Promise<boolean>) => {
            const json = JSON.parse(jsonString)

            if (json.noise_router !== undefined) {
                var menu_info: any = []
                Object.keys(json.noise_router).forEach((element) => menu_info.push({
                    content: element,
                    callback: () => {
                        GraphManager.loadJSON(json.noise_router[element])
                        DatapackManager.closeDatapacks()
                    }
                }))
                const options = { top: 200, left: 200 }
                const e = console.error
                console.error = () => { }
                var menu = new LiteGraph.ContextMenu(menu_info, options as IContextMenuOptions, GraphManager.canvas.getCanvasWindow());
                console.error = e
            } else {
                GraphManager.loadJSON(json, save_function)
                DatapackManager.closeDatapacks()
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
                load(jsonString, async (jsonString: string) => {
                    const writable = await fileHandle.createWritable()
                    await writable.write(jsonString)
                    await writable.close()
                    return true
                })
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
            await this.saveAs()
        }

        this.save_button.onclick = async () => {
            await this.save()
        }
    }

    static async save() {
        const jsonString = GraphManager.getJsonString()
        if (await GraphManager.save(jsonString)) {
            GraphManager.setSaved()
        } else {
            this.saveAs()
        }
    }

    static async saveAs() {
        const jsonString = GraphManager.getJsonString()
        if (jsonString === undefined)
            return
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
                    ]
                })
            const writable = await fileHandle.createWritable()
            await writable.write(jsonString)
            await writable.close()

            GraphManager.setSaved()
        } else {
            const bb = new Blob([jsonString], { type: 'text/plain' })
            const a = document.createElement('a')
            a.download = GraphManager.id ? GraphManager.id.substr(GraphManager.id.lastIndexOf("/") + 1) + ".json" : "density_function.json" 
            a.href = window.URL.createObjectURL(bb)
            a.click()
            GraphManager.setSaved()
        }
    }
}