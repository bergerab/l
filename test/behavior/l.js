const { expect } = require('chai');
const { expectStr, assertStr } = require('../setup');
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
});
