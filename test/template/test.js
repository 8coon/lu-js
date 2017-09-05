'use strict';

/* global describe */
/* global it */

const assert = require('chai').assert;
const b = require('../../template/template');


describe('Template', () => {

    it('should return object', () => {
        assert(typeof b`<div/>` === 'object', 'b returns object');
    });

    it('should return vdom node with tag name specified', () => {
        assert((b`<div/>`).tag === 'div', 'tag name is div');
        assert((b`<div></div>`).tag === 'div', 'tag name is div');
    });

    it('should return vdom node with children 1', () => {
        const node = b`<div>lol kek<div/></div>`;

        assert(node.tag === 'div', 'tag name is div');
        assert(node.children.length === 2, 'node has children');
        assert(node.children[0] === 'lol kek', 'node has correct text child');
        assert(node.children[1].tag === 'div', 'node has correct node child');
    });

    it('should return vdom node with children 2', () => {
        const node = b`<div>lol kek<div>cheburek</div></div>`;

        assert(node.tag === 'div', 'tag name is div');
        assert(node.children[1].children.length === 1, 'node has children');
        assert(node.children[1].children[0] === 'cheburek', 'node has correct child');
    });

    it('should return vdom node with children 3', () => {
        const node = b`<div>lol kek<div>cheburek<div>lol</div></div></div>`;

        assert(node.tag === 'div', 'tag name is div');
        assert(node.children[1].children[1].children.length === 1, 'node has children');
        assert(node.children[1].children[1].children[0] === 'lol', 'node has correct child');
    });

    it('should substitute values and parse props', () => {
        const node = b`<div 
            lol kek="1 2 3" prop="${'value'}"/>`;

        assert(node.tag === 'div', 'tag name is div');
        assert(node.children.length === 0, 'node has no children');
        assert(node.props.lol === true, 'props.lol is true');
        assert(node.props.kek === '1 2 3', 'props.kek is 1 2 3');
        assert(node.props.prop === 'value', 'props.prop is value');
    });

    it('should substitute values and parse style', () => {
        const node = b`<div style="${{backgroundColor: 'rgb(240, 255, 255)'}}"/>`;

        assert(node.style, 'node has style');
        assert(node.style.backgroundColor === 'rgb(240, 255, 255)', 'node background color is rgb(240, 255, 255)');
    });

    it('should cache rendered templates', () => {
        b`<div kek style="${{backgroundColor: 'rgb(240, 255, 255)'}}"/>`;
        const node2 = b`<div kek style="${{backgroundColor: 'rgb(240, 255, 255)'}}"/>`;

        assert(node2.cached === true, 'template is cached');
    });

});
