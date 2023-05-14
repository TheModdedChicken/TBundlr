declare module "tbundlr" {
    class TBundlr {
        private _programs;
        constructor();
        test(): void;
        emitProgramEvent(type: string, body: any, pid?: string): void;
        readConfig(url: URL): Promise<ITBConfig>;
        runProgram(url: URL, options?: {
            parent?: HTMLElement;
            interop?: boolean;
        }): Promise<void>;
        execute(url: URL, options?: {
            config?: ITBConfig;
            parent?: HTMLElement;
            interop?: boolean;
        }): void;
    }
    interface ITBConfig {
        $tbundlr_version: number;
        id?: string;
        author?: string;
        description?: string;
        main: string;
        window?: {
            width?: number;
            height?: number;
        };
    }
    export { TBundlr };
}
//# sourceMappingURL=tbundlr.d.ts.map