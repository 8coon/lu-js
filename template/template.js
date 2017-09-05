'use strict';

const Map = require('../map/map');

// Regexps
const TAG_MATCH = '<[^<>]*>';
const TAG_NAME_MATCH = '<([^<>]*)>';
const TAG_SHORT_MATCH = '<[^<>]*\\/>';
const TAG_SHORT_NAME_MATCH = '<([^<>]*)\\/>';
const TAG_CLOSING_MATCH = '<\\/[A-Za-z0-9_-]*>';
const TAG_CLOSING_NAME_MATCH = '<\\/([A-Za-z0-9_-]*)>';

// ASCII special char codes
const VALUE_STR = String.fromCharCode(30);   // Serialized argument indicator
const VALUE_MATCH = '\\x1E';


/**
 * Template Node
 * @param {string[]|Node[]} children
 * @param {{cached: boolean}} options
 * @constructor {Node}
 */
function Node(children, options) {
    this.tag = '';
    this.children = children;
    this.props = {};
    this.style = {};
    this.cached = options && options.cached;
}

Object.assign(Node.prototype, {

    setProps(props) {
        const style = props.style;
        delete props.style;

        this.props = props;
        this.style = style || {};
    }

});

const serializeValue = (literal, value, idx) => {
    if (typeof value === 'object' || typeof value === 'function') {
        return `${VALUE_STR}${idx}${VALUE_STR}`
    }

    return String(value || '');
};


const parseValue = (value, values) => {
    const matches = value.match(new RegExp(`^${VALUE_MATCH}(\\d*)${VALUE_MATCH}$`));

    // If value vas plain text
    if (!matches) {
        return value;
    }

    return values[parseInt(matches[1], 10)];
};


const propsT = (match, values) => {
    let matches = match.match(/(?:(?=")(".*?")|([\w=]*))/g);

    return matches
        .slice(1)
        .reduce((props, match, idx, array) => {
            // Empty match
            if (!match.length) {
                return props;
            }

            // Property without a value
            if (!match.endsWith('=')) {
                return Object.assign(props, {[match]: true});
            }

            let nextMatch = array[idx + 1] || '';
            array[idx + 1] = '';

            // Trim braces
            if (nextMatch.startsWith('"')) {
                nextMatch = nextMatch.substring(1, nextMatch.length - 1);
            }

            const key = match.substring(0, match.length - 1);
            const value = parseValue(nextMatch, values);

            return Object.assign(props, {[key]: value});
        }, {});
};


const tagT = match => match.match(/^([A-Za-z0-9_-]*)/)[1] || '';


const childrenT = (content, values) => {
    let matches = content.match(new RegExp(`${TAG_MATCH}.*${TAG_CLOSING_MATCH}|${TAG_SHORT_MATCH}|([^<>]*)`, 'g'));

    // If no suitable child found
    if (!matches) {
        return [];
    }

    return matches
        .map(match => matchT(match, values))
        .filter(node => typeof node === 'object' || typeof node === 'string' && node.length > 0);
};


const matchT = (literal, values, options) => {
    let matches;

    // If we got a self-closing tag
    matches = literal.match(new RegExp(`^\\s*${TAG_SHORT_NAME_MATCH}\\s*$`));
    if (matches) {
        const node = new Node([], options);

        node.tag = tagT(matches[1]);
        node.setProps(propsT(matches[1], values));

        return node;
    }

    // We got a normal tag probably with a content
    matches = literal.match(new RegExp(`^\\s*${TAG_NAME_MATCH}(.*)${TAG_CLOSING_NAME_MATCH}\\s*$`));
    if (matches && matches[1].toLowerCase() === matches[3].toLowerCase()) {
        const node = new Node(childrenT(matches[2]), options);

        node.tag = tagT(matches[1]);
        node.setProps(propsT(matches[1], values));

        return node;
    }

    // Plain text
    return literal;
};


const rendered = new Map();

const b = (literals, ...values) => {
    const cached = rendered.get(literals);

    // If the template was cached
    if (cached !== void 0) {
        return matchT(cached, values, {cached: true});
    }

    // Merge literals and values
    const merged = literals
        .map(literal => literal.replace(new RegExp(`${VALUE_MATCH}\\r\\n`), ''))
        .map((literal, idx) => literal + serializeValue(literal, values[idx], idx))
        .join('');

    // Cache compiled template
    rendered.set(literals, merged);

    // Parse the whole thing
    return matchT(merged, values);
};


module.exports = b;
