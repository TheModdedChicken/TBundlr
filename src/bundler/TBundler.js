class TBundler {
  CDN_JS = 'https://combinatronics.com';
  CDN_TEXT = 'https://raw.githubusercontent.com';
  programs = {};

  constructor () {}
  test () {console.log('You successfully tested the TBundler module! Your mother would be proud :D')}

  /**
   * Run a loaded/cached program
   * @param {string | object} program String ID of program or object with program data
   */
  run (program) {
    var programData = {};

    if (typeof program === 'string') programData = this.programs[program];
    if (typeof program === 'object') programData = program;

    console.log(programData)
  }

  /**
   * Fetch a program from github
   * @param {string?} repo
   * @param {{
   *  run: boolean,
   *  cache: boolean
   * }} options
   */
  fetchProgram (repo, options) {
    getJSON(this.CDN_TEXT + repo + '/tb-config.json', (err, data) => {
      if (err) throw err;

      const id = this.programs[data.id] ? data.id + `_${new Date().getTime()}` : data.id;

      if (options.run) this.run(data);
      if (options.cache === null || options.cache === true) {
        delete data.id;
        this.programs[id] = data;
      } // Program cache check should ALWAYS be the last step unless another step requires it to be cached first
    })
  }

  /**
   * Delete a program from the program cache
   * @param {string} id 
   */
  delete (id) { delete this.programs[id] }
}

/* Functions */

/**
 * Yoinked from https://stackoverflow.com/a/35970894/14618276 on Oct 9 2021
 * @param {string} url 
 * @param {(err: Error, data: object)} callback
 */
function getJSON (url, callback) {
  fetch(url).then(res => res.json()).then(data => {
    callback(null, data)
  }).catch(err => callback(err, null))
}

/**
 * 
 * @param {string[]} parts 
 * @param {{
 *  sep: string
 *  type: 'url' | 'dir'
 * }} options 
 */
function joinPaths(parts, options) {
  if (!options.type || options.type === 'dir') {
    return parts.join('\\').replace(/\/+/g, '\\');
  } else if (options.type === 'url') {
    var outURL = '';

    for (const part of parts) {
      
    }
  }
}