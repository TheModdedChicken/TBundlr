class TBundler {
  constructor () {
    this.CDN = 'https://combinatronics.com'
  }
  test () {console.log('You successfully tested the TBundler module! Your mother would be proud :D')}

  /**
   * 
   * @param {string} id 
   * @param {string?} repo
   */
  loadProgram (id, repo) {
    getJSON(this.CDN + repo + '/tb-config.json', (err, data) => {
      console.log(err || data)
    })
  }
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