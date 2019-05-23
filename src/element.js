/*
 * Copyright 2019 Adam Bertrand Berger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const { SELF_CLOSING_NODE_NAMES } = require('./tags');

/*
 * A fake DOM
 *
 * This is for use in nodejs. If `document` isn't found in the environtment
 * it will use this fake DOM instead.
 */
class Document {
    createTextNode(text) {
        const element = new Element(this, '#text', 3).getProxy();
        element.nodeValue = text;
        return element;
    }
    
    createElement(tagName) {
        if (typeof tagName !== 'string') {
            throw new Error('Tag can not be numbers');
        }
        return new Element(this, tagName, 1).getProxy();
    }
}

/*
 * Element from the DOM with a liposuction
 *
 * This is for use in nodejs. If the environment doesn't have
 * the DOM available, it will use this instead. It is good enough
 * for generating HTML. Doesn't have full fledged DOM features such as
 * HTML parsing.
 */
let elementId = 0;
class Element {
    // elements and textnodes
    constructor(document, tagName, type=3) {
        if (!tagName) {
            throw new Error('You must specify a `tagName`');
        }

        this.id = ++elementId;
        this.content = '';
        this.node = new Node(tagName, type);
    }

    escape(val) {
        return val.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    outerHTML() {
        if (this.node.isTextNode()) {
            return this.content;
        }

        const name = this.node.tagName.toLowerCase();
        let attrsList = Object.keys(this.node.attributes),
            attrs = attrsList.length > 0 ? ' ' : '';

        for (let i=0; i<attrsList.length; ++i) {
            const attrName = attrsList[i],
                  attrVal = this.node.attributes[attrName];
            if (attrVal === null) { // for boolean attributes
                attrs += `${attrName.toLowerCase()}`;
            } else {
                attrs += `${attrName.toLowerCase()}="${attrVal}"`;
            }
            if (i !== attrsList.length - 1) {
                attrs += ' ';
            }
        }

        let html = `<${name}${attrs}>`;
        if (!(SELF_CLOSING_NODE_NAMES.has(this.node.nodeName))) {
            // TODO: should replace < with &gt; and &lt;, textContent should show the real < and >
            html += this.escape(this.content);
            for (const child of this.node.children) {
                html += child.outerHTML();
            }
            html += `</${name}>`;
        }
        return html;
    }

    setAttribute(name, val) {
        if (val === '') {
            this.node.attributes[name] = null;
        } else {
            this.node.attributes[name] = val;
        }
    }

    removeAttribute(name) {
        delete this.node.attributes[name];
    }

    hasId(id) {
        if (this.id === id) {
            return true;
        }
        for (const child of this.node.children) {
            if (child.hasId(id)) {
                return true;
            }
        }
        return false;
    }

    appendChild(proxy) {
        if (proxy == null) { 
            return;
        }
        const element = proxyToElement.get(proxy);
        if (this.hasId(element.id) || element.hasId(this.id)) {
            throw new Error('You can\'t append a child which contains its parent.');
        }
        for (const child of this.node.children) {
            // don't add the same node twice
            if (element.id === child.id) {
                return;
            }
        }
        this.node.children.push(element);
    }

    getProxy() {
        const proxy = new Proxy(this, {
            get: (obj, prop) => {
                if (prop === 'outerHTML') {
                    return this.outerHTML();
                }
                if (prop === 'appendChild') {
                    return this.appendChild;
                }
                
                if (HTML.has(prop)) {
                    if (this.node.isElementNode()) {
                        return this.content.toString();
                    } else {
                        return undefined;
                    }
                }
                if (TEXT.has(prop)) {
                    if (this.node.isTextNode()) {
                        return this.content.toString();
                    } else {
                        return undefined;
                    }
                }
                if (prop in obj && prop !== 'id') {
                    return obj[prop];
                }
                return obj.node[prop];
            },
            set: (obj, prop, val) => {
                if (prop in READ_ONLY_PROPS) {
                    throw new Error(`You can\'t set ${prop} on nodes`);
                }

                if (typeof val !== 'object' && typeof val !== 'function' && !PROPS.has(prop)) {
                    obj.node.attributes[prop] = val;
                    obj.node[prop] = val;
                } else {
                    if ((HTML.has(prop) && this.node.isElementNode()) || (TEXT.has(prop) && this.node.isTextNode())) {
                        this.content = val.toString();
                    } else {
                        obj.node[prop] = val;
                    }
                }

                return val;
            }
        });
        
        proxyToElement.set(proxy, this);

        return proxy;
    }
}

const ELEMENT_NODE = 1,
      TEXT_NODE = 3,
      PROPS = new Set([
          'innerHTML', 'textContent', 'isContentEditable', 'nodeValue'
      ]),
      /*
       * Node properties which contain HTML (not just text)
       */
      HTML = new Set([
          'innerHTML', 'textContent', 'innerText'
      ]),
      /*
       * Node properties which contain only text (not HTML)
       */
      TEXT = new Set([
          'textContent', 'nodeValue',
      ]),
      READ_ONLY_PROPS = new Set([
          'attributes', 'nodeName', 'children', 'outerHTML', 'setAttribute', 'removeAttribute',
      ]),
      proxyToElement = new Map();

class Node {
    constructor(tagName='#text', type=TEXT_NODE) {
        if (type !== 1 && type !== 3) {
            throw new Error(`Only type of ELEMENT_NODE (${ELEMENT_NODE}) and TEXT_NODE (${TEXT_NODE}) are supported`);
        }

        this.attributes =  {};
        this.children = [];
        this.type = type;
        this.tagName = tagName.toUpperCase();
        this.style = new Proxy({}, {
            set: (obj, prop, val) => {
                const cssName = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
                const css = `${cssName}: ${val};`;

                if (this.attributes.style != null) {
                    this.attributes.style += ' ' + css;
                } else {
                    this.attributes.style = css;
                }
                
                obj[prop] = val;
            }
        });
        this.dataset = new Proxy({}, {
            set: (obj, prop, val) => {
                const dataName = 'data-' + prop.replace(/([A-Z])/g, '-$1').toLowerCase();
                this.attributes[dataName] = val;
                obj[prop] = val;
            }
        });
    }

    isTextNode() {
        return this.type === TEXT_NODE;
    }

    isElementNode() {
        return this.type === ELEMENT_NODE;
    }
}

const isElement = o => proxyToElement.has(o);

Object.assign(module.exports, {
    Element,
    Document,
    isElement,
});
