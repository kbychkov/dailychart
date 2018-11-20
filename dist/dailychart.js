;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Dailychart = factory();
  }
}(this, function() {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SVG_NS = 'http://www.w3.org/2000/svg';

var Dailychart = function () {
  function Dailychart(el, options) {
    _classCallCheck(this, Dailychart);

    this.options = Dailychart.extend({}, this.defaultOptions, options);

    if (!el) {
      throw new Error('Dailychart.js: el is not defined');
    } else {
      this.element = el;
    }

    this.width = this.options.width || el.offsetWidth;
    this.height = this.options.height || el.offsetHeight;

    if (!el.getAttribute('data-dailychart-values') || el.getAttribute('data-dailychart-values').length === 0) {
      return; // nothing to draw
    } else {
      this.values = el.getAttribute('data-dailychart-values').split(',').map(Number);
    }

    if (this.values.length < 2) return; // at least two points needs to draw a line

    if (!el.getAttribute('data-dailychart-length') || el.getAttribute('data-dailychart-length').length === 0) {
      this.length = this.values.length;
    } else {
      this.length = +el.getAttribute('data-dailychart-length');
    }

    if (!el.getAttribute('data-dailychart-close') || el.getAttribute('data-dailychart-close').length === 0) {
      this.previous = this.values[0];
    } else {
      this.previous = +el.getAttribute('data-dailychart-close');
    }

    this.normalize().translate().draw();
  }

  _createClass(Dailychart, [{
    key: 'normalize',
    value: function normalize() {
      var min = Math.min.apply(null, this.values.concat([this.previous]));
      var max = Math.max.apply(null, this.values.concat([this.previous]));

      this.values = this.values.map(function (value) {
        return (value - min) / (max - min);
      });
      this.previous = (this.previous - min) / (max - min);

      return this;
    }
  }, {
    key: 'translate',
    value: function translate() {
      var _this = this;

      var max = Math.max.apply(null, this.values.concat([this.previous]));
      var k = this.height / max;

      this.values = this.values.map(function (value) {
        return _this.height - value * k;
      });
      this.previous = this.height - this.previous * k;

      return this;
    }
  }, {
    key: 'id',
    value: function id() {
      return Math.random().toString(36).substr(2, 9);
    }
  }, {
    key: 'path',
    value: function path() {
      var inc = this.width / (this.length - 1);
      var d = [];

      for (var i = 0; i < this.values.length; i++) {
        d.push(i === 0 ? 'M' : 'L');
        d.push(i * inc);
        d.push(this.values[i]);
      }

      return d.join(' ');
    }
  }, {
    key: 'draw',
    value: function draw() {
      var _options = this.options,
          lineWidth = _options.lineWidth,
          colorPositive = _options.colorPositive,
          colorNegative = _options.colorNegative,
          fillPositive = _options.fillPositive,
          fillNegative = _options.fillNegative;


      var id = this.id();
      var idPositive = 'dailychart-' + id + '-positive';
      var idNegative = 'dailychart-' + id + '-negative';

      var d = this.path();
      var dPositive = d + ' V ' + this.height + ' H 0 Z';
      var dNegative = d + ' V 0 H 0 Z';

      var svg = this.svgElement();
      var linePrevious = this.lineElement(this.previous);

      var pathPositive = this.pathElement(d, lineWidth, colorPositive, '', idPositive);
      var areaPositive = this.pathElement(dPositive, 0, '', fillPositive, idPositive);
      var clipPositive = this.clipElement(idPositive);
      var rectPositive = this.rectElement(0, 0, this.width, this.previous);

      var pathNegative = this.pathElement(d, lineWidth, colorNegative, '', idNegative);
      var areaNegative = this.pathElement(dNegative, 0, '', fillNegative, idNegative);
      var clipNegative = this.clipElement(idNegative);
      var rectNegative = this.rectElement(0, this.previous, this.width, this.height - this.previous);

      clipPositive.appendChild(rectPositive);
      clipNegative.appendChild(rectNegative);

      svg.appendChild(clipPositive);
      svg.appendChild(clipNegative);

      svg.appendChild(linePrevious);
      svg.appendChild(areaPositive);
      svg.appendChild(areaNegative);
      svg.appendChild(pathPositive);
      svg.appendChild(pathNegative);

      this.element.appendChild(svg);
    }
  }, {
    key: 'svgElement',
    value: function svgElement() {
      var svg = document.createElementNS(SVG_NS, 'svg');

      svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', SVG_NS);
      svg.setAttribute('width', this.width);
      svg.setAttribute('height', this.height);

      return svg;
    }
  }, {
    key: 'lineElement',
    value: function lineElement(y) {
      var line = document.createElementNS(SVG_NS, 'line');

      line.setAttribute('x1', 0);
      line.setAttribute('y1', y);
      line.setAttribute('x2', this.width);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', this.options.closeColor);
      line.setAttribute('stroke-width', this.options.closeWidth);

      line.style.shapeRendering = 'crispEdges';

      return line;
    }
  }, {
    key: 'pathElement',
    value: function pathElement(d, width, stroke, fill, clipId) {
      var path = document.createElementNS(SVG_NS, 'path');

      path.setAttribute('d', d);
      path.setAttribute('fill', fill === '' ? 'none' : fill);
      path.setAttribute('stroke-width', width);
      path.setAttribute('stroke-linejoin', 'bevel');
      path.setAttribute('stroke', stroke === '' ? 'none' : stroke);
      path.setAttribute('clip-path', 'url(#' + clipId + ')');

      return path;
    }
  }, {
    key: 'rectElement',
    value: function rectElement(x, y, w, h) {
      var rect = document.createElementNS(SVG_NS, 'rect');

      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', w);
      rect.setAttribute('height', h);

      return rect;
    }
  }, {
    key: 'clipElement',
    value: function clipElement(id) {
      var clip = document.createElementNS(SVG_NS, 'clipPath');

      clip.setAttribute('id', id);

      return clip;
    }
  }], [{
    key: 'extend',
    value: function extend(target) {
      for (var _len = arguments.length, objects = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        objects[_key - 1] = arguments[_key];
      }

      for (var _iterator = objects, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var object = _ref;

        for (var key in object) {
          var val = object[key];
          target[key] = val;
        }
      }
      return target;
    }
  }]);

  return Dailychart;
}();

Dailychart.prototype.defaultOptions = {
  width: undefined,
  height: undefined,
  lineWidth: 1,
  colorPositive: '#33AE45',
  colorNegative: '#EB5757',
  fillPositive: '',
  fillNegative: '',
  closeWidth: 1,
  closeColor: '#e0e0e0'
};
return Dailychart;
}));
