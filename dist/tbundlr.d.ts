export declare class TBundlr {
    private _programs;
    constructor();
    test(): void;
    readConfig(url: URL): Promise<ITBConfig>;
    runProgram(url: URL, options?: {
        parent?: HTMLElement;
    }): Promise<void>;
    execute(url: URL, config: ITBConfig, parent?: HTMLElement): void;
}
interface ITBConfig {
    $tbundlr_version: number;
    id: string;
    author: string;
    description: string;
    main: string;
    window?: {
        width?: number;
        height?: number;
    };
}
export {};
//# sourceMappingURL=tbundlr.d.ts.map