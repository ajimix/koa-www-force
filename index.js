const url = require('url');

/**
 * Default configuration
 */
const defaults = {
  www: true,
  trustHostHeader: false,
  useHTTPS: false,
  ignoreUrl: false,
  temporary: false,
  redirectMethods: ['GET', 'HEAD'],
  internalRedirectMethods: [],
};

/**
 * enforceWWW
 *
 *   @param    {Hash}       options
 *   @param    {Boolean}    options[trustHostHeader]
 *   @param    {Boolean}    options[enforceWWW]
 *   @param    {Boolean}    options[useHTTPS]
 *   @param    {String}     options[hostname]
 *   @param    {Boolean}    options[ignoreUrl]
 *   @param    {Boolean}    options[temporary]
 *   @param    {Array}      options[redirectMethods]
 *   @param    {Array}      options[internalRedirectMethods]
 *   @return   {Function}
 *   @api      public
 */
module.exports = function enforceWWW(options) {
  options = Object.assign({}, defaults, options);

  const redirectStatus = {};
  options.redirectMethods.forEach((x) => {
    redirectStatus[x] = options.temporary ? 302 : 301;
  });
  options.internalRedirectMethods.forEach((x) => {
    redirectStatus[x] = 307;
  });

  return (ctx, next) => {
    var host = url.parse('http://' + ctx.request.header.host).hostname;

    // If we trust host header and the hostname is localhost, then we use the
    // forwarded header
    if (host.includes('localhost') && options.trustHostHeader) {
      host = ctx.request.header['x-forwarded-host'] || host;
    }

    // Check if host has www or not
    const hasWWW = host.substr(0, 4) === 'www.';

    if ((hasWWW && options.enforceWWW) ||
        (!hasWWW && !options.enforceWWW) ||
        host === 'localhost' // If we are here and still is localhost, we assume
                             // is development environment
      ){
      return next();
    }

    if (hasWWW && !options.enforceWWW) {
      host = host.substr(4);
    } else {
      host = 'www.' + host;
    }

    // build redirect url
    var redirectTo = (options.useHTTPS ? 'https://' : 'http://') + host;

    if(!options.ignoreUrl) {
      redirectTo += ctx.request.url;
    }

    // redirect to www or non www
    ctx.response.status = redirectStatus[ctx.method];
    ctx.response.redirect(redirectTo);
  };
};
