var _ = (function() {
  'use strict';

  // convenience method for DOM Element checks
  var isDOMElement = function(node) {
    return !!node.nodeName;
  };

  // need to check against prototype chain because iframes don't
  // retain type information for instanceof since they don't share
  // a memory context, generally will check for DOM element
  var isOfDOMType = function(node, type) {
    return isDOMElement(node) && node.nodeName.toLowerCase() === type.toLowerCase();
  };

  // extracts <name> from strings of format: [object <name>]
  // IE11 returns constructors in this format
  var typeName = function(constructor) {
    return (
      constructor.toString().match(/\s\w+/) ||
      []
    ).join().trim();
  };

  // extracts <name> from strings of format: function <name>() { ... }
  // all non-IE browsers return constructors in this format
  var fname = function(fn) {
    return fn.name ||
      (
        fn.toString().trim().match(/^function\s*([^\s(]+)/) ||
        []
      ).slice(-1).join();
  };

  var cname = function(obj) {
    return fname(obj.constructor) || typeName(obj.constructor);
  };

  return {
    noop: function() {},
    fname: fname,
    cname: cname,
    isDOMElement: isDOMElement,
    isOfDOMType: isOfDOMType,
    isType: function(obj, type) {
      return cname(obj) === type;
    },
    isString: function(arg) {
      return typeof arg === 'string';
    },
    isFunction: function(arg) {
      return typeof arg === 'function';
    },
    isNonNullObj: function(arg) {
      return arg !== null && typeof arg === 'object';
    },
    isUndefined: function(arg) {
      return typeof arg === 'undefined';
    },
    isDefined: function(arg) {
      return typeof arg !== 'undefined';
    },
    isTruthy: function(arg) {
      return Boolean(arg);
    },
    isFalsy: function(arg) {
      return !Boolean(arg);
    },
    toArray: function(list) {
      return Array.prototype.slice.call(list);
    },
    isEmpty: function(list) {
      //TODO: this really should be for any enumerable data type -- but for now, it
      //doesn't matter
      return Array.isArray(list) && list.length === 0;
    },
    isEmptyObj: function(obj) {
      return Object.keys(obj).length === 0 && obj.constructor === Object;
    },
    // NOTE: this doesn't remotely guarantee typesafety of nested objects!!
    // the current form is a quick fix for the merging of nested vasts.  Since
    // wrapper 2 is destined to be short-lived.  For a truly type-safe deep merge,
    // there needs to be a lot more conditional handling for guaranteeing output
    // types!!!!
    mergeObjects: function(/*object1, object2, ...*/) {
      return _.toArray(arguments).reduce(function(accumulator, obj) {
        return Object.keys(obj).reduce(function(acc, key) {
          var v = obj[key];
          if (acc[key]) {
            if (Array.isArray(acc[key])) {
              acc[key] = acc[key].concat(v);
            } else {
              acc[key] = [acc[key]].concat(v);
            }
          } else {
            acc[key] = v;
          }
          return acc;
        }, accumulator);
      }, {});
    },
    /**
     * clone - assumes values are only: primitives, Arrays, or plain Objects.  Anything
     * fancier probably needs to be handled
     *
     * @param {Object} target
     * @returns {Object}
     */
    clone: function(target) {
      return Object.keys(target)
        .reduce(function(obj, key) {
          var val;
          if (target[key] instanceof Array) { val = target[key].slice(); }
          else if (target[key] instanceof Function) { val = target[key]; }
          else if (target[key] instanceof Object) { val = _.clone(target[key]); } // might have to make it private for reference name
          else { val = target[key]; }
          obj[key] = val;
          return obj;
        }, {});
    },
    /**
     * del - avoiding delete keyword... due to negative performance implications
     * for v8 https://groups.google.com/forum/#!topic/v8-users/zE4cOHBkAnY
     * http://perfectionkills.com/understanding-delete/
     *
     * @param {Object} object
     * @param {String} name
     * @returns {Object}
     */
    del: function(object, name) {
      return Object.keys(object)
        .reduce(function(newobj, k) {
          if (k !== name) { newobj[k] = object[k]; }
          return newobj;
        }, {});
    },
    /**
     * throttle - throttles passed function which when invoked repeatedly will only
     * be triggered at most once in the passed time interval
     *
     * @param {Function} fn
     * @param {Number} wait
     * @returns {Function}
     */
    throttle: function(fn, wait, optionalContext) {
      var lastTime, currentTime, result;
      return function() {
        var context = optionalContext || this;
        currentTime = new Date().getTime();
        if (!lastTime || (currentTime - lastTime >= wait)) {
          lastTime = currentTime;
          result = fn.apply(context, arguments);
        } else {
          result = function() {};
        }
        return result;
      };
    },
    fromJSON: function(str) {
      var parsed;
      try {
        JSON.parse(str);
      } catch (e) {
        parsed = {};
      } finally {
        return parsed;
      }
    }
  };
})();

