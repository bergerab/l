const { expect } = require('chai');

function expectStr(le) {
    return expect(le.outerHTML);
}

function assertStr(le, str) {
    expectStr(le).to.equal(str);
}

function assertStrs(le1, le2) {
    expectStr(le1).to.equal(le2.outerHTML);
}

module.exports = {
    expectStr,
    assertStr,
    assertStrs
}
