'strict mode';

const l = (function () {
    // keys in the configuration object that are reserved (won't work as
    // a shortcut to add a prop or attr)
    const RESERVED_KEYS = ['children', 'props', 'attrs'];

    // If these keys are in the root of the configuration object, they will
    // always be interpreted as properties and not attributes
    const FORCED_PROP_KEYS = ['innerHTML', 'outerHTML', 'textContent', 'hidden', 'dataset', 'isContentEditable'];

    // Attempt to guess what someone means -- careful when you add to this
    // it will trying to use these keys as attributes
    const ALIAS_KEYS = { html: 'innerHTML', text: 'textContent' };

    let forceAttrsEnabled = false,
        forcePropsEnabled = false,
        aliasingEnabled = true;
    
    class L {
        constructor(name, init1={}, init2, ...children) {
            init1 = this.normalize(init1);
            init2 = this.normalize(init2);
            
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

        normalize(init) {
            if (l.isLGenerator(init)) {
                init = init().render();
            } else if (l.isNodeGenerator(init)) {
                init = init();
            } else if (l.isL(init)) {
                init = init.render();
            }
            return init;
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
                if (l.aliasingEnabled && ALIAS_KEYS[name] !== undefined) {
                    name = ALIAS_KEYS[name];
                }
                
                if (!RESERVED_KEYS.includes(name)) {
                    if (val !== undefined) {
                        const type = typeof val;
                        if (!forceAttrsEnabled && (forcePropsEnabled || type === 'object' || type === 'function' || FORCED_PROP_KEYS.includes(name))) {
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
            lib.setProps(tag, this.props);
            lib.setAttrs(tag, this.attrs);
            lib.addChildren(tag, this.children);
            return tag;
        }
    }
    
    const lib = (...args) => {
        if (typeof args[0] === 'string') {
            return new L(...args).render();
        } else {
            return lib.appendChild(...args);
        }
    },
          tags = [ 
              'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 
              'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist',
              'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figure', 'footer',
              'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img',
              'input', 'label', 'legend', 'li', 'ul', 'link', 'main', 'map', 'mark', 'menu', 'menuitem',
              'meta', 'meter', 'nav', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress',
              'q',  's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span',
              'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th',
              'thead', 'time', 'title', 'tr', 'track', 'u', 'var', 'video', 'wbr',
          ];

    // TODO: should use proxy if we have it otherwise use old tag way
    
    let tagDefs = 'var ';
    const tagDefAliases = {
        var: '_var',
            };
    for (let i=0; i<tags.length; ++i) {
        let key = tags[i],
            val = '_nr' + tags[i];
        if (key in tagDefAliases) {
            key = tagDefAliases[key];
        }
        tagDefs += key + '=' + 'l.' + val + (i === tags.length - 1 ? ';' : ',');
    }

    const tagNoRenderFunc = tag => (...args) => new L(tag, ...args),    
          tagFunc = tag => (...args) => new L(tag, ...args).render();

    for (const tag of tags) {
        lib[tag] = tagFunc(tag);

        const nrt = '_nr'+tag;
        lib[nrt] = tagNoRenderFunc(tag);
        lib[nrt]._is_l_L_generator = true;
        lib[tag]._is_l_node_generator = true;
    }

    const valOf = val => {
        if (typeof val === 'function') {
            return val();
        }
        return val;
    };

    lib.isNodeGenerator = o => typeof o === 'function' && o._is_l_node_generator;
    lib.isLGenerator = o => typeof o === 'function' && o._is_l_L_generator;    
    lib.isL = o => typeof o === 'object' && o._is_l_L;

    lib.nodify = (...vals) => {
        vals = vals.flat();
        for (let i=0; i<vals.length; ++i) {
            const val = vals[i];
            if (l.isLGenerator(val)) {
                vals[i] = val().render();                
            } else if (l.isL(val)) {
                vals[i] = val.render();
            } else if (l.isNodeGenerator(val)) {
                vals[i] = val();
            } else if (!l.isNode(val)) {
                vals[i] = document.createTextNode(val);
            }
        }
        return vals;
    };
    
    lib.appendChild = (parent, ...children) => {
        l.nodify(children.flat()).forEach(child => parent.appendChild(child));
        return parent;
    };
    lib.appendChildren = lib.appendChild;
    
    lib.appendBody = (...children) => lib.appendChild(document.body, ...children);
    
    lib.prependChild = (parent, ...children) => {
        l.nodify(children.flat()).forEach(child => parent.insertAdjacentElement('afterBegin', child));
        return parent;
    };
    lib.prependChildren = lib.prependChild;
    
    lib.prependBody = (...children) => lib.prependChild(document.body, ...children);
    
    lib.insertChildAfter = (target, ...nodes) => {
        l.nodify(nodes.flat()).forEach(node => target.insertAdjacentElement('afterEnd', node));
        return target;
    };
    lib.insertChildrenAfter = lib.insertChildAfter;
    
    lib.insertChildBefore = (target, ...nodes) => {
        l.nodify(nodes.flat()).forEach(node => target.insertAdjacentElement('beforeBegin', node));
        return target;
    };
    lib.insertChildrenBefore = lib.insertChildBefore;

    lib.setProp = (target, name, val) => {
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
    
    lib.setProps = (target, props={}) => {
        for (const name in props) {
            lib.setProp(target, name, props[name]);
        }
        return target;
    };
    lib.setProperties = lib.setProps;

    lib.setAttr = (target, name, val) => {
        if (val !== null && val !== '') {
            target.setAttribute(name, valOf(val));
        }
        return target;
    };
    lib.setAttribute = lib.setAttr;

    lib.setStyle = (target, style) => {
        return lib.setProp(target, 'style', style);
    };
    
    lib.setAttrs = (target, attrs={}) => {
        for (const name in attrs) {
            lib.setAttr(target, name, attrs[name]);
        }
        return target;
    };
    lib.setAttributes = lib.setAttrs;

    lib.removeAttr = (target, attr) => {
        target.removeAttribute(attr);
        return target;
    };
    lib.removeAttribute = lib.removeAttr;

    lib.removeAttrs = target => {
        while (target.attributes.length > 0) {
            target.removeAttributeNode(target.attributes[0]);
        }
        return target;
    };
    lib.removeAttributes = lib.removeAttrs;
    
    lib.addChildren = (target, ...children) => {
        lib.appendChild(target, ...children);
        return target;
    };
    lib.addChild = lib.addChildren;

    lib.removeChildren = target => {
        while (target.firstChild !== null) {
            target.firstChild.remove();
        }
        return target;
    };
    lib.removeChild = lib.removeChildren;

    lib.remove = target => {
        target.remove();
        return target;
    };

    lib.removeClass = (target, ...classes) => {
        classes.forEach(_class => target.classList.remove(_class));
        return target;
    };
    lib.removeClasses = lib.removeClass;

    lib.addClass = (target, ...classes) => {
        classes.forEach((_class, i) => target.className += (target.className.length === 0 ? '' : ' ') + _class);
        return target;
    };
    lib.addClasses = lib.addClass;

    lib.addId = (target, ...ids) => {
        ids.forEach((id, i) => target.id += (target.id.length === 0 ? '' : ' ') + id);
        return target;
    };
    lib.addIds = lib.addId;

    lib.selectByClass = className => {
        return document.getElementsByClassName(className);
    };

    lib.selectById = id => {
        return document.getElementById(id);
    };

    lib.selectFirst = selector => {
        return document.querySelector(selector);
    };

    lib.selectAll = selector => {
        return document.querySelectorAll(selector);
    };

    lib.isNode = o => o instanceof Element || o instanceof HTMLDocument;

    // force everything in config object to be an attribute
    lib.forceAttrs = b => forceAttrsEnabled = b;

    // force everything in the config object to be a prop
    lib.forceProps = b => forcePropsEnabled = b;

    // enable/disable aliasing of config object names
    lib.disableAliasing = () => aliasingEnabled = false;
    lib.enableAliasing = () => aliasingEnabled = true;

    // taint an object with all the html functions
    lib.import = (o=window, clobber=false) => {
        for (const tag of tags) {
            if (clobber || o[tag] === undefined) {
                o[tag] = l[tag];
            }
        }

        return o;
    };

    // current issue: l.div('oij', 3) 

    // black magic function that lets you use html tags as function names
    // without tainting global namespace
    // anything that would not work as an identifier has been prefixed with an underscore
    lib.eval = func => {
        const f = tagDefs + 'var ret = (' + func + ')(); return l.isL(ret) ? ret.render() : ret;';
        return new Function(f)();
    };

    return lib;
}());
