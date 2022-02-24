import { DensityFunction, lerp } from "deepslate";


export abstract class PreviewMode{
    constructor(cellWidth: number){}

    abstract getContext(ax: number, ay: number): DensityFunction.Context
}

export namespace PreviewMode{

    export class CellAlignedXY implements PreviewMode{
        constructor(
            private cellWidth: number
        ){}

        getContext(ax: number, ay: number): DensityFunction.Context {
            return {
                x: ax * this.cellWidth * 200,
                y: 0,
                z: ay * this.cellWidth * 200,
            }
        }
    }

    export class SemiCellAlignedProfile implements PreviewMode {
        constructor(
            private cellWidth: number,
        ){}

        getContext(ax: number, ay: number): DensityFunction.Context {
            return {
                x: ax * this.cellWidth * 200,
                y: lerp( 1 - ay, -64, 128),
                z: 0
            }
        }
    }

    export class Profile implements PreviewMode {
        getContext(ax: number, ay: number): DensityFunction.Context {
            return {
                x: lerp(ax, 0, 256),
                y: lerp(ay, -64, 192),
                z: 0
            }
        }

    }

    export const PREVIEW_MODES = [CellAlignedXY, SemiCellAlignedProfile, Profile]
}