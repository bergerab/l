/*
 * Copyright 2019 Adam Bertrand Berger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const { TAGS } = require('./tags');

/*
 * o is map from (symbol -> symbol)
 *
 */
const toDeclarations = (o) => {
    return `var ${Object.entries(o).map(([x, y]) => `${x}=${y}`).join(',')};`;
};

const createDeclarations = (aliases={ var: '_var' }) => {
    const context = {};
    for (let tagName of TAGS.values()) {
        let elementGeneratorName = tagName;

        if (tagName in aliases) {
            tagName = aliases[tagName];
        }
        context[tagName] = 'l.' + elementGeneratorName;
    }
    return toDeclarations(context);
};

const declarations = createDeclarations();

const _eval = (func, l) => {
    func = `${declarations};return (${func})();`;
    return new Function('l', func)(l);
};

const _with = (data, func, l) => {
    func = `return (${func})();`;
    const args = ['l', '__data'];
    let hasThis = false;
    for (const key in data) {
        if (key !== 'this') { // make it so that we can use "this" by not passing it as an argument, just bind it to the function
            args.push(key);
            func = `${key}=__data.${key};\n` + func;
        } else {
            hasThis = true;
        }
    }
    func = declarations + func; // ordering matters here. we are doing the declarations last, so that people can overwrite the element generators
    args.push(func);

    if (hasThis) {
        return new Function(...args).bind(data['this'])(l, data);
    } else {
        return new Function(...args)(l, data);
    }
};

module.exports = {
    _eval,
    _with,
};
