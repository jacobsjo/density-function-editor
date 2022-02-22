/// <reference types="wicg-file-system-access" />
export declare class MenuManager {
    static fileHandle: FileSystemFileHandle;
    static fileName: string;
    static edited: boolean;
    static save_button: HTMLElement;
    static addHandlers(): void;
    static save(): Promise<void>;
    static saveAs(): Promise<void>;
    static setEdited(force?: boolean): void;
}
//# sourceMappingURL=MenuManager.d.ts.map