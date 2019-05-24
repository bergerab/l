/*
 * Copyright 2019 Adam Bertrand Berger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const { RESERVED_KEYS, FORCED_PROP_KEYS, ALIAS_KEYS } = require('./config'),
      { setProps, setAttrs, appendChildren, isElement } = require('./domHelpers'),
      { document, supportsProxy } = require('./env'),
      { _eval, _with } = require('./eval'),
      { TAGS } = require('./tags');

let forceAttrsEnabled = false,
    forcePropsEnabled = false,
    aliasingEnabled = true;

class IElement {
    constructor(name, init1={}, init2, ...children) {
        init1 = normalize(init1);
        init2 = normalize(init2);
        
        const init2IsElement = isElement(init2),
              init1IsElement = isElement(init1),
              init2Type = typeof init2,
              init1Type = typeof init1;

        let init = {};
        if (!init1IsElement) {
            if (init2IsElement || typeof init2 !== 'object' && init2 !== undefined) {
                init = typeof init1 === 'object' ? init1 : {};
            } else {
                init = init2 || init1;
            }
        }
        
        if (Array.isArray(init1)) {
            if (init2 === undefined) {
                init = {
                    children: init1
                };
            } else {
                init.children = init1;
            }
        } else if (init1IsElement) {
            if (init2 === undefined) {
                init = {
                    children: [init1]
                };
            } else {
                init.children = [init1];
            }
        } else if (init1Type !== 'object') {
            if (init2 === undefined) {
                init = {
                    props: {
                        textContent: init
                    }
                };
            } else {
                init.props = init.props || {};
                init.props.textContent = init1;
            }
        }

        const init2IsChild = init2IsElement || typeof init2 !== 'object' && init2 !== undefined;
        if (init2IsChild || children.length > 0) {
            if (init2IsChild) {
                children = [init2].concat(children);
            }

            if (init.children !== undefined) {
                init.children = init.children.concat(children);
            } else {
                init.children = children;
            }
        }

        this.name = typeof name === 'number' ? name.toString() : name;
        this.children = nodify(init.children) || [];
        this.props = init.props || {};
        this.attrs = init.attrs || {};

        this.inferAttrsAndProps(init);
    }
    
    inferAttrsAndProps(init) {
        for (let name in init) {
            let val = init[name];
            if (aliasingEnabled && ALIAS_KEYS[name] !== undefined) {
                name = ALIAS_KEYS[name];
            }
            
            if (!(RESERVED_KEYS.has(name))) {
                if (val !== undefined) {
                    const type = typeof val;
                    if (!forceAttrsEnabled && (forcePropsEnabled || type === 'object' || type === 'function' || FORCED_PROP_KEYS.has(name))) {
                        this.props[name] = val;
                    } else {
                        this.attrs[name] = val;
                    }
                }
            }
        }
    }

    render() {
        var tag = document.createElement(this.name);
        setProps(tag, this.props);
        setAttrs(tag, this.attrs);
        if (this.children.length > 0) {
            appendChildren(tag, this.children);
        }
        return tag;
    }
}

/*
 * Instead of adding a boolean field to the element generator functions
 * I keep them in a set. It feels cleaner this way to not have a random
 * boolean floating around.
 */
const elementGenerators = new Set(),
      iElementGenerators = new Set(),
      isElementGenerator = o => typeof o === 'function' && elementGenerators.has(o),
      isIElementGenerator = o => typeof o === 'function' && iElementGenerators.has(o),
      isIElement = o => typeof o === 'object' && o instanceof IElement;

/*
 * Creates an IElement generator for the given tagName
 * This  generator returns a IElement (not HTMLElement)
 */
const createIElementGenerator = tagName => {
    const func = (...args) => new IElement(tagName, ...args);
    iElementGenerators.add(func);
    return func;
};

/* 
 * Creates a node generator for the given tagName.
 * This generator returns a HTMLElement.
 */
const createElementGenerator = tagName => {
    const func = (...args) => new IElement(tagName, ...args).render();
    elementGenerators.add(func);
    return func;
};

/*
 * If we don't have E6 Proxy in this environment, set the tag names
 * as functions immediately. Return the updated `l`
 */
const setElementGenerators = l => {
    for (const tag of TAGS.values()) {
        l[tag] = createElementGenerator(tag);
        l['_' + tag] = createIElementGenerator(tag);
    }
    return l;
};

/*
 * If we have ES6 Proxy in this environment, setup a proxy so that
 * we can skip creating 100+ functions as in `setElementGenerators`.
 * Return proxy to replace `l`
 */
const proxyElementGenerators = l => {
    const cache = {},
          proxy = new Proxy(l, {
              get: function(obj, prop) {
                  if (prop in cache) {
                      return cache[prop];
                  }
                  
                  if (TAGS.has(prop)) {
                      return cache[prop] = createElementGenerator(prop);
                  } else if (prop.startsWith('_')) {
                      return cache[prop] = createIElementGenerator(prop.substring(3));
                  }
                  return obj[prop];
              },
          });
    return proxy;
};

/*
 * disableProxy - even if this environment has ES6 Proxy don't use it. For testing purposes
 * 
 * Returns a new `l` that has the node generators attached.
 */
const attachElementGenerators = (l, disableProxy=false) => {
    if (!supportsProxy() || !disableProxy) {
        return setElementGenerators(l);
    } else {
        return proxyElementGenerators(l);
    }
};

const l = (...args) => {
    if (args.length === 0) {
        return null;
    }

    if (typeof args[0] === 'string' || typeof args[0] === 'number') {
        return new IElement(...args).render();
    } else {
        args = nodify(args);
        appendChildren(...args);
        return args[0];
    }
};

/*
 * Normalizes then ensures that the given value turns into
 * some sort of DOM Node
 */
const nodify = (vals) => {
    if (Array.isArray(vals)) {
        for (let i=0; i<vals.length; ++i) {
            vals[i] = normalize(vals[i], v => {
                if (typeof v === 'string') {
                    return document.createTextNode(v);
                } else if (typeof v === 'number') {
                    return document.createTextNode(v.toString());
                }
                return v;
            });
        }
        return vals;
    }
};

/*
 * Takes any value and lifts it into the type
 * expected by arguments to l(...)
 */
const normalize = (val, ifNotElement) => {
    if (isIElementGenerator(val)) {
        return val().render();
    } else if (isElementGenerator(val)) {
        return val();
    } else if (isIElement(val)) {
        return val.render();
    } else if (typeof val === 'function') {
        return normalize(_eval(val, l));
    } else if (ifNotElement !== undefined && !isElement(val)) {
        return ifNotElement(val);
    }
    return val;
};

/*
 * Same as l(...) but returns the result as an unformatted HTML string
 */
l.str = (...args) => {
    const ret = l(...args);
    if (isElement(ret)) {
        return ret.outerHTML;
    }
    return '';
};

l.pstr = (...args) => {
    const ret = l(...args);
    if (isElement(ret)) {
        let stack = [ret];
        while (stack.length > 0) {
            const item = stack.pop();
        }
        return ret.outerHTML;
    }
    return '';
};

l.nodify = nodify;
l.normalize = normalize;

l.with = (data, ...args) => {
    if (args.length === 1 && typeof args[0] === 'function') {
        return normalize(_with(data, args[0], l));
    }
    for (let i=0; i<args.length; ++i) {
        const arg = args[i];
        if (typeof arg === 'function') {
            args[i] = normalize(_with(data, arg, l));
        }
    }
    return l(...args);
};

// taint an object with all the html functions
l.import = (o=window, clobber=false) => {
    for (const tag of TAGS.values()) {
        if (clobber || o[tag] === undefined) {
            o[tag] = l[tag];
        }
    }
    return o;
};

// browser only
l.perf = (...args) => {
    const start = performance.now();
    const ret = l(...args);
    console.log(performance.now() - start);
    return ret;
}

l.isIElement = isIElement;

Object.assign(module.exports, {
    IElement,
    isIElement,
    isElementGenerator,
    isIElementGenerator,
    createElementGenerator,
    createIElementGenerator,
    l: attachElementGenerators(l),
});
