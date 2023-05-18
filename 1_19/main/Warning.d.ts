import { DensityFunction } from "deepslate";
export declare abstract class Warning {
    protected readonly df: DensityFunction;
    constructor(df: DensityFunction);
    abstract getWarning(): string;
    abstract getDescription(): string;
}
export declare namespace Warning {
    function create(df: DensityFunction): Warning | undefined;
    class NoWarning extends Warning {
        getWarning(): string;
        getDescription(): string;
    }
    class NonOverlappingWarning extends Warning {
        protected df: DensityFunction.Ap2;
        private doWarn;
        getWarning(): string;
        getDescription(): string;
    }
    class AbsPositiveWarning extends Warning {
        protected df: DensityFunction.Mapped;
        getWarning(): string;
        getDescription(): string;
    }
    class AddWarning extends Warning {
        protected df: DensityFunction.Ap2;
        private getWarningInput;
        getWarning(): string;
        getDescription(): string;
    }
    class MulWarning extends Warning {
        protected df: DensityFunction.Ap2;
        private getWarningInput;
        getWarning(): string;
        getDescription(): string;
    }
}
//# sourceMappingURL=Warning.d.ts.map