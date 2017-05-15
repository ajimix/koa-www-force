# Koa force www

This simple [Koa.js](http://koajs.com/) middleware enforces www subdomain (or the opposite) on any incoming requests.
In case of a non-subdomain (or the opposite) request, koa-www-force automatically redirects to the required subdomain using a `301 permanent redirect`.

koa-www-force also works behind reverse proxies (load balancers) as they are for example used by Heroku and nodejitsu.
In such cases, however, the `trustHostHeader` parameter has to be set (see below).

## Install
```
$ npm install koa-www-force
```

## API

### `enforceWWW(options);`
**params:** {Hash} options

**return:** {Function}

### Available Options
*   `www [Boolean]` - wether to add or remove www subdomain from the urls (default is `true`)
*   `trustHostHeader [Boolean]` - trust `x-forwarded-host` header from Heroku, nodejitsu or any other proxy (default is `false`)
*   `useHTTPS [Boolean]` - to redirect to the https version of the domain (default is `false`)
*   `ignoreUrl [Boolean]` - ignore request url, redirect all requests to root (default is `false`)
*   `temporary [Boolean]` - use `302 Temporary Redirect` (default is to use `301 Permanent Redirect`)
*   `redirectMethods [Array]` - Whitelist methods that should be redirected (default is `['GET', 'HEAD']`)
*   `internalRedirectMethods [Array]` - Whitelist methods for `307 Internal Redirect` (default is `[]`)

## Reverse Proxies (Heroku, Nodejitsu and others)

Heroku, nodejitsu and other hosters often use reverse proxies which offer SSL endpoints but then forward unencrypted HTTP traffic to the website. This makes it difficult to detect if the original host came with or without www. Luckily, most reverse proxies set the `x-forwarded-host` header flag with the original request scheme. koa-www-force is ready for such scenarios, but you have to specifically request the evaluation of this flag:

```javascript
app.use(enforceWWW({
  trustHostHeader: true
}))
```

Please do *not* set this flag if you are not behind a proxy that is setting this header as such flags can be easily spoofed in a direct client/server connection.

## Usage

### Without Reverse Proxy

Add www subdomain to all pages

```javascript
const Koa = require('koa');
const enforceWWW = require('koa-www-force');
const app = new Koa();

// Force www on all page
app.use(enforceWWW());
```

Remove www subdomain from all pages

```javascript
const Koa = require('koa');
const enforceWWW = require('koa-www-force');
const app = new Koa();

// Remove www on all pages
app.use(enforceWWW({
  www: false
}));
```

### With Reverse Proxy
```javascript
const Koa = require('koa');
const enforceWWW = require('koa-www-force');
const app = new Koa();

// Force www on all page
app.use(enforceWWW({
  trustHostHeader: true
}));
```

## Advanced Redirect Setting

### Redirect Methods
By default only `GET` and `HEAD` methods are whitelisted for redirect.
koa-www-force will respond with `403` on all other methods.
You can change whitelisted methods by passing `redirectMethods` array to options.

### Internal Redirect Support \[POST/PUT\]
**By default there is no HTTP(S) methods whitelisted for `307 internal redirect`.**
You can define custom whitelist of methods for `307` by passing `internalRedirectMethods` array to options.
This should be useful if you want to support `POST` and `PUT` delegation from `HTTP` to `HTTPS`.
For more info see [this](http://www.checkupdown.com/status/E307.html) article.

## License
MIT

## Credits
This project is inspired and based on the wonderful work of [koa-sslify](https://github.com/turboMaCk/koa-sslify)
