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

    it('should initialize the empty chart without errors', function () {
      try {
        var element = document.createElement('div');
        new Dailychart(element);
      } catch (e) {
        expect(e).to.be.false;
      }
    });
  });

  describe('#shift', function () {
    const Mock = function (values, previous) {
      this.values = values;
      this.previous = previous;
      this.shift = Dailychart.prototype.shift;
      return this;
    };

    it('normalizes values to zero #1', function () {
      const mock = new Mock([5, 6, 8, 9, 7, 5, 4, 4, 5, 8], 6).shift();

      expect(mock.values).to.deep.equal([1, 2, 4, 5, 3, 1, 0, 0, 1, 4]);
      expect(mock.previous).to.be.equal(2);
    });

    it('normalizes values to zero #2', function () {
      const mock = new Mock([5, 6, 8, 9, 7, 5, 4, 4, 5, 8], 2).shift();

      expect(mock.values).to.deep.equal([3, 4, 6, 7, 5, 3, 2, 2, 3, 6]);
      expect(mock.previous).to.be.equal(0);
    });

    it('normalizes values to zero #3', function () {
      const mock = new Mock([5, 6, 8, 9, 7, 5, 4, 4, 5, 8], 10).shift();

      expect(mock.values).to.deep.equal([1, 2, 4, 5, 3, 1, 0, 0, 1, 4]);
      expect(mock.previous).to.be.equal(6);
    });

    it('normalizes values to zero #4', function () {
      const mock = new Mock([-1, 0, 2, 3, 1, -1, -2, -2, -1, 2], 0).shift();

      expect(mock.values).to.deep.equal([1, 2, 4, 5, 3, 1, 0, 0, 1, 4]);
      expect(mock.previous).to.be.equal(2);
    });
  });

  describe('#normalize', function () {
    const Mock = function (values, previous) {
      this.values = values;
      this.previous = previous;
      this.normalize = Dailychart.prototype.normalize;
      return this;
    };

    it('normalizes values to unit', function () {
      const mock = new Mock([1, 2, 4, 5, 3, 1, 0, 0, 1, 4], 2).normalize();

      expect(mock.values).to.deep.equal([1/5, 2/5, 4/5, 1, 3/5, 1/5, 0, 0, 1/5, 4/5]);
      expect(mock.previous).to.be.equal(2/5);
    });
  });
});
