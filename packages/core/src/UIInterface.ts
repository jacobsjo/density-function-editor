
export interface UIInterface {
    logger: {
        debug: (message: string | Error, title?: string) => void,
        info: (message: string | Error, title?: string) => void,
        success: (message: string | Error, title?: string) => void,
        warn: (message: string | Error, title?: string) => void,
        error: (message: string | Error, title?: string) => void
    }

    confirm: (message: string) => boolean
    prompt: (message: string, preset?: string) => string
}