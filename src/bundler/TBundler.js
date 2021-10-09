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
    import(this.CDN + repo + id + '/tb-config.json').then(data => {
      console.log(data)
    })
  }
}