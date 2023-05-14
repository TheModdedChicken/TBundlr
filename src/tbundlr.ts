class TBundlr {
  private _programs: Map<string, ITBProgram> = new Map()

  constructor () { 
    window.addEventListener("message", (e) => {
      const data: ITBInteropData = e.data;
      const cmd = data.cmd;

      if (cmd in InteropCommands) InteropCommands[cmd](data, this);
    });
  }

  test () {console.log('You successfully tested the TBundlr module! Your mother would be proud :D')}

  emitProgramEvent (type: string, body: any, pid?: string) {
    const program = this._programs.get(pid || "");
    if (!program) console.warn(`[tbundlr_warn:-:emitProgramEvent::invalid_pid] Couldn't find program with ID of '${pid}'`);

    const message = {
      pid,
      cmd: type,
      body
    };

    if (!program || program.type === "js") window.postMessage(message, "*");
    else (program.element as HTMLIFrameElement).contentWindow?.postMessage(message, "*");
  }

  async readConfig (url: URL) {
    const res = await fetch(url);
    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) throw new Error(
      `[tbundlr:-:readConfig::content-type-mismatch] Tried reading TB config expecting 'application/json'. Got '${contentType}' instead`
    );

    const config: ITBConfig = await res.json();
    if (!config.$tbundlr_version) throw new Error(
      `[tbundlr:-:readConfig::invalid-config::$tbundlr_version] Property '$tbundlr_version' not set. Config read aborted`
    );

    return config;
  }

  async runProgram(
    url: URL, 
    options?: { 
      parent?: HTMLElement, 
      interop?: boolean 
    }
  ) {
    const config: ITBConfig = await this.readConfig(url);

    const fileURL = new URL(config.main, url);
    this.execute(fileURL, { config, ...options });
  }

  execute (
    url: URL,
    options?: {
      config?: ITBConfig,
      parent?: HTMLElement,
      interop?: boolean
    },
  ) {
    const isJS = url.href.endsWith('.js');

    var element = document.createElement(isJS ? 'script' : 'iframe');
    element.setAttribute('type', isJS ? 'text/javascript' : 'text/html');
    element.setAttribute('src', `${url.href}`);

    if (options?.parent) element = options?.parent.appendChild(element);
    else element = document.body.appendChild(element);

    const pid = new Date().getTime();
    const meta: ITBProgram = {
      type: isJS ? 'js' : 'html',
      element,
      $tbundlr_version: 1,
      main: url.href,
      ...options?.config
    };

    // Add program to Map
    this._programs.set(`${pid}`, meta);

    // Send execute event to new IFrame
    if (!isJS && options?.interop) (element as HTMLIFrameElement).addEventListener(
      "load", 
      () => this.emitProgramEvent('tbundlr_event:-:execute', { ...meta, element: undefined }, `${pid}`)
    );
  }
}

function parseTTScript (script: string) {
  return typeof trustedTypes !== 'undefined' ? 
  trustedTypes.createPolicy("ppjs", { createScript: (string: string) => string }).createScript(script) : script
}

const InteropCommands: { [x in keyof any]: (data: ITBInteropData, bundler: TBundlr) => void } = {
  "tbundlr_cmd:-:test": (data, bundler: TBundlr) => {
    bundler.emitProgramEvent("tbundlr_event:-:test", true, data.pid)
  },
  "tbundlr_cmd:-:eval": (data: ITBInteropData) => {
    const body: string = data.body;
    eval( parseTTScript(body) )
  },
  "tbundlr_cmd:-:create_script": () => {
    console.log("Recieved 'tbundlr_program:-:create_script'")
  }
}

interface ITBConfig {
  $tbundlr_version: number
  id?: string
  author?: string
  description?: string
  main: string // Can either end with .html or .js
  window?: { // Only for webpage embeds (.html)
    width?: number
    height?: number
  }
}

interface ITBProgram extends ITBConfig {
  type: "html" | "js"
  element: HTMLElement
}

interface ITBInteropData {
  pid?: string
  cmd: string,
  body?: any
}

export {
  TBundlr
}