/**
 * Module dependencies
 */

var classes = require('component-classes')
var m = require('multiline').stripIndent
var events = require('component-events')
var assign = require('object-assign')
var inserted = require('inserted')
var style = require('load-styles')
var adjust = require('adjust')()
var domify = require('domify')
var sliced = require('sliced')
var css = require('dom-css')

/**
 * Defaults
 */

var defaults = {
  orientation: 'bottom center',
  delay: 300
}

/**
 * Default orientations
 */

var orientations = {
  'bottom right': { x: -20, y: 7 },
  'top right': { x: -20, y: -7 },
  'bottom left': { x: 20, y: 7 },
  'top left': { x: 20, y: -7 },
  'bottom': { x: 0, y: 7 },
  'left': { x: -7, y: 0 },
  'right': { x: 7, y: 0 },
  'top': { x: 0, y: -7 }
}

/**
 * Export `Tooltip`
 */

module.exports = tip

/**
 * Template
 */

var template = domify(m(function() {/*
  <div class="tooltip tooltip-hide">
    <div class="tooltip-arrow"></div>
    <div class="tooltip-body"></div>
  </div>
*/}))

/**
 * Insert tooltip styling
 */

style(m(function () {/*
  .tooltip {
    position: absolute;
    font-size: 11px;
    display: inline-block;
    background-color: #000;
    border-color: #000;
    color: #fff;
  }

  .tooltip-body {
    background-color: inherit;
    color: inherit;
    padding: 8px 10px 7px 10px;
    text-align: center;
  }

  .tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    line-height: 0;
    border-color: inherit;
    border-style: dashed;
    border-width: 5px;
  }

  .tooltip[orientation~="top"] .tooltip-arrow { border-top-color: inherit }
  .tooltip[orientation~="bottom"] .tooltip-arrow { border-bottom-color: inherit }
  .tooltip[orientation~="left"] .tooltip-arrow { border-left-color: inherit }
  .tooltip[orientation~="right"] .tooltip-arrow { border-right-color: inherit }

  .tooltip[orientation~="bottom"][orientation~="center"] .tooltip-arrow,
  .tooltip[orientation~="bottom"][orientation~="left"] .tooltip-arrow,
  .tooltip[orientation~="bottom"][orientation~="right"] .tooltip-arrow {
    bottom: -5px;
    left: 50%;
    margin-left: -5px;
    border-top-style: solid;
    border-bottom: none;
    border-left-color: transparent;
    border-right-color: transparent
  }

  .tooltip[orientation~="top"][orientation~="center"] .tooltip-arrow,
  .tooltip[orientation~="top"][orientation~="left"] .tooltip-arrow,
  .tooltip[orientation~="top"][orientation~="right"] .tooltip-arrow {
    top: -5px;
    left: 50%;
    margin-left: -5px;
    border-bottom-style: solid;
    border-top: none;
    border-left-color: transparent;
    border-right-color: transparent
  }

  .tooltip[orientation~="right"][orientation~="middle"] .tooltip-arrow {
    right: -5px;
    top: 50%;
    margin-top: -5px;
    border-left-style: solid;
    border-right: none;
    border-top-color: transparent;
    border-bottom-color: transparent
  }

  .tooltip[orientation~="left"][orientation~="middle"] .tooltip-arrow {
    left: -5px;
    top: 50%;
    margin-top: -5px;
    border-right-style: solid;
    border-left: none;
    border-top-color: transparent;
    border-bottom-color: transparent
  }

  .tooltip[orientation~="top"][orientation~="right"] .tooltip-arrow,
  .tooltip[orientation~="bottom"][orientation~="right"] .tooltip-arrow {
    left: 85%;
  }


  .tooltip[orientation~="top"][orientation~="left"] .tooltip-arrow,
  .tooltip[orientation~="bottom"][orientation~="left"] .tooltip-arrow {
    left: 15%;
  }

  .tooltip-hide {
    pointer-events: none;
    opacity: 0;
  }
*/}))

/**
 * Initialize a tooltip
 *
 * @param {Element} el
 * @param {String} message
 * @param {Object} options
 * @return {Tip|Array}
 */

function tip(el, message, options) {
  if (!arguments.length || typeof el === 'string') {
    var els = sliced(document.querySelectorAll(el || '[tooltip]'));
    return els.map(function(el) {
      var msg = message || el.getAttribute('tooltip')
      var offset = undefined

      if (el.hasAttribute('tooltip-offset')) {
        var op = el.getAttribute('tooltip-offset').split(/\s+/)
        offset = { x: Number(op[0]), y: Number(op[1]) }
      }

      return new Tip(el, msg, {
        orientation: el.getAttribute('tooltip-orientation'),
        class: el.getAttribute('tooltip-class'),
        offset: offset
      })
    })
  } else {
    return new Tip(el, message, options)
  }
}

/**
 * Initialize a `Tip` with the given `content`.
 *
 * @param {Element} el
 * @param {Mixed} message
 * @param {Object} options
 * @api public
 */

function Tip(el, message, options) {
  if (!(this instanceof Tip)) return new Tip(el, message, options)
  options = options || {}

  if (typeof message === 'object') {
    options = message
    message = null
  }

  this.options = assign(defaults, options)
  this.options.offset = options.offset === undefined
    ? orientations[this.options.orientation]
    : options.offset

  this.host = el
  this.el = template.cloneNode(true)
  this.inner = this.el.querySelector('.tooltip-body')
  this.classes = classes(this.el)

  if (this.options.class) {
    this.classes.add(this.options.class)
  }

  // add the message
  message = message || el.getAttribute('title')
  if (!message) throw new Error('tooltip doesn\'t have any content')
  this.message(message)

  // bind if already in the DOM
  // otherwise wait until it's inserted
  if (el.parentNode) {
    this.bind()
  } else {
    inserted(el, this.bind.bind(this))
  }
}

/**
 * Bind the events
 *
 * @return {Tip}
 */

Tip.prototype.bind = function () {
  document.body.appendChild(this.el)

  this.events = events(this.host, this)
  this.events.bind('mouseenter', 'show')
  this.events.bind('mouseleave', 'maybeHide')

  this.tip_events = events(this.el, this)
  this.tip_events.bind('mouseenter', 'cancelHide')
  this.tip_events.bind('mouseleave', 'maybeHide')

  // setup the adjustments
  this.orientation()

  return this
}

/**
 * Set tip `content`.
 *
 * @param {String|Element} content
 * @return {Tip} self
 * @api public
 */

Tip.prototype.message = function(content){
  if ('string' == typeof content) content = domify(content)
  this.inner.appendChild(content)
  return this
}

/**
 * Maybe hide
 *
 * @return {Tip}
 */

Tip.prototype.maybeHide = function() {
  var self = this
  var delay = this.options.delay

  this.hiding = true

  setTimeout(function() {
    self.hiding && self.hide()
  }, delay)

  return this
}

/**
 * Hide the tooltip
 *
 * @return {Tip}
 */

Tip.prototype.hide = function() {
  this.classes.add('tooltip-hide')
  return this
}

/**
 * Cancel the hiding
 *
 * @return {Tip}
 */

Tip.prototype.cancelHide = function() {
  this.hiding = false
  return this
}

/**
 * Show a tooltip
 *
 * @return {Tip}
 */

Tip.prototype.show = function() {
  this.classes.remove('tooltip-hide')
  this.hiding = false
  return this
}

/**
 * Set the orientation
 *
 * @return {Tip}
 */

Tip.prototype.orientation = function() {
  this.adjust = adjust(this.el, this.host, {
    target: this.options.orientation,
    offset: this.options.offset
  })

  return this
};
