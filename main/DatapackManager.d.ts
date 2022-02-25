import { NoiseSettings } from "deepslate";
import { IContextMenuItem } from "litegraph.js";
import { CompositeDatapack, Datapack } from "mc-datapack-loader";
export declare class DatapackManager {
    static datapack: CompositeDatapack;
    static vanilla_datapack: Datapack;
    static noise_settings: Map<string, NoiseSettings>;
    static init(): Promise<void>;
    static openDatapack(datapack: Datapack): Promise<void>;
    static register(datapack: Datapack): Promise<void>;
    static closeDatapacks(): Promise<void>;
    static getMenuOptions(): IContextMenuItem[];
    static tryGetNoiseSettingsFromDensityFunction(df_id: string): string | NoiseSettings;
    static datapackSave(jsonString: string, id: string): Promise<boolean>;
}
//# sourceMappingURL=DatapackManager.d.ts.map