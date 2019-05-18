<img src="logo.png" width="100px"></img>
# _l_: An HTML Generation Library for Javascript

_l_ is a 100 line Javascript file that makes generating HTML easier.

When you want to create HTML dynamically you have to use the DOM API. The DOM API is verbose, and can require multiple statements to generate a single node to your liking. This library gives a functional style to DOM creation and allows for describing HTML structures in a single statement.

Try it out online [here](http://idiocode.com/projects/l/index.html#try)!

## Motivation
You can use _l_ to make DOM nodes for you, so you don't have to use the DOM API directly. This saves the programmer's time sheerly because you don't have to use the DOM's verbose wording and imperative style.

The DOM API's imperative style requires you to create more lines to make nodes. Because one statement usually appears per line, it forces the programmer to write more lines of code.

_l_ allows you to create a node and assign attributes to it in one line. You can also assign child nodes without assigning any additional temporary variables (unlike the document.createElement(...) API).

### Bad:
```
const node = document.createElement('span');
node.innerHTML = 'Meatball';
const container = document.createElement('div');
container.appendChild(node);
```

### Good:
```
const container = l.div([l.span('Meatball')]);
```

## Interface
The library is meant to mimic the way DOM nodes are designed by use of attributes, properties, and children. _l_ function calls take a "configuration object" which is an object that contains either (you guessed it) attributes, properties, or children. If you specify "attrs" or "attributes" each field in that object will be added as an attribute to the HTML element.

```
l.div({ attrs: { id: 'my-id', class: 'cool' } });
```

You can also specify a "props" or "properties" key. Each field in that object will be assigned to the DOM node after creation. You can use this to attach event handlers to DOM nodes. You could also attach event handlers via an attribute, but those have different meanings. Additionally, you could use this to apply styles to the DOM node. Supplying the properties object with a style could achieve the same as this imperative code: `node.style.backgroundColor = 'red'`;.

```
l.div({ props: { style: { backgroundColor: 'red' }}});
```

There is one more special value that can be placed in the configuration object: children. In the DOM API you can only add children through function calls. There is no way to create an element that already has children on it. _l_ solves that problem:

```
l.div({ children: [ l.b('1'), l.b('2'), l.b('3') ]});
```

## Syntax
Nodes are created by writing `l.tagname(...)` where "tagname" is a valid name of an HTML element like "div" or "b". HTML5 elements are supported as well. For example: `l.section(l.h1('Title'));`.

You can call _l_ as a function too (`l('myweirdtagname', ...)`) to create non-standard HTML elements.

There are a few shortcuts which create a shorthand for the configuration object. You can pass in a string instead of a configuration object, and that string will be used as the `innerHTML` of the node.

```
l.div('This is in the innerHTML');
```

You can give it an array instead too which will interpret each item in the array as a child of this node. Giving a single node to _l_ will treat that node as its only child.

```
l.div([ l.div(l.div('Only child')), l.div('Child 2') ]);
```

Each of these examples allows for passing of a configuration object as well. You just pass it in as the last argument:

```
l.div('Red text', { props: style: { color: 'red' }});
```

## Related Libraries
The idea of generating HTML in programming languages is old. It has been (almost famously) re-invented in lisps many times. [spinneret](https://github.com/ruricolist/spinneret), for example, is a library for generating HTML5. Programming languages like prolog, python, and c have done it too. However, these programming languages don't run directly in the browser like Javascript does. Those libraries are created for web servers or static page generation. Having access to the DOM allows nodes to be created dynamically and for creating interactive HTML. This makes Javascript a good use case for such a library.

The browser already has the capability of generating HTML through a builtin interface: the DOM. I've used the DOM enough to know how time consuming it is to use, and others have noticed too and have created libraries to make using it faster for the programmer. This is exactly what _l_ is for, and exactly what the libraries seen below (which came before this) are for:
- [crel](https://github.com/KoryNunn/crel) - Similar in function to _l_ with interface differences.
- [laconic](https://github.com/joestelmach/laconic) - Similar to crel (crel says this was its inspiration).
- [RE:DOM](https://redom.js.org/) - Influenced by web components.

## Unlicense

```
Unlicense
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to http://unlicense.org
```