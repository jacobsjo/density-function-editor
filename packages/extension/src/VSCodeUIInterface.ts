import { UIInterface } from "df-editor-core/src/UIInterface";
//import * as vscode from 'vscode';


export class VSCodeUIInterface implements UIInterface{

    constructor(
        private readonly vscode: any
    ){ }

    logger = {
        debug(message: string | Error, title?: string): void {
            //vscode.window.showInformationMessage(title + "\n" + (message as string))
            if (message instanceof Error){
                console.debug(message)
            }
        },

        info(message: string | Error, title?: string): void{
            //vscode.window.showInformationMessage(title + "\n" + (message as string))
            if (message instanceof Error){
                console.log(message)
            }
        },     

        success(message: string | Error, title?: string): void{
            //vscode.window.showInformationMessage(title + "\n" + (message as string))
            if (message instanceof Error){
                console.log(message)
            }
        },

        warn(message: string | Error, title?: string): void{
            //vscode.window.showWarningMessage(title + "\n" + (message as string))
            if (message instanceof Error){
                console.warn(message)
            }
        },

        error(message: string | Error, title?: string): void{
            //vscode.window.showErrorMessage(title + "\n" + (message as string))
            if (message instanceof Error){
                console.error(message)
            }
        }
    };

    async confirm(message: string): Promise<boolean>{
       return true;// (await vscode.window.showInformationMessage(message, "Yes", "No")) === "Yes"
    };

    async prompt(message: string, _default?: string): Promise<string>{
        return ""/* await vscode.window.showInputBox({
            placeHolder: "",
            prompt: message,
            value: _default
          });*/
    }
}