/*
 * Copyright 2019 Adam Bertrand Berger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const { HTMLNode, Document } = require('./proxyNode');
const { tags } = require('./tags');

module.exports = (function () {
    const l = (...args) => {
        if (args.length === 0) {
            return null;
        }
        
        args[0] = normalize(args[0]);
        if (typeof args[0] === 'string') {
            return new L(...args).render();
        } else if (typeof args[0] === 'function') {
            const first = l.eval(args.shift());
            if (args.length > 0) {
                return l.appendChild(first, ...args);
            } else {
                return first;
            }
        } else {
            return l.appendChild(...args);
        }
    };

    let window = this,
        document = null,
        Proxy = Proxy || null,
        HTMLDocument = null,
        Element = null,
        usingProxyDocument = false;
    
    function setupWindowProps(wnd) {
        window = wnd;

        if (window === undefined || window.document === undefined) {
            document = new Document(); // use fake document if there is none
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
    }

    setupWindowProps(window);

    
    // keys in the configuration object that are reserved (won't work as
    // a shortcut to add a prop or attr)
    const RESERVED_KEYS = {children: true, props: true, attrs: true};

    // If these keys are in the root of the configuration object, they will
    // always be interpreted as properties and not attributes
    const FORCED_PROP_KEYS = {innerHTML: true, innerText: true, outerHTML: true, textContent: true, hidden: true, dataset: true, isContentEditable: true};

    // Attempt to guess what someone means -- careful when you add to this
    // it will trying to use these keys as attributes
    const ALIAS_KEYS = { html: 'innerHTML', text: 'textContent' };


    function normalize(init) {
        if (l.isLGenerator(init)) {
            init = init().render();
        } else if (l.isNodeGenerator(init)) {
            init = init();
        } else if (l.isL(init)) {
            init = init.render();
        } else if (typeof init === 'function') {
            init = l.eval(init);
        }
        return init;
    }
    
    let forceAttrsEnabled = false,
        forcePropsEnabled = false,
        aliasingEnabled = true,
        proxyEnabled = false;
    
    class L {
        constructor(name, init1={}, init2, ...children) {
            init1 = normalize(init1);
            init2 = normalize(init2);
            
            const init2IsNode = l.isNode(init2),
                  init1IsNode = l.isNode(init1),
                  init2Type = typeof init2,
                  init1Type = typeof init1;

            let init = {};
            if (!init1IsNode) {
                if (init2IsNode || typeof init2 !== 'object' && init2 !== undefined) {
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
            } else if (init1IsNode) {
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
                            innerHTML: init
                        }
                    };
                } else {
                    init.props = init.props || {};
                    init.props.innerHTML = init1;
                }
            }

            const init2IsChild = init2IsNode || typeof init2 !== 'object' && init2 !== undefined;
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

            this.name = name;
            this.children = init.children || [];
            this.props = init.props || {};
            this.attrs = init.attrs || {};

            this._is_l_L = true;

            this.liftInit(init);
        }

        add(...others) {
            for (const other of others.flat()) {
                this.children.push(other);
            }
            return this;
        }

        liftInit(init) {
            for (let name in init) {
                let val = init[name];
                if (aliasingEnabled && ALIAS_KEYS[name] !== undefined) {
                    name = ALIAS_KEYS[name];
                }
                
                if (!(name in RESERVED_KEYS)) {
                    if (val !== undefined) {
                        const type = typeof val;
                        if (!forceAttrsEnabled && (forcePropsEnabled || type === 'object' || type === 'function' || name in FORCED_PROP_KEYS)) {
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
            l.setProps(tag, this.props);
            l.setAttrs(tag, this.attrs);
            l.addChildren(tag, this.children);
            return tag;
        }
    }

    const supportsProxy = () => {
        return typeof Proxy === 'function';
    };

    /*
     * Because programs like webpack only run in 'strict mode',
     * there is no way to use the "deprecated" with statement.
     * it is not officially deprecated, its just that the 
     * community doesn't like it so much that it has been disabled in
     * strict mode.
     *
     * I'll continue using this hack instead. My integration tests show
     * that the difference in speed is not great (usually < 1 ms)
     */
    let tagDefs = 'var ';
    const tagDefAliases = { var: '_var' };

    for (const tag of tags.values()) {
        let key = tag,
            val = '_nr' + tag;

        if (key in tagDefAliases) {
            key = tagDefAliases[key];
        }
        tagDefs += key + '=' + 'l.' + val + ',';
    }
    tagDefs = tagDefs.substring(0, tagDefs.length - 1) + ';';

    const tagNoRenderFunc = tag => (...args) => new L(tag, ...args),    
          tagFunc = tag => (...args) => new L(tag, ...args).render();
    
    let proxy = null;
    if (!supportsProxy() || !proxyEnabled) {
        for (const tag of tags.values()) {
            l[tag] = tagFunc(tag);

            const nrt = '_nr' + tag;
            l[nrt] = tagNoRenderFunc(tag);
            l[nrt]._is_l_L_generator = true;
            l[tag]._is_l_node_generator = true;
        }
    } else {
        const cache = {};
        proxy = new Proxy(l, {
            get: function(obj, prop) {
                if (prop in cache) {
                    return cache[prop];
                }
                
                if (tags.has(prop)) {
                    const func = tagFunc(prop);
                    func._is_l_node_generator = true;
                    cache[prop] = func;
                    return func;
                } else if (prop.startsWith('_nr')) {
                    const name = prop.substring(3),
                          func = tagNoRenderFunc(name);
                    func._is_l_L_generator = true;
                    cache[prop] = func;
                    return func;
                }
                return obj[prop];
            },
        });
    }

    const valOf = val => {
        if (typeof val === 'function') {
            return val();
        }
        return val;
    };

    l.isNodeGenerator = o => typeof o === 'function' && o._is_l_node_generator;
    l.isLGenerator = o => typeof o === 'function' && o._is_l_L_generator;    
    l.isL = o => typeof o === 'object' && o instanceof L;

    l.nodify = (...vals) => {
        vals = vals.flat();
        for (let i=0; i<vals.length; ++i) {
            const val = vals[i];
            if (l.isLGenerator(val)) {
                vals[i] = val().render();                
            } else if (l.isL(val)) {
                vals[i] = val.render();
            } else if (l.isNodeGenerator(val)) {
                vals[i] = val();
            } else if (typeof val === 'function') {
                vals[i] = l.eval(val);
            } else if (!l.isNode(val)) {
                vals[i] = document.createTextNode(val);
            }
        }
        return vals;
    };
    
    l.appendChild = (parent, ...children) => {
        l.nodify(children.flat()).forEach(child => parent.appendChild(child));
        return parent;
    };
    l.appendChildren = l.appendChild;
    
    l.appendBody = (...children) => l.appendChild(document.body, ...children);
    
    l.prependChild = (parent, ...children) => {
        l.nodify(children.flat()).forEach(child => parent.insertAdjacentElement('afterBegin', child));
        return parent;
    };
    l.prependChildren = l.prependChild;
    
    l.prependBody = (...children) => l.prependChild(document.body, ...children);
    
    l.insertChildAfter = (target, ...nodes) => {
        l.nodify(nodes.flat()).forEach(node => target.insertAdjacentElement('afterEnd', node));
        return target;
    };
    l.insertChildrenAfter = l.insertChildAfter;
    
    l.insertChildBefore = (target, ...nodes) => {
        l.nodify(nodes.flat()).forEach(node => target.insertAdjacentElement('beforeBegin', node));
        return target;
    };
    l.insertChildrenBefore = l.insertChildBefore;

    l.setProp = (target, name, val) => {
        if (typeof val === 'object') {
            if (typeof target[name] === 'object') {
                for (const key in val) {
                    target[name][key] = val[key];
                }
            } else {
                target[name] = val;                    
            }
        } else {
            target[name] = val;
        }
        return target;
    };
    
    l.setProps = (target, props={}) => {
        for (const name in props) {
            l.setProp(target, name, props[name]);
        }
        return target;
    };
    l.setProperties = l.setProps;

    l.setAttr = (target, name, val) => {
        if (val !== null && val !== '') {
            target.setAttribute(name, valOf(val));
        }
        return target;
    };
    l.setAttribute = l.setAttr;

    l.setStyle = (target, style) => {
        return l.setProp(target, 'style', style);
    };
    
    l.setAttrs = (target, attrs={}) => {
        for (const name in attrs) {
            l.setAttr(target, name, attrs[name]);
        }
        return target;
    };
    l.setAttributes = l.setAttrs;

    l.addChildren = (target, ...children) => {
        l.appendChild(target, ...children);
        return target;
    };
    l.addChild = l.addChildren;

    l.str = (...args) => {
        const ret = l(...args);
        if (l.isNode(ret)) {
            return ret.outerHTML;
        }
        return '';
    };

    // start of things that can be removed
    l.removeAttr = (target, attr) => {
        target.removeAttribute(attr);
        return target;
    };
    l.removeAttribute = l.removeAttr;

    l.removeAttrs = target => {
        while (target.attributes.length > 0) {
            target.removeAttributeNode(target.attributes[0]);
        }
        return target;
    };
    l.removeAttributes = l.removeAttrs;
    
    l.removeChildren = target => {
        while (target.firstChild !== null) {
            target.firstChild.remove();
        }
        return target;
    };
    l.removeChild = l.removeChildren;

    l.remove = target => {
        target.remove();
        return target;
    };

    l.removeClass = (target, ...classes) => {
        classes.forEach(_class => target.classList.remove(_class));
        return target;
    };
    l.removeClasses = l.removeClass;

    l.addClass = (target, ...classes) => {
        classes.forEach((_class, i) => target.className += (target.className.length === 0 ? '' : ' ') + _class);
        return target;
    };
    l.addClasses = l.addClass;

    l.addId = (target, ...ids) => {
        ids.forEach((id, i) => target.id += (target.id.length === 0 ? '' : ' ') + id);
        return target;
    };
    l.addIds = l.addId;

    l.selectByClass = className => {
        return document.getElementsByClassName(className);
    };

    l.selectById = id => {
        return document.getElementById(id);
    };

    l.selectFirst = selector => {
        return document.querySelector(selector);
    };

    l.selectAll = selector => {
        return document.querySelectorAll(selector);
    };
    // end of things that can be removed

    l.isNode = o => {
        if (usingProxyDocument) {
            return o != null && o instanceof HTMLNode;
        } else {
            return (Element != null && HTMLDocument != null) && (o instanceof Element || o instanceof HTMLDocument);
        }
    };

    // force everything in config object to be an attribute
    l.forceAttrs = b => forceAttrsEnabled = b;

    // force everything in the config object to be a prop
    l.forceProps = b => forcePropsEnabled = b;

    // enable/disable aliasing of config object names
    l.disableAliasing = () => aliasingEnabled = false;
    l.enableAliasing = () => aliasingEnabled = true;

    // try to use Javascript Proxy if it is supported for l.<tagname>
    l.enableProxy = () => proxyEnabled = true;
    l.disableProxy = () => proxyEnabled = false;

    // taint an object with all the html functions
    l.import = (o=window, clobber=false) => {
        for (const tag of tags.values()) {
            if (clobber || o[tag] === undefined) {
                o[tag] = l[tag];
            }
        }

        return o;
    };

    l.injectWindow = mock => {
        window = mock;
        document = window.document;
        setupWindowProps(mock);
    };

    // current issue: l.div('oij', 3) 

    // black magic function that lets you use html tags as function names
    // without tainting global namespace
    // anything that would not work as an identifier has been prefixed with an underscore
    l.eval = func => {
        const f = tagDefs + 'var ret = (' + func + ')(); return l.isL(ret) ? ret.render() : ret;';
        return normalize(new Function('l', f)(l));
    };

    return proxy === null ? l : proxy;
}());

