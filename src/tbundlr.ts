class TBundlr {
  private _programs: Map<string, ITBProgram> = new Map()

  constructor () { 
    console.log(
      "%c[TBundlr] NOTICE: Programs loaded with TBundlr cannot be guaranteed as safe. Please be wary of what you run.",
      `
        font-weight: 700;
        color: black;
        background: red;
      `
    )

    window.addEventListener("message", (e) => {
      const program = this._programs.get(e.data.pid);
      console.log(e.data)
      if (!e.data.pid || !program) throw new Error("[tbundlr_err:-:message_eventListener::invalid_pid] A message was received from an unknown program. Aborted message processing");
      if (!e.data.token) throw new Error(
        `[tbundlr_err:-:message_eventListener::invalid_token] A message was received from program with ID of '${e.data.pid}', but no token was provided. Aborted message processing`
      );

      const data: ITBInteropData = e.data;
      const cmd = data.cmd;

      if (program.token !== data.token) throw new Error(
        `[tbundlr_err:-:message_eventListener::invalid_token] A message was received from program with ID of '${e.data.pid}', but the token provided was invalid. Aborted message processing`
      );

      // TO-DO: Update errors to provide programs with error info
      // TO-DO: Improve domain-message security

      if (cmd in InteropCommands) {
        const cmdData = InteropCommands[cmd];
        if (this._programs.get(data.pid)?.meta.interop) InteropCommands[cmd].func(data, this);
        else if (cmdData.auth === "low") InteropCommands[cmd].func(data, this);
        else throw new Error(
          `[tbundlr_err:-:message_eventListener::unauthorized] A message was received from program with ID of '${e.data.pid}', but it does not have sufficient authorization. Aborted message processing`
        );
      };
    });
  }

  test () {console.log('You successfully tested the TBundlr module! Your mother would be proud :D')}

  postMessage (event: string, body: any, auth: { pid: string, token: string }) {
    const program = this._programs.get(auth.pid);
    if (!program) throw new Error(`[tbundlr_err:-:emitProgramEvent::invalid_pid] Couldn't find program with ID of '${auth.pid}'`);

    const message = {
      pid: auth.pid,
      cmd: event,
      body
    };

    switch (program.meta.type) {
      case "js": {
        program.element.dispatchEvent(
          new CustomEvent(event, { detail: message })
        );
        break;
      }

      case "html": {
        (program.element as HTMLIFrameElement).contentWindow?.postMessage(
          {
            token: auth.token,
            ...message
          }, 
          new URL(program.meta.main).origin
        );
        break;
      }
    }
  }

  broadcastMessage () {
    
  }

  async readConfig (url: URL) {
    const res = await fetch(url);
    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) throw new Error(
      `[tbundlr_err:-:readConfig::content-type-mismatch] Tried reading TB config expecting 'application/json'. Got '${contentType}' instead`
    );

    const config: ITBConfig = await res.json();
    if (!config.$tbundlr_version) throw new Error(
      `[tbundlr_err:-:readConfig::invalid-config::$tbundlr_version] Property '$tbundlr_version' not set. Config read aborted`
    );

    return config;
  }

  async runProgram(
    url: URL, 
    options?: ITBProgramOptions
  ) {
    const config: ITBConfig = await this.readConfig(url);

    const fileURL = new URL(config.main, url);
    this.execute(fileURL, config, options);
  }

  execute (
    url: URL,
    config: ITBConfig,
    options?: ITBProgramOptions,
  ) {
    const isJS = url.href.endsWith('.js');

    // TO-DO: Add support for popup windows
    var element = document.createElement(isJS ? 'script' : 'iframe');
    element.setAttribute('type', isJS ? 'text/javascript' : 'text/html');
    element.setAttribute('src', `${url.href}`);

    if (options?.parent) element = options?.parent.appendChild(element);
    else element = document.body.appendChild(element);

    const pid = crypto.randomUUID(); // Program Identifier
    const token = crypto.randomUUID(); // Program Authentication Token (For security)

    const meta: ITBProgramMeta = { 
      type: isJS ? 'js' : 'html',
      interop: options?.interop || false,
      main: url.href,
      details: {
        $tbundlr_version: config.$tbundlr_version,
        id: config.id,
        author: config.author,
        description: config.description,
        window: config.window
      },
    };

    // Check if interop permissions have been granted, if requesting interop
    if (!options?.interop && config.window?.interop) throw new Error(
      `[tbundlr_err:-:execute::interopRequested] Program with main file '${url.href}' is requesting 'interop' permissions to load.`
    );

    // Add program to Map
    this._programs.set(pid, {
      token,
      element,
      meta
    });

    // Send execute event to new IFrame
    (element as HTMLElement).addEventListener(
      "load", 
      () => this.postMessage(
        'tbundlr_event:-:loaded_program', 
        meta, 
        { pid, token }
      ),
      { once: true }
    );
  }
}

// Parse Scripts for Eval Function (Policy bypass)
function parseTTScript (script: string) {
  return typeof trustedTypes !== 'undefined' ? 
  trustedTypes.createPolicy("ppjs", { createScript: (string: string) => string }).createScript(script) : script
}

const InteropCommands: { 
  [x in keyof any]: {
    func: (data: ITBInteropData, bundler: TBundlr) => void,
    auth: "low" | "high"
  }
} = {
  "tbundlr_cmd:-:test": {
    auth: "low",
    func: (data, bundler: TBundlr) => {
      bundler.postMessage("tbundlr_event:-:test", true, { pid: data.pid, token: data.token })
    }
  },
  "tbundlr_cmd:-:eval": {
    auth: "high",
    func: (data: ITBInteropData) => {
      const body: string = data.body;
      eval( parseTTScript(body) )
    }
  },
  "tbundlr_cmd:-:create_script": {
    auth: "high",
    func: () => {
      console.log("Recieved 'tbundlr_program:-:create_script'")
    }
  }
}

interface ITBConfig {
  $tbundlr_version: number
  id: string
  author?: string
  description?: string
  main: string // Can either end with .html or .js
  window?: { // Only for webpage embeds (.html)
    interop?: boolean
    width?: number
    height?: number
  }
}

interface ITBProgramMeta {
  type: "html" | "js"
  interop: boolean
  main: string
  details: {
    $tbundlr_version: number
    id: string
    author?: string
    description?: string
    window?: {
      interop?: boolean
      width?: number
      height?: number
    }
  }
}

interface ITBProgram {
  element: HTMLElement
  token: string
  meta: ITBProgramMeta
}

interface ITBProgramOptions {
  parent?: HTMLElement
  interop?: boolean
}

interface ITBInteropData {
  pid: string
  token: string
  cmd: string
  body?: any
}

export {
  TBundlr
}