import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';


export const Portfolios = new Mongo.Collection('portfolios');


if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('portfolios', function portfoliosPublication() {
    return Portfolios.find({
      $or: [
        { private: { $ne: true } },
        { managerAddress: this.userId },
      ],
    });
  });
}


Meteor.methods({
  'portfolios.insert'(address, name, managerAddress, managerName, sharePrice, notional, intraday, mtd, ytd) {
    check(address, String);
    check(name, String);
    check(managerAddress, String);
    check(managerName, String);
    check(sharePrice, Number);
    check(notional, Number);
    check(intraday, Number);
    check(mtd, Number);
    check(ytd, Number);

    Portfolios.insert({
      address,
      name,
      managerAddress,
      managerName,
      sharePrice,
      notional,
      intraday,
      mtd,
      ytd,
      isNew: true,
      delta: "±0.0",
      username: 'N/A',
      createdAt: new Date(),
    });
  },
  'portfolios.remove'(portfolioId) {
    check(portfolioId, String);

    const portfolio = Portfolios.findOne(portfolioId);

    // Only the owner can delete it
    // TODO assert portflio address
    // if (portfolio.owner !== Meteor.userId())
    //   throw new Meteor.Error('not-authorized');

    Portfolios.remove(portfolioId);
  },
  'portfolios.setSharePrice'(portfolioId, setToSharePrice) {
    check(portfolioId, String);
    check(setToSharePrice, Number);

    Portfolios.update(portfolioId, { $set: { sharePrice: setToSharePrice } });
  },
  'portfolios.setNotional'(portfolioId, setToNotional) {
    check(portfolioId, String);
    check(setToNotional, Number);

    Portfolios.update(portfolioId, { $set: { notional: setToNotional } });
  },
  'portfolios.setToUsed'(portfolioId) {
    check(portfolioId, String);

    Portfolios.update(portfolioId, { $set: { isNew: false } });
  },
});
