import { DensityFunction } from "deepslate";
import { PersistentCacheDensityFunction } from "./DensityFunction/PersistentCacheDensityFunction";



export abstract class Warning{
    constructor(
        protected readonly df: DensityFunction
    ){}
    abstract getWarning(): string
    abstract getDescription(): string
}

export namespace Warning{

    export function create(df: DensityFunction): Warning{
        if (df instanceof PersistentCacheDensityFunction){
            df = df.getWrapped()
        }
        if (df === undefined){
            return undefined
        }

        if (df instanceof DensityFunction.Mapped){
            switch (df.type){
                case "abs":
                case "half_negative":
                case "quarter_negative":
                    return new AbsPositiveWarning(df)
            }
        }

        if (df instanceof DensityFunction.Ap2){
            switch (df.type){
                case "add":
                    return new AddWarning(df)
                case "mul":
                    return new MulWarning(df)
                case "min":
                case "max":
                    return new NonOverlappingWarning(df)
            }
        }

        //TODO (maybe):
        // cache_2d
        // noise (sampling size 0)
        // weird scaled sampler
        // range_choice
        // clamp

        return new NoWarning(df)
    }

    export class NoWarning extends Warning{
        getWarning(): string {
            return ""
        }
        getDescription(): string {
            return ""
        }
    }

    export class NonOverlappingWarning extends Warning{
        declare protected df: DensityFunction.Ap2

        private doWarn(){
			const min1 = this.df.argument1.minValue()
			const min2 = this.df.argument2.minValue()
			const max1 = this.df.argument1.maxValue()
			const max2 = this.df.argument2.maxValue()

            return min1 >= max2 || min2 >= max1
        }

        getWarning(): string {
            return this.doWarn() ? "Non Overlapping Inputs" : ""
        }
        getDescription(): string {
			const min1 = this.df.argument1.minValue()
			const min2 = this.df.argument2.minValue()
			const max1 = this.df.argument1.maxValue()
			const max2 = this.df.argument2.maxValue()

            return this.doWarn() ? `[${min1.toFixed(2)}, ${max1.toFixed(2)}] and [${min2.toFixed(2)}, ${max2.toFixed(2)}] do not overlap` : ""
        }
    }

    export class AbsPositiveWarning extends Warning{
        declare protected df: DensityFunction.Mapped

        getWarning(): string {
			const min = this.df.input.minValue()
            return min >= 0 ? "Input is always positive" : ""
        }

        getDescription(): string {
			const min = this.df.input.minValue()
			const max = this.df.input.maxValue()
            return min >= 0 ? `${this.df.type} has no effect on input in range [${min.toFixed(2)}, ${max.toFixed(2)}]` : ""
        }
    }

    export class AddWarning extends Warning{
        declare protected df: DensityFunction.Ap2

        private getWarningInput(){
            if (this.df.argument1.minValue() === 0 && this.df.argument1.maxValue() === 0) return 1
            if (this.df.argument2.minValue() === 0 && this.df.argument2.maxValue() === 0) return 2
            return 0
        }

        getWarning(): string {
            const warningInput = this.getWarningInput()
            return warningInput ? `Argument ${warningInput} is always 0` : ""
        }

        getDescription(): string {
            return ""
        }

    }

    export class MulWarning extends Warning{
        declare protected df: DensityFunction.Ap2

        private getWarningInput(){
            if (this.df.argument1.minValue() === 0 && this.df.argument1.maxValue() === 0) return [1,0]
            if (this.df.argument2.minValue() === 0 && this.df.argument2.maxValue() === 0) return [2,0]
            if (this.df.argument1.minValue() === 1 && this.df.argument1.maxValue() === 1) return [1,1]
            if (this.df.argument2.minValue() === 1 && this.df.argument2.maxValue() === 1) return [2,1]
            return false
        }

        getWarning(): string {
            const warningInput = this.getWarningInput()
            return warningInput ? `Argument ${warningInput[0]} is always ${warningInput[1]}` : ""
        }

        getDescription(): string {
            return ""
        }
    }

}
