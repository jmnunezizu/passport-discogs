var util = require('util');
var OAuthStrategy = require('passport-oauth').OAuthStrategy;
var InternalOAuthError = require('passport-oauth').InternalOAuthError;

function Strategy(options, verify) {
  options = options || {};
  options.requestTokenURL = options.requestTokenURL || 'https://api.discogs.com/oauth/request_token';
  options.accessTokenURL = options.accessTokenURL || 'https://api.discogs.com/oauth/access_token';
  options.userAuthorizationURL = options.userAuthorizationURL || 'https://www.discogs.com/oauth/authorize';

  options.sessionKey = options.sessionKey || 'oauth:discogs';

  OAuthStrategy.call(this, options, verify);
  this.name = 'discogs';
  this._clientSecret = options.consumerSecret;
}

/**
 * Inherit from `OAuthStrategy`.
 */
util.inherits(Strategy, OAuthStrategy);

Strategy.prototype.userProfile = function(token, tokenSecret, params, done) {
  this._oauth.get('https://api.discogs.com/oauth/identity', token, tokenSecret, function (err, body, res) {
    if (err) {
      return done(new InternalOAuthError('failed to fetch user profile', err));
    }
    
    try {
      var json = JSON.parse(body);

      var profile = { provider: 'discogs' };
      profile.id = json.username;
      
      profile._raw = body;
      profile._json = json;
      
      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
