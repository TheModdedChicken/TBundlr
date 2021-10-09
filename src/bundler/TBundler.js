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
    getJSON(this.CDN + repo + '/tb-config.json').then(data => console.log(data))
  }
}

/* Functions */

/**
 * Yoinked from https://stackoverflow.com/a/35970894/14618276 on Oct 9 2021
 * @param {string} url 
 */
function getJSON (url) {
  return new Promise((res, rej) => {
    fetch(url, { mode: 'no-cors' }).then(res => res.json()).then(data => {
      res(data)
    }).catch(err => rej(err))
  })
}