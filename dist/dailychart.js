'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SVG_NS = 'http://www.w3.org/2000/svg';

var Dailychart = function () {
  function Dailychart(el, options) {
    _classCallCheck(this, Dailychart);

    this.options = Dailychart.extend({}, this.defaultOptions, options);

    this.element = el;
    this.width = this.options.width || el.offsetWidth;
    this.height = this.options.height || el.offsetHeight;

    this.values = el.getAttribute('data-dailychart-values').split(',').map(Number);
    this.length = +el.getAttribute('data-dailychart-length');
    this.previous = +el.getAttribute('data-dailychart-close');

    this._normalize();
    this._translate();
    this._draw();
  }

  _createClass(Dailychart, [{
    key: '_normalize',
    value: function _normalize() {
      var _this = this;

      var max = Math.max.apply(null, this.values.concat([this.previous]));
      var min = Math.min.apply(null, this.values.concat([this.previous]));
      var k = (this.height - this.options.lineWidth * 2) / (max - min);

      this.values = this.values.map(function (value) {
        return (value - min) * k + _this.options.lineWidth;
      });
      this.previous = (this.previous - min) * k + this.options.lineWidth;
    }
  }, {
    key: '_translate',
    value: function _translate() {
      var _this2 = this;

      this.values = this.values.map(function (value) {
        return _this2.height - value;
      });
      this.previous = this.height - this.previous;
    }
  }, {
    key: '_id',
    value: function _id() {
      return Math.random().toString(36).substr(2, 9);
    }
  }, {
    key: '_path',
    value: function _path() {
      var inc = this.width / this.length;
      var i = 0,
          d = [];

      for (; i < this.values.length; i++) {
        d.push(i === 0 ? 'M' : 'L');
        d.push(i * inc);
        d.push(this.values[i]);
      }

      return d.join(' ');
    }
  }, {
    key: '_close',
    value: function _close(path, flag) {
      if (flag === 'positive') {
        path += ' V ' + this.height + ' H 0 Z';
      }
      if (flag === 'negative') {
        path += ' V 0 H 0 Z';
      }
      return path;
    }
  }, {
    key: '_draw',
    value: function _draw() {
      var _options = this.options,
          lineWidth = _options.lineWidth,
          colorPositive = _options.colorPositive,
          colorNegative = _options.colorNegative,
          fillPositive = _options.fillPositive,
          fillNegative = _options.fillNegative;


      var id = this._id();
      var idPositive = 'dailychart-' + id + '-positive';
      var idNegative = 'dailychart-' + id + '-negative';

      var d = this._path();
      var dPositive = this._close(d, 'positive');
      var dNegative = this._close(d, 'negative');

      var svg = this._svgElement();
      var linePrevious = this._lineElement(this.previous);

      var pathPositive = this._pathElement(d, lineWidth, colorPositive, '', idPositive);
      var areaPositive = this._pathElement(dPositive, 0, '', fillPositive, idPositive);
      var clipPositive = this._clipElement(idPositive);
      var rectPositive = this._rectElement(0, 0, this.width, this.previous);

      var pathNegative = this._pathElement(d, lineWidth, colorNegative, '', idNegative);
      var areaNegative = this._pathElement(dNegative, 0, '', fillNegative, idNegative);
      var clipNegative = this._clipElement(idNegative);
      var rectNegative = this._rectElement(0, this.previous, this.width, this.height - this.previous);

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
    key: '_svgElement',
    value: function _svgElement() {
      var svg = document.createElementNS(SVG_NS, 'svg');

      svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', SVG_NS);
      svg.setAttribute('width', this.width);
      svg.setAttribute('height', this.height);

      return svg;
    }
  }, {
    key: '_lineElement',
    value: function _lineElement(y) {
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
    key: '_pathElement',
    value: function _pathElement(d, width, stroke, fill, clipId) {
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
    key: '_rectElement',
    value: function _rectElement(x, y, w, h) {
      var rect = document.createElementNS(SVG_NS, 'rect');

      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', w);
      rect.setAttribute('height', h);

      return rect;
    }
  }, {
    key: '_clipElement',
    value: function _clipElement(id) {
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

Dailychart.version = '1.1.1';