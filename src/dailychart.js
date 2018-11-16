const SVG_NS = 'http://www.w3.org/2000/svg';

class Dailychart {
  constructor(el, options) {
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

  normalize() {
    const min = Math.min.apply(null, this.values.concat([this.previous]));
    const max = Math.max.apply(null, this.values.concat([this.previous]));

    this.values = this.values.map(value => (value - min) / (max - min));
    this.previous = (this.previous - min) / (max - min);

    return this;
  }

  _normalize() {
    const max = Math.max.apply(null, this.values.concat([this.previous]));
    const min = Math.min.apply(null, this.values.concat([this.previous]));
    const k = max === min ? 0 : (this.height - this.options.lineWidth * 2) / (max - min);
    const shift = k === 0 ? this.height / 2 : 0;

    this.values = this.values.map(value => (value - min) * k + this.options.lineWidth + shift);
    this.previous = (this.previous - min) * k + this.options.lineWidth + shift;
  }

  _translate() {
    this.values = this.values.map(value => this.height - value);
    this.previous = this.height - this.previous;
  }

  _id() {
    return Math.random().toString(36).substr(2, 9);
  }

  path() {
    const inc = this.width / (this.length - 1);
    const d = [];

    for (let i = 0; i < this.values.length; i++) {
      d.push(i === 0 ? 'M' : 'L');
      d.push(i * inc);
      d.push(this.values[i]);
    }

    return d.join(' ');
  }

  _path() {
    const inc = this.width / (this.length - 1);
    let i = 0, d = [];

    for (; i < this.values.length; i++) {
      d.push(i === 0 ? 'M' : 'L');
      d.push(i * inc);
      d.push(this.values[i]);
    }

    return d.join(' ');
  }

  _close(path, flag) {
    if (flag === 'positive') {
      path += ` V ${this.height} H 0 Z`;
    }
    if (flag === 'negative') {
      path += ` V 0 H 0 Z`;
    }
    return path;
  }

  _draw() {
    const { lineWidth, colorPositive, colorNegative, fillPositive, fillNegative } = this.options;

    const id = this._id();
    const idPositive = `dailychart-${id}-positive`;
    const idNegative = `dailychart-${id}-negative`;

    const d = this._path();
    const dPositive = this._close(d, 'positive');
    const dNegative = this._close(d, 'negative');

    const svg = this._svgElement();
    const linePrevious = this._lineElement(this.previous);

    const pathPositive = this._pathElement(d, lineWidth, colorPositive, '', idPositive);
    const areaPositive = this._pathElement(dPositive, 0, '', fillPositive, idPositive);
    const clipPositive = this._clipElement(idPositive);
    const rectPositive = this._rectElement(0, 0, this.width, this.previous);

    const pathNegative = this._pathElement(d, lineWidth, colorNegative, '', idNegative);
    const areaNegative = this._pathElement(dNegative, 0, '', fillNegative, idNegative);
    const clipNegative = this._clipElement(idNegative);
    const rectNegative = this._rectElement(0, this.previous, this.width, this.height - this.previous);

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

  _pathElement(d, width, stroke, fill, clipId) {
    const path = document.createElementNS(SVG_NS, 'path');

    path.setAttribute('d', d);
    path.setAttribute('fill', fill === '' ? 'none' : fill);
    path.setAttribute('stroke-width', width);
    path.setAttribute('stroke-linejoin', 'bevel');
    path.setAttribute('stroke', stroke === '' ? 'none' : stroke);
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
  fillPositive: '',
  fillNegative: '',
  closeWidth: 1,
  closeColor: '#e0e0e0'
};
