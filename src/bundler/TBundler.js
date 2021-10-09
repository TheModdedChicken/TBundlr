class TBundler {

  /**
   * 
   * @param {{
   *  repos?: string
   * }} options 
   */
  constructor (options) {
    //this.repos = options.repos
  }

  /**
   * 
   * @param {string} id 
   * @param {string?} repo
   */
  loadProgram (id, repo) {
    import(repo + id + "/tb-config.json").then(data => {
      console.log(data)
    })
  }
}