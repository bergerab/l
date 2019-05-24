/* should be moved to a performance testing file */
const { expectStr, assertStr } = require('../setup');
const { performance } = require('perf_hooks');
var l = require('../../dist/l.js');
const { expect } = require('chai');

function assertStrAndRuntime(normal, lFunc, str, msDifference=1) {
    var now = performance.now();
    expectStr(lFunc()).to.equal(str);
    const dt2 = performance.now() - now;
    
    now = performance.now();
    expectStr(normal()).to.equal(str);
    const dt1 = performance.now() - now;

    console.log('\tNormal took', dt1, '`l` Function took', dt2);

    expect(dt2 - dt1).to.be.lessThan(msDifference);
}

describe('`l` Functions and normal function calls should be the same', () => {
    it('Producing a `div` should have the same output and `l` function should be within 1 millisecond in runtime', () => {
        assertStrAndRuntime(() => l.div(), () => l(() => div), '<div></div>');
    });

    it('Producing nested `div`s should have the same output and `l` function should be within 1 millisecond in runtime', () => {
        assertStrAndRuntime(() => l.div(l.div(l.div(l.div(l.div())))), () => l(() => div(div(div(div(div()))))), '<div><div><div><div><div></div></div></div></div></div>');
    });

    it('Producing large amount of content should have the same output and `l` function should be within 1 millisecond in runtime', () => {
        assertStrAndRuntime(
            
            () => l.div(
                `Maecenas commodo quam in dolor suscipit, vitae auctor dui ullamcorper. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur placerat leo nec diam finibus, id vulputate mauris rutrum. Aliquam at dui euismod, rhoncus mi nec, lacinia quam. Nullam vitae aliquet mi. Donec scelerisque vestibulum metus vel porta. Donec magna urna, facilisis volutpat fermentum sed, consequat ac lectus. Integer feugiat massa nulla, at vehicula nibh posuere eleifend. Ut nec lorem dolor. Vivamus molestie enim quam, ut condimentum justo aliquam quis. Pellentesque mattis semper metus vel tempor. Aliquam convallis, sem nec elementum lobortis, massa est dapibus dolor, tempor convallis lorem massa sit amet nisi. Phasellus in hendrerit felis, ut pulvinar tortor. Sed blandit ligula vitae eros sollicitudin cursus. Quisque gravida nibh vitae pretium sodales.`,
                l.div(l.div(l.div(l.div())))),

            
            () => l(() => div(
                `Maecenas commodo quam in dolor suscipit, vitae auctor dui ullamcorper. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur placerat leo nec diam finibus, id vulputate mauris rutrum. Aliquam at dui euismod, rhoncus mi nec, lacinia quam. Nullam vitae aliquet mi. Donec scelerisque vestibulum metus vel porta. Donec magna urna, facilisis volutpat fermentum sed, consequat ac lectus. Integer feugiat massa nulla, at vehicula nibh posuere eleifend. Ut nec lorem dolor. Vivamus molestie enim quam, ut condimentum justo aliquam quis. Pellentesque mattis semper metus vel tempor. Aliquam convallis, sem nec elementum lobortis, massa est dapibus dolor, tempor convallis lorem massa sit amet nisi. Phasellus in hendrerit felis, ut pulvinar tortor. Sed blandit ligula vitae eros sollicitudin cursus. Quisque gravida nibh vitae pretium sodales.`,                
                div(div(div(div()))))),
            
            
            '<div><div><div><div><div></div></div></div></div></div>'
        );
    });

    it('Producing nested `div`s should have the same output and `l` function should be within 1 millisecond in runtime', () => {
        assertStrAndRuntime(() =>
                            l.div(span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span(),span()),
                            () => l(() => div(div(div(div(div()))))), '<div><div><div><div><div></div></div></div></div></div>');
    });
});

