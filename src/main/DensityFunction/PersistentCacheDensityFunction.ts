import { DensityFunction, NoiseRouter } from "deepslate";


export class PersistentCacheDensityFunction extends DensityFunction{
    constructor(
        private wrapped?: DensityFunction,
        private cache: Map<string, number> = new Map<string, number>(),
        private wrapper?: () => DensityFunction
    ){
        super()
    }

    public compute(context: DensityFunction.Context): number {
        const context_string = `${context.x} ${context.y} ${context.z}`
        if (this.cache.has(context_string)){
            return this.cache.get(context_string)
        } else {
            if (this.wrapped === undefined){
                this.wrapped = this.wrapper()
            }
            const density = this.wrapped.compute(context)
            this.cache.set(context_string, density)
            return density
        }
    }

    public mapAll(visitor: DensityFunction.Visitor){
        return new PersistentCacheDensityFunction(undefined, this.cache, () => this.wrapped.mapAll(visitor))
    }

    public minValue() {
        if (this.wrapped === undefined){
            this.wrapped = this.wrapper()
        }
        const min = this.wrapped.minValue()
        return min
    }
    public maxValue() {
        if (this.wrapped === undefined){
            this.wrapped = this.wrapper()
        }
        const max = this.wrapped.maxValue()
        return max
    }
}