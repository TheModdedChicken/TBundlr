class TBundler {
  CDN = 'https://cdn.jsdelivr.net';
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
  fetchProgram (url, options) {
    getJSON(formatCdnUrl(url) + '/tb-config.json', (err, data) => {
      if (err) throw err;

      var program = data;
      const id = this.programs[program.id] ? program.id + `_${new Date().getTime()}` : program.id;

      if (options.run) this.run(program);
      if (options.cache === null || options.cache === true) {
        delete program.id;
        this.programs[id] = program;
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
 * 
 * @param {string} url 
 */
function formatCdnUrl(url) {
  var urlParts = url.replace(/(https:\/\/)|(http:\/\/)/gi, '').replace(/\/+|\\+/g, '/').split('/');
  var urlOut = this.CDN;
  var foundBranch = false;
  var foundQuery = false;

  for (var i = 0; i < urlParts; i++) {
    const part = urlParts[i];

    if (part.match(/(raw.githubusercontent.com)|(github.com)/g)) urlOut += 'gh'
    else if (i === 3 && part !== 'blob' && part !== 'blame') {
      urlOut += '@' + part;
      foundBranch = true;
    }
    else if (i === 4 && !foundBranch) {
      urlOut += '@' + part;
      foundBranch = true;
    }
    else if (foundQuery || part.startsWith('?') || part.startsWith('#')) {
      urlOut += part
      foundQuery = true;
    }
    else urlOut += '/' + part;
  }
}

/**
 * Yoinked from https://stackoverflow.com/a/35970894/14618276 on Oct 9 2021
 * @param {string} url 
 * @param {(err: Error, data: object)} callback
 */
function getJSON(url, callback) {
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