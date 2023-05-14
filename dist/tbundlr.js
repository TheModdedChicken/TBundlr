var tbundlr = (() => {
    const defines = {};
    const entry = [null];
    function define(name, dependencies, factory) {
        defines[name] = { dependencies, factory };
        entry[0] = name;
    }
    define("require", ["exports"], (exports) => {
        Object.defineProperty(exports, "__cjsModule", { value: true });
        Object.defineProperty(exports, "default", { value: (name) => resolve(name) });
    });
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    define("tbundlr", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.TBundlr = void 0;
        class TBundlr {
            constructor() {
                this._programs = new Map();
                globalThis.TBundlr = this;
            }
            test() { console.log('You successfully tested the TBundlr module! Your mother would be proud :D'); }
            readConfig(url) {
                return __awaiter(this, void 0, void 0, function* () {
                    const res = yield fetch(url);
                    const contentType = res.headers.get("content-type");
                    if (!(contentType === null || contentType === void 0 ? void 0 : contentType.includes("application/json")))
                        throw new Error(`[tbundlr:-:readConfig::content-type-mismatch] Tried reading TB config expecting 'application/json'. Got '${contentType}' instead`);
                    const config = yield res.json();
                    if (!config.$tbundlr_version)
                        throw new Error(`[tbundlr:-:readConfig::invalid-config::$tbundlr_version] Property '$tbundlr_version' not set. Config read aborted`);
                    return config;
                });
            }
            runProgram(url, options) {
                return __awaiter(this, void 0, void 0, function* () {
                    const config = yield this.readConfig(url);
                    const fileURL = new URL(config.main, url);
                    this.execute(fileURL, config, options);
                    window.dispatchEvent(new CustomEvent('tbundlr:-:runProgram', { detail: config }));
                });
            }
            execute(url, config, options) {
                var _a;
                const isJS = url.href.endsWith('.js');
                var element = document.createElement(isJS ? 'script' : 'iframe');
                element.setAttribute('type', isJS ? 'text/javascript' : 'text/html');
                element.setAttribute('src', `${url.href}`);
                if (options === null || options === void 0 ? void 0 : options.parent)
                    element = options === null || options === void 0 ? void 0 : options.parent.appendChild(element);
                else
                    element = document.body.appendChild(element);
                const pid = new Date().getTime();
                const meta = Object.assign({ type: isJS ? 'js' : 'html', element }, config);
                this._programs.set(`${pid}`, meta);
                window.dispatchEvent(new CustomEvent('tbundlr:-:execute', { detail: { pid: `${pid}`, config } }));
                if (!isJS && (options === null || options === void 0 ? void 0 : options.interop)) {
                    (_a = element.contentWindow) === null || _a === void 0 ? void 0 : _a.addEventListener("tbundlr_run:-:execute", (e) => {
                        console.log("testingdf sfgdg");
                    });
                }
            }
        }
        exports.TBundlr = TBundlr;
    });
    
    'marker:resolver';

    function get_define(name) {
        if (defines[name]) {
            return defines[name];
        }
        else if (defines[name + '/index']) {
            return defines[name + '/index'];
        }
        else {
            const dependencies = ['exports'];
            const factory = (exports) => {
                try {
                    Object.defineProperty(exports, "__cjsModule", { value: true });
                    Object.defineProperty(exports, "default", { value: require(name) });
                }
                catch (_a) {
                    throw Error(['module "', name, '" not found.'].join(''));
                }
            };
            return { dependencies, factory };
        }
    }
    const instances = {};
    function resolve(name) {
        if (instances[name]) {
            return instances[name];
        }
        if (name === 'exports') {
            return {};
        }
        const define = get_define(name);
        if (typeof define.factory !== 'function') {
            return define.factory;
        }
        instances[name] = {};
        const dependencies = define.dependencies.map(name => resolve(name));
        define.factory(...dependencies);
        const exports = dependencies[define.dependencies.indexOf('exports')];
        instances[name] = (exports['__cjsModule']) ? exports.default : exports;
        return instances[name];
    }
    if (entry[0] !== null) {
        return resolve(entry[0]);
    }
})();