# Dailychart.js

[![npm](https://img.shields.io/npm/v/dailychart.svg)](https://www.npmjs.com/package/dailychart)
[![Travis (.org)](https://img.shields.io/travis/kbychkov/dailychart.svg)](https://travis-ci.org/kbychkov/dailychart)
[![Dependency Status](https://img.shields.io/david/kbychkov/dailychart.svg)](https://david-dm.org/kbychkov/dailychart)
[![devDependency Status](https://img.shields.io/david/dev/kbychkov/dailychart.svg)](https://david-dm.org/kbychkov/dailychart?type=dev)
[![Greenkeeper badge](https://badges.greenkeeper.io/kbychkov/dailychart.svg)](https://greenkeeper.io/)

Dailychart.js is a tiny standalone SVG charting library to display daily graph of a stock market security. Try the [demo](https://kbychkov.github.io/dailychart/).

## Installation

The simplest way is to include the library file from CDN:

```html
<script src='https://unpkg.com/dailychart/dist/dailychart.min.js'></script>
```

It's also possible to install the package as a dependency from NPM

```bash
npm install dailychart --save
```

then include the library into your project:

```js
var Dailychart = require('dailychart');
```

## Usage

First, create a container for the chart and fill with data using attributes.

- `data-dailychart-values` (required) - comma-separated values for the chart.
- `data-dailychart-close` - the value splits the chart on two areas (positive, negative) with its own colors.
- `data-dailychart-length` - the total number of data points. Used to scale the chart along the horizontal axis. If `data-dailychart-values` has fewer points the remaining space will be empty. On the other hand, if `data-dailychart-length` isn't defined the chart will fit the container.

```html
<div id="chart"
     data-dailychart-values="12.94,13.0,12.98,13.02,13.0,13.0,12.95,12.85,13.04,13.13"
     data-dailychart-close="13.08"
     data-dailychart-length="78">
</div>
```

Optionally apply CSS to the container.

```css
#chart {
  width: 80px;
  height: 30px;
}
```

Finally, create the chart for the element.

```js
Dailychart.create('#chart', { lineWidth: 2 });
```

The first parameter can be a HTML element, a list of HTML elements or a CSS selector string.

## Configuration

The second parameter of the constructor is an object that contains the number of options to control the appearance of the chart.

- `width` - Chart width. If not set it equals to container's width.
- `height` - Chart height. If not set it equals to container's height.
- `lineWidth` - Line width of the graph (default: 1).
- `colorPositive` - Color of the positive part of the graph (default: '#33AE45').
- `colorNegative` - Color of the negative part of the graph (default: '#EB5757').
- `fillPositive` - Fill color of the positive area (default: '').
- `fillNegative` - Fill color of the negative area (default: '').
- `closeWidth` - Width of the close line (default: 1).
- `closeColor` - Color of the close line (default: '#e0e0e0').
 
 ## License

 Dailychart.js is available under the [MIT License](https://github.com/kbychkov/dailychart/blob/master/LICENSE).
