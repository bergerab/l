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
 * If environment doesn't have `document` use these as HTMLElements
 */
let nodeId = 0;
const proxyToNode = new Map();

function HTMLNode(dom, nodeName, type=1) {
    if (type !== 1 && type !== 3) {
        throw new Error('Only type of ELEMENT_NODE (1) and TEXT_NODE (3) are supported');
    }
    if (type === 3) {
        nodeName = '#text';
    }
    if (!nodeName) {
        throw new Error('You must specify a `nodeName`');
    }

    this.id = ++nodeId;
    this.content = '';
    this.node = {
        attributes: {},
        type: type, // can be 1 for element node or 3 for text node (for our purposes)
        nodeName: nodeName.toUpperCase(),
        style: new Proxy({}, {
            set: (obj, prop, val) => {
                const cssName = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
                const css = `${cssName}: ${val};`;

                if (this.node.attributes.style != null) {
                    this.node.attributes.style += ' ' + css;
                } else {
                    this.node.attributes.style = css;
                }
                
                obj[prop] = val;
            }
        }),
        dataset: new Proxy({}, {
            set: (obj, prop, val) => {
                const dataName = 'data-' + prop.replace(/([A-Z])/g, '-$1').toLowerCase();
                this.node.attributes[dataName] = val;
                obj[prop] = val;
            }
        }),
        children: [],
    };

    const SELF_CLOSING_NODE_NAMES = new Set([
        'META', 'BR', 'IMG', 'INPUT', 'HR',
    ]);

    // When these names are set, they will not be assigned to an attribute
    // only a prop.
    const PROPS = new Set([
        'innerHTML', 'textContent', 'isContentEditable', 'nodeValue'
    ]);

    const HTML = new Set([
        'innerHTML', 'textContent', 'innerText'
    ]);

    const TEXT = new Set([
        'textContent', 'nodeValue',
    ]);

    const outerHTML = () => {
        if (type === 3) {
            return this.content;
        }
        
        const name = nodeName.toLowerCase();
        let attrsList = Object.keys(this.node.attributes),
            attrs = attrsList.length > 0 ? ' ' : '';

        for (let i=0; i<attrsList.length; ++i) {
            const attrName = attrsList[i],
                  attrVal = this.node.attributes[attrName];
            attrs += `${attrName.toLowerCase()}="${attrVal}"`;
            if (i !== attrsList.length - 1) {
                attrs += ' ';
            }
        }

        let html = `<${name}${attrs}>`;
        if (!(SELF_CLOSING_NODE_NAMES.has(this.node.nodeName))) {
            html += this.content;
            for (const child of this.node.children) {
                html += child.outerHTML;
            }
            html += `</${name}>`;
        }
        return html;
    };

    const setAttribute = (name, val) => {
        this.node.attributes[name] = val;
    };

    this.usesId = id => {
        if (this.id === id) {
            return true;
        }
        for (const child of this.node.children) {
            if (child.usesId(id)) {
                return true;
            }
        }
        return false;
    };

    this.appendChild = proxyNode => {
        if (proxyNode == null) {
            return;
        }
        const node = proxyToNode.get(proxyNode);
        if (this.usesId(node.id) || node.usesId(this.id)) {
            throw new Error('You can\'t append a child which contains its parent.');
        }
        for (const child of this.node.children) {
            // don't add the same node twice
            child = proxyToNode.get(child);
            if (node.id === child.id) {
                return;
            }
        }
        this.node.children.push(proxyNode);
    };
    
    const readonlyProps = new Set([
        'attributes', 'nodeName', 'children', 'outerHTML', 'setAttribute'
    ]);
    
    const proxy = new Proxy(this, {
        get: (obj, prop) => {
            if (prop === 'outerHTML') {
                return outerHTML();
            }
            if (prop === 'setAttribute') {
                return setAttribute;
            }
            if (HTML.has(prop)) {
                if (type === 1) {
                    return this.content;
                } else {
                    return undefined;
                }
            }
            if (TEXT.has(prop)) {
                if (type === 3) {
                    return this.content;
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
            if (prop in readonlyProps) {
                throw new Error('You can\'t set `' + prop + '` on nodes');
            }
            
            if (typeof val !== 'object' && typeof val !== 'function' && !PROPS.has(prop)) {
                obj.node.attributes[prop] = val;
                obj.node[prop] = val;
            } else {
                if (HTML.has(prop) && type === 1) {
                    this.content = val;
                } else if (TEXT.has(prop) && type === 3) {
                    this.content = val;
                } else {
                    /*
                      if (prop === 'style') {
                      let css = '';
                      for (const name in val) {
                      const cssName = name.replace(/([A-Z])/g, '-$1').toLowerCase();
                      css += `${cssName}: ${val[name]}; `;
                      }
                      css = css.substring(0, css.length - 1);

                      if (obj.node.attributes.style != null) {
                      obj.node.attributes.style += css;
                      } else {
                      obj.node.attributes.style = css;
                      }
                      } else if (prop === 'dataset') {
                      for (const name in val) {
                      
                      }
                      }
                    */
                    
                    obj.node[prop] = val;
                }
            }

            return val;
        }
    });
    
    proxyToNode.set(proxy, this);

    return proxy;
}

class Document {
    createTextNode(text) {
        const node = new HTMLNode(this, null, 3);
        node.nodeValue = text;
        return node;
    }
    
    createElement(tagName) {
        return new HTMLNode(this, tagName, 1);
    }
}

if (Array.prototype.flat === undefined) {
    Array.prototype.flat = function() {
        let flattened = [];
        for (let i=0; i<this.length; ++i) {
            const item = this[i];
            if (Array.isArray(item)) {
                flattened = flattened.concat(item);
            } else {
                flattened.push(item);
            }
        }
        return flattened;
    };
}

if (Array.prototype.forEach === undefined) {
    Array.prototype.forEach = function(func) {
        for (let i=0; i<this.length; ++i) {
            func(this[i], i);
        }
        return this;
    };
}

module.exports = {
    HTMLNode,
    Document,
};
