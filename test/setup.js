const { expect } = require('chai');

function expectStr(le) {
    return expect(le.outerHTML);
}

function assertStr(le, str) {
    expectStr(le).to.equal(str);
}

module.exports = {
    expectStr,
    assertStr,
}
