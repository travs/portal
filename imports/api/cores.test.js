/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Cores } from './cores.js';

if (Meteor.isServer) {
  describe('Cores', () => {
    describe('methods', () => {
      const userId = Random.id();
      let portfolioId;

      beforeEach(() => {
        Cores.remove({});
        portfolioId = Cores.insert({
          text: 'test portfolio',
          createdAt: new Date(),
          managerAddress: userId,
          username: 'Joe Plumber',
        });
      });

      it('can delete owned portfolio', () => {
        // Find the internal implementation of the portfolio method so we can
        // test it in isolation
        const deletePortfolio = Meteor.server.method_handlers['cores.remove'];

        // Set up a fake method invocation that looks like what the method expects
        const invocation = { userId };

        // Run the method with `this` set to the fake invocation
        deletePortfolio.apply(invocation, [portfolioId]);

        // Verify that the method does what we expected
        assert.equal(Cores.find().count(), 0);
      });
    });
  });
}
