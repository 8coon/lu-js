'use strict';

import Map from '../map/map';


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
 * @param options
 * @constructor {Node}
 */
export function Node(children, options) {
    this.tag = '';
    this.children = children;
    this.attrs = {};
    this.cached = options && options.cached;

    const processor = options.node;

    if (processor) {
        return processor(this);
    }
}

const serializeValue = (literal, value, idx) => {
    if (typeof value === 'object' || typeof value === 'function') {
        return `${VALUE_STR}${idx}${VALUE_STR}`
    }

    return String(value || '');
};


const parseValue = (value, values) => {
    const matches = value.match(new RegExp(`^${VALUE_MATCH}(\\d*)${VALUE_MATCH}$`));

    // If value is plain text
    if (!matches) {
        return value;
    }

    return values[parseInt(matches[1], 10)];
};


const attrsT = (match, values, attrs) => {
    let matches = match.match(/(?:(?=")(".*?")|([\w=]*))/g);

    return matches
        .slice(1)
        .reduce((props, match, idx, array) => {
            // Empty match
            if (!match.length) {
                return props;
            }

            const valueT = attrs[match];

            // Property without a value
            if (!match.endsWith('=')) {
                return Object.assign(props, {[match]: valueT ? valueT(match, true) : true});
            }

            let nextMatch = array[idx + 1] || '';
            array[idx + 1] = '';

            // Trim braces
            if (nextMatch.startsWith('"')) {
                nextMatch = nextMatch.substring(1, nextMatch.length - 1);
            }

            const key = match.substring(0, match.length - 1);
            const value = parseValue(nextMatch, values, attrs);
            const nextValueT = attrs[key];

            return Object.assign(props, {[key]: nextValueT ? nextValueT(key, value): value});
        }, {});
};


const tagT = match => match.match(/^([A-Za-z0-9_-]*)/)[1] || '';


const childrenT = (content, values, options) => {
    let matches = content.match(new RegExp(`${TAG_MATCH}.*${TAG_CLOSING_MATCH}|${TAG_SHORT_MATCH}|([^<>]*)`, 'g'));

    // If no suitable child found
    if (!matches) {
        return [];
    }

    return matches
        .map(match => matchT(match, values, options))
        .filter(node => typeof node === 'object' || typeof node === 'string' && node.length > 0);
};


const matchT = (literal, values, options) => {
    const parseTagT = (tag, content, children) => {
        const tags = options.tags;
        const attrs = attrsT(content, values, options.attrs);

        if (tags[tag]) {
            return (tags[tag])(tag, attrs, children);
        }

        const node = new Node(children || [], options);

        node.tag = tag;
        node.attrs = attrs;

        return node;
    };

    let matches;

    // If we got a self-closing tag
    matches = literal.match(new RegExp(`^\\s*${TAG_SHORT_NAME_MATCH}\\s*$`));
    if (matches) {
        return parseTagT(tagT(matches[1]), matches[1]);
    }

    // We got a normal tag probably with a content
    matches = literal.match(new RegExp(`^\\s*${TAG_NAME_MATCH}(.*)${TAG_CLOSING_NAME_MATCH}\\s*$`));
    let tagName;

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
export default function Lou(options = {}) {
    const rendered = new Map();

    let render = options.render || 'json';
    const tags = options.tags || {};
    const attrs = options.attrs || {};
    const node = options.node;

    switch (render) {
        case 'json': render = root => root; break;
        case 'dom': render = root => document.createElement('DIV'); break;
    }

    return (literals, ...values) => {
        const cached = rendered.get(literals);

        // If the template was cached
        if (cached !== void 0) {
            return render(matchT(cached, values, {cached: true, tags, attrs, node}));
        }

        // Merge literals and values
        const merged = literals
            .map(literal => literal.replace(new RegExp(`${VALUE_MATCH}\\r\\n`), ''))
            .map((literal, idx) => literal + serializeValue(literal, values[idx], idx))
            .join('');

        // Cache compiled template
        rendered.set(literals, merged);

        // Parse the whole thing
        return render(matchT(merged, values, {tags, attrs, node}));
    };
};

window.Lou = Lou;
