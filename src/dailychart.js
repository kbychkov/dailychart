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

    this.normalize().translate().draw();
  }

  static create(ctx, options) {
    if (typeof ctx === 'string') {
      ctx = document.querySelectorAll(ctx);
      if (!ctx) return;
    }

    if (ctx instanceof HTMLElement) {
      ctx = [ctx];
    } else if (ctx instanceof NodeList || ctx instanceof HTMLCollection) {
      ctx = Array.from(ctx);
    } else {
      throw new Error('Incorrect context was provided');
    }

    ctx.forEach(el => new Dailychart(el, options));
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

  translate() {
    const max = Math.max.apply(null, this.values.concat([this.previous]));
    const k = this.height / max;

    this.values = this.values.map(value => this.height - value * k);
    this.previous = this.height - this.previous * k;

    return this;
  }

  id() {
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

  draw() {
    const { lineWidth, colorPositive, colorNegative, fillPositive, fillNegative } = this.options;

    const id = this.id();
    const idPositive = `dailychart-${id}-positive`;
    const idNegative = `dailychart-${id}-negative`;

    const d = this.path();
    const dPositive = `${d} V ${this.height} H 0 Z`;
    const dNegative = `${d} V 0 H 0 Z`;

    const svg = this.svgElement();
    const linePrevious = this.lineElement(this.previous);

    const pathPositive = this.pathElement(d, lineWidth, colorPositive, '', idPositive);
    const areaPositive = this.pathElement(dPositive, 0, '', fillPositive, idPositive);
    const clipPositive = this.clipElement(idPositive);
    const rectPositive = this.rectElement(0, 0, this.width, this.previous);

    const pathNegative = this.pathElement(d, lineWidth, colorNegative, '', idNegative);
    const areaNegative = this.pathElement(dNegative, 0, '', fillNegative, idNegative);
    const clipNegative = this.clipElement(idNegative);
    const rectNegative = this.rectElement(0, this.previous, this.width, this.height - this.previous);

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

  svgElement() {
    const svg = document.createElementNS(SVG_NS, 'svg');

    svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', SVG_NS);
    svg.setAttribute('width', this.width);
    svg.setAttribute('height', this.height);

    return svg;
  }

  lineElement(y) {
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

  pathElement(d, width, stroke, fill, clipId) {
    const path = document.createElementNS(SVG_NS, 'path');

    path.setAttribute('d', d);
    path.setAttribute('fill', fill === '' ? 'none' : fill);
    path.setAttribute('stroke-width', width);
    path.setAttribute('stroke-linejoin', 'bevel');
    path.setAttribute('stroke', stroke === '' ? 'none' : stroke);
    path.setAttribute('clip-path', `url(#${clipId})`);

    return path;
  }

  rectElement(x, y, w, h) {
    const rect = document.createElementNS(SVG_NS, 'rect');

    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);

    return rect;
  }

  clipElement(id) {
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
