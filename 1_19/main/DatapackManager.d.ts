import { Identifier, NoiseGeneratorSettings } from "deepslate";
import { IContextMenuItem } from "litegraph.js";
import { CompositeDatapack, Datapack } from "mc-datapack-loader";
export declare class DatapackManager {
    static datapack: CompositeDatapack;
    static vanilla_datapack: Datapack;
    static noise_settings: Map<string, NoiseGeneratorSettings>;
    static init(version: string): Promise<void>;
    static openDatapack(datapack: Datapack): Promise<void>;
    static reload(): Promise<void>;
    static closeDatapacks(): Promise<void>;
    static getMenuOptions(): IContextMenuItem[];
    static tryGetNoiseSettingsFromDensityFunction(df_id: string): string | string[];
    static datapackSave(json: any, id: Identifier): Promise<boolean>;
}
//# sourceMappingURL=DatapackManager.d.ts.map