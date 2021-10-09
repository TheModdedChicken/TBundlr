/**
 * Old function for creating cdn.jsdelivr.net compliant github urls
 * @param {string} url 
 * @deprecated
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