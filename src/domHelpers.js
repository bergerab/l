/*
 * Copyright 2019 Adam Bertrand Berger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const { isUsingProxyDocument, Element, HTMLDocument } = require('./env');
const fakeDom = require('./element');

const appendChildren = (parent, ...children) => {
    children.flat().forEach(child => parent.appendChild(child));
    return parent;
};

const appendBody = (...children) => appendChild(document.body, ...children);

const prependChild = (parent, ...children) => {
    children.flat().forEach(child => parent.insertAdjacentElement('afterBegin', child));
    return parent;
};

const prependBody = (...children) => prependChild(document.body, ...children);

const insertChildAfter = (target, ...nodes) => {
    nodes.flat().forEach(node => target.insertAdjacentElement('afterEnd', node));
    return target;
};

const insertChildBefore = (target, ...nodes) => {
    nodes.flat().forEach(node => target.insertAdjacentElement('beforeBegin', node));
    return target;
};

const setProp = (target, name, val) => {
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

const setProps = (target, props={}) => {
    for (const name in props) {
        setProp(target, name, props[name]);
    }
    return target;
};

const setAttr = (target, name, val) => {
    if (val !== null && val !== '') {
        if (val === false) {
            target.removeAttribute(name);
        } else {
            if (val === true) {
                val = ''; // indicates "true"
            }
            target.setAttribute(name, val);
        }
    }
    return target;
};

const setStyle = (target, style) => {
    return setProp(target, 'style', style);
};

const setAttrs = (target, attrs={}) => {
    for (const name in attrs) {
        setAttr(target, name, attrs[name]);
    }
    return target;
};

const addChildren = (target, ...children) => {
    appendChild(target, ...children);
    return target;
};

const removeAttr = (target, attr) => {
    target.removeAttribute(attr);
    return target;
};

const removeAttrs = target => {
    while (target.attributes.length > 0) {
        target.removeAttributeNode(target.attributes[0]);
    }
    return target;
};

const removeChildren = target => {
    while (target.firstChild !== null) {
        target.firstChild.remove();
    }
    return target;
};

const remove = target => {
    target.remove();
    return target;
};

const removeClass = (target, ...classes) => {
    classes.forEach(_class => target.classList.remove(_class));
    return target;
};

const addClass = (target, ...classes) => {
    classes.forEach((_class, i) => target.className += (target.className.length === 0 ? '' : ' ') + _class);
    return target;
};

const addId = (target, ...ids) => {
    ids.forEach((id, i) => target.id += (target.id.length === 0 ? '' : ' ') + id);
    return target;
};

const selectByClass = className => {
    return document.getElementsByClassName(className);
};

const selectById = id => {
    return document.getElementById(id);
};

const selectFirst = selector => {
    return document.querySelector(selector);
};

const selectAll = selector => {
    return document.querySelectorAll(selector);
};

const isElement = o => {
    if (isUsingProxyDocument()) {
        return fakeDom.isElement(o);
    } else {
        return (Element != null && HTMLDocument != null) && (o instanceof Element || o instanceof HTMLDocument);
    }
};

Object.assign(module.exports, {
    isElement,
    appendChildren,
    appendBody,
    prependChild,
    prependBody,
    insertChildAfter,
    insertChildBefore,
    setProp,
    setProps,
    setAttr,
    setStyle,
    setAttrs,
    addChildren,
    removeAttr,
    removeAttrs,
    removeChildren,
    remove,
    removeClass,
    addClass,
    addId,
    selectByClass,
    selectById,
    selectFirst,
    selectAll,
});
