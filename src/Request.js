/*globals _, Promise, errorCodes, Errors*/

var Request = (function() {
  'use strict';

  return {

    get: function(url) {
      if (_.isFalsy(url)) { return Promise.reject(errorCodes.WRAPPER_URI_TIMEOUT); }
      var req = new XMLHttpRequest();
      req.open('GET', url);
      req.send(null);
      return new Promise(function(success, failure) {
        req.addEventListener('load', function() {
          // condition for IE, since it doesn't always trigger the error event for win8.1 ie11
          if (/^5/.test(req.status)) { failure(errorCodes.WRAPPER_URI_TIMEOUT); }
          success(req.response);
        });
        req.addEventListener('error', function(e) {
          failure(errorCodes.WRAPPER_URI_TIMEOUT);
        });
      });
    },

    // Firing tracking pixels is best served by using `Image` since that doesn't trigger
    // CORS errors.
    getImg: function(url) {
      var img = new Image();
      img.src = url;
      return new Promise(function(success, failure) {
        img.addEventListener('load', success);
        img.addEventListener('error', failure);
      });
    }

  };

})();

