// deploy the html service app
const doGet = () => HtmlService.createHtmlOutputFromFile('tokener');

/**
 * TokenInfo
 * @typedef {Object} TokenInfo
 * @property {string} token - the token
 * @property {boolean} ok - whether valid
 * @property {string} scope scope the token applies to
 * @property {number} expiresIn how long till it expires in ms
 * @property {number} timeNow server time when check was done for convenience
 * 
 * some of these will be defined if there's an error
 * @property {string| undefined} error_description - text describing error
 * @property {Error | undefined} err js error if parsing failed
 * @property {string| undefined} data if parsing failed, what urlfetch returned
 */


/**
 * namespace to manage token
 */
var _Tokener = (() => {

  // url to validate google oauth token
  const _checkUrl = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={{token}}"

  // gets info about the token
  const checkToken = (token) => {

    // bounce that off the token checker
    let response = null;

    // build response value 
    const value = {
      token,
      timeNow: new Date().getTime(),
      ok: false,
      token,
      expiresIn:0,
      scope:''
    }

    try {
     response = UrlFetchApp.fetch(_checkUrl.replace(/\{\{token\}\}/, token), { muteHttpExceptions: true });
    } 
    catch (error) {
      return {
        ...value,
        error_description: 'token check fetch failure',
        error
      }
    }

    // unravel the response
    try {
      const result = JSON.parse(response.getContentText());
      // minimize the info returned to essentials
      // ie. drop audience, issued_to and accessType
      const {scope, expires_in} = result || {}
      return {
        ...value,
        ok: result && result.error ? false : true,
        scope,
        expiresIn: (expires_in || 0) * 1000,
        error_description: result && result.error
      }
    }
    catch (error) {
      return {
        ...value,
        error_description: 'parse error',
        error: error,
        data: response && response.getContentText()

      };
    }
  }

  const getToken = () => checkToken(ScriptApp.getOAuthToken())

  return {
    getToken,
    checkToken
  }
})()

// exports
/**
 * gets a token and returns info about it
 * @return {TokenInfo}
 */
var getToken = () => _Tokener.getToken();

/**
 * checks a given token
 * @param {string} token
 * @return {TokenInfo}
 */
var checkToken = (token) => _Tokener.checkToken(token);



