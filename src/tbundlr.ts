import { Snowflake } from 'nodejs-snowflake';

export class TBundlr {
  private _programs: Map<string, ITBProgram> = new Map()

  constructor () { (globalThis as any).TBundlr = this; }

  test () {console.log('You successfully tested the TBundlr module! Your mother would be proud :D')}

  async readConfig (url: URL) {
    const res = await fetch(url);
    const contentType = res.headers.get("content-type");
    if (contentType !== "application/json") throw new Error(
      `[tbundlr:-:readConfig::content-type-mismatch] Tried reading TB config expecting 'application/json'. Got '${contentType}' instead`
    );

    const config: ITBConfig = await res.json();
    if (!config.$tbundlr_version) throw new Error(
      `[tbundlr:-:readConfig::invalid-config::$tbundlr_version] Property '$tbundlr' not set. Config read aborted`
    );

    return config;
  }

  async runProgram(url: URL, options?: { parent?: HTMLElement }) {
    const config: ITBConfig = await this.readConfig(url);

    this.execute(url, config, options?.parent);
    window.dispatchEvent(new CustomEvent(
      'tbundlr:-:runProgram', { detail: config }
    ));
  }

  execute (
    url: URL,
    config: ITBConfig,
    parent?: HTMLElement,
  ) {
    const isJS = url.href.endsWith('.js');

    var element = document.createElement(isJS ? 'script' : 'embed');
    element.setAttribute('type', isJS ? 'text/javascript' : 'text/html');
    element.setAttribute('src', `${url.href}`);

    if (parent) element = parent.appendChild(element);
    else element = document.appendChild(element);

    const pid = new Snowflake().getUniqueID();
    const meta: ITBProgram = {
      type: isJS ? 'js' : 'html',
      element,
      ...config
    };

    this._programs.set(`${pid}`, meta);

    window.dispatchEvent(new CustomEvent(
      'tbundlr:-:execute', { detail: { pid: `${pid}`, config } }
    ));
  }
}

interface ITBConfig {
  $tbundlr_version: number
  id: string
  author: string
  description: string
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