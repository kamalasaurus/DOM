/*global XMLDocument, HTMLDocument, _, oNative, Component, Element, Errors*/

/**
 * @module DOM - a Singleton object literal with convenience functions used by
 * Components.  Primarily, the Component constructor invokes a lot of these
 * functions, which serve to separate implementation logic from the application
 * logic; instantiated as IIFE to allow private scope
 */
var DOM = (function() {
  'use strict';

  var svgNamespace = 'http://www.w3.org/2000/svg';
  var svgWhitelist = ['svg', 'circle', 'polygon']; //using whitelist because we want to limit footprint

  /**
   * @private createElement - called by DOM.create; depends on oNative global
   * object to exist, called in .create()
   *
   * @param {String} name - see DOM[create] for details
   * @param {Document} doc - optional document, useful to create case-sensitive XMLs
   * @returns {Element}
   */
  var createElement = function(name, doc) {
    var originDoc = doc || oNative.getDoc();
    return (svgWhitelist.indexOf(name) !== -1) ?
      originDoc.createElementNS(svgNamespace, name) :
      originDoc.createElement(name);
  };

  /**
   * @private appendToIframe - attaches child element to iframe's nested DOM body
   * element the iframe's nested structure doesn't exist until after it's attached
   * to the parent DOM, so you have to attach to the 'load' event if the contentWindow
   * doesn't yet exist (it only exists after attachment), called in .appendChild()
   *
   * @param {Element} iframe
   * @param {Element} child
   */
  var appendToIframe = function(iframe, child) {
    if (iframe.contentWindow) {
      iframe.contentWindow.document.body.appendChild(child);
    } else {
      iframe.addEventListener('load', function() {
        iframe.contentWindow.document.body.appendChild(child);
      }, false);
    }
  };

  /**
   * @private prepareIframe - this attaches all the base styles to the iframe and its
   * nested DOM structure; since this is a private fxn, and is only called after
   * the iframe is first invoked, there's no possibility of it already being in the DOM,
   * called in .create()
   *
   * @param {Element} iframe
   */
  var prepareIframe = function(iframe) {
    iframe.addEventListener('load', function() {
      var bodyStyle = iframe.contentWindow.document.body.style;
      bodyStyle.margin = 0;
      bodyStyle.width = iframe.style.width;
      bodyStyle.height = iframe.style.height;
      bodyStyle.border = iframe.style.border;
    }, false);
  };

  /**
   * @private isIframe - only called on valid Elements
   *
   * @param {Element} el
   * @returns {Boolean}
   */
  var isIframe = function(el) {
    return el.nodeName.toLowerCase() === 'iframe';
  };

  /**
   * @private getNode - extracts node from the recieved Element or Component, called by
   * .getNodeAndDo()
   *
   * @param {Element|Component} el
   * @returns {Element|undefined}
   */
  var getNode = function(el) {
    var node;
    if (el instanceof Component) { node = el.element; }
    else if (_.isDOMElement(el)) { node = el; }
    return node;
  };

  /**
   * getPixels - extracts the numberical value from a DOMString or Number IF it is not
   * a percentage; regex functions implicitly coerce numbers to strings for pattern
   * matching
   *
   * @param {DOMString|Number} value
   * @returns {Float}
   */
  var getPixels = function(value) {
    return !/%$/.test(value) && /\d+/.test(value) && parseFloat(/\d+/.exec(value)[0]);
  };

  /**
   * valid - checks if the root element passed into DOM.get is a valid DOM object with
   * DOM functionality
   *
   * @param {Element} node
   * @returns {Boolean}
   */
  var validRoot = function(node) {
    return [Element, XMLDocument, HTMLDocument].some(function(testType) {
      return node instanceof testType;
    });
  };

  /**
   * validElement - cross-domain javascript contexts lose object type inference, so if
   * a container element is passed into the context from a different one, instanceof
   * fails to detect what it is an instance of.  Hence, the constructor string check.
   *
   * Currently just whitelisting constructors that run into this issue for this code.
   *
   * @param {Element} node
   * @returns {Boolean}
   */
  var validElement = function(node) {
    return _.isDOMElement(node);
  };

  // BEGINS the public interface that DOM exposes
  return {
    /**
     * getOne - retrieve only one DOM element from a #document node or element contained
     *
     * @param {String} selector - css-compatible selector list
     * @param {Element} root - root from which querySelector will be called
     * @returns {Element}
     */
    getOne: function(selector, root) {
      var doc = validRoot(root) ? root : oNative.getDoc();
      return doc.querySelector(selector);
    },
    /**
     * get - retrieve a set of DOM elements from a #document node or element contained
     * within via querySelector -- NOTE: querySelector fails at IE10, unlikely will have
     * to support less than that.
     *
     * @param {String} selector - the css-compatible selector list i.e. 'div, span.hello'
     * @param {Element} root - the root from where querySelectorAll will be called
     * @returns {Array.<Element>}
     */
    get: function(selector, root) {
      var doc = validRoot(root) ? root : oNative.getDoc();
      return _.toArray(doc.querySelectorAll(selector));
    },
    /**
     * create - creates and returns a DOM element
     *
     * @param {String|Element} name - must be valid HTML selector or SVG selector in svgWhitelist above
     * @param {Object[String]|undefined} props - must have valid DOM attributes for the element
     * in question, and keys MUST be FLAT strings, i.e. if you're attaching a nested property,
     * the key should be 'namespace.name', NOT a nested object. Leave undefined if you want a
     * vanilla object
     * @param {Document} doc = optional document, helpful to build off XML documents instead of HTML
     * @returns {Element}
     */
    create: function(nameOrNode, props, doc) {
      var node = validElement(nameOrNode) ? nameOrNode : createElement(nameOrNode, doc);
      if (props) { this.setProperties(node, props); }
      if (isIframe(node)) { prepareIframe(node); }
      return node;
    },
    /**
     * setProperties - sets all the attributes from the props object on the DOM node, if you're
     * unsure about the .bind(this) on the function declaration, see the explanation from
     * Brendan Eich: https://twitter.com/kamalasaurus/status/793932911795961856 on Statements vs.
     * Expressions
     *
     * @param {Element} node
     * @param {Object[String]} props
     */
    setProperties: function(node, props) {
      Object.keys(props).forEach(function(prop) {
        this.setProperty(node, prop, props[prop]);
      }.bind(this));
    },
    /**
     * setProperty - assigns an individual property on the DOM node
     * NOTE: about the reduce: the final accessor evaluates instead of returning a reference,
     * so you have to assign immediately at the end of the loop; until the final call, this returns
     * references down the nested property tree i.e. CSSStyleDeclaration
     *
     * @param {Element} node
     * @param {String} prop - '.' delimited string of potentially nested attribute, i.e style.width
     * @param {String|Number} val - must be a valid value for the attribute attempting to be set
     */
    setProperty: function(node, prop, val) {
      prop
        .split('.')
        .reduce(function(n, p, idx, arr) {
          if (idx === arr.length - 1) {
            if (_.isFunction(n.setAttribute)) {
              n.setAttribute(p, val);
            } else {
              n[p] = val;
            }
          } else {
            return n[p];
          }
        }, node);
    },
    /**
     * appendChild - calls the .appendChild() method on the parent if it's a DOM element.  If the
     * parent is an iframe, calls appendToIframe() to append to the nested body element of the
     * iframe or create a callback to do so once the iframe contentWindow is initialized
     *
     * @param {Element} parent
     * @param {Element} child
     */
    appendChild: function(parent, child) {
      if (_.isDOMElement(parent) && _.isDOMElement(child)) {
        if (isIframe(parent)) { appendToIframe(parent, child); }
        else { parent.appendChild(child); }
      }
    },
    /**
     * remove - for IE compliance, this is abstracted here.  JScript has the method removeNode
     * instead of remove.  It just removes a node from the DOM.
     *
     * @param {Element} node
     */
    remove: function(node) {
      if (node.remove) {
        node.remove();
      } else if (node.removeNode) {
        node.removeNode();
      } else {
        node.parentNode.removeChild(node);
      }
    },
    /**
     * getNodeAndDo - tests to see if there is a DOM element in el, and returns it as the first
     * argument in a callback, this way the node can be handled without having to manually check
     * if it exists or not every time you want to call it.  The tradeoff is that you have to call
     * .bind(this) on the callback if you want it to retain its context for what it does in the
     * callback i.e.:
     * DOM.getNodeAndDo(element, function(node) { return process(node)  }.bind(this))
     *
     * @param {*} el
     * @param {Function[Element]} callback - the first argument in the callback will be the DOM
     * node associated with the component or the element
     */
    getNodeAndDo: function(el, callback) {
      var node = getNode(el);
      if (node) { return callback(node);}
      // else process error; this would have been great as a Promise, but no IE supports Promise
    },
    /**
     * toPx - return a stringified pixel value for style tags to consume
     *
     * @param {*} value
     * @returns {String|Boolean}
     */
    toPx: function(value) {
      var val = getPixels(value);
      return val && val + 'px';
    },
    /**
     * getWidth - get the width as defined by the DOM for a target element, el must be an Element
     * for a valid number to return
     *
     * @param {Element|Component} el
     * @returns {Number|undefined}
     */
    getWidth: function(el) {
      return this.getNodeAndDo(el, function(node) {
        return getPixels(getComputedStyle(node,'').getPropertyValue('width')) ||
          getPixels(node.style.width) ||
          node.width ||
          node.clientWidth;
      }.bind(this));
    },
    /**
     * getHeight - get the height as defined by the DOM for a target element, el must be an Element
     * for a valid number to return
     *
     * @param {Element|Component} el
     * @returns {Number|undefined}
     */
    getHeight: function(el) {
      return this.getNodeAndDo(el, function(node) {
        return getPixels(getComputedStyle(node,'').getPropertyValue('height')) ||
          getPixels(node.style.height) ||
          node.height ||
          node.clientHeight;
      }.bind(this));
    },
    /**
     * getParent  - get the parent of an element
     *
     * @param {Element} el
     * @returns {Element}
     */
    getParent: function(el) {
      return el.parentElement || el.parentNode;
    },
    /**
     * getParentUntil - recursively get parent until parent of type is reached
     *
     * @param {Element} el
     * @param {String} tagName
     * @returns {Element}
     */
    getParentUntil: function(el, tagName) {
      var parent = this.getParent(el);
      while (this.getParent(parent) && parent.tagName.toLowerCase() !== tagName.toLowerCase()) {
        parent = this.getParent(parent);
      }
      return parent;
    },
    /**
     * getText - get text content of element
     *
     * @param {Element} el
     * @returns {String}
     */
    getText: function(el) {
      if (!el) { return ''; }
      return _.toArray(el.childNodes)
        .map(function(text) { return text.textContent.trim(); })
        .join('');
    },
    /**
     * getCdata - get CDATA of element
     *
     * @param {Element} el
     * @returns {String}
     */
    getCdata: function(el) {
      if (!el) { return ''; }
      // use cdata.textContent instead of nodeValue because it's equivalent and safer for IE
      return _.toArray(el.childNodes)
        .filter(function(node) { return node.nodeName === '#cdata-section'; })
        .map(function(cdata) { return cdata.textContent.trim(); })[0];
    },
    /**
     * getName - get tagName of element
     *
     * @param {Element} el
     * @returns {String}
     */
    getName: function(el) {
      return el.tagName.toLowerCase();
    },
    /**
     * getAttribute - gets Attribute of element
     *
     * @param {Element} el
     * @param {String} attr - attribute name
     * @returns {String} - value
     */
    getAttribute: function(el, attr) {
      return el.getAttribute(attr) || el[attr] || '';
    },
    /**
     * getAttributes - get all attributes on an element
     *
     * @param {Element} el
     * @returns {Object.<String>}
     */
    getAttributes: function(el) {
      if (!el) { return {}; }
      return _.toArray(el.attributes)
        .reduce(function(obj, attrNode) {
          return obj[attrNode.name] = attrNode.nodeValue, obj;
        }, {});
    },
    getData: function(el) {
      var cdata = DOM.getCdata(el);
      var text = DOM.getText(el);
      return cdata || text || '';
    },
    createEvent: function(name) {
      var event;
      try {
        event = new Event(name);
      } catch (e) {
        event = oNative.getDoc().createEvent('Event');
        event.initEvent(name, false, true);
      } finally {
        return event;
      }
    },
    parseXML: function(xml) {
      var doc;
      try {
        if (_.isString(xml)) {
          doc = (new DOMParser()).parseFromString(xml, 'text/xml');
        } else {
          // assume the xml came from our xml generator, or was postprocessed in the request
          doc = xml;
        }
        Errors.xmlParseError(doc);
      } catch (e) {
        console.error(e);
      } finally {
        return doc;
      }
    },
    /**
    * serializeXMLNode - get serialized strings of a DOM node
    *
    * @param {Element} el
    * @returns {String}
    */
    serializeXMLNode: function(node) {
      var xmlStr;
      try {
        xmlStr = (new XMLSerializer()).serializeToString(node);
        Errors.xmlSerializeError();
      } catch (e) {
        console.error(e);
      } finally {
        return xmlStr;
      }
    }
  };

})();

