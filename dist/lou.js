/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _template = __webpack_require__(1);

var _template2 = _interopRequireDefault(_template);

var _dom = __webpack_require__(3);

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _template2.default;


_template2.default.domRender = _dom2.default;
window.Lou = _template2.default;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.Node = Node;
exports.default = Lou;

var _map = __webpack_require__(2);

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Regexps
var TAG_MATCH = '<[^<>]*>';
var TAG_NAME_MATCH = '<([^<>]*)>';
var TAG_SHORT_MATCH = '<[^<>]*\\/>';
var TAG_SHORT_NAME_MATCH = '<([^<>]*)\\/>';
var TAG_CLOSING_MATCH = '<\\/[A-Za-z0-9_-]*>';
var TAG_CLOSING_NAME_MATCH = '<\\/([A-Za-z0-9_-]*)>';

// ASCII special char codes
var VALUE_STR = String.fromCharCode(30); // Serialized argument indicator
var VALUE_MATCH = '\\x1E';

/**
 * Template Node
 * @param {string[]|Node[]} children
 * @param options
 * @constructor {Node}
 */
function Node(children, options) {
    this.tag = '';
    this.children = children;
    this.attrs = {};
    this.cached = options && options.cached;

    var processor = options.node;

    if (processor) {
        return processor(this);
    }
}

var serializeValue = function serializeValue(literal, value, idx, values) {
    if (idx >= values.length) {
        return '';
    }

    return '' + VALUE_STR + idx + VALUE_STR;
};

var parseValue = function parseValue(value, values) {
    var matches = value.match(new RegExp('^' + VALUE_MATCH + '(\\d*)' + VALUE_MATCH + '$'));

    // If value is plain text
    if (!matches) {
        return value;
    }

    return values[parseInt(matches[1], 10)];
};

var attrsT = function attrsT(match, values, attrs) {
    var matches = match.match(/(?:(?=")(".*?")|([\w=]*))/g);

    return matches.slice(1).reduce(function (props, match, idx, array) {
        // Empty match
        if (!match.length) {
            return props;
        }

        var valueT = attrs[match];

        // Property without a value
        if (!match.endsWith('=')) {
            return Object.assign(props, _defineProperty({}, match, valueT ? valueT(match, true) : true));
        }

        var nextMatch = array[idx + 1] || '';
        array[idx + 1] = '';

        // Trim braces
        if (nextMatch.startsWith('"')) {
            nextMatch = nextMatch.substring(1, nextMatch.length - 1);
        }

        var key = match.substring(0, match.length - 1);
        var value = parseValue(nextMatch, values, attrs);
        var nextValueT = attrs[key];

        return Object.assign(props, _defineProperty({}, key, nextValueT ? nextValueT(key, value) : value));
    }, {});
};

var tagT = function tagT(match) {
    return match.match(/^([A-Za-z0-9_-]*)/)[1] || '';
};

var childrenT = function childrenT(content, values, options) {
    var matches = content.match(new RegExp(TAG_SHORT_MATCH + '|' + TAG_MATCH + '.*' + TAG_CLOSING_MATCH + '|' + VALUE_MATCH + '\\d*' + VALUE_MATCH + '|([^<>]*)', 'g'));

    // If no suitable child found
    if (!matches) {
        return [];
    }

    return matches.map(function (match) {
        return matchT(parseValue(match, values), values, options);
    }).reduce(function (nodes, match) {
        if (match && match[0] instanceof Node) {
            nodes.push.apply(nodes, _toConsumableArray(match));
        } else {
            nodes.push(match);
        }

        return nodes;
    }, []).filter(function (node) {
        return (typeof node === 'undefined' ? 'undefined' : _typeof(node)) === 'object' || typeof node === 'string' && node.length > 0;
    });
};

var matchT = function matchT(literal, values, options) {
    // If we got a node instance -- insert it in our JSON
    if (literal instanceof Node || literal[0] instanceof Node) {
        return literal;
    }

    var parseTagT = function parseTagT(tag, content, children) {
        var tags = options.tags;
        var attrs = attrsT(content, values, options.attrs);

        if (tags[tag]) {
            return tags[tag](tag, attrs, children);
        }

        var node = new Node(children || [], options);

        node.tag = tag;
        node.attrs = attrs;

        return node;
    };

    var matches = void 0;

    // If we got a self-closing tag
    matches = literal.match(new RegExp('^' + TAG_SHORT_NAME_MATCH));
    if (matches) {
        return parseTagT(tagT(matches[1]), matches[1]);
    }

    // We got a normal tag probably with a content
    matches = literal.match(new RegExp('^' + TAG_NAME_MATCH + '(.*)' + TAG_CLOSING_NAME_MATCH + '$'));
    var tagName = void 0;

    if (matches && matches[1]) {
        tagName = tagT(matches[1]);
    }

    if (tagName) {
        return parseTagT(tagName, matches[1], childrenT(matches[2], values, options));
    }

    // Plain text
    return literal;
};

/**
 * @param {{
 *      node: function(node: Node): Node,
 *      tags: Map<string, function(name: string, attrs: object, children: Node[]): Node>,
 *      attrs: Map<string, function(name: string, value),
 *      events: boolean = false
 *
 * }} options
 */
function Lou() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var rendered = new _map2.default();

    var tags = options.tags || {};
    var attrs = options.attrs || {};
    var node = options.node;

    return function (literals) {
        for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            values[_key - 1] = arguments[_key];
        }

        // Array of nodes -- return
        if (literals[0] instanceof Node) {
            return literals;
        }

        var cached = rendered.get(literals);

        // If the template was cached
        if (cached !== void 0) {
            return matchT(cached, values, { cached: true, tags: tags, attrs: attrs, node: node });
        }

        // Merge literals and values
        var merged = literals.map(function (literal) {
            return literal.trim().replace(new RegExp('[' + VALUE_MATCH + '\\r\\n\\t]', 'g'), '');
        }).map(function (literal, idx) {
            return literal + serializeValue(literal, values[idx], idx, values);
        }).join('');

        // Cache compiled template
        rendered.set(literals, merged);

        // Parse the whole thing
        return matchT(merged, values, { tags: tags, attrs: attrs, node: node });
    };
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var ArrayMap = function ArrayMap() {
    this.byLength = {};
};

Object.assign(ArrayMap.prototype, {
    prepare: function prepare(key) {
        var byLength = this.byLength[key.length] || {};
        this.byLength[key.length] = byLength;

        var byFirst = byLength[key[0]];
        byLength[key[0]] = byFirst || { keys: [], values: [] };
    },
    set: function set(key, value) {
        this.prepare(key);
        var index = this.byLength[key.length][key[0]].keys.indexOf(key);

        if (index === -1) {
            this.byLength[key.length][key[0]].keys.push(key);
            this.byLength[key.length][key[0]].values.push(value);

            return;
        }

        this.byLength[key.length][key[0]].values[index] = value;
    },
    has: function has(key) {
        if (!this.byLength[key.length]) {
            return false;
        }

        if (!this.byLength[key.length][key[0]]) {
            return false;
        }

        return this.byLength[key.length][key[0]].keys.indexOf(key) !== -1;
    },
    get: function get(key) {
        if (!this.byLength[key.length]) {
            return void 0;
        }

        if (!this.byLength[key.length][key[0]]) {
            return void 0;
        }

        var index = this.byLength[key.length][key[0]].keys.indexOf(key);
        return this.byLength[key.length][key[0]].values[index];
    }
});

exports.default = ArrayMap;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var charMap = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '&': '&amp;',
    '\'': '&#39;'
};

var sanitize = function sanitize(string) {
    return string.replace(/[<>'"&]/g, function (match) {
        return charMap[match];
    });
};

/**
 * @param {Node} src
 * @param parent = null
 * @param {{events: boolean = false}} options
 */
var domT = function domT(src) {
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var options = arguments[2];

    // We're handling text node
    if ((typeof src === 'undefined' ? 'undefined' : _typeof(src)) !== 'object') {
        var text = sanitize(String(src));
        var _dst = document.createTextNode(text);

        // Append to parent
        if (parent) {
            parent.appendChild(_dst);
        }

        return _dst;
    }

    var dst = document.createElement(src.tag);
    var events = options.events;
    var handlers = void 0;

    // Creating event handlers map
    if (events) {
        dst.__lou_handlers__ = dst.__lou_handlers__ || {};
        handlers = dst.__lou_handlers__;
    }

    // Render attributes
    Object.keys(src.attrs).forEach(function (name) {
        var value = src.attrs[name];

        // Processing inline styles separately
        if (name === 'style') {
            Object.keys(value).forEach(function (propName) {
                return dst.style[propName] = value[propName];
            });
            return;
        }

        // Processing event handlers
        var lowerName = name.toLowerCase();
        if (events && lowerName.startsWith('on')) {
            handlers[lowerName] = value;

            value = 'this.__lou_handlers__[\'' + lowerName + '\'](event)';
        }

        dst.setAttribute(name, value);
    });

    // Render children
    src.children.forEach(function (child) {
        return domT(child, dst, options);
    });

    // Append to parent
    if (parent) {
        parent.appendChild(dst);
    }

    return dst;
};

/**
 * @param {Node} root
 * @param {{events: boolean = false}} options
 */

exports.default = function (root) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return domT(root, null, options);
};

/***/ })
/******/ ]);