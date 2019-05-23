/*
 * Copyright 2019 Adam Bertrand Berger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * Keys in the configuration object that are reserved (won't work as
 * a shortcut to add a prop or attr)
 */
const RESERVED_KEYS = new Set([
    'children',
    'props',
    'attrs',
]);

/*
 * If these keys are in the root of the configuration object, they will
 * always be interpreted as properties and not attributes
 */
const FORCED_PROP_KEYS = new Set([
    'innerHTML',
    'innerText',
    'outerHTML',
    'textContent',
    'hidden',
    'dataset',
    'isContentEditable',
]);

/*
 * Attempt to guess what someone means -- careful when you add to this
 * it will trying to use these keys as attributes
 */
const ALIAS_KEYS = {
    html: 'innerHTML',
    text: 'textContent'
};

Object.assign(module.exports, {
    RESERVED_KEYS,
    FORCED_PROP_KEYS,
    ALIAS_KEYS
});
