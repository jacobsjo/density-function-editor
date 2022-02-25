import { DensityFunction, lerp } from "deepslate";



export class PreviewMode{
    static display_name = "Preview Mode"

    constructor(
        protected cellWidth: number){}

    getContext(ax: number, ay: number): DensityFunction.Context {
        return {
            x: 0,
            y: 0,
            z: 0
        }
    }

    getColor(value: number, min: number, max: number): [number, number, number] {
        if (min === max) return [128,128,128]
        const color = Math.clamp((Math.floor(((value - min) / (max - min)) * 256)), 0, 255)
        return [color, color, color]
    }

}

export namespace PreviewMode{
    export class XY extends PreviewMode{
        static display_name = "Top"
        getContext(ax: number, ay: number): DensityFunction.Context {
            return {
                x: ax * this.cellWidth * 200,
                y: 0,
                z: ay * this.cellWidth * 200,
            }
        }
    }

    export class Profile extends PreviewMode {
        static display_name = "Profile"
        getContext(ax: number, ay: number): DensityFunction.Context {
            return {
                x: ax * this.cellWidth * 200,
                y: Math.floor((1 - ay) * 200 - 64),
                z: 0
            }
        }
    }

    export class ProfileSolid extends Profile {
        static display_name = "Profile (Solid)"
        getColor(value: number, min: number, max: number): [number, number, number]{
            const scale = 1
            if (value < 0){
                const v = Math.clamp(Math.floor(-value / scale * 256), 0, 255)
                return [0,0,v]
            } else {
                const v = Math.clamp(Math.floor((1 - (value / scale)) * 256), 0, 255)
                return [255,v,v]
            }
        }

    }

    export const PREVIEW_MODES: (typeof PreviewMode.XY | typeof PreviewMode.Profile | typeof PreviewMode.ProfileSolid)[] = [PreviewMode.XY, PreviewMode.Profile, PreviewMode.ProfileSolid]
}
