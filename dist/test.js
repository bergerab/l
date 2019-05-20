const l = require('./l');

//const root = l(() => div('awoeifj', { style: { color: 'red', backgroundColor: 'pink', }, dataset: { pink: 'dink' }}));

const asdf = l(() => div(span, span, br));

console.log(asdf.outerHTML);

console.log(l.str(() => div(
    span(hr, 'weofij', hr, br, noscript)
)));
