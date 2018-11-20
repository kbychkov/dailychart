var expect = chai.expect;

describe('dailychart.js', function () {
  describe('#constructor', function () {
    it('throws the error when no params passed', function () {
      try {
        new Dailychart();
        expect(true).to.be.false; // should not get here
      } catch (e) {
        expect(e.message).to.be.equal('Dailychart.js: el is not defined');
      }
    });

    it('do nothing when no values passed', function () {
      var element = document.createElement('div');
      new Dailychart(element);

      expect(element.firstElementChild).to.be.null;
    });

    it('should initialize the chart with values', function () {
      var element = document.createElement('div');
      element.setAttribute('data-dailychart-values', '5,6,8,9,7,5,4,4,5,8');
      new Dailychart(element);

      const svg = element.firstElementChild;
      expect(svg.tagName).to.be.equal('svg');
    });
  });

  describe('#normalize', function () {
    const Mock = function (values, previous) {
      this.values = values;
      this.previous = previous;
      this.normalize = Dailychart.prototype.normalize;
      return this;
    };

    it('normalizes values', function () {
      const mock = new Mock([5, 6, 8, 9, 7, 5, 4, 4, 5, 8], 6).normalize();

      expect(mock.values).to.deep.equal([1/5, 2/5, 4/5, 1, 3/5, 1/5, 0, 0, 1/5, 4/5]);
      expect(mock.previous).to.be.equal(2/5);
    });
  });

  describe('#translate', function () {
    const Mock = function (values, previous) {
      this.values = values;
      this.previous = previous;
      this.height = 40;
      this.translate = Dailychart.prototype.translate;
      return this;
    };

    it('translates values to SVG coords', function () {
      const mock = new Mock([1, 2, 4, 5, 3, 1, 0, 0, 1, 4], 2).translate();

      expect(mock.values).to.deep.equal([32, 24, 8, 0, 16, 32, 40, 40, 32, 8]);
      expect(mock.previous).to.be.equal(24);
    });  });

  describe('#path', function () {
    const Mock = function (values) {
      this.values = values;
      this.width = 100;
      this.length = 11;
      this.path = Dailychart.prototype.path;
    };

    it('returns the path that correspond to values', function () {
      const mock = new Mock([5, 6, 8, 9, 7, 5, 4, 4, 5, 8, 8]);
      const result = mock.path();

      expect(result).to.be.equal('M 0 5 L 10 6 L 20 8 L 30 9 L 40 7 L 50 5 L 60 4 L 70 4 L 80 5 L 90 8 L 100 8');
    });
  });
});
