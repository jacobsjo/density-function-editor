import { NumberFunction } from "deepslate";

export const IdentityNumberFunction: NumberFunction<number> = {
    compute(c: number): number {
        return c
    }
}