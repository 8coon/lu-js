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
    this.onRender = null;

    const processor = options.node;

    if (processor) {
        return processor(this);
    }
}

const serializeValue = (literal, value, idx, values) => {
    if (idx >= values.length) {
        return '';
    }

    return `${VALUE_STR}${idx}${VALUE_STR}`;
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
    let matches = content.match(new RegExp(`${TAG_SHORT_MATCH}|${TAG_MATCH}.*?${TAG_CLOSING_MATCH}|${VALUE_MATCH}\\d*${VALUE_MATCH}|([^<>]*)`, 'g'));

    // If no suitable child found
    if (!matches) {
        return [];
    }

    return matches
        .map(match => matchT(parseValue(match, values), values, options))
        .reduce((nodes, match) => {
            if (match && (match[0]) instanceof Node) {
                nodes.push(...match);
            } else {
                nodes.push(match);
            }

            return nodes;
        }, [])
        .filter(node => typeof node === 'object' || typeof node === 'string' && node.length > 0);
};


const matchT = (literal, values, options) => {
    // If we got a node instance -- insert it in our JSON
    if (literal instanceof Node || literal[0] instanceof Node) {
        return literal;
    }

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
    matches = literal.match(new RegExp(`^${TAG_SHORT_NAME_MATCH}`));
    if (matches) {
        return parseTagT(tagT(matches[1]), matches[1]);
    }

    // We got a normal tag probably with a content
    matches = literal.match(new RegExp(`^${TAG_NAME_MATCH}(.*)${TAG_CLOSING_NAME_MATCH}$`));
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
 *      node: function(node: Node): Node,
 *      tags: Map<string, function(name: string, attrs: object, children: Node[]): Node>,
 *      attrs: Map<string, function(name: string, value),
 *      events: boolean = false
 *
 * }} options
 */
export default function Lou(options = {}) {
    const rendered = new Map();

    const tags = options.tags || {};
    const attrs = options.attrs || {};
    const node = options.node;

    return (literals, ...values) => {
        // Array of nodes -- return
        if (literals[0] instanceof Node) {
            return literals;
        }

        const cached = rendered.get(literals);

        // If the template was cached
        if (cached !== void 0) {
            return matchT(cached, values, {cached: true, tags, attrs, node});
        }

        // Merge literals and values
        const merged = literals
            .map(literal => literal.trim().replace(new RegExp(`[${VALUE_MATCH}\\r\\n\\t]`, 'g'), ''))
            .map((literal, idx) => literal + serializeValue(literal, values[idx], idx, values))
            .join('');

        // Cache compiled template
        rendered.set(literals, merged);

        // Parse the whole thing
        return matchT(merged, values, {tags, attrs, node});
    };
};
