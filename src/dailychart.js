const SVG_NS = 'http://www.w3.org/2000/svg';

class Dailychart {
  constructor(el, options) {
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

  static extend(target, ...objects) {
    for (let object of objects) {
      for (let key in object) {
        let val = object[key];
        target[key] = val;
      }
    }
    return target;
  }

  _normalize() {
    const max = Math.max.apply(null, this.values.concat([this.previous]));
    const min = Math.min.apply(null, this.values.concat([this.previous]));
    const k = (this.height - this.options.lineWidth * 2) / (max - min);

    this.values = this.values.map(value => (value - min) * k + this.options.lineWidth);
    this.previous = (this.previous - min) * k + this.options.lineWidth;
  }

  _translate() {
    this.values = this.values.map(value => this.height - value);
    this.previous = this.height - this.previous;
  }

  _id() {
    return Math.random().toString(36).substr(2, 9);
  }

  _path() {
    const inc = this.width / this.length;
    let i = 0, d = [];

    for (; i < this.values.length; i++) {
      d.push(i === 0 ? 'M' : 'L');
      d.push(i * inc);
      d.push(this.values[i]);
    }

    return d.join(' ');
  }

  _draw() {
    const id = this._id();
    const d = this._path();
    const svg = this._svgElement();

    const linePrevious = this._lineElement(this.previous);

    const pathPositive = this._pathElement(d, this.options.colorPositive, `dailychart-${id}-positive`);
    const clipPositive = this._clipElement(`dailychart-${id}-positive`);
    const rectPositive = this._rectElement(0, 0, this.width, this.previous);

    const pathNegative = this._pathElement(d, this.options.colorNegative, `dailychart-${id}-negative`);
    const clipNegative = this._clipElement(`dailychart-${id}-negative`);
    const rectNegative = this._rectElement(0, this.previous, this.width, this.height - this.previous);

    clipPositive.appendChild(rectPositive);
    clipNegative.appendChild(rectNegative);

    svg.appendChild(clipPositive);
    svg.appendChild(clipNegative);

    svg.appendChild(linePrevious);
    svg.appendChild(pathPositive);
    svg.appendChild(pathNegative);

    this.element.appendChild(svg);
  }

  _svgElement() {
    const svg = document.createElementNS(SVG_NS, 'svg');

    svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', SVG_NS);
    svg.setAttribute('width', this.width);
    svg.setAttribute('height', this.height);

    return svg;
  }

  _lineElement(y) {
    const line = document.createElementNS(SVG_NS, 'line');

    line.setAttribute('x1', 0);
    line.setAttribute('y1', y);
    line.setAttribute('x2', this.width);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', this.options.closeColor);
    line.setAttribute('stroke-width', this.options.closeWidth);

    line.style.shapeRendering = 'crispEdges';

    return line;
  }

  _pathElement(d, stroke, clipId) {
    const path = document.createElementNS(SVG_NS, 'path');

    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-width', this.options.lineWidth);
    path.setAttribute('stroke-linejoin', 'bevel');
    path.setAttribute('stroke', stroke);
    path.setAttribute('clip-path', `url(#${clipId})`);

    return path;
  }

  _rectElement(x, y, w, h) {
    const rect = document.createElementNS(SVG_NS, 'rect');

    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);

    return rect;
  }

  _clipElement(id) {
    const clip = document.createElementNS(SVG_NS, 'clipPath');

    clip.setAttribute('id', id);

    return clip;
  }
}

Dailychart.prototype.defaultOptions = {
  width: undefined,
  height: undefined,
  lineWidth: 1,
  colorPositive: '#33AE45',
  colorNegative: '#EB5757',
  closeWidth: 1,
  closeColor: '#e0e0e0'
};

Dailychart.version = '1.0.0';
