/* global describe, it, expect, Lou */

['Normal', 'Minified'].forEach(type => {
    const Lou = window[`Lou${type}`];

    describe(`Lou ${type}`, () => {

        it('should return object', () => {
            const b = Lou();

            expect(typeof b`<div/>` === 'object', 'b returns object');
        });

        it('should return vdom node with tag name specified', () => {
            const b = Lou();

            expect((b`<div/>`).tag === 'div', 'tag name is div');
            expect((b`<div></div>`).tag === 'div', 'tag name is div');
        });

        it('should return vdom node with children 1', () => {
            const b = Lou();

            const node = b`<div>lol kek<div/></div>`;

            expect(node.tag === 'div', 'tag name is div');
            expect(node.children.length === 2, 'node has children');
            expect(node.children[0] === 'lol kek', 'node has correct text child');
            expect(node.children[1].tag === 'div', 'node has correct node child');
        });

        it('should return vdom node with children 2', () => {
            const b = new Lou();

            const node = b`<div>lol kek<div>cheburek</div></div>`;

            expect(node.tag === 'div', 'tag name is div');
            expect(node.children[1].children.length === 1, 'node has children');
            expect(node.children[1].children[0] === 'cheburek', 'node has correct child');
        });

        it('should return vdom node with children 3', () => {
            const b = Lou();

            const node = b`<div>lol kek<div>cheburek<div>lol</div></div></div>`;

            expect(node.tag === 'div', 'tag name is div');
            expect(node.children[1].children[1].children.length === 1, 'node has children');
            expect(node.children[1].children[1].children[0] === 'lol', 'node has correct child');
        });

        it('should substitute values and parse attrs', () => {
            const b = Lou();

            const node = b`<div 
                lol kek="1 2 3" prop="${'value'}"/>`;

            expect(node.tag === 'div', 'tag name is div');
            expect(node.children.length === 0, 'node has no children');
            expect(node.attrs.lol === true, 'attrs.lol is true');
            expect(node.attrs.kek === '1 2 3', 'attrs.kek is 1 2 3');
            expect(node.attrs.prop === 'value', 'attrs.prop is value');
        });

        it('should substitute values and parse style', () => {
            const b = Lou();

            const node = b`<div style="${{backgroundColor: 'rgb(240, 255, 255)'}}"/>`;

            expect(node.attrs.style, 'node has style');
            expect(node.attrs.style.backgroundColor === 'rgb(240, 255, 255)', 'node background color is rgb(240, 255, 255)');
        });

        it('should cache rendered templates', () => {
            const b = Lou();

            b`<div kek style="${{backgroundColor: 'rgb(240, 255, 255)'}}"/>`;
            const node2 = b`<div kek style="${{backgroundColor: 'rgb(240, 255, 255)'}}"/>`;

            expect(node2.cached === true, 'template is cached');
        });

        it('should call tag substitution function', () => {
            const b = Lou({
                tags: {
                    'div': (name, attrs, children) => {
                        expect(name === 'div', 'tag name is resolved correctly');
                        expect(attrs.lol, 'tag attrs are resolved correctly 1');
                        expect(attrs.kek, 'tag attrs are resolved correctly 2');
                        expect(attrs.chebu === 'rek', 'tag attrs are resolved correctly 3');
                        expect(children[0].tag === 'a', 'children are resolved correctly');

                        return {tag: 'span', attrs, children}
                    }
                }
            });

            const node = b`<div lol kek chebu="${'rek'}"><a href="#"></a></div>`;

            expect(typeof node === 'object', 'node is object');
            expect(node.tag === 'span', 'tag is substituted');
            expect(node.attrs.chebu === 'rek', 'tag attrs are substituted');
        });

        it('should call rendering function', () => {
            const b = Lou({
                render: root => {
                    expect(root.tag === 'div');
                    return root.attrs.class;
                }
            });

            const node = b`<div class="${'lol kek cheburek'}">k</div>`;

            expect(node === 'lol kek cheburek');
        });

        it('should call attribute substitution function', () => {
            const kek = {kek: true};

            const b = Lou({
                attrs: {
                    'lol': (name, value) => {
                        expect(name === 'lol', 'name is resolved correctly');
                        expect(value === kek, 'value is resolved correctly');
                        return 'kek';
                    }
                }
            });

            const node = b`<div lol="${kek}"/>`;

            expect(node.attrs.lol === 'kek', 'value is substituted');
        });

        it('should call node processor', () => {
            let called = 0;

            const b = Lou({
                node: node => {
                    expect(node.tag === 'div', 'tag is resolved correctly');
                    node.lol = 'kek';

                    called++;
                    return node;
                }
            });

            const node = b`<div class="lol"><div class="kek"/></div>`;

            expect(node.lol === 'kek', 'processor can modify node 1');
            expect(node.children[0].lol === 'kek', 'processor can modify node 2');
            expect(called === 2, 'processor is called 2 times');
        });

        it('should render to DOM', () => {
            const b = Lou({render: 'DOM'});

            const node = b`
                <div class="lol kek" style="${{backgroundColor: 'black', color: 'white'}}">
                    <a href="#">Click me!</a>
                </div>`;

            expect(node.tagName === 'DIV', 'tag is rendered to DOM');
            expect(node.classList.contains('lol'), 'class is rendered to DOM 1');
            expect(node.classList.contains('kek'), 'class is rendered to DOM 2');
            expect(node.querySelector('a').href === '#', 'child is rendered to DOM');
            expect(node.querySelector('a').childNodes.item(0).textContent === 'Click me!', 'text is rendered to DOM');
        });

    });
});
