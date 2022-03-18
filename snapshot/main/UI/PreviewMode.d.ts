import { DensityFunction } from "deepslate";
export declare class PreviewMode {
    protected cellWidth: number;
    static display_name: string;
    constructor(cellWidth: number);
    getContext(ax: number, ay: number): DensityFunction.Context;
    getColor(value: number, min: number, max: number): [number, number, number];
}
export declare namespace PreviewMode {
    class XY extends PreviewMode {
        static display_name: string;
        getContext(ax: number, ay: number): DensityFunction.Context;
    }
    class Profile extends PreviewMode {
        static display_name: string;
        getContext(ax: number, ay: number): DensityFunction.Context;
    }
    class ProfileSolid extends Profile {
        static display_name: string;
        getColor(value: number, min: number, max: number): [number, number, number];
    }
    const PREVIEW_MODES: (typeof PreviewMode.XY | typeof PreviewMode.Profile | typeof PreviewMode.ProfileSolid)[];
}
//# sourceMappingURL=PreviewMode.d.ts.map