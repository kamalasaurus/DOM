/*global DOM, Element, oNative*/

/**
 * @class Component - base class to wrap HTML elements, this allows the logical framework
 * to be independent of the implementation details; it is assumed that a Component
 * will always be associated with a DOM element, have one parent, and potentially many
 * children.  All methods return 'this' to promote a Monad usage pattern.
 *
 * @constructor
 * @param {String|Element} name - String must be a valid HTML selector, if SVG selector,
 * must be included in DOM[svgWhitelist] for the appropriate constructor to be
 * invoked; Element must be a DOMElement which will then get wrapped by the Component
 * class
 * @param {Object} props - expects a hash of valid HTML attributes, for example:
 *  {
 *    'src': 'https://happy.com',
 *    'style.width': '100px'
 *  }
 * nested properties must be delimited with a '.' like 'style.width'
 * @returns {Component}
 */
var Component = function(name, props) {
  'use strict';

  this.element = DOM.create(name, props); // {Element}
  this.parent = undefined; // {undefined | Element | Component}
  this.children = []; // {Array.<Component>} cannot be hold Elements

  /**
   * removes this Component from parent's children array and from the DOM,
   * additional pointers will have to be manually removed
   */
  this.remove = function() {
    if (this.parent instanceof Component) {
      this.parent.children.splice(
        this.parent.children.indexOf(this),
        1
      );
    }
    this.parent = undefined;
    this.children.forEach(function(child) {
      child.remove();
    });
    DOM.remove(this.element);
    return this;
  };

  /**
   * @param {Component} child - only accepts Components, appends to children array
   * and to associated DOM element of this Component, sets parent pointer of child
   * to this Component
   * @returns {Component}
   */
  this.appendChild = function(child) {
    if (child instanceof Component) {
      this.children.push(child);
      DOM.appendChild(this.element, child.element);
      child.parent = this;
      return this;
    }
  };

  /**
   * @param {Component|Element} parent - can be Component or Element, appends this
   * Component to parent's associated DOM element, and if it's a Component, sets
   * up parent and children pointers
   * @returns {Component}
   */
  this.appendTo = function(parent) {
    DOM.getNodeAndDo(parent, function(pNode) {
      DOM.appendChild(pNode, this.element);
      this.parent = parent;
      if (parent instanceof Component) { parent.children.push(this); }
      return this;
    }.bind(this));
  };

  /**
   * @param {Object} props - {'style.width': val, ...}
   * @returns {Component}
   */
  this.updateProps = function(props) {
    DOM.setProperties(this.element, props);
    return this;
  };

  /**
   * @param {String} prop - valid DOM attribute 'style.width'
   * @param {String|Number} val - valid DOM attribute value
   * @returns {Component}
   */
  this.updateProp = function(prop, val) {
    DOM.setProperty(this.element, prop, val);
    return this;
  };

  /**
   * getName - get the name of the element
   *
   * @returns {String} - lowercase tagName
   */
  this.getName = function() {
    return DOM.getName(this.element);
  };

  /**
   * attr - calls getAttribute on the underlying element, in the case
   * of computed properties, like currentSrc, there is a fallthrough
   * for to directly access the element.
   *
   * @param {String} name - attribute name
   * @returns {Stirng}
   */
  this.attr = function(name) {
    return DOM.getAttribute(this.element, name);
  };

  /**
   * is - compare the element name with the expected tagName
   *
   * @param {String} name - expected tagName
   * @returns {Boolean}
   */
  this.is = function(name) {
    return this.getName() === name;
  };

  /**
   * getWindow – traverse the tree to get the relevant parent window
   * @param {Component} [component] - recursively call with the parent component
   * until the iframe is exposed.
   * @returns {Object} - window
   */
  this.getWindow = function(component) {
    var comp = component || this;
    if (comp.parent === undefined) { return oNative.getWindow(comp.element); }
    return comp.getName() === 'iframe' ?
      comp.element.contentWindow :
      this.getWindow(comp.parent);
  };

  this.getDocument = function() {
    return this.element.ownerDocument;
  };

  // whitelist the DOM methods that are allowed to propagate upwards, to expose all
  // the properties of the element, have to glob together a massive prototype chain,
  // i.e. HTMLVideoElement > HTMLElement > Node > EventTarget > Object ; OR, maybe
  // it's possible to set the prototype of the component to be element.__proto__ or
  // element.constructor.prototype, and then override as necessary. Would that create
  // unnecessary duplication of DOM element functionality and grow memory inefficient?
  // I guess they're just a bunch of references?
  this.addEventListener = this.element.addEventListener.bind(this.element);
  this.removeEventListener = this.element.removeEventListener.bind(this.element);
  this.dispatchEvent = this.element.dispatchEvent.bind(this.element);

};

