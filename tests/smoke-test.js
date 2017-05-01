/* eslint-env mocha */
/* globals browser */

describe('smoke test', () => {
  beforeEach(function () {
    browser.url('http://localhost:3000');
  });

  it('The hero text is here @watch', () => {
    browser.waitForExist('.hero-text');
  });
});