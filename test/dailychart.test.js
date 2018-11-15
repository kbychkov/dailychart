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
});
