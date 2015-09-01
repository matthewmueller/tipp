(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tipp = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Module dependencies
 */

var within_document = require('within-document')
var classes = require('component-classes')
var events = require('component-events')
var assign = require('object-assign')
var inserted = require('inserted')
var style = require('load-styles')
var adjust = require('adjust')()
var domify = require('domify')
var sliced = require('sliced')

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
 * Export `tipp`
 */

module.exports = tipp

/**
 * Template
 */

var template = domify(require('./tipp.html'))

/**
 * Insert tipp styling
 */

style(require('./tipp.css'))

/**
 * Initialize a tipp
 *
 * @param {Element} el
 * @param {String} message
 * @param {Object} options
 * @return {Tipp|Array}
 */

function tipp(el, message, options) {
  if (!arguments.length || typeof el === 'string') {
    var els = sliced(document.querySelectorAll(el || '[tipp]'));
    return els.map(function(el) {
      var msg = message || el.getAttribute('tipp')
      var offset = undefined

      if (el.hasAttribute('tipp-offset')) {
        var op = el.getAttribute('tipp-offset').split(/\s+/)
        offset = { x: Number(op[0]), y: Number(op[1]) }
      }

      return new Tipp(el, msg, {
        orientation: el.getAttribute('tipp-orientation'),
        class: el.getAttribute('tipp-class'),
        offset: offset
      })
    })
  } else {
    return new Tipp(el, message, options)
  }
}

/**
 * Initialize a `Tipp` with the given `content`.
 *
 * @param {Element} el
 * @param {Mixed} message
 * @param {Object} options
 * @api public
 */

function Tipp(el, message, options) {
  if (!(this instanceof Tipp)) return new Tipp(el, message, options)
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
  this.container = template.cloneNode(true)
  this.el = this.container.querySelector('.tipp')
  this.inner = this.el.querySelector('.tipp-body')
  this.container_classes = classes(this.container)
  this.classes = classes(this.el)

  if (this.options.class) {
    this.options.class.split(/\s+/).map(function(cls) {
      this.classes.add(cls)
    }, this)
  }

  // add the message
  message = message || el.getAttribute('title')
  if (!message) throw new Error('tipp doesn\'t have any content')
  this.message(message)

  // bind if already in the DOM
  // otherwise wait until it's inserted
  if (within_document(el)) {
    this.bind()
  } else {
    inserted(el, this.bind.bind(this))
  }
}

/**
 * Bind the events
 *
 * @return {Tipp}
 */

Tipp.prototype.bind = function () {
  document.body.appendChild(this.container)

  this.events = events(this.host, this)
  this.events.bind('mouseenter', 'show')
  this.events.bind('mouseleave', 'maybeHide')

  this.tip_events = events(this.container, this)
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
 * @return {Tipp} self
 * @api public
 */

Tipp.prototype.message = function(content){
  if ('string' == typeof content) content = domify(content)
  this.inner.appendChild(content)
  return this
}

/**
 * Maybe hide
 *
 * @return {Tipp}
 */

Tipp.prototype.maybeHide = function() {
  var self = this
  var delay = this.options.delay

  this.hiding = true

  setTimeout(function() {
    self.hiding && self.hide()
  }, delay)

  return this
}

/**
 * Hide the tipp
 *
 * @return {Tipp}
 */

Tipp.prototype.hide = function() {
  this.container_classes.add('tipp-hide')
  this.classes.add('tipp-hide')
  return this
}

/**
 * Cancel the hiding
 *
 * @return {Tipp}
 */

Tipp.prototype.cancelHide = function() {
  this.hiding = false
  return this
}

/**
 * Show a tipp
 *
 * @return {Tipp}
 */

Tipp.prototype.show = function() {
  this.container_classes.remove('tipp-hide')
  this.classes.remove('tipp-hide')
  this.hiding = false
  return this
}

/**
 * Set the orientation
 *
 * @return {Tipp}
 */

Tipp.prototype.orientation = function() {
  this.adjust = adjust(this.container, this.host, {
    target: this.options.orientation,
    offset: this.options.offset
  })

  return this
};

},{"./tipp.css":32,"./tipp.html":33,"adjust":2,"component-classes":13,"component-events":15,"domify":21,"inserted":25,"load-styles":27,"object-assign":28,"sliced":29,"within-document":30}],2:[function(require,module,exports){
/**
 * Module dependencies
 */

var translate = require('translate-component')
var scroll_parent = require('scrollparent')
var Engine = require('adjust-engine')
var raf = require('component-raf')
var now = require('right-now')

/**
 * Get the scrollbar size
 */

var scrollbars = get_scrollbar_size()

/**
 * Export `Adjust`
 */

module.exports = Adjust

/**
 * Initialize `Adjust`
 *
 * @param {Element} attachment
 * @param {Element} target
 * @param {Object} options
 */

function Adjust () {
  var adjustments = []
  var cache = []

  // tick-related
  var last_tick = null
  var timeout = null
  var ticking = true

  // start ticking
  tick()

  // optimize the remaining adjustments
  return function adjust (attachment, target, options) {
    switch (arguments.length) {
      case 0: return position()
      case 1: return attachment !== null ? position(attachment) : unbind()
      default: return add(attachment, target, options) && position(attachment)
    }
  }

  /**
   * Adjust an attachment relative to a target
   */

  function add (attachment, target, options) {
    var adjustment = [attachment, target, Engine(options)];
    adjustments.push(adjustment)

    // styling
    attachment.style.position = 'absolute'
    attachment.style.zIndex = 1000
    attachment.style.left = '0'
    attachment.style.top = '0'

    // initialize the cache
    cache.push([0, 0]);

    return adjustment;
  }

  /**
   * Manage the repositions
   *
   * Based off of: https://github.com/HubSpot/tether/blob/99173e/src/js/tether.js#L52-L85
   */

  function tick () {
    if (!ticking) return

    // Some browsers call events a little too frequently, refuse to run more than is reasonable
    if (last_tick && (now() - last_tick) < 10) {
      raf(tick)
      return
    }

    last_tick = now()
    position()

    // tick again...
    raf(tick)
  }

  /**
   * Position the element
   *
   * @param {Element} attachment
   */

  function position (attachment) {
    adjustments.forEach(function(adjustment, i) {
      // calculate one or all
      if (attachment && attachment != adjustment[0]) return;

      // calculate the offsets
      var offset = calculate(adjustment, i)

      // only translate if the offset changed
      if (offset) {
        translate(adjustment[0], Math.round(offset[0]), Math.round(offset[1]))
        adjustment[0].setAttribute('orientation', offset[2])
      }
    });
  }

  /**
   * Run the calculations
   *
   * @param {Array} adjustment
   * @param {Number} i
   * @return {Object}
   */

  function calculate (adjustment, i) {
    var attachment = adjustment[0]
    var target = adjustment[1]
    var engine = adjustment[2]

    var attachment_position = rect(attachment)
    var target_position = rect(target)

    // calculate the updated position
    var position = engine(attachment_position, target_position, viewport())
    var parent = scroll_parent(attachment)
    var off = offset(attachment)

    var scroll_left = parent.scrollLeft || 0
    var scroll_top = parent.scrollTop || 0

    // calculate the offsets
    var x = scroll_left + position.left - off.left
    var y = scroll_top + position.top - off.top

    // check to see if the position has even changed
    if (cache[i][0] == x && cache[i][1] == y) {
      return false;
    } else {
      cache[i][0] = x
      cache[i][1] = y
      return [x, y, position.orientation]
    }
  }

  /**
   * Stop ticking
   */

  function unbind () {
    ticking = false
  }
}

/**
 * Properly get the bounding box
 *
 * @param {Element} el
 * @return {Object}
 */

function rect (el) {
  var box = el.getBoundingClientRect()
  var scrollTop = window.scrollY
  var scrollLeft = window.scrollX

  return {
    top: box.top + scrollTop,
    right: box.right + scrollLeft,
    left: box.left + scrollLeft,
    bottom: box.bottom + scrollTop,
    width: box.width,
    height: box.height
  }
}

/**
 * Get the offset relative to a position
 * setting parent.
 *
 * @param {Element} el
 * @return {Object} offset
 */

function offset (el) {
  var x = el.offsetLeft
  var y = el.offsetTop

  el = el.offsetParent
  while (el) {
    x += el.offsetLeft + el.clientLeft
    y += el.offsetTop + el.clientTop
    el = el.offsetParent
  }

  return {
    left: x,
    top: y
  }
}

/**
 * Get the viewport positions
 *
 * @return {Object}
 */

function viewport () {
  var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
  var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)

  return {
    top: 0,
    left: 0,
    right: width - scrollbars[0],
    bottom: height - scrollbars[1]
  }
}

/**
 * Get the scroll bar size
 *
 * @return {Array}
 */

function get_scrollbar_size () {
   var inner = document.createElement('p')
   inner.style.width = '100%'
   inner.style.height = '100%'

   var outer = document.createElement('div')
   outer.style.position = 'absolute'
   outer.style.top = '0px'
   outer.style.left = '0px'
   outer.style.visibility = 'hidden'
   outer.style.width = '100px'
   outer.style.height = '100px'
   outer.style.overflow = 'hidden'
   outer.appendChild(inner)
   document.body.appendChild(outer)

   var w1 = inner.offsetWidth
   var h1 = inner.offsetHeight
   outer.style.overflow = 'scroll'
   var w2 = inner.offsetWidth
   var h2 = inner.offsetHeight
   if (w1 == w2) w2 = outer.clientWidth
   if (h1 == h2) h2 = outer.clientHeight
   document.body.removeChild(outer)

   return [(w1 - w2), (h1 - h2)]
};

},{"adjust-engine":3,"component-raf":7,"right-now":8,"scrollparent":9,"translate-component":10}],3:[function(require,module,exports){
/**
 * Module Dependencies
 */

var expr = require('./lib/expression')
var assign = require('object-assign')
var mirror = require('./lib/mirror')

/**
 * Export `Adjust`
 */

module.exports = Adjust

/**
 * Initialize `Adjust`
 *
 * @param {Object} options
 * @return {Object}
 */

function Adjust(options) {
  options = options || {}
  options.flip = undefined === options.flip ? true : options.flip
  options.offset = options.offset || {}

  // default to center middle
  if (!options.attachment && !options.target) {
    options.attachment = 'center middle'
  }

  var offset = assign({ x: 0, y: 0 }, options.offset)
  var attachment = options.attachment ? expr(options.attachment) : mirror(expr(options.target))
  var target = options.target ? expr(options.target) : mirror(expr(options.attachment))

  return function adjust(attachment_position, target_position, viewport_position) {
    // use the width/height or compute the width/height
    var height = attachment_position.height || attachment_position.bottom - attachment_position.top
    var width = attachment_position.width || attachment_position.right - attachment_position.left
    var orientation = assign({}, attachment);

    // calculate the target height and width
    var target_height = target_position.height || target_position.bottom - target_position.top
    var target_width = target_position.width || target_position.right - target_position.left

    // get the offsets
    var offset_y = target.y * target_height - attachment.y * height
    var offset_x = target.x * target_width - attachment.x * width

    // update the position with the offsets
    var left = target_position.left + offset_x + offset.x
    var top = target_position.top + offset_y + offset.y
    var bottom = top + height
    var right = left + width

    // check if we need to flip
    if (options.flip && viewport_position) {
      // out of viewport on the left side or right side,
      // and we have room on the right or left
      if (left < viewport_position.left && target_position.right + width <= viewport_position.right) {
        // flip right
        left = target_position.right - offset.x
        right = left + width
        orientation.x = mirror(orientation.x)
      } else
      if (right > viewport_position.right && target_position.left - width >= viewport_position.left) {
        // flip left
        right = target_position.left - offset.x
        left = right - width
        orientation.x = mirror(orientation.x)
      }

      // out of viewport on the top or bottom,
      // and we have room on the bottom or top
      if (top < viewport_position.top && target_position.bottom + height <= viewport_position.bottom) {
        // flip bottom
        top = target_position.bottom - offset.y
        bottom = top + height
        orientation.y = mirror(orientation.y)
      } else
      if (bottom > viewport_position.bottom && target_position.top - height >= viewport_position.top) {
        // flip top
        bottom = target_position.top - offset.y
        top = bottom - height
        orientation.y = mirror(orientation.y)
      }
    }

    return {
      top: top,
      left: left,
      width: width,
      height: height,
      right: right,
      bottom: bottom,
      orientation: expr(orientation)
    }
  }
}

},{"./lib/expression":4,"./lib/mirror":5,"object-assign":6}],4:[function(require,module,exports){
/**
 * Export `expression`
 *
 * @param {String|Object} expr
 * @return {Object|String}
 */

module.exports = function expr (expr) {
  return typeof expr === 'string'
    ? parse(expr)
    : compile(expr)
}

/**
 * Parse the expression
 *
 * @param {String} expr
 * @return {Object}
 */

function parse(expr) {
  var tokens = expr.split(/\s+/)
  var out = {}

  // token defaults
  if (tokens.length === 1) {
    switch(tokens[0]) {
      case 'middle': tokens.push('center'); break
      case 'bottom': tokens.push('center'); break
      case 'center': tokens.push('middle'); break
      case 'right': tokens.push('middle'); break
      case 'left': tokens.push('middle'); break
      case 'top': tokens.push('center'); break
    }
  }

  // turn strings into numbers
  tokens.forEach(function(token, i) {
    switch (token) {
      case 'center': return out.x = 0.5
      case 'middle': return out.y = 0.5
      case 'bottom': return out.y = 1
      case 'right': return out.x = 1
      case 'left': return out.x = 0
      case 'top': return out.y = 0
      default:
        return i % 2
          ? out.y = percentage(token)
          : out.x = percentage(token)
    }
  })

  return out
}

/**
 * Compile an object into a string
 * the reverse of parse
 *
 * @param {Object} n
 * @return {String}
 */

function compile (expr) {
  var out = []
  switch (expr.x) {
    case 0: out.push('left'); break
    case 0.5: out.push('center'); break
    case 1: out.push('right'); break
    default: out.push(expr.x * 100 + '%')
  }

  switch (expr.y) {
    case 0: out.push('top'); break
    case 0.5: out.push('middle'); break
    case 1: out.push('bottom'); break
    default: out.push((expr.y * 100) + '%')
  }

  return out.join(' ')
}

/**
 * To percentage
 *
 * @param {String} val
 * @return {Number}
 */

function percentage (val) {
  var float = parseFloat(val)
  return isNaN(float) ? 0 : float / 100
}

},{}],5:[function(require,module,exports){
/**
 * Export `mirror`
 */

module.exports = mirror

/**
 * Get the mirror of the attachment
 *
 * @param {Number|Object}
 * @return {Object}
 */

function mirror (p) {
  if (typeof p === 'number') {
    return round(Math.abs(1 - p))
  }

  return {
    x: round(Math.abs(1 - p.x)),
    y: round(Math.abs(1 - p.y))
  }
}

/**
 * Rounding
 *
 * @param {Number} n
 * @return {Number}
 */

function round (n) {
  return parseFloat(n.toFixed(2))
}

},{}],6:[function(require,module,exports){
'use strict';
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function ToObject(val) {
	if (val == null) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function ownEnumerableKeys(obj) {
	var keys = Object.getOwnPropertyNames(obj);

	if (Object.getOwnPropertySymbols) {
		keys = keys.concat(Object.getOwnPropertySymbols(obj));
	}

	return keys.filter(function (key) {
		return propIsEnumerable.call(obj, key);
	});
}

module.exports = Object.assign || function (target, source) {
	var from;
	var keys;
	var to = ToObject(target);

	for (var s = 1; s < arguments.length; s++) {
		from = arguments[s];
		keys = ownEnumerableKeys(Object(from));

		for (var i = 0; i < keys.length; i++) {
			to[keys[i]] = from[keys[i]];
		}
	}

	return to;
};

},{}],7:[function(require,module,exports){
/**
 * Expose `requestAnimationFrame()`.
 */

exports = module.exports = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || fallback;

/**
 * Fallback implementation.
 */

var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  var req = setTimeout(fn, ms);
  prev = curr;
  return req;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.clearTimeout;

exports.cancel = function(id){
  cancel.call(window, id);
};

},{}],8:[function(require,module,exports){
(function (global){
module.exports =
  global.performance &&
  global.performance.now ? function now() {
    return performance.now()
  } : Date.now || function now() {
    return +new Date
  }

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
;(function () {
  var parents = function (node, ps) {
    if (node.parentNode === null) { return ps; }

    return parents(node.parentNode, ps.concat([node]));
  };

  var style = function (node, prop) {
    return getComputedStyle(node, null).getPropertyValue(prop);
  };

  var overflow = function (node) {
    return style(node, "overflow") + style(node, "overflow-y") + style(node, "overflow-x");
  };

  var scroll = function (node) {
   return (/(auto|scroll)/).test(overflow(node));
  };

  var scrollParent = function (node) {
    if (!(node instanceof HTMLElement)) {
      return ;
    }

    var ps = parents(node.parentNode, []);

    for (var i = 0; i < ps.length; i += 1) {
      if (scroll(ps[i])) {
        return ps[i];
      }
    }

    return window;
  };

  // If common js is defined use it.
  if (typeof module === "object" && module !== null) {
    module.exports = scrollParent;
  } else {
    window.Scrollparent = scrollParent;
  }
})();

},{}],10:[function(require,module,exports){

/**
 * Module dependencies.
 */

var transform = require('transform-property');
var has3d = require('has-translate3d');

/**
 * Expose `translate`.
 */

module.exports = translate;

/**
 * Translate `el` by `(x, y)`.
 *
 * @param {Element} el
 * @param {Number} x
 * @param {Number} y
 * @api public
 */

function translate(el, x, y){
  if (transform) {
    if (has3d) {
      el.style[transform] = 'translate3d(' + x + 'px,' + y + 'px, 0)';
    } else {
      el.style[transform] = 'translate(' + x + 'px,' + y + 'px)';
    }
  } else {
    el.style.left = x;
    el.style.top = y;
  }
};

},{"has-translate3d":11,"transform-property":12}],11:[function(require,module,exports){

var prop = require('transform-property');

// IE <=8 doesn't have `getComputedStyle`
if (!prop || !window.getComputedStyle) {
  module.exports = false;

} else {
  var map = {
    webkitTransform: '-webkit-transform',
    OTransform: '-o-transform',
    msTransform: '-ms-transform',
    MozTransform: '-moz-transform',
    transform: 'transform'
  };

  // from: https://gist.github.com/lorenzopolidori/3794226
  var el = document.createElement('div');
  el.style[prop] = 'translate3d(1px,1px,1px)';
  document.body.insertBefore(el, null);
  var val = getComputedStyle(el).getPropertyValue(map[prop]);
  document.body.removeChild(el);
  module.exports = null != val && val.length && 'none' != val;
}

},{"transform-property":12}],12:[function(require,module,exports){

var styles = [
  'webkitTransform',
  'MozTransform',
  'msTransform',
  'OTransform',
  'transform'
];

var el = document.createElement('p');
var style;

for (var i = 0; i < styles.length; i++) {
  style = styles[i];
  if (null != el.style[style]) {
    module.exports = style;
    break;
  }
}

},{}],13:[function(require,module,exports){
/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el || !el.nodeType) {
    throw new Error('A DOM element reference is required');
  }
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`, can force state via `force`.
 *
 * For browsers that support classList, but do not support `force` yet,
 * the mistake will be detected and corrected.
 *
 * @param {String} name
 * @param {Boolean} force
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name, force){
  // classList
  if (this.list) {
    if ("undefined" !== typeof force) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  }

  // fallback
  if ("undefined" !== typeof force) {
    if (!force) {
      this.remove(name);
    } else {
      this.add(name);
    }
  } else {
    if (this.has(name)) {
      this.remove(name);
    } else {
      this.add(name);
    }
  }

  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var className = this.el.getAttribute('class') || '';
  var str = className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

},{"indexof":14}],14:[function(require,module,exports){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],15:[function(require,module,exports){

/**
 * Module dependencies.
 */

var events = require('event');
var delegate = require('delegate');

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

},{"delegate":16,"event":20}],16:[function(require,module,exports){
/**
 * Module dependencies.
 */

var closest = require('closest')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

},{"closest":17,"event":20}],17:[function(require,module,exports){
/**
 * Module Dependencies
 */

var matches = require('matches-selector')

/**
 * Export `closest`
 */

module.exports = closest

/**
 * Closest
 *
 * @param {Element} el
 * @param {String} selector
 * @param {Element} scope (optional)
 */

function closest (el, selector, scope) {
  scope = scope || document.documentElement;

  // walk up the dom
  while (el && el !== scope) {
    if (matches(el, selector)) return el;
    el = el.parentNode;
  }

  // check scope for match
  return matches(el, selector) ? el : null;
}

},{"matches-selector":18}],18:[function(require,module,exports){
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (!el || el.nodeType !== 1) return false;
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

},{"query":19}],19:[function(require,module,exports){
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

},{}],20:[function(require,module,exports){
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
},{}],21:[function(require,module,exports){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Tests for browser support.
 */

var innerHTMLBug = false;
var bugTestDiv;
if (typeof document !== 'undefined') {
  bugTestDiv = document.createElement('div');
  // Setup
  bugTestDiv.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
  // Make sure that link elements get serialized correctly by innerHTML
  // This requires a wrapper element in IE
  innerHTMLBug = !bugTestDiv.getElementsByTagName('link').length;
  bugTestDiv = undefined;
}

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  // for script/link/style tags to work in IE6-8, you have to wrap
  // in a div with a non-whitespace character in front, ha!
  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.polyline =
map.ellipse =
map.polygon =
map.circle =
map.text =
map.line =
map.path =
map.rect =
map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

},{}],22:[function(require,module,exports){

module.exports = inserted;

/**
 * Watch for removal with a DOM3 Mutation Event.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function inserted(el, fn) {
  function cb(mutationEvent) {
    var target = mutationEvent.target
      , children = target.getElementsByTagName ? [].slice.call(target.getElementsByTagName('*')) : [];

    if (el === target || ~children.indexOf(el)) {
      fn(el);
      document.removeEventListener('DOMNodeInserted', cb);
    }
  }

  document.addEventListener('DOMNodeInserted', cb);
}

},{}],23:[function(require,module,exports){

/**
 * Module dependencies.
 */

var withinDoc = require('within-document')
  , Observer = require('mutation-observer');

/**
 * Expose `inserted`.
 */

module.exports = inserted;

/**
 * Watched elements.
 *
 * @api private
 */

var watched = [];

/**
 * Set up observer.
 *
* @api private
 */

var observer = new Observer(onchanges);

/**
 * Generic observer callback.
 *
 * @api private
 */

function onchanges(changes){
  // keep track of number of found els
  var found = 0;

  for (var i = 0, l = changes.length; i < l; i++) {
    if (changes[i].addedNodes.length) {
      // allow for manipulation of `watched`
      // from within the callback
      var w = watched.slice();

      for (var i2 = 0, l2 = w.length; i2 < l2; i2++) {
        var el = w[i2][0];

        // check if the added element is the same
        // or that it's now part of the document
        if (withinDoc(el)) {
          watched.splice(i2 - found++, 1)[0][1]();

          // abort if nothing else left to watch
          if (!watched.length) observer.disconnect();
        }
      }

      // we only need to loop through watched els once
      break;
    }
  }
}

/**
 * Starts observing the DOM.
 *
 * @api private
 */

function observe(){
  var html = document.documentElement;
  observer.observe(html, {
    subtree: true,
    childList: true
  });
}

/**
 * Watches for insertion of `el` into DOM.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function inserted(el, fn){
  // reattach observer if we weren't watching
  if (!watched.length) observe();

  // we add it to the list of elements to check
  watched.push([el, fn]);
}

},{"mutation-observer":26,"within-document":30}],24:[function(require,module,exports){

/**
 * Module dependencies.
 */

var withinDocument = require('within-document');

/**
 * Expose `inserted`.
 */

exports = module.exports = inserted;

/**
 * Default interval.
 */

exports.interval = 200;

/**
 * Watch for removal and invoke `fn(el)`.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api public
 */

function inserted(el, fn){
  interval(el, fn);
}

/**
 * Watch for removal with an interval.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function interval(el, fn) {
  var id = setInterval(function(){
    if (!withinDocument(el)) return;
    clearInterval(id);
    fn(el);
  }, exports.interval);
}

},{"within-document":30}],25:[function(require,module,exports){

/**
 * Module dependencies.
 */

var Observer = require('mutation-observer');

/**
 * Exports the `MutationObserver` based approach
 * or the fallback one depending on UA capabilities.
 */

module.exports = Observer
  ? require('./dom4')
  : document.addEventListener
    ? require('./dom3')
    : require('./fallback');

},{"./dom3":22,"./dom4":23,"./fallback":24,"mutation-observer":26}],26:[function(require,module,exports){
var MutationObserver = window.MutationObserver
  || window.WebKitMutationObserver
  || window.MozMutationObserver;

/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

var WeakMap = window.WeakMap;

if (typeof WeakMap === 'undefined') {
  var defineProperty = Object.defineProperty;
  var counter = Date.now() % 1e9;

  WeakMap = function() {
    this.name = '__st' + (Math.random() * 1e9 >>> 0) + (counter++ + '__');
  };

  WeakMap.prototype = {
    set: function(key, value) {
      var entry = key[this.name];
      if (entry && entry[0] === key)
        entry[1] = value;
      else
        defineProperty(key, this.name, {value: [key, value], writable: true});
      return this;
    },
    get: function(key) {
      var entry;
      return (entry = key[this.name]) && entry[0] === key ?
          entry[1] : undefined;
    },
    'delete': function(key) {
      var entry = key[this.name];
      if (!entry) return false;
      var hasValue = entry[0] === key;
      entry[0] = entry[1] = undefined;
      return hasValue;
    },
    has: function(key) {
      var entry = key[this.name];
      if (!entry) return false;
      return entry[0] === key;
    }
  };
}

var registrationsTable = new WeakMap();

// We use setImmediate or postMessage for our future callback.
var setImmediate = window.msSetImmediate;

// Use post message to emulate setImmediate.
if (!setImmediate) {
  var setImmediateQueue = [];
  var sentinel = String(Math.random());
  window.addEventListener('message', function(e) {
    if (e.data === sentinel) {
      var queue = setImmediateQueue;
      setImmediateQueue = [];
      queue.forEach(function(func) {
        func();
      });
    }
  });
  setImmediate = function(func) {
    setImmediateQueue.push(func);
    window.postMessage(sentinel, '*');
  };
}

// This is used to ensure that we never schedule 2 callas to setImmediate
var isScheduled = false;

// Keep track of observers that needs to be notified next time.
var scheduledObservers = [];

/**
 * Schedules |dispatchCallback| to be called in the future.
 * @param {MutationObserver} observer
 */
function scheduleCallback(observer) {
  scheduledObservers.push(observer);
  if (!isScheduled) {
    isScheduled = true;
    setImmediate(dispatchCallbacks);
  }
}

function wrapIfNeeded(node) {
  return window.ShadowDOMPolyfill &&
      window.ShadowDOMPolyfill.wrapIfNeeded(node) ||
      node;
}

function dispatchCallbacks() {
  // http://dom.spec.whatwg.org/#mutation-observers

  isScheduled = false; // Used to allow a new setImmediate call above.

  var observers = scheduledObservers;
  scheduledObservers = [];
  // Sort observers based on their creation UID (incremental).
  observers.sort(function(o1, o2) {
    return o1.uid_ - o2.uid_;
  });

  var anyNonEmpty = false;
  observers.forEach(function(observer) {

    // 2.1, 2.2
    var queue = observer.takeRecords();
    // 2.3. Remove all transient registered observers whose observer is mo.
    removeTransientObserversFor(observer);

    // 2.4
    if (queue.length) {
      observer.callback_(queue, observer);
      anyNonEmpty = true;
    }
  });

  // 3.
  if (anyNonEmpty)
    dispatchCallbacks();
}

function removeTransientObserversFor(observer) {
  observer.nodes_.forEach(function(node) {
    var registrations = registrationsTable.get(node);
    if (!registrations)
      return;
    registrations.forEach(function(registration) {
      if (registration.observer === observer)
        registration.removeTransientObservers();
    });
  });
}

/**
 * This function is used for the "For each registered observer observer (with
 * observer's options as options) in target's list of registered observers,
 * run these substeps:" and the "For each ancestor ancestor of target, and for
 * each registered observer observer (with options options) in ancestor's list
 * of registered observers, run these substeps:" part of the algorithms. The
 * |options.subtree| is checked to ensure that the callback is called
 * correctly.
 *
 * @param {Node} target
 * @param {function(MutationObserverInit):MutationRecord} callback
 */
function forEachAncestorAndObserverEnqueueRecord(target, callback) {
  for (var node = target; node; node = node.parentNode) {
    var registrations = registrationsTable.get(node);

    if (registrations) {
      for (var j = 0; j < registrations.length; j++) {
        var registration = registrations[j];
        var options = registration.options;

        // Only target ignores subtree.
        if (node !== target && !options.subtree)
          continue;

        var record = callback(options);
        if (record)
          registration.enqueue(record);
      }
    }
  }
}

var uidCounter = 0;

/**
 * The class that maps to the DOM MutationObserver interface.
 * @param {Function} callback.
 * @constructor
 */
function JsMutationObserver(callback) {
  this.callback_ = callback;
  this.nodes_ = [];
  this.records_ = [];
  this.uid_ = ++uidCounter;
}

JsMutationObserver.prototype = {
  observe: function(target, options) {
    target = wrapIfNeeded(target);

    // 1.1
    if (!options.childList && !options.attributes && !options.characterData ||

        // 1.2
        options.attributeOldValue && !options.attributes ||

        // 1.3
        options.attributeFilter && options.attributeFilter.length &&
            !options.attributes ||

        // 1.4
        options.characterDataOldValue && !options.characterData) {

      throw new SyntaxError();
    }

    var registrations = registrationsTable.get(target);
    if (!registrations)
      registrationsTable.set(target, registrations = []);

    // 2
    // If target's list of registered observers already includes a registered
    // observer associated with the context object, replace that registered
    // observer's options with options.
    var registration;
    for (var i = 0; i < registrations.length; i++) {
      if (registrations[i].observer === this) {
        registration = registrations[i];
        registration.removeListeners();
        registration.options = options;
        break;
      }
    }

    // 3.
    // Otherwise, add a new registered observer to target's list of registered
    // observers with the context object as the observer and options as the
    // options, and add target to context object's list of nodes on which it
    // is registered.
    if (!registration) {
      registration = new Registration(this, target, options);
      registrations.push(registration);
      this.nodes_.push(target);
    }

    registration.addListeners();
  },

  disconnect: function() {
    this.nodes_.forEach(function(node) {
      var registrations = registrationsTable.get(node);
      for (var i = 0; i < registrations.length; i++) {
        var registration = registrations[i];
        if (registration.observer === this) {
          registration.removeListeners();
          registrations.splice(i, 1);
          // Each node can only have one registered observer associated with
          // this observer.
          break;
        }
      }
    }, this);
    this.records_ = [];
  },

  takeRecords: function() {
    var copyOfRecords = this.records_;
    this.records_ = [];
    return copyOfRecords;
  }
};

/**
 * @param {string} type
 * @param {Node} target
 * @constructor
 */
function MutationRecord(type, target) {
  this.type = type;
  this.target = target;
  this.addedNodes = [];
  this.removedNodes = [];
  this.previousSibling = null;
  this.nextSibling = null;
  this.attributeName = null;
  this.attributeNamespace = null;
  this.oldValue = null;
}

function copyMutationRecord(original) {
  var record = new MutationRecord(original.type, original.target);
  record.addedNodes = original.addedNodes.slice();
  record.removedNodes = original.removedNodes.slice();
  record.previousSibling = original.previousSibling;
  record.nextSibling = original.nextSibling;
  record.attributeName = original.attributeName;
  record.attributeNamespace = original.attributeNamespace;
  record.oldValue = original.oldValue;
  return record;
};

// We keep track of the two (possibly one) records used in a single mutation.
var currentRecord, recordWithOldValue;

/**
 * Creates a record without |oldValue| and caches it as |currentRecord| for
 * later use.
 * @param {string} oldValue
 * @return {MutationRecord}
 */
function getRecord(type, target) {
  return currentRecord = new MutationRecord(type, target);
}

/**
 * Gets or creates a record with |oldValue| based in the |currentRecord|
 * @param {string} oldValue
 * @return {MutationRecord}
 */
function getRecordWithOldValue(oldValue) {
  if (recordWithOldValue)
    return recordWithOldValue;
  recordWithOldValue = copyMutationRecord(currentRecord);
  recordWithOldValue.oldValue = oldValue;
  return recordWithOldValue;
}

function clearRecords() {
  currentRecord = recordWithOldValue = undefined;
}

/**
 * @param {MutationRecord} record
 * @return {boolean} Whether the record represents a record from the current
 * mutation event.
 */
function recordRepresentsCurrentMutation(record) {
  return record === recordWithOldValue || record === currentRecord;
}

/**
 * Selects which record, if any, to replace the last record in the queue.
 * This returns |null| if no record should be replaced.
 *
 * @param {MutationRecord} lastRecord
 * @param {MutationRecord} newRecord
 * @param {MutationRecord}
 */
function selectRecord(lastRecord, newRecord) {
  if (lastRecord === newRecord)
    return lastRecord;

  // Check if the the record we are adding represents the same record. If
  // so, we keep the one with the oldValue in it.
  if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord))
    return recordWithOldValue;

  return null;
}

/**
 * Class used to represent a registered observer.
 * @param {MutationObserver} observer
 * @param {Node} target
 * @param {MutationObserverInit} options
 * @constructor
 */
function Registration(observer, target, options) {
  this.observer = observer;
  this.target = target;
  this.options = options;
  this.transientObservedNodes = [];
}

Registration.prototype = {
  enqueue: function(record) {
    var records = this.observer.records_;
    var length = records.length;

    // There are cases where we replace the last record with the new record.
    // For example if the record represents the same mutation we need to use
    // the one with the oldValue. If we get same record (this can happen as we
    // walk up the tree) we ignore the new record.
    if (records.length > 0) {
      var lastRecord = records[length - 1];
      var recordToReplaceLast = selectRecord(lastRecord, record);
      if (recordToReplaceLast) {
        records[length - 1] = recordToReplaceLast;
        return;
      }
    } else {
      scheduleCallback(this.observer);
    }

    records[length] = record;
  },

  addListeners: function() {
    this.addListeners_(this.target);
  },

  addListeners_: function(node) {
    var options = this.options;
    if (options.attributes)
      node.addEventListener('DOMAttrModified', this, true);

    if (options.characterData)
      node.addEventListener('DOMCharacterDataModified', this, true);

    if (options.childList)
      node.addEventListener('DOMNodeInserted', this, true);

    if (options.childList || options.subtree)
      node.addEventListener('DOMNodeRemoved', this, true);
  },

  removeListeners: function() {
    this.removeListeners_(this.target);
  },

  removeListeners_: function(node) {
    var options = this.options;
    if (options.attributes)
      node.removeEventListener('DOMAttrModified', this, true);

    if (options.characterData)
      node.removeEventListener('DOMCharacterDataModified', this, true);

    if (options.childList)
      node.removeEventListener('DOMNodeInserted', this, true);

    if (options.childList || options.subtree)
      node.removeEventListener('DOMNodeRemoved', this, true);
  },

  /**
   * Adds a transient observer on node. The transient observer gets removed
   * next time we deliver the change records.
   * @param {Node} node
   */
  addTransientObserver: function(node) {
    // Don't add transient observers on the target itself. We already have all
    // the required listeners set up on the target.
    if (node === this.target)
      return;

    this.addListeners_(node);
    this.transientObservedNodes.push(node);
    var registrations = registrationsTable.get(node);
    if (!registrations)
      registrationsTable.set(node, registrations = []);

    // We know that registrations does not contain this because we already
    // checked if node === this.target.
    registrations.push(this);
  },

  removeTransientObservers: function() {
    var transientObservedNodes = this.transientObservedNodes;
    this.transientObservedNodes = [];

    transientObservedNodes.forEach(function(node) {
      // Transient observers are never added to the target.
      this.removeListeners_(node);

      var registrations = registrationsTable.get(node);
      for (var i = 0; i < registrations.length; i++) {
        if (registrations[i] === this) {
          registrations.splice(i, 1);
          // Each node can only have one registered observer associated with
          // this observer.
          break;
        }
      }
    }, this);
  },

  handleEvent: function(e) {
    // Stop propagation since we are managing the propagation manually.
    // This means that other mutation events on the page will not work
    // correctly but that is by design.
    e.stopImmediatePropagation();

    switch (e.type) {
      case 'DOMAttrModified':
        // http://dom.spec.whatwg.org/#concept-mo-queue-attributes

        var name = e.attrName;
        var namespace = e.relatedNode.namespaceURI;
        var target = e.target;

        // 1.
        var record = new getRecord('attributes', target);
        record.attributeName = name;
        record.attributeNamespace = namespace;

        // 2.
        var oldValue =
            e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;

        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          // 3.1, 4.2
          if (!options.attributes)
            return;

          // 3.2, 4.3
          if (options.attributeFilter && options.attributeFilter.length &&
              options.attributeFilter.indexOf(name) === -1 &&
              options.attributeFilter.indexOf(namespace) === -1) {
            return;
          }
          // 3.3, 4.4
          if (options.attributeOldValue)
            return getRecordWithOldValue(oldValue);

          // 3.4, 4.5
          return record;
        });

        break;

      case 'DOMCharacterDataModified':
        // http://dom.spec.whatwg.org/#concept-mo-queue-characterdata
        var target = e.target;

        // 1.
        var record = getRecord('characterData', target);

        // 2.
        var oldValue = e.prevValue;


        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          // 3.1, 4.2
          if (!options.characterData)
            return;

          // 3.2, 4.3
          if (options.characterDataOldValue)
            return getRecordWithOldValue(oldValue);

          // 3.3, 4.4
          return record;
        });

        break;

      case 'DOMNodeRemoved':
        this.addTransientObserver(e.target);
        // Fall through.
      case 'DOMNodeInserted':
        // http://dom.spec.whatwg.org/#concept-mo-queue-childlist
        var target = e.relatedNode;
        var changedNode = e.target;
        var addedNodes, removedNodes;
        if (e.type === 'DOMNodeInserted') {
          addedNodes = [changedNode];
          removedNodes = [];
        } else {

          addedNodes = [];
          removedNodes = [changedNode];
        }
        var previousSibling = changedNode.previousSibling;
        var nextSibling = changedNode.nextSibling;

        // 1.
        var record = getRecord('childList', target);
        record.addedNodes = addedNodes;
        record.removedNodes = removedNodes;
        record.previousSibling = previousSibling;
        record.nextSibling = nextSibling;

        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          // 2.1, 3.2
          if (!options.childList)
            return;

          // 2.2, 3.3
          return record;
        });

    }

    clearRecords();
  }
};

if (!MutationObserver) {
  MutationObserver = JsMutationObserver;
}

module.exports = MutationObserver;

},{}],27:[function(require,module,exports){

/**
 * Module exports.
 */

module.exports = loadStyles;

/**
 * Injects the CSS into the <head> DOM node.
 *
 * @param {String} css CSS string to add to the <style> tag.
 * @param {Document} doc document instance to use.
 */

function loadStyles(css, doc) {
  // default to the global `document` object
  if (!doc) doc = document;

  var head = doc.head || doc.getElementsByTagName('head')[0];

  // no <head> node? create one...
  if (!head) {
    head = doc.createElement('head');
    var body = doc.body || doc.getElementsByTagName('body')[0];
    if (body) {
      body.parentNode.insertBefore(head, body);
    } else {
      doc.documentElement.appendChild(head);
    }
  }

  var style = doc.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet) {  // IE
    style.styleSheet.cssText = css;
  } else {                 // the world
    style.appendChild(doc.createTextNode(css));
  }
  head.appendChild(style);

  return style;
}

},{}],28:[function(require,module,exports){
/* eslint-disable no-unused-vars */
'use strict';
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],29:[function(require,module,exports){

/**
 * An Array.prototype.slice.call(arguments) alternative
 *
 * @param {Object} args something with a length
 * @param {Number} slice
 * @param {Number} sliceEnd
 * @api public
 */

module.exports = function (args, slice, sliceEnd) {
  var ret = [];
  var len = args.length;

  if (0 === len) return ret;

  var start = slice < 0
    ? Math.max(0, slice + len)
    : slice || 0;

  if (sliceEnd !== undefined) {
    len = sliceEnd < 0
      ? sliceEnd + len
      : sliceEnd
  }

  while (len-- > start) {
    ret[len - start] = args[len];
  }

  return ret;
}


},{}],30:[function(require,module,exports){

/**
 * Module dependencies.
 */

var withinElement = require('within-element');

/**
 * Check if the DOM element `child` is within the page global `document`.
 *
 * @param {DOMElement} child - the element to check if it with within `document`
 * @return {Boolean} True if `child` is within the `document`. False otherwise.
 * @public
 */

module.exports = function within (child) {
  return withinElement(child, document);
};

},{"within-element":31}],31:[function(require,module,exports){

/**
 * Check if the DOM element `child` is within the given `parent` DOM element.
 *
 * @param {DOMElement|Range} child - the DOM element or Range to check if it's within `parent`
 * @param {DOMElement} parent  - the parent node that `child` could be inside of
 * @return {Boolean} True if `child` is within `parent`. False otherwise.
 * @public
 */

module.exports = function within (child, parent) {
  // don't throw if `child` is null
  if (!child) return false;

  // Range support
  if (child.commonAncestorContainer) child = child.commonAncestorContainer;
  else if (child.endContainer) child = child.endContainer;

  // traverse up the `parentNode` properties until `parent` is found
  var node = child;
  while (node = node.parentNode) {
    if (node == parent) return true;
  }

  return false;
};

},{}],32:[function(require,module,exports){
module.exports = 'module.exports = \'.tipp {\n  font-size: 11px;\n  display: inline-block;\n  background-color: #000;\n  border-color: #000;\n  color: #fff;\n}\n\n.tipp-container.tipp-hide {\n  pointer-events: none;\n}\n\n.tipp.tipp-hide {\n  opacity: 0;\n}\n\n.tipp-body {\n  background-color: inherit;\n  color: inherit;\n  padding: 8px 10px 7px 10px;\n  text-align: center;\n}\n\n.tipp-arrow {\n  position: absolute;\n  width: 0;\n  height: 0;\n  line-height: 0;\n  border-color: inherit;\n  border-style: dashed;\n  border-width: 5px;\n}\n\n.tipp-container[orientation~="top"] .tipp-arrow { border-top-color: inherit }\n.tipp-container[orientation~="bottom"] .tipp-arrow { border-bottom-color: inherit }\n.tipp-container[orientation~="left"] .tipp-arrow { border-left-color: inherit }\n.tipp-container[orientation~="right"] .tipp-arrow { border-right-color: inherit }\n\n.tipp-container[orientation~="bottom"][orientation~="center"] .tipp-arrow,\n.tipp-container[orientation~="bottom"][orientation~="left"] .tipp-arrow,\n.tipp-container[orientation~="bottom"][orientation~="right"] .tipp-arrow {\n  bottom: -5px;\n  left: 50%;\n  margin-left: -5px;\n  border-top-style: solid;\n  border-bottom: none;\n  border-left-color: transparent;\n  border-right-color: transparent\n}\n\n.tipp-container[orientation~="top"][orientation~="center"] .tipp-arrow,\n.tipp-container[orientation~="top"][orientation~="left"] .tipp-arrow,\n.tipp-container[orientation~="top"][orientation~="right"] .tipp-arrow {\n  top: -5px;\n  left: 50%;\n  margin-left: -5px;\n  border-bottom-style: solid;\n  border-top: none;\n  border-left-color: transparent;\n  border-right-color: transparent\n}\n\n.tipp-container[orientation~="right"][orientation~="middle"] .tipp-arrow {\n  right: -5px;\n  top: 50%;\n  margin-top: -5px;\n  border-left-style: solid;\n  border-right: none;\n  border-top-color: transparent;\n  border-bottom-color: transparent\n}\n\n.tipp-container[orientation~="left"][orientation~="middle"] .tipp-arrow {\n  left: -5px;\n  top: 50%;\n  margin-top: -5px;\n  border-right-style: solid;\n  border-left: none;\n  border-top-color: transparent;\n  border-bottom-color: transparent\n}\n\n.tipp-container[orientation~="top"][orientation~="right"] .tipp-arrow,\n.tipp-container[orientation~="bottom"][orientation~="right"] .tipp-arrow {\n  left: 85%;\n}\n\n\n.tipp-container[orientation~="top"][orientation~="left"] .tipp-arrow,\n.tipp-container[orientation~="bottom"][orientation~="left"] .tipp-arrow {\n  left: 15%;\n}\n\';';
},{}],33:[function(require,module,exports){
module.exports = 'module.exports = \'<div class="tipp-container tipp-hide">\n  <div class="tipp tipp-hide">\n    <div class="tipp-arrow"></div>\n    <div class="tipp-body"></div>\n  </div>\n</div>\n\';';
},{}]},{},[1])(1)
});