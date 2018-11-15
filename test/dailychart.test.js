var expect = chai.expect;

describe('dailychart.js', function () {
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
      var container = document.getElementById('chart_1');
      new Dailychart(container);
    } catch (e) {
      expect(e).to.be.false;
    }
  });
});
