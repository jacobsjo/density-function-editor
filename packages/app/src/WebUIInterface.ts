import { UIInterface } from "df-editor-core/src/UIInterface";
import * as toastr from "toastr"

export class WebUIInterface implements UIInterface{

    logger = {
        debug(message: string | Error, title?: string): void {
            toastr.info(message as string, title)
            if (message instanceof Error){
                console.debug(message)
            }
        },

        info(message: string | Error, title?: string): void{
            toastr.info(message as string, title)
            if (message instanceof Error){
                console.log(message)
            }
        },     

        success(message: string | Error, title?: string): void{
            toastr.success(message as string, title)
            if (message instanceof Error){
                console.log(message)
            }
        },

        warn(message: string | Error, title?: string): void{
            toastr.warning(message as string, title)
            if (message instanceof Error){
                console.warn(message)
            }
        },

        error(message: string | Error, title?: string): void{
            toastr.error(message as string, title)
            if (message instanceof Error){
                console.error(message)
            }
        }
    };

    async confirm(message: string): Promise<boolean>{
       return confirm(message)
    };

    async prompt(message: string, _default?: string): Promise<string>{
        return prompt(message, _default)
    }
}