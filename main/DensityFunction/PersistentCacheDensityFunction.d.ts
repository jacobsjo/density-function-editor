import { DensityFunction } from "deepslate";
export declare class PersistentCacheDensityFunction extends DensityFunction {
    private wrapped?;
    private cache;
    private wrapper?;
    constructor(wrapped?: DensityFunction, cache?: Map<string, number>, wrapper?: () => DensityFunction);
    compute(context: DensityFunction.Context): number;
    mapAll(visitor: DensityFunction.Visitor): PersistentCacheDensityFunction;
    minValue(): number;
    maxValue(): number;
    getWrapped(): DensityFunction | undefined;
}
//# sourceMappingURL=PersistentCacheDensityFunction.d.ts.map