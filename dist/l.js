'use strict';
/*
 * Copyright 2019 Adam Bertrand Berger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'strict mode';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var l = function () {
    // keys in the configuration object that are reserved (won't work as
    // a shortcut to add a prop or attr)
    var RESERVED_KEYS = { children: true, props: true, attrs: true };

    // If these keys are in the root of the configuration object, they will
    // always be interpreted as properties and not attributes
    var FORCED_PROP_KEYS = { innerHTML: true, outerHTML: true, textContent: true, hidden: true, dataset: true, isContentEditable: true };

    // Attempt to guess what someone means -- careful when you add to this
    // it will trying to use these keys as attributes
    var ALIAS_KEYS = { html: 'innerHTML', text: 'textContent' };

    function normalize(init) {
        if (l.isLGenerator(init)) {
            init = init().render();
        } else if (l.isNodeGenerator(init)) {
            init = init();
        } else if (l.isL(init)) {
            init = init.render();
        } else if (typeof init === 'function') {
            init = lib.eval(init);
        }
        return init;
    }

    var forceAttrsEnabled = false,
        forcePropsEnabled = false,
        aliasingEnabled = true,
        proxyEnabled = false;

    var L = function () {
        function L(name) {
            for (var _len = arguments.length, children = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
                children[_key - 3] = arguments[_key];
            }

            var init1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var init2 = arguments[2];

            _classCallCheck(this, L);

            init1 = normalize(init1);
            init2 = normalize(init2);

            var init2IsNode = l.isNode(init2),
                init1IsNode = l.isNode(init1),
                init2Type = typeof init2 === 'undefined' ? 'undefined' : _typeof(init2),
                init1Type = typeof init1 === 'undefined' ? 'undefined' : _typeof(init1);

            var init = {};
            if (!init1IsNode) {
                if (init2IsNode || (typeof init2 === 'undefined' ? 'undefined' : _typeof(init2)) !== 'object' && init2 !== undefined) {
                    init = (typeof init1 === 'undefined' ? 'undefined' : _typeof(init1)) === 'object' ? init1 : {};
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

            var init2IsChild = init2IsNode || (typeof init2 === 'undefined' ? 'undefined' : _typeof(init2)) !== 'object' && init2 !== undefined;
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

        _createClass(L, [{
            key: 'add',
            value: function add() {
                for (var _len2 = arguments.length, others = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    others[_key2] = arguments[_key2];
                }

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = others.flat()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var other = _step.value;

                        this.children.push(other);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                return this;
            }
        }, {
            key: 'liftInit',
            value: function liftInit(init) {
                for (var name in init) {
                    var val = init[name];
                    if (aliasingEnabled && ALIAS_KEYS[name] !== undefined) {
                        name = ALIAS_KEYS[name];
                    }

                    if (!(name in RESERVED_KEYS)) {
                        if (val !== undefined) {
                            var type = typeof val === 'undefined' ? 'undefined' : _typeof(val);
                            if (!forceAttrsEnabled && (forcePropsEnabled || type === 'object' || type === 'function' || name in FORCED_PROP_KEYS)) {
                                this.props[name] = val;
                            } else {
                                this.attrs[name] = val;
                            }
                        }
                    }
                }
            }
        }, {
            key: 'render',
            value: function render() {
                var tag = document.createElement(this.name);
                lib.setProps(tag, this.props);
                lib.setAttrs(tag, this.attrs);
                lib.addChildren(tag, this.children);
                return tag;
            }
        }]);

        return L;
    }();

    var lib = function lib() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        if (args.length === 0) {
            return null;
        }

        args[0] = normalize(args[0]);
        if (typeof args[0] === 'string') {
            return new (Function.prototype.bind.apply(L, [null].concat(args)))().render();
        } else if (typeof args[0] === 'function') {
            var first = lib.eval(args.shift());
            if (args.length > 0) {
                return lib.appendChild.apply(lib, [first].concat(args));
            } else {
                return first;
            }
        } else {
            return lib.appendChild.apply(lib, args);
        }
    },
        tags = {
        a: 1, abbr: 1, address: 1, area: 1, article: 1, aside: 1, audio: 1, b: 1, base: 1, bdi: 1, bdo: 1, blockquote: 1,
        body: 1, br: 1, button: 1, canvas: 1, caption: 1, cite: 1, code: 1, col: 1, colgroup: 1, data: 1, datalist: 1,
        dd: 1, del: 1, details: 1, dfn: 1, dialog: 1, div: 1, dl: 1, dt: 1, em: 1, embed: 1, fieldset: 1, figure: 1, footer: 1,
        form: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1, head: 1, header: 1, hgroup: 1, hr: 1, html: 1, i: 1, iframe: 1, img: 1,
        input: 1, label: 1, legend: 1, li: 1, ul: 1, link: 1, main: 1, map: 1, mark: 1, menu: 1, menuitem: 1,
        meta: 1, meter: 1, nav: 1, object: 1, ol: 1, optgroup: 1, option: 1, output: 1, p: 1, param: 1, pre: 1, progress: 1,
        q: 1, s: 1, samp: 1, script: 1, section: 1, select: 1, small: 1, source: 1, span: 1,
        strong: 1, style: 1, sub: 1, summary: 1, sup: 1, table: 1, tbody: 1, td: 1, template: 1, textarea: 1, tfoot: 1, th: 1,
        thead: 1, time: 1, title: 1, tr: 1, track: 1, u: 1, var: 1, video: 1, wbr: 1
    };

    var browserSupportsProxy = typeof window.Proxy === 'function';

    var tagDefs = 'var ';
    var tagDefAliases = {
        var: '_var'
    };

    var tagsList = Object.keys(tags);

    for (var i = 0; i < tagsList.length; ++i) {
        var key = tagsList[i],
            val = '_nr' + tagsList[i];
        if (key in tagDefAliases) {
            key = tagDefAliases[key];
        }
        tagDefs += key + '=' + 'l.' + val + (i === tagsList.length - 1 ? ';' : ',');
    }

    var tagNoRenderFunc = function tagNoRenderFunc(tag) {
        return function () {
            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
            }

            return new (Function.prototype.bind.apply(L, [null].concat([tag], args)))();
        };
    },
        tagFunc = function tagFunc(tag) {
        return function () {
            for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                args[_key5] = arguments[_key5];
            }

            return new (Function.prototype.bind.apply(L, [null].concat([tag], args)))().render();
        };
    };

    var proxy = null;
    if (!browserSupportsProxy || !proxyEnabled) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = tagsList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var tag = _step2.value;

                lib[tag] = tagFunc(tag);

                var nrt = '_nr' + tag;
                lib[nrt] = tagNoRenderFunc(tag);
                lib[nrt]._is_l_L_generator = true;
                lib[tag]._is_l_node_generator = true;
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    } else {
        var cache = {};
        proxy = new Proxy(lib, {
            get: function get(obj, prop) {
                if (prop in cache) {
                    return cache[prop];
                }

                if (prop in tags) {
                    var func = tagFunc(prop);
                    func._is_l_node_generator = true;
                    cache[prop] = func;
                    return func;
                } else if (prop.startsWith('_nr')) {
                    var name = prop.substring(3),
                        _func = tagNoRenderFunc(name);
                    _func._is_l_L_generator = true;
                    cache[prop] = _func;
                    return _func;
                }
                return obj[prop];
            }
        });
    }

    var valOf = function valOf(val) {
        if (typeof val === 'function') {
            return val();
        }
        return val;
    };

    lib.isNodeGenerator = function (o) {
        return typeof o === 'function' && o._is_l_node_generator;
    };
    lib.isLGenerator = function (o) {
        return typeof o === 'function' && o._is_l_L_generator;
    };
    lib.isL = function (o) {
        return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && o._is_l_L;
    };

    lib.nodify = function () {
        for (var _len6 = arguments.length, vals = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            vals[_key6] = arguments[_key6];
        }

        vals = vals.flat();
        for (var _i = 0; _i < vals.length; ++_i) {
            var _val = vals[_i];
            if (l.isLGenerator(_val)) {
                vals[_i] = _val().render();
            } else if (l.isL(_val)) {
                vals[_i] = _val.render();
            } else if (l.isNodeGenerator(_val)) {
                vals[_i] = _val();
            } else if (typeof _val === 'function') {
                vals[_i] = l.eval(_val);
            } else if (!l.isNode(_val)) {
                vals[_i] = document.createTextNode(_val);
            }
        }
        return vals;
    };

    lib.appendChild = function (parent) {
        for (var _len7 = arguments.length, children = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
            children[_key7 - 1] = arguments[_key7];
        }

        l.nodify(children.flat()).forEach(function (child) {
            return parent.appendChild(child);
        });
        return parent;
    };
    lib.appendChildren = lib.appendChild;

    lib.appendBody = function () {
        for (var _len8 = arguments.length, children = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
            children[_key8] = arguments[_key8];
        }

        return lib.appendChild.apply(lib, [document.body].concat(children));
    };

    lib.prependChild = function (parent) {
        for (var _len9 = arguments.length, children = Array(_len9 > 1 ? _len9 - 1 : 0), _key9 = 1; _key9 < _len9; _key9++) {
            children[_key9 - 1] = arguments[_key9];
        }

        l.nodify(children.flat()).forEach(function (child) {
            return parent.insertAdjacentElement('afterBegin', child);
        });
        return parent;
    };
    lib.prependChildren = lib.prependChild;

    lib.prependBody = function () {
        for (var _len10 = arguments.length, children = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
            children[_key10] = arguments[_key10];
        }

        return lib.prependChild.apply(lib, [document.body].concat(children));
    };

    lib.insertChildAfter = function (target) {
        for (var _len11 = arguments.length, nodes = Array(_len11 > 1 ? _len11 - 1 : 0), _key11 = 1; _key11 < _len11; _key11++) {
            nodes[_key11 - 1] = arguments[_key11];
        }

        l.nodify(nodes.flat()).forEach(function (node) {
            return target.insertAdjacentElement('afterEnd', node);
        });
        return target;
    };
    lib.insertChildrenAfter = lib.insertChildAfter;

    lib.insertChildBefore = function (target) {
        for (var _len12 = arguments.length, nodes = Array(_len12 > 1 ? _len12 - 1 : 0), _key12 = 1; _key12 < _len12; _key12++) {
            nodes[_key12 - 1] = arguments[_key12];
        }

        l.nodify(nodes.flat()).forEach(function (node) {
            return target.insertAdjacentElement('beforeBegin', node);
        });
        return target;
    };
    lib.insertChildrenBefore = lib.insertChildBefore;

    lib.setProp = function (target, name, val) {
        if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
            if (_typeof(target[name]) === 'object') {
                for (var _key13 in val) {
                    target[name][_key13] = val[_key13];
                }
            } else {
                target[name] = val;
            }
        } else {
            target[name] = val;
        }
        return target;
    };

    lib.setProps = function (target) {
        var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        for (var name in props) {
            lib.setProp(target, name, props[name]);
        }
        return target;
    };
    lib.setProperties = lib.setProps;

    lib.setAttr = function (target, name, val) {
        if (val !== null && val !== '') {
            target.setAttribute(name, valOf(val));
        }
        return target;
    };
    lib.setAttribute = lib.setAttr;

    lib.setStyle = function (target, style) {
        return lib.setProp(target, 'style', style);
    };

    lib.setAttrs = function (target) {
        var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        for (var name in attrs) {
            lib.setAttr(target, name, attrs[name]);
        }
        return target;
    };
    lib.setAttributes = lib.setAttrs;

    lib.removeAttr = function (target, attr) {
        target.removeAttribute(attr);
        return target;
    };
    lib.removeAttribute = lib.removeAttr;

    lib.removeAttrs = function (target) {
        while (target.attributes.length > 0) {
            target.removeAttributeNode(target.attributes[0]);
        }
        return target;
    };
    lib.removeAttributes = lib.removeAttrs;

    lib.addChildren = function (target) {
        for (var _len13 = arguments.length, children = Array(_len13 > 1 ? _len13 - 1 : 0), _key14 = 1; _key14 < _len13; _key14++) {
            children[_key14 - 1] = arguments[_key14];
        }

        lib.appendChild.apply(lib, [target].concat(children));
        return target;
    };
    lib.addChild = lib.addChildren;

    lib.removeChildren = function (target) {
        while (target.firstChild !== null) {
            target.firstChild.remove();
        }
        return target;
    };
    lib.removeChild = lib.removeChildren;

    lib.remove = function (target) {
        target.remove();
        return target;
    };

    lib.removeClass = function (target) {
        for (var _len14 = arguments.length, classes = Array(_len14 > 1 ? _len14 - 1 : 0), _key15 = 1; _key15 < _len14; _key15++) {
            classes[_key15 - 1] = arguments[_key15];
        }

        classes.forEach(function (_class) {
            return target.classList.remove(_class);
        });
        return target;
    };
    lib.removeClasses = lib.removeClass;

    lib.addClass = function (target) {
        for (var _len15 = arguments.length, classes = Array(_len15 > 1 ? _len15 - 1 : 0), _key16 = 1; _key16 < _len15; _key16++) {
            classes[_key16 - 1] = arguments[_key16];
        }

        classes.forEach(function (_class, i) {
            return target.className += (target.className.length === 0 ? '' : ' ') + _class;
        });
        return target;
    };
    lib.addClasses = lib.addClass;

    lib.addId = function (target) {
        for (var _len16 = arguments.length, ids = Array(_len16 > 1 ? _len16 - 1 : 0), _key17 = 1; _key17 < _len16; _key17++) {
            ids[_key17 - 1] = arguments[_key17];
        }

        ids.forEach(function (id, i) {
            return target.id += (target.id.length === 0 ? '' : ' ') + id;
        });
        return target;
    };
    lib.addIds = lib.addId;

    lib.selectByClass = function (className) {
        return document.getElementsByClassName(className);
    };

    lib.selectById = function (id) {
        return document.getElementById(id);
    };

    lib.selectFirst = function (selector) {
        return document.querySelector(selector);
    };

    lib.selectAll = function (selector) {
        return document.querySelectorAll(selector);
    };

    lib.isNode = function (o) {
        return o instanceof Element || o instanceof HTMLDocument;
    };

    // force everything in config object to be an attribute
    lib.forceAttrs = function (b) {
        return forceAttrsEnabled = b;
    };

    // force everything in the config object to be a prop
    lib.forceProps = function (b) {
        return forcePropsEnabled = b;
    };

    // enable/disable aliasing of config object names
    lib.disableAliasing = function () {
        return aliasingEnabled = false;
    };
    lib.enableAliasing = function () {
        return aliasingEnabled = true;
    };

    // try to use Javascript Proxy if it is supported for l.<tagname>
    lib.enableProxy = function () {
        return proxyEnabled = true;
    };
    lib.disableProxy = function () {
        return proxyEnabled = false;
    };

    // taint an object with all the html functions
    lib.import = function () {
        var o = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;
        var clobber = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = tagsList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var _tag = _step3.value;

                if (clobber || o[_tag] === undefined) {
                    o[_tag] = l[_tag];
                }
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        return o;
    };

    // current issue: l.div('oij', 3) 

    // black magic function that lets you use html tags as function names
    // without tainting global namespace
    // anything that would not work as an identifier has been prefixed with an underscore
    lib.eval = function (func) {
        var f = tagDefs + 'var ret = (' + func + ')(); return l.isL(ret) ? ret.render() : ret;';
        return normalize(new Function(f)());
    };

    return proxy === null ? lib : proxy;
}();
