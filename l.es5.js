"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var l = function () {
  var L =
  /*#__PURE__*/
  function () {
    function L(name) {
      var init1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var init2 = arguments.length > 2 ? arguments[2] : undefined;

      _classCallCheck(this, L);

      var init = init2 || init1;

      if (typeof init1 === 'string') {
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
      } else if (Array.isArray(init1)) {
        if (init2 === undefined) {
          init = {
            children: init1
          };
        } else {
          init.children = init1;
        }
      } else if (_instanceof(init1, Element) || _instanceof(init1, HTMLDocument)) {
        if (init2 === undefined) {
          init = {
            children: [init1]
          };
        } else {
          init.children = [init1];
        }
      }

      this.state = init.state || {};
      this.name = name;
      this.children = init.children || [];
      this.props = init.props || init.properties || {};
      this.attrs = init.attrs || init.attributes || {};
    }

    _createClass(L, [{
      key: "valOf",
      value: function valOf(val) {
        if (typeof val === 'function') {
          return val.bind(this)();
        }

        return val;
      }
    }, {
      key: "render",
      value: function render() {
        var tag = document.createElement(this.name);

        for (var name in this.props) {
          var val = this.props[name];

          if (_typeof(val) === 'object') {
            if (_typeof(tag[name]) === 'object') {
              for (var key in val) {
                tag[name][key] = val[key];
              }
            } else {
              tag[name] = this.props[name];
            }
          } else {
            tag[name] = this.props[name];
          }
        }

        for (var _name in this.attrs) {
          var _val = this.attrs[_name];

          if (_val !== null && _val !== '') {
            tag.setAttribute(_name, this.valOf(this.attrs[_name]));
          }
        }

        for (var i = 0; i < this.children.length; ++i) {
          tag.appendChild(this.children[i]);
        }

        return tag;
      }
    }]);

    return L;
  }();

  var lib = function lib(name, init1, init2) {
    return new L(name, init1, init2).render();
  },
      tags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'label', 'legend', 'li', 'ul', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'var', 'video', 'wbr'];

  var _loop = function _loop() {
    var tag = _tags[_i];

    lib[tag] = function (init1, init2) {
      return new L(tag, init1, init2).render();
    };
  };

  for (var _i = 0, _tags = tags; _i < _tags.length; _i++) {
    _loop();
  }

  lib.append = function (parent, child) {
    return parent.appendChild(child);
  };

  lib.appendBody = function (child) {
    return lib.append(document.body, child);
  };

  lib.prepend = function (parent, child) {
    return parent.insertAdjacentElement('afterBegin', child);
  };

  lib.prependBody = function (child) {
    return lib.prepend(document.body, child);
  };

  lib.after = function (n1, n2) {
    return n1.insertAdjacentElement('afterEnd', n2);
  };

  lib.before = function (n1, n2) {
    return n1.insertAdjacentElement('beforeBegin', n2);
  };

  return lib;
}();
