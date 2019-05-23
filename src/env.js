/*
 * Copyright 2019 Adam Bertrand Berger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const { Document } = require('./element');

let window = global,
    document = null,
    Proxy = Proxy || null,
    HTMLDocument = null,
    Element = null,
    usingProxyDocument = false;

const initializeWindow = newWindow => {
    window = newWindow;

    // if there is no window, use a new fake DOM
    if (window === undefined || window.document === undefined) {
        document = new Document();
        usingProxyDocument = true;
    } else {
        document = window.document;
        usingProxyDocument = false;
    }
    
    if (window !== undefined) {
        Proxy = window.Proxy;
        HTMLDocument = window.HTMLDocument;
        Element = window.Element;
    }
};

const supportsProxy = () => typeof Proxy === 'function';
const isUsingProxyDocument = () => usingProxyDocument;

initializeWindow(window);

Object.assign(module.exports, {
    initializeWindow,
    window,
    document,
    Proxy,
    HTMLDocument,
    Element,
    isUsingProxyDocument,
    supportsProxy,
});
