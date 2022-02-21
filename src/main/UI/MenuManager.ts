import { GraphManager } from "./GraphManager"

export class MenuManager {

    static fileHandle: FileSystemFileHandle
    static fileName: string = "density_function.json"


    static addHandlers() {
        const save_button = document.getElementById("menu-button-save")

        document.getElementById("menu-button-new").onclick = async () => {
            GraphManager.clear()
            this.fileHandle = undefined
            this.fileName = "density_function.json"
            save_button.classList.add("disabled")
        }

        document.getElementById("menu-button-open").onclick = async () => {
            if ("showOpenFilePicker" in window) {
                [this.fileHandle] = await window.showOpenFilePicker({
                    types: [
                        {
                            description: "All JSON files",
                            accept: {
                                "application/json": [".json"]
                            }
                        }
                    ]
                })
                this.fileName = this.fileHandle.name

                const file = await this.fileHandle.getFile()
                const jsonString = await file.text()
                GraphManager.loadJSON(JSON.parse(jsonString))
                save_button.classList.remove("disabled")

            } else {
                const input = document.createElement('input') as HTMLInputElement
                input.type = 'file'
                input.accept = '.json'

                input.onchange = (evt) => {
                    const file = (evt.target as HTMLInputElement).files[0]

                    const reader = new FileReader();
                    reader.readAsText(file, 'UTF-8')

                    reader.onload = (evt: ProgressEvent<FileReader>) => {
                        this.fileHandle = undefined
                        this.fileName = file.name
                        const jsonString = evt.target.result as string
                        GraphManager.loadJSON(JSON.parse(jsonString))
                    }
                }

                input.click()
            }

        }

        document.getElementById("menu-button-save-as").onclick = async () =>{
            const jsonString = JSON.stringify(GraphManager.getJSON())
            if ("showSaveFilePicker" in window){
                this.fileHandle = await window.showSaveFilePicker(
                    {types: [
                        {
                            description: "All JSON files",
                            accept: {
                                "application/json": [".json"]
                            }
                        }
                    ], suggestedName: this.fileName
                } )
                this.fileName = this.fileHandle.name
                const writable = await this.fileHandle.createWritable()
                await writable.write(jsonString)
                await writable.close()

                save_button.classList.remove("disabled")
            } else {
                const bb = new Blob([jsonString], {type: 'text/plain'})
                const a = document.createElement('a')
                a.download = this.fileName
                a.href = window.URL.createObjectURL(bb)
                a.click()
            }
        }

        save_button.onclick = async () => {
            if (this.fileHandle){
                const jsonString = JSON.stringify(GraphManager.getJSON())

                const writable = await this.fileHandle.createWritable()
                await writable.write(jsonString)
                await writable.close()
            }
        }        
    }
}