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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _template2.default;

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

var serializeValue = function serializeValue(literal, value, idx) {
    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' || typeof value === 'function') {
        return '' + VALUE_STR + idx + VALUE_STR;
    }

    return String(value || '');
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
    var matches = content.match(new RegExp(TAG_MATCH + '.*' + TAG_CLOSING_MATCH + '|' + TAG_SHORT_MATCH + '|([^<>]*)', 'g'));

    // If no suitable child found
    if (!matches) {
        return [];
    }

    return matches.map(function (match) {
        return matchT(match, values, options);
    }).filter(function (node) {
        return (typeof node === 'undefined' ? 'undefined' : _typeof(node)) === 'object' || typeof node === 'string' && node.length > 0;
    });
};

var matchT = function matchT(literal, values, options) {
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
    matches = literal.match(new RegExp('^\\s*' + TAG_SHORT_NAME_MATCH + '\\s*$'));
    if (matches) {
        return parseTagT(tagT(matches[1]), matches[1]);
    }

    // We got a normal tag probably with a content
    matches = literal.match(new RegExp('^\\s*' + TAG_NAME_MATCH + '(.*)' + TAG_CLOSING_NAME_MATCH + '\\s*$'));
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
 *      render: 'json'|'dom'|function(root: Node),
 *      node: function(node: Node): Node,
 *      tags: Map<string, function(name: string, attrs: object, children: Node[]): Node>,
 *      attrs: Map<string, function(name: string, value),
 *
 * }} options
 */
function Lou() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var rendered = new _map2.default();

    var render = options.render || 'json';
    var tags = options.tags || {};
    var attrs = options.attrs || {};
    var node = options.node;

    switch (render) {
        case 'json':
            render = function render(root) {
                return root;
            };break;
        case 'dom':
            render = function render(root) {
                return document.createElement('DIV');
            };break;
    }

    return function (literals) {
        for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            values[_key - 1] = arguments[_key];
        }

        var cached = rendered.get(literals);

        // If the template was cached
        if (cached !== void 0) {
            return render(matchT(cached, values, { cached: true, tags: tags, attrs: attrs, node: node }));
        }

        // Merge literals and values
        var merged = literals.map(function (literal) {
            return literal.replace(new RegExp(VALUE_MATCH + '\\r\\n'), '');
        }).map(function (literal, idx) {
            return literal + serializeValue(literal, values[idx], idx);
        }).join('');

        // Cache compiled template
        rendered.set(literals, merged);

        // Parse the whole thing
        return render(matchT(merged, values, { tags: tags, attrs: attrs, node: node }));
    };
};

window.Lou = Lou;

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

/***/ })
/******/ ]);