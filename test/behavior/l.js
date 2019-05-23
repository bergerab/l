const { expect } = require('chai');
const { expectStr, assertStr, assertStrs } = require('../setup');
var l = require('../../dist/l.js');

describe('HTML Element creation with no properties, attributes, or children', () => {
    it('should produce an element if a function with a name of a valid HTML tag name is called on `l`.', () => {
        expectStr(l.div()).to.equal('<div></div>');
        expectStr(l.span()).to.equal('<span></span>');
        expectStr(l.blockquote()).to.equal('<blockquote></blockquote>');
        expectStr(l.html()).to.equal('<html></html>');
    });

    it('should produce an element if a function with a name of a valid HTML5 tag name is called on `l`.', () => {
        expectStr(l.section()).to.equal('<section></section>');
        expectStr(l.article()).to.equal('<article></article>');        
    });

    it('should not work with invalid tag names.', () => {
        expect(l.bogus).to.equal(undefined);
        expect(l.badbad).to.equal(undefined);
        expect(l.notATag).to.equal(undefined);
        expect(l.htmll).to.equal(undefined);
        expect(l.hhtml).to.equal(undefined);
        expect(l.qp).to.equal(undefined);
    });

    it('should be able to produce any tag name by calling `l` as a function.', () => {
        expectStr(l('custom')).to.equal('<custom></custom>');
        expectStr(l('p')).to.equal('<p></p>');
    });

    it('should be able to produce tags by using `l` functions.', () => {
        expectStr(l(() => span)).to.equal('<span></span>');
        expectStr(l(() => html)).to.equal('<html></html>');
        expectStr(l(() => blockquote)).to.equal('<blockquote></blockquote>');
        expectStr(l(() => section)).to.equal('<section></section>');
    });
});

describe('HTML Element creation with properties, and attributes', () => {
    it('should add to the nodes attributes when `attrs` is passed explicitly.', () => {
        assertStr(l.div({ attrs: {}}), '<div></div>');
        assertStr(l.div({ attrs: { style: 'color: red;'}}), '<div style="color: red;"></div>');
        assertStr(l.div({ attrs: { nonStandard: 'thingy'}}), '<div nonstandard="thingy"></div>'); // attributes become lowercase
        assertStr(l.div({ attrs: { one: 'a', two: 'b', three: 'c', four: 'd' }}), '<div one="a" two="b" three="c" four="d"></div>');
        
        function meatball() {};
        let node = l.div({ attrs: { onchange: meatball }});
        assertStr(node, '<div onchange="function meatball() {}"></div>');
        expect(node.onchange).to.equal(undefined);
    });

    it('should add to the nodes properties when `props` is passed explicitly.', () => {
        assertStr(l.div({ props: {}}), '<div></div>');
        
        let node = l.div({ props: { style: { color: 'red', backgroundColor: 'pink' }}});
        assertStr(node, '<div style="color: red; background-color: pink;"></div>');
        expect(node.style.color).to.equal('red');
        expect(node.style.backgroundColor).to.equal('pink');
        
        function meatball() {}
        node = l.div({ props: { onchange: meatball }});
        expect(node.outerHTML).to.equal('<div></div>');
        expect(node.onchange).to.equal(meatball);

        function handler() {}
        node = l.div({ props: { nonStandardProp: handler }});
        expect(node.outerHTML).to.equal('<div></div>');
        expect(node.nonStandardProp).to.equal(handler);

        node = l.span({ props: { nonStandardProp: handler, onchange: meatball }});
        expect(node.outerHTML).to.equal('<span></span>');
        expect(node.nonStandardProp).to.equal(handler);
        expect(node.onchange).to.equal(meatball);        
    });

    it('should infer whether to use attrs or props based on the value and name in the configuration object', () => {
        let node = l.div({ style: { color: 'red', backgroundColor: 'pink' }});
        assertStr(node, '<div style="color: red; background-color: pink;"></div>');
        expect(node.style.color).to.equal('red');
        expect(node.style.backgroundColor).to.equal('pink');

        function meatball() {}
        node = l.div({ onchange: meatball });
        expect(node.outerHTML).to.equal('<div></div>');
        expect(node.onchange).to.equal(meatball);
    });

    it('should allow for boolean attributes', () => {
        assertStr(l.div({ enabled: true }), '<div enabled></div>');
        assertStr(l.div({ disabled: true }), '<div disabled></div>');
        assertStr(l.span({ disabled: false }), '<span></span>');
    });
});

describe('HTML Element creation with child elements', () => {
    it('should be able to have no children', () => {
        assertStr(l(() => div([])), '<div></div>');
        assertStr(l(() => div()), '<div></div>');
    });
    
    it('should work for single children.', () => {
        assertStr(l.div(l.span), '<div><span></span></div>');
        assertStr(l.div(l.span()), '<div><span></span></div>');
        assertStr(l.div([l.span]), '<div><span></span></div>');
        assertStr(l.div([l.span()]), '<div><span></span></div>');
        assertStr(l.p([l.h1()]), '<p><h1></h1></p>');

        assertStr(l(() => p(h1)), '<p><h1></h1></p>');
        assertStr(l(() => a([h2])), '<a><h2></h2></a>');
        assertStr(l(() => a([h2()])), '<a><h2></h2></a>');
        assertStr(l(() => a(h2())), '<a><h2></h2></a>');                
    });

    it('should work for two children.', () => {
        assertStr(l.a([l.i(), l.span()]), '<a><i></i><span></span></a>');                                
        assertStr(l.a([l.i(), l.span]), '<a><i></i><span></span></a>');
        assertStr(l.a([l.i, l.p()]), '<a><i></i><p></p></a>');                                        
        assertStr(l.a([l.i, l.span]), '<a><i></i><span></span></a>');                        

        assertStr(l.a(l.i(), l.span), '<a><i></i><span></span></a>');
        assertStr(l.a(l.i, l.span), '<a><i></i><span></span></a>');
        assertStr(l.a(l.i(), l.span()), '<a><i></i><span></span></a>');

        assertStr(l(() => a(i, span)), '<a><i></i><span></span></a>');
    });

    it('should work for three children.', () => {
        assertStr(l.article(l.section, l.h1, l.h2), '<article><section></section><h1></h1><h2></h2></article>');
        assertStr(l(() => article(h2, section, h3)), '<article><h2></h2><section></section><h3></h3></article>');
    });

    it('should be able to have text node children.', () => {
        assertStr(l(() => a(1, 2, 3, 4)), '<a>1234</a>');
        assertStr(l(() => h2('asdf', 'd', 'wer')), '<h2>asdfdwer</h2>');
        assertStr(l(() => h3(2, 'asdf', 'd', 3, 4, 'wer')), '<h3>2asdfd34wer</h3>');
    });

    it('should work when the children and/or parent have text content.', () => {
        assertStr(l(() => a('1', i('2'), '3', span('4'))), '<a>1<i>2</i>3<span>4</span></a>');
        assertStr(l(() => p('1', em('2', 'a', 'b'), '3', span, 'c', 'd')), '<p>1<em>2ab</em>3<span></span>cd</p>');
        assertStr(l(() => em(i('asdf'))), '<em><i>asdf</i></em>');
    });

    it('should be able to have children of their own.', () => {
        assertStr(l(() => a(p(div(span)))), '<a><p><div><span></span></div></p></a>');
        assertStr(l(() => h5(p, h4(section, h2, div(span(), div()), h6))), '<h5><p></p><h4><section></section><h2></h2><div><span></span><div></div></div><h6></h6></h4></h5>');
    });

    it('should be able to have children of their own with arbitrary text content.', () => {
        assertStr(l(() => h1('asdf', h2('fds', 3, 10), 3, 1)), '<h1>asdf<h2>fds310</h2>31</h1>');
        assertStr(l(() => h5(0, p(3), 99, h4(section, 'hey', h2, div(span('a'), 'b', div()), h6))), '<h5>0<p>3</p>99<h4><section></section>hey<h2></h2><div><span>a</span>b<div></div></div><h6></h6></h4></h5>');
    });
});

const a = 39;
describe('l functions', () => {
    it('should have the same output as tag generators.', () => {
        assertStrs(l(() => div()), l.div());
        assertStrs(l(() => h1(h2(h3), h4, h5)), l.h1(l.h2(l.h3), l.h4, l.h5));
        assertStrs(l(() => p('fff', h2(h3, 1, 2), 23, 'fwef', h4, h5, 'wef')), l.p('fff', l.h2(l.h3, 1, 2), 23, 'fwef', l.h4, l.h5, 'wef'));
        assertStrs(l(() => div), l.div());
    });

    it('should be able to have nested l functions.', () => {
        assertStr(l(() => div(span, () => h1(p, a, 'f'))), '<div><span></span><h1><p></p><a></a>f</h1></div>');
        assertStr(l(() => a(p, l(() => h6(h4, 'b', h3)))), '<a><p></p><h6><h4></h4>b<h3></h3></h6></a>');
        assertStr(l(() => h1(() => h2(() => h3(() => h4(() => h5))))), '<h1><h2><h3><h4><h5></h5></h4></h3></h2></h1>');
        assertStr(l(() => h1(l(() => h2(l(() => h3(l(() => h4(l(() => h5))))))))), '<h1><h2><h3><h4><h5></h5></h4></h3></h2></h1>');
    });

    it('should be a valid argument for tag generators.', () => {
        assertStr(l.div(() => span), '<div><span></span></div>');
        assertStr(l.h2(() => h4(h3), () => h5(), () => span), '<h2><h4><h3></h3></h4><h5></h5><span></span></h2>');
    });

    it('should return its first argument if it is not an intermediate tag.', () => {
        assertStr(l.h2(() => l.div()), '<h2><div></div></h2>');
        assertStr(l.h2(() => 3), '<h2>3</h2>');
        assertStr(l.h4(() => 'spongebob'), '<h4>spongebob</h4>');
    });

    it('should\'t overwrite locally scoped variables', () => {
        const p = 3;
        expect(l(() => div(p)).outerHTML).to.equal('<div><p></p></div>');
        expect(p).to.equal(3);
    });

    it('should\'t overwrite globally scoped variables', () => {
        expect(l(() => div(a)).outerHTML).to.equal('<div><a></a></div>');
        expect(a).to.equal(39);
    });
});

describe('Calling l as a function', () => {
    it('should be idempotent.', () => {
        expect(l(l(l(l(l(3))))).outerHTML).to.equal(l(3).outerHTML);
        assertStr(l(l(l(l(l('burrito'))))), l('burrito').outerHTML);
        assertStr(l(l(l(l(l(() => div))))), l.div().outerHTML);
    });

    it('should correctly normalize numbers', () => {
        assertStr(l(2, 3), '<2>3</2>');
        assertStr(l('toe', 3, 4), '<toe>34</toe>');
        assertStr(l(100), '<100></100>');
    });

    it('should add arguemnts as children if first argument can be normalized to an element', () => {
        assertStr(l(() => div('hi'), 2323), '<div>hi2323</div>');
        assertStr(l(l.span(), 'inside'), '<span>inside</span>');
    });
});

describe('Element generators given a text argument', () => {
    it('should place it in textContent, and not innerHTML', () => {
        let node = l.div('<free></free>');
        expect(node.children.length).to.equal(0);
        expect(node.outerHTML).to.equal('<div>&lt;free&gt;&lt;/free&gt;</div>');
        expect(node.textContent).to.equal('<free></free>');
    });
});
