import { GraphManager } from "./GraphManager"

export class MenuManager {

    static fileHandle: FileSystemFileHandle
    static fileName: string = "density_function.json"

    static edited: boolean = false
    static save_button: HTMLElement

    static addHandlers() {
        this.save_button = document.getElementById("menu-button-save")

        document.getElementById("menu-button-new").onclick = async () => {
            if (this.edited && !confirm("You have unsaved changes, continue?")){
                return
            }
            GraphManager.clear()
            this.fileHandle = undefined
            this.fileName = "density_function.json"
            this.save_button.classList.add("disabled")
            this.edited = false
        }

        document.getElementById("menu-button-open").onclick = async () => {
            if (this.edited && !confirm("You have unsaved changes, continue?")){
                return
            }
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

                const file = await this.fileHandle.getFile()
                const jsonString = await file.text()
                if (GraphManager.loadJSON(JSON.parse(jsonString))){
                    this.fileName = this.fileHandle.name
                    this.save_button.classList.remove("disabled")
                } else {
                    this.fileHandle = undefined
                    this.fileName = "density_function.json"
                    this.save_button.classList.add("disabled")
                }
                this.edited = false

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
                        this.fileHandle = undefined
                        if (GraphManager.loadJSON(JSON.parse(jsonString))){
                            this.fileName = file.name
                        } else {
                            this.fileName = "density_function.json"
                        }
                        this.edited = false
                    }
                }

                input.click()
            }

        }

        document.getElementById("menu-button-save-as").onclick = async () =>{
            await this.saveAs()
        }

        this.save_button.onclick = async () => {
            await this.save()
        }        
    }

    static async save(){
        if (this.fileHandle){
            const jsonString = JSON.stringify(GraphManager.getJSON(), null, 2)

            const writable = await this.fileHandle.createWritable()
            await writable.write(jsonString)
            await writable.close()
            this.edited = false
        } else {
            this.saveAs()
        }
    }

    static async saveAs(){
        const jsonString = JSON.stringify(GraphManager.getJSON(), null, 2)
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

            this.edited = false
            this.save_button.classList.remove("disabled")
        } else {
            const bb = new Blob([jsonString], {type: 'text/plain'})
            const a = document.createElement('a')
            a.download = this.fileName
            a.href = window.URL.createObjectURL(bb)
            a.click()
            this.edited = false
        }
    }

    static setEdited(force: boolean = true){
        this.edited = force
    }
}